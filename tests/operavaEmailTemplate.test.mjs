import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  otpEmailTemplate,
  servicesConfirmationTemplate,
  applicationConfirmationTemplate,
  staffNotificationTemplate,
  recruitmentPoolConfirmationTemplate,
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
