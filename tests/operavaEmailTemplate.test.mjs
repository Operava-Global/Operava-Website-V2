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
    plugins: [{
      name: 'cloudflare-sockets-test-stub',
      setup(build) {
        build.onResolve({filter: /^cloudflare:sockets$/}, () => ({path: 'cloudflare:sockets', namespace: 'test-stub'}))
        build.onLoad({filter: /.*/, namespace: 'test-stub'}, () => ({
          contents: 'export const connect = () => { throw new Error("Cloudflare transport unavailable in unit tests") }',
          loader: 'js',
        }))
      },
    }],
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
  assert.match(career,/job application/i)
  assert.doesNotMatch(career,/Future Operavian/)

  const partnershipSubmission = clientConfirmationEmail({
    ...example,
    sourceLabel: 'OPERAVA Partnership form',
    rows: [
      { label: 'Email', value: 'partner@example.org' },
      { label: 'Company', value: 'Example Alliance Ltd' },
      { label: 'Partnership Type', value: 'Technology / Integration Partner' },
      { label: 'Role / Title', value: 'Partnership Director' },
      { label: 'Target Markets', value: 'Southeast Asia' },
      { label: 'Partnership Timeline', value: 'Within 3 months' },
      { label: 'Description', value: 'We propose a regional technology integration collaboration.' },
      { label: 'Website / System URL', value: 'https://example.org' },
    ],
  })
  assert.match(partnershipSubmission, /partnership proposal/i)
  assert.match(partnershipSubmission, /OPERAVA Partnerships Team/)
  assert.match(partnershipSubmission, /Partnership Type/)
  assert.match(partnershipSubmission, /Partnership Proposal/)
  assert.match(partnershipSubmission, /Company Website/)
  assert.match(partnershipSubmission, /OPERAVA-SER-74036461/)
  assert.match(partnershipSubmission, /max-width:640px/)
  assert.ok(partnershipSubmission.includes('linear-gradient(180deg,#000000 0%,#190b30 31%,#5e1cb0 70%,#bc9af4 100%)'))

  const academySubmission = clientConfirmationEmail({
    ...example,
    sourceLabel: 'OPERAVA Academy enrollment / inquiry form',
    rows: [
      { label: 'Email', value: 'learner@example.org' },
      { label: 'Phone', value: '+63 912 345 6789' },
      { label: 'Country / Location', value: 'Philippines' },
      { label: 'Company', value: 'Example Learning Group' },
      { label: 'Inquiry Type', value: 'Course Enrollment' },
      { label: 'Program / Track', value: 'Artificial Intelligence' },
      { label: 'Description', value: 'I would like to enroll in the next available AI program.' },
    ],
  })
  assert.match(academySubmission, /OPERAVA Academy enrollment or information inquiry/)
  assert.match(academySubmission, /OPERAVA Academy Team/)
  assert.match(academySubmission, /Thank you for your interest in OPERAVA Academy/)
  assert.match(academySubmission, /Inquiry Category/)
  assert.match(academySubmission, /Service \/ Program/)
  assert.match(academySubmission, /OPERAVA-SER-74036461/)
  assert.match(academySubmission, /max-width:640px/)
})
