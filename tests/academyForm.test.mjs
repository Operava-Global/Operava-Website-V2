import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('OPERAVA Academy uses the shared email-verification and confirmation pipeline', () => {
  const form = readFileSync(new URL('../src/components/forms/AcademyEnrollmentForm.tsx', import.meta.url), 'utf8')
  const page = readFileSync(new URL('../src/pages/Academy.tsx', import.meta.url), 'utf8')
  const verify = readFileSync(new URL('../functions/api/forms/verify.ts', import.meta.url), 'utf8')
  const core = readFileSync(new URL('../functions/lib/formCore.ts', import.meta.url), 'utf8')
  const success = readFileSync(new URL('../src/components/forms/FormSuccess.tsx', import.meta.url), 'utf8')

  assert.match(page, /<AcademyEnrollmentForm \/>/)
  assert.match(form, /formType: 'ACADEMY'/)
  assert.match(form, /<OtpVerify/)
  assert.match(form, /Link to="\/privacy"/)
  assert.match(verify, /isAcademy\s*\?\s*env\.ACADEMY_INBOX\s*\|\|\s*ACADEMY_INBOX_DEFAULT/)
  assert.match(verify, /confirmationBcc\s*=\s*isAcademy/)
  assert.match(verify, /\.\.\.\(confirmationBcc\s*\?\s*\{\s*bcc:\s*\[confirmationBcc\]\s*\}\s*:\s*\{\}\)/)
  assert.match(core, /ACADEMY_INBOX_DEFAULT = 'academy@operavaglobal\.com'/)
  assert.match(core, /OPERAVA Academy Team/)
  assert.match(success, /Academy inquiry received/)
})
