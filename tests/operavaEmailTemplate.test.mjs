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
  assert.match(otpEmailTemplate, /Your access, secured\./)
  assert.match(otpEmailTemplate, /Expires in {{expiry_minutes}} minutes/)
})

test('all confirmation variants keep the same visual shell and website footer', () => {
  for (const html of [
    servicesConfirmationTemplate,
    applicationConfirmationTemplate,
    staffNotificationTemplate,
    recruitmentPoolConfirmationTemplate,
  ]) {
    assert.match(html, /max-width:560px/)
    assert.match(html, /background-color:#070710/)
    assert.match(html, /background-color:#101019/)
    assert.match(html, /background-color:#211332/)
    assert.match(html, /linear-gradient\(180deg,#101019 0%,#310752 24%,#850bfa 58%,#c7c5fb 100%\)/)
    assert.match(html, /SUBMISSION CONFIRMATION/)
    assert.match(html, /www\.operavaglobal\.com<\/a>/)
    assert.doesNotMatch(html, /{{otp_code}}|{{expiry_minutes}}|Email_Header\.png|Emailfooterimage\.jpg/)
  }
  assert.match(servicesConfirmationTemplate, /{{REFERENCE_ID}}/)
  assert.match(servicesConfirmationTemplate, /{{DETAILS_LIST}}/)
  assert.match(applicationConfirmationTemplate, /{{REFERENCE_ID}}/)
  assert.match(staffNotificationTemplate, /{{TITLE}}/)
  assert.match(staffNotificationTemplate, /{{ROWS_HTML}}/)
  assert.match(recruitmentPoolConfirmationTemplate, /{{APPLICATION_ID}}/)
})
