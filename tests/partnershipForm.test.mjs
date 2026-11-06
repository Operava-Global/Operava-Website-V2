import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { validateIntakeForm } from '../src/utils/formValidation.ts'

const proposal = {
  name: 'Jane Partner',
  company: 'Example Alliance Ltd',
  partnershipType: 'Technology / Integration Partner',
  email: 'jane@example.org',
  phone: '+63 912 345 6789',
  country: 'Philippines',
  category: '',
  service: '',
  description: 'We would like to partner on technology integrations for regional customers.',
  websiteUrl: 'https://example.org',
  accurate: true,
  privacy: true,
}

test('Partnership intake accepts a complete verified proposal without Careers fields', () => {
  assert.deepEqual(validateIntakeForm(proposal, 'PARTNERSHIP'), {})
})

test('Partnership intake requires company, type, proposal and consent', () => {
  const result = validateIntakeForm({
    ...proposal,
    company: '',
    partnershipType: '',
    description: 'Too short',
    accurate: false,
    privacy: false,
  }, 'PARTNERSHIP')
  assert.ok(result.company)
  assert.ok(result.partnershipType)
  assert.ok(result.description)
  assert.ok(result.accurate)
  assert.ok(result.privacy)
  assert.equal(result.resume, undefined)
})

test('Partnership uses dedicated route, homepage CTA and footer quick link', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const home = readFileSync(new URL('../src/pages/Home.tsx', import.meta.url), 'utf8')
  const nav = readFileSync(new URL('../src/site/nav.ts', import.meta.url), 'utf8')
  const start = readFileSync(new URL('../functions/api/forms/start.ts', import.meta.url), 'utf8')
  const verify = readFileSync(new URL('../functions/api/forms/verify.ts', import.meta.url), 'utf8')
  assert.match(app, /path="\/partnerships" element=\{<Partnership \/>\}/)
  assert.match(home, /to="\/partnerships"/)
  assert.match(nav, /\{ label: 'Partnerships', to: '\/partnerships' \}/)
  assert.match(start, /'PARTNERSHIP'/)
  assert.match(verify, /partners@operavaglobal\.com/)
  assert.match(verify, /isAcademy\s*\?\s*env\.ACADEMY_INBOX\s*\|\|\s*ACADEMY_INBOX_DEFAULT/)
  assert.match(verify, /isPartnership\s*\?\s*env\.PARTNERS_INBOX\s*\|\|\s*'partners@operavaglobal\.com'/)
  assert.match(verify, /\.\.\.\(confirmationBcc\s*\?\s*\{\s*bcc:\s*\[confirmationBcc\]\s*\}\s*:\s*\{\}\)/)
})
