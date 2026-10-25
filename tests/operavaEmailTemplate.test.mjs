import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  otpEmailTemplate,
  servicesConfirmationTemplate,
  applicationConfirmationTemplate,
  staffNotificationTemplate,
  recruitmentPoolConfirmationTemplate,
  professionalConfirmationTemplate,
} from '../functions/lib/emailTemplates.ts'

const ownerMaster = readFileSync(new URL('../email/templates/operava-otp.html', import.meta.url), 'utf8')

test('OTP runtime template exactly equals owner HTML, footer correction included', () => {
  assert.equal(otpEmailTemplate, ownerMaster)
  assert.match(otpEmailTemplate, />www\.operavaglobal\.com<\/a>/)
  assert.doesNotMatch(otpEmailTemplate, />Visit OPERAVA<\/a>/)
  assert.match(otpEmailTemplate, /href="https:\/\/www\.operavaglobal\.com\/"/)
  assert.match(otpEmailTemplate, /{{otp_code}}/)
  assert.match(otpEmailTemplate, /{{expiry_minutes}}/)
  assert.match(otpEmailTemplate, /YOUR VERIFICATION CODE/)
  assert.match(otpEmailTemplate, /{{expiry_minutes}} minutes/)
})

test('all confirmation variants keep the same owner-approved 640px rounded black/violet shell', () => {
  for (const html of [
    servicesConfirmationTemplate, applicationConfirmationTemplate,
    staffNotificationTemplate, recruitmentPoolConfirmationTemplate,
  ]) {
    assert.match(html, /max-width:640px/)
    assert.match(html, /background-color:#000000/)
    assert.match(html, /border-radius:16px/)
    assert.match(html, /linear-gradient\(180deg,#000000 0%,#190b30 31%,#5e1cb0 70%,#bc9af4 100%\)/)
    assert.match(html, html === applicationConfirmationTemplate ? /APPLICATION CONFIRMATION/ : /SUBMISSION CONFIRMATION/)
    assert.match(html, /www\.operavaglobal\.com<\/a>/)
    assert.doesNotMatch(html, /{{otp_code}}|{{expiry_minutes}}|482 931|Email_Header\.png/)
  }
  assert.match(servicesConfirmationTemplate, /{{REFERENCE_ID}}/)
  assert.match(servicesConfirmationTemplate, /{{DETAILS_LIST}}/)
  assert.match(applicationConfirmationTemplate, /{{REFERENCE_ID}}/)
  assert.match(staffNotificationTemplate, /{{TITLE}}/)
  assert.match(staffNotificationTemplate, /{{ROWS_HTML}}/)
  assert.match(recruitmentPoolConfirmationTemplate, /{{APPLICATION_ID}}/)
})


test('customer-facing confirmations use the same colors and gradient but left-aligned letter content', () => {
  assert.match(professionalConfirmationTemplate, /max-width:640px/)
  assert.match(professionalConfirmationTemplate, /linear-gradient\(180deg,#000000 0%,#190b30 31%,#5e1cb0 70%,#bc9af4 100%\)/)
  assert.match(professionalConfirmationTemplate, /align="left"/)
  assert.match(professionalConfirmationTemplate, /{{EMAIL_BODY}}/)
  assert.doesNotMatch(professionalConfirmationTemplate, /{{otp_code}}|YOUR VERIFICATION CODE|class="otp-panel"/)
})


test('Future Operavian and Future Business Partner messages are left-aligned professional letters with dynamic references', async () => {
  // Bundle the Cloudflare TypeScript module so Node's test runner can resolve
  // its existing extensionless imports without altering production import paths.
  const { build } = await import('esbuild')
  const bundled = await build({
    entryPoints: ['functions/lib/formCore.ts'],
    absWorkingDir: process.cwd(),
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
  })
  const url = 'data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].contents).toString('base64')
  const { clientConfirmationEmail, clientConfirmationText, applicantConfirmationEmail } = await import(url)
  const example={
    name:'Js',
    email:'example@example.com',
    referenceId:'OPERAVA-SER-74036461',
    sourceLabel:'Services / Request a Quote form',
    rows:[
      {label:'Email',value:'example@example.com'},
      {label:'Phone',value:'0954875848'},
      {label:'Country / Location',value:'Bajak'},
      {label:'Company',value:'K'},
      {label:'Inquiry Type',value:'Application - Future Operavian'},
      {label:'Description',value:'Example project requirements'},
      {label:'Preferred contact',value:'Email'},
    ]
  }
  const application=clientConfirmationEmail(example)
  assert.match(application,/align="left"/)
  assert.match(application,/Thank you for contacting OPERAVA/)
  assert.match(application,/application to become a Future Operavian/)
  assert.match(application,/2-3 business days/)
  assert.match(application,/OPERAVA Recruitment Team/)
  assert.match(application,/Submitted Details/)
  assert.match(application,/Company \/ Organization/)
  assert.match(application,/OPERAVA-SER-74036461/)
  assert.doesNotMatch(application,/{{EMAIL_BODY}}|class="otp-panel"/)
  assert.match(clientConfirmationText(example),/Best regards,\nOPERAVA Recruitment Team/)
  const partnership = clientConfirmationEmail({
    ...example,
    rows: example.rows.map(row => row.label === 'Inquiry Type' ? {...row,value:'Services Inquiry - Future Business Partner'} : row)
  })
  assert.match(partnership,/future business partnership/)
  assert.match(partnership,/1-2 business days/)
  assert.match(partnership,/OPERAVA Support Team/)
  const generic = clientConfirmationEmail({...example,rows:example.rows.map(row=>row.label==='Inquiry Type'?{...row,value:'General Inquiry'}:row)})
  assert.doesNotMatch(generic,/future business partnership|Future Operavian|1-2 business days/)
  const career = applicantConfirmationEmail(example)
  assert.match(career,/OPERAVA Recruitment Team/)
})
