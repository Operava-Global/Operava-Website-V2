/**
 * Veriff decision webhook. The raw body is HMAC-authenticated before parsing.
 * Only a final Veriff-approved ID + selfie decision with an exact applicant-name
 * match unlocks AVA. Provider review/decline/resubmission never self-approves.
 */
import { constantTimeHexEqual, hmacSha256Hex, normalizeIdentityName } from '../lib/avaVeriff'

type Env = {
  SUBMISSIONS_DB?: D1Database
  AVA_VERIFF_API_KEY?: string
  AVA_VERIFF_SHARED_SECRET?: string
}
type VeriffDecision = {
  status?:string
  verification?:{
    id?:string;attemptId?:string;vendorData?:string;endUserId?:string
    status?:string;code?:number;decisionTime?:string;submissionTime?:string
    person?:{firstName?:string|null;lastName?:string|null;fullName?:string|null}
    document?:{type?:string|null;country?:string|null}
  }
}
function respond(message:string,status:number) {
  return new Response(JSON.stringify({ok:status<400,message}),{
    status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',
      'Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}
  })
}
function timestamp(value:unknown):number {
  if(typeof value!=='string')return Date.now()
  const parsed=Date.parse(value)
  return Number.isFinite(parsed)?parsed:Date.now()
}
export const onRequestPost:PagesFunction<Env> = async ({request,env}) => {
  const db=env.SUBMISSIONS_DB
  const apiKey=env.AVA_VERIFF_API_KEY?.trim()||''
  const sharedSecret=env.AVA_VERIFF_SHARED_SECRET?.trim()||''
  if(!db||apiKey.length<12||sharedSecret.length<24)
    return respond('Identity verification webhook is not configured.',503)
  if(request.method!=='POST')return respond('Method not allowed.',405)
  if(request.headers.get('X-AUTH-CLIENT')!==apiKey)
    return respond('Provider authentication required.',403)
  const raw=await request.text()
  if(raw.length>24_000)return respond('Decision event is too large.',413)
  const signature=request.headers.get('X-HMAC-SIGNATURE')||request.headers.get('x-hmac-signature')||''
  const expected=await hmacSha256Hex(sharedSecret,raw)
  if(!constantTimeHexEqual(signature,expected))
    return respond('Provider signature is invalid.',403)
  let event:VeriffDecision
  try{event=JSON.parse(raw) as VeriffDecision}catch{return respond('Invalid decision event.',400)}
  const v=event.verification
  if(event.status!=='success'||!v||typeof v.id!=='string'||v.id.length>120||
    typeof v.vendorData!=='string'||v.vendorData.length>100||
    typeof v.status!=='string'||typeof v.code!=='number')
    return respond('Decision event is incomplete.',400)
  const intent=await db.prepare(`SELECT session_id,link_used_at FROM ava_screening_identity_intents
    WHERE vendor_reference=?`).bind(v.id).first<{session_id:string;link_used_at:number|null}>()
  if(!intent||intent.session_id!==v.vendorData)
    return respond('Unknown identity verification session.',404)
  if(!intent.link_used_at)return respond('The secure applicant link was not opened.',403)
  const applicant=await db.prepare(`SELECT name,profile,identity_consent_at,assessment_status
    FROM ava_screening_sessions WHERE id=?`).bind(intent.session_id)
    .first<{name:string;profile:string|null;identity_consent_at:number|null;assessment_status:string}>()
  if(!applicant||!applicant.identity_consent_at||applicant.assessment_status!=='not_started')
    return respond('Applicant verification is no longer active.',409)
  const decisionTime=timestamp(v.decisionTime||v.submissionTime)
  const eventId=String(`${v.attemptId||v.id}:${v.status}:${v.decisionTime||v.submissionTime||'decision'}`).slice(0,128)
  const reserved=await db.prepare(`INSERT OR IGNORE INTO ava_screening_provider_events(event_id,session_id,received_at)
    VALUES (?,?,?)`).bind(eventId,intent.session_id,Date.now()).run()
  if(!reserved.meta.changes)return respond('Duplicate decision event accepted.',200)

  let expectedName=applicant.name
  try{
    const profile=JSON.parse(applicant.profile||'{}') as {fullName?:string}
    if(typeof profile.fullName==='string'&&profile.fullName.trim())expectedName=profile.fullName
  }catch{/* use email-verified applicant name */}
  const person=v.person||{}
  const verifiedName=String(person.fullName||[person.firstName,person.lastName].filter(Boolean).join(' ')).trim()
  const nameMatch=Boolean(verifiedName&&normalizeIdentityName(verifiedName)===normalizeIdentityName(expectedName))
  const documentType=String(v.document?.type||'').trim().slice(0,40)
  const documentCountry=String(v.document?.country||'').trim().slice(0,8)
  const providerStatus=String(v.status).toLowerCase()
  const expectedCode:Record<string,number>={approved:9001,declined:9102,resubmission_requested:9103,expired:9104,abandoned:9121}
  const codeValid=providerStatus==='review'||expectedCode[providerStatus]===v.code
  const approved=providerStatus==='approved'&&codeValid&&nameMatch&&Boolean(documentType)
  const storedStatus=!codeValid?'invalid_decision':approved?'approved':
    providerStatus==='review'?'review':
    providerStatus==='approved'?'approved_unmatched':
    ['declined','resubmission_requested','expired','abandoned'].includes(providerStatus)?providerStatus:'pending'
  const applicantStatus=approved?'approved':
    providerStatus==='review'&&codeValid?'pending_verification':
    codeValid&&['resubmission_requested','expired','abandoned'].includes(providerStatus)?'needs_resubmission':'rejected'
  await db.prepare(`INSERT INTO ava_screening_identity_provider_decisions
    (session_id,vendor_reference,provider_status,decision_code,document_type,document_country,name_match,decision_time,received_at)
    VALUES (?,?,?,?,?,?,?,?,?)
    ON CONFLICT(session_id) DO UPDATE SET vendor_reference=excluded.vendor_reference,
      provider_status=excluded.provider_status,decision_code=excluded.decision_code,
      document_type=excluded.document_type,document_country=excluded.document_country,
      name_match=excluded.name_match,decision_time=excluded.decision_time,received_at=excluded.received_at`)
    .bind(intent.session_id,v.id,storedStatus,v.code,documentType||null,documentCountry||null,
      nameMatch?1:0,decisionTime,Date.now()).run()
  await db.prepare(`UPDATE ava_screening_identity_intents SET provider_status=?,
    provider_url=CASE WHEN ? IN ('review','resubmission_requested') THEN provider_url ELSE NULL END
    WHERE session_id=?`).bind(storedStatus,storedStatus,intent.session_id).run()
  await db.prepare(`UPDATE ava_screening_sessions SET identity_status=?,identity_reviewed=?
    WHERE id=? AND assessment_status='not_started'`)
    .bind(applicantStatus,approved?Date.now():null,intent.session_id).run()
  await db.prepare(`INSERT INTO ava_screening_review_events(session_id,action,detail,recorded_at)
    VALUES (?,?,?,?)`).bind(intent.session_id,'veriff_decision',
      `status:${storedStatus}; code:${v.code}; name_match:${nameMatch?1:0}; document_type:${documentType||'unavailable'}`,Date.now()).run()
  return respond(approved?'Identity verified.':'Provider decision received; additional verification is required.',200)
}
export const onRequestGet:PagesFunction<Env>=async()=>respond('Method not allowed.',405)
