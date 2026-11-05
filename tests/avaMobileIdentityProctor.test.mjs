import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8')
const backend=read('functions/api/ava-screening.ts')
const link=read('functions/api/ava-identity-link.ts')
const callback=read('functions/api/ava-identity-callback.ts')
const applicant=read('src/pages/AvaScreening.tsx')
const schema=read('db/submissions.sql')
const privacy=read('src/site/content/legal/privacy.ts')

test('mobile verification email link is one-time and safe against mail scanners',()=>{
  assert.match(backend,/createOneTimeToken\(32\)/)
  assert.match(backend,/linkExpires=now\+15\*60_000/)
  assert.match(backend,/link_token_hash/)
  assert.match(backend,/resubmission_requested','link_expired','email_failed/)
  assert.match(link,/Do not consume on GET/)
  assert.match(link,/method="post"/)
  assert.match(link,/SET link_used_at=\?,link_token_hash=NULL/)
  assert.match(link,/status:303/)
  assert.match(link,/Referrer-Policy':'no-referrer/)
})

test('Veriff decision is authenticated and only final approved, name-matched ID unlocks assessment',()=>{
  assert.match(callback,/hmacSha256Hex\(sharedSecret,raw\)/)
  assert.match(callback,/X-HMAC-SIGNATURE/)
  assert.match(callback,/v\.vendorData/)
  assert.match(callback,/approved:9001,declined:9102,resubmission_requested:9103,expired:9104,abandoned:9121/)
  assert.match(callback,/codeValid/)
  assert.match(callback,/nameMatch/)
  assert.match(callback,/Boolean\(documentType\)/)
  assert.match(backend,/provider_status==='approved'&&provider\.decision_code===9001&&provider\.name_match===1/)
  assert.match(schema,/ava_screening_identity_provider_decisions/)
})

test('desktop status refresh and separate rules acknowledgment precede assessment',()=>{
  assert.match(applicant,/setInterval\(\(\)=>void refresh\(\),5000\)/)
  assert.match(applicant,/IDENTITY SUBMISSION RECEIVED/)
  assert.match(applicant,/Return to your computer/)
  assert.match(applicant,/assessmentRulesAccepted/)
  assert.match(applicant,/acceptAssessmentRules/)
  assert.match(applicant,/Read and acknowledge the assessment rules before starting/)
  assert.match(backend,/assessment_rules_accepted_at/)
})

test('focus loss pauses on the server, clears draft, and requires new recordings to resume',()=>{
  assert.match(backend,/focus_lost','visibility_hidden','fullscreen_exited/)
  assert.match(backend,/proctor_paused_at=COALESCE/)
  assert.match(backend,/proctor_incidents=CASE WHEN proctor_paused_at IS NULL/)
  assert.match(backend,/if\(row\.proctor_paused_at\)return error/)
  assert.match(backend,/latest\.get\('screen'\)!<=pausedAt/)
  assert.match(backend,/latest\.get\('camera'\)!<=pausedAt/)
  assert.match(backend,/action === 'proctorResume'/)
  assert.match(backend,/action === 'proctorHeartbeat'/)
  assert.match(backend,/Date\.now\(\)-row\.proctor_heartbeat_at>10_000/)
  assert.match(applicant,/action:'proctorHeartbeat'/)
  assert.match(applicant,/setAnswer\(''\)/)
  assert.match(applicant,/submit\('proctorResume'\)/)
  assert.match(applicant,/surface!=='monitor'/)
  assert.match(applicant,/45-minute timer continues/)
  assert.match(schema,/proctor_paused_at INTEGER/)
})

test('privacy notice explains provider ID media and 30-day proctor retention',()=>{
  assert.match(privacy,/Veriff/)
  assert.match(privacy,/30-day object-retention lifecycle/)
  assert.match(privacy,/cannot guarantee detection/)
})
