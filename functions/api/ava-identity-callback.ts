/**
 * Server-to-server certified identity provider adapter.
 * This is NOT a browser endpoint. A provider integration must sign the exact
 * raw body with HMAC-SHA256 using AVA_IDV_WEBHOOK_SECRET, and report audited
 * liveness, document authenticity, document name and face comparison results.
 * A 95% face similarity alone never verifies an identity.
 */
type Env = { SUBMISSIONS_DB?: D1Database; AVA_IDV_WEBHOOK_SECRET?: string }
type ProviderEvent = {
  reference?: string
  status?: string
  timestamp?: number
  documentType?: string
  documentFullName?: string
  faceMatchScore?: number
  livenessPassed?: boolean
  documentAuthentic?: boolean
  passportNfcPassed?: boolean
}
function respond(message:string,status:number) {
  return new Response(JSON.stringify({ok:status<400,message}),{
    status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}
  })
}
function normalizeName(value:string) {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en')
    .replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ')
}
function equalConstant(a:string,b:string) {
  if(a.length!==b.length) return false
  let difference=0
  for(let i=0;i<a.length;i++) difference |= a.charCodeAt(i)^b.charCodeAt(i)
  return difference===0
}
export const onRequestPost:PagesFunction<Env> = async ({request,env}) => {
  if(!env.SUBMISSIONS_DB||!env.AVA_IDV_WEBHOOK_SECRET||env.AVA_IDV_WEBHOOK_SECRET.length<32)
    return respond('Identity verification is not configured.',503)
  const claimed=request.headers.get('X-Ava-Identity-Signature')||''
  const body=await request.text()
  if(body.length>8000) return respond('Invalid event.',413)
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.AVA_IDV_WEBHOOK_SECRET),
    {name:'HMAC',hash:'SHA-256'},false,['sign'])
  const signed=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(body)))
  const expected=Array.from(signed,b=>b.toString(16).padStart(2,'0')).join('')
  if(!equalConstant(claimed.replace(/^sha256=/,'').toLowerCase(),expected))
    return respond('Provider authentication required.',403)
  let event:ProviderEvent
  try {event=JSON.parse(body) as ProviderEvent}
  catch{return respond('Invalid event.',400)}
  if(!event.reference||typeof event.reference!=='string'||event.reference.length>200||
    typeof event.timestamp!=='number'||Math.abs(Date.now()-event.timestamp)>300_000)
    return respond('Invalid or expired event.',400)
  const intent=await env.SUBMISSIONS_DB.prepare(
    'SELECT session_id FROM ava_screening_identity_intents WHERE vendor_reference=?'
  ).bind(event.reference).first<{session_id:string}>()
  if(!intent) return respond('Unknown verification reference.',404)
  const row=await env.SUBMISSIONS_DB.prepare(
    'SELECT name,profile,identity_status FROM ava_screening_sessions WHERE id=?'
  ).bind(intent.session_id).first<{name:string;profile:string|null;identity_status:string}>()
  if(!row) return respond('Applicant unavailable.',404)
  let fullName=row.name
  try {
    const parsed=JSON.parse(row.profile||'{}') as {fullName?:string}
    if(parsed.fullName)fullName=parsed.fullName
  }catch{ /* use verified applicant name */ }
  const nameMatch=typeof event.documentFullName==='string' &&
    normalizeName(event.documentFullName)===normalizeName(fullName)
  const score=Number(event.faceMatchScore)
  const validScore=Number.isFinite(score)&&score>=0&&score<=100
  const nfc=event.documentType==='passport'?event.passportNfcPassed===true:
    event.documentType==='national_id'
  const passed=event.status==='completed' && validScore && score>=95 &&
    event.livenessPassed===true && event.documentAuthentic===true &&
    nameMatch && nfc
  const previous=await env.SUBMISSIONS_DB.prepare(
    'SELECT status FROM ava_screening_identity_attestations WHERE session_id=?'
  ).bind(intent.session_id).first<{status:string}>()
  if(previous?.status==='verified')return respond('Already verified.',200)
  await env.SUBMISSIONS_DB.prepare(`INSERT INTO ava_screening_identity_attestations
    (session_id,vendor_reference,face_score,liveness_pass,document_authentic,
      document_name_match,passport_nfc_pass,status,checked_at)
    VALUES (?,?,?,?,?,?,?,?,?)
    ON CONFLICT(session_id) DO UPDATE SET
      vendor_reference=excluded.vendor_reference,face_score=excluded.face_score,
      liveness_pass=excluded.liveness_pass,document_authentic=excluded.document_authentic,
      document_name_match=excluded.document_name_match,passport_nfc_pass=excluded.passport_nfc_pass,
      status=excluded.status,checked_at=excluded.checked_at`)
    .bind(intent.session_id,event.reference,validScore?score:0,event.livenessPassed===true?1:0,
      event.documentAuthentic===true?1:0,nameMatch?1:0,nfc?1:0,
      passed?'verified':'manual_review',Date.now()).run()
  if(passed) await env.SUBMISSIONS_DB.prepare(
    "UPDATE ava_screening_sessions SET identity_status='approved',identity_reviewed=? WHERE id=?"
  ).bind(Date.now(),intent.session_id).run()
  else await env.SUBMISSIONS_DB.prepare(
    "UPDATE ava_screening_sessions SET identity_status='pending_review' WHERE id=? AND identity_status!='approved'"
  ).bind(intent.session_id).run()
  return respond('Provider event accepted.',200)
}
export const onRequestGet:PagesFunction<Env>=async()=>respond('Method not allowed.',405)
