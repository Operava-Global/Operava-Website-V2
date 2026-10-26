import assert from 'node:assert/strict'

// Read-only smoke tests for the production Ava self-registration API.
// No valid OTP, email, or personal data is ever submitted or generated.
const BASE = 'https://www.operavaglobal.com'
const API = BASE + '/api/ava-screening'
async function post(action, data = {}, extra = {}) {
  const response = await fetch(API, {
    method:'POST', cache:'no-store', redirect:'manual',
    headers:{'Content-Type':'application/json',...extra},
    body:JSON.stringify({action,...data}),
    signal:AbortSignal.timeout(12000),
  })
  const json = await response.json().catch(()=>({}))
  return { status:response.status, data:json }
}
const config=await post('publicConfig')
assert.equal(config.status,200,'Public registration API must be enabled')
assert.equal(config.data.ok,true)
assert.equal(config.data.emailOtpOnly,true)
assert.equal(config.data.registrationOpen,true)
assert.equal(typeof config.data.turnstileSiteKey,'string','Turnstile must be configured for public registration')
assert.ok(config.data.turnstileSiteKey.length>10)
console.log('PASS: Public registration API enabled with Turnstile site key')

const rejected=await post('publicStart',{
  name:'Synthetic QA (no registration)',
  email:'nonexistent-ava-smoketest@example.invalid',
  role:'tech',
  turnstileToken:'invalid-test-token',
},{Origin:BASE})
assert.equal(rejected.status,403,'Invalid Turnstile must be rejected before D1 writes or SES mail')
console.log('PASS: Invalid Turnstile rejected')

const admin=await post('pendingReviews')
assert.equal(admin.status,403,'Reviewer APIs require an independent secret')
console.log('PASS: Reviewer API denies unauthenticated calls')

const code=await post('publicVerify',{
  email:'nonexistent-ava-smoketest@example.invalid',
  code:'000000',name:'Synthetic QA',role:'tech'
})
assert.equal(code.status,401,'OTP login cannot grant access to unknown email')
console.log('PASS: Unknown OTP rejected')

const access=await fetch(BASE+'/recruitment-admin/',{
  redirect:'manual',signal:AbortSignal.timeout(12000)})
assert.ok([302,303,401,403].includes(access.status),
  'Recruitment Admin must require Cloudflare Access authentication')
console.log('PASS: Recruitment Admin is protected by Cloudflare Access')
