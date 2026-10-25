import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  otpEmailTemplate,
  careersOtpEmailTemplate,
  applicationConfirmationTemplate,
  careersStaffNotificationTemplate,
  servicesConfirmationTemplate,
} from '../functions/lib/emailTemplates.ts'

const canonical = readFileSync(new URL('../email/templates/operava-otp.html', import.meta.url), 'utf8')

test('Careers email OTP retains the owner-approved HTML structure and 6-digit code placeholders', () => {
  assert.equal(otpEmailTemplate, canonical, 'Never change the approved OTP master')
  assert.match(careersOtpEmailTemplate, /Verify your OPERAVA job application/)
  assert.match(careersOtpEmailTemplate, /complete your OPERAVA job application/)
  assert.match(careersOtpEmailTemplate, /{{otp_code}}/)
  assert.match(careersOtpEmailTemplate, /{{expiry_minutes}}/)
  assert.match(careersOtpEmailTemplate, /www\.operavaglobal\.com<\/a>/)
  assert.match(careersOtpEmailTemplate, /max-width:640px/)
  assert.match(careersOtpEmailTemplate, /linear-gradient\(180deg,#000000 0%,#190b30 31%,#5e1cb0 70%,#bc9af4 100%\)/)
  assert.match(otpEmailTemplate, /Use this one-time password to securely sign in/, 'The owner-uploaded master stays unchanged')
})

test('Careers applicant confirmation says job application, never general inquiry', () => {
  assert.match(applicationConfirmationTemplate, /APPLICATION CONFIRMATION/)
  assert.match(applicationConfirmationTemplate, /Thank you for submitting your application to OPERAVA Global Solutions\./)
  assert.match(applicationConfirmationTemplate, /APPLICATION CONFIRMATION/)
  assert.match(applicationConfirmationTemplate, /Application reference number/)
  assert.match(applicationConfirmationTemplate, /{{REFERENCE_ID}}/)
  assert.match(applicationConfirmationTemplate, /{{DETAILS_LIST}}/)
  assert.doesNotMatch(applicationConfirmationTemplate, /thank you for contacting OPERAVA|service inquiry/i)
  assert.match(applicationConfirmationTemplate, /www\.operavaglobal\.com<\/a>/)
})

test('Talent Acquisition gets application-specific notification; general inquiry remains unchanged', () => {
  assert.match(careersStaffNotificationTemplate, /NEW JOB APPLICATION/)
  assert.match(careersStaffNotificationTemplate, /NEW JOB APPLICATION/)
  assert.match(careersStaffNotificationTemplate, /{{REFERENCE_ID}}/)
  assert.match(careersStaffNotificationTemplate, /{{ROWS_HTML}}/)
  assert.match(servicesConfirmationTemplate, /SUBMISSION CONFIRMATION/)
})

test('Careers OTP squares have dedicated high contrast in both themes and a visible focus state', () => {
  const css = readFileSync(new URL('../src/site/theme.css', import.meta.url), 'utf8')
  const component = readFileSync(new URL('../src/components/forms/OtpVerify.tsx', import.meta.url), 'utf8')
  assert.match(component, /careerMode\s*\?\s*"operava-careers-otp-digit/)
  assert.match(css, /html:not\(\[data-theme="light"\]\) #site-shell input\.operava-careers-otp-digit/)
  assert.match(css, /html\[data-theme="light"\] #site-shell input\.operava-careers-otp-digit/)
  assert.match(css, /input\.operava-careers-otp-digit:focus-visible/)
  assert.match(css, /border:2px solid #b8a0f2!important/)
})
