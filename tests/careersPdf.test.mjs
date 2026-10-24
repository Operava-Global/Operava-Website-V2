import assert from 'node:assert/strict'
import { test } from 'node:test'
import { File } from 'node:buffer'
import {
  validateCareerResumePdf, careerResumeMetadata, CAREER_RESUME_ACCEPT,
  MAX_ATTACHMENT_BYTES,
} from '../src/utils/attachments.ts'
import { readEmailAttachment, attachmentSha256 } from '../functions/lib/emailAttachment.ts'

const valid = new File(['%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF'], 'candidate-cv.pdf', { type: 'application/pdf' })

test('Careers PDF CV uses one non-editable document format and binds actual file bytes to OTP metadata', async () => {
  assert.equal(CAREER_RESUME_ACCEPT, '.pdf,application/pdf')
  assert.equal(validateCareerResumePdf(valid), null)
  const meta = await careerResumeMetadata(valid)
  const server = await readEmailAttachment(valid)
  assert.equal(server.contentType, 'application/pdf')
  assert.equal(meta.attachmentSize, server.bytes.length)
  assert.equal(meta.attachmentSha256, await attachmentSha256(server.bytes))
})

test('Careers rejects edit-friendly documents and images even when other forms allow them', async () => {
  for (const filename of ['cv.doc','cv.docx','cv.txt','cv.png','cv.jpg','cv.pdf.exe']) {
    const file = new File(['hello'], filename, { type: 'application/octet-stream' })
    assert.match(validateCareerResumePdf(file), /only a non-editable PDF/)
  }
})

test('Careers rejects missing, empty and exactly 5 MB PDFs', async () => {
  const empty = new File([], 'cv.pdf', { type: 'application/pdf' })
  assert.match(validateCareerResumePdf(empty), /empty/)
  const fiveMB = new File([new Uint8Array(MAX_ATTACHMENT_BYTES)], 'cv.pdf', { type: 'application/pdf' })
  assert.match(validateCareerResumePdf(fiveMB), /too large/)
  await assert.rejects(careerResumeMetadata(fiveMB), /too large/)
})

test('Careers detects renamed files and MIME mismatch before OTP can start', async () => {
  const renamed = new File(['not actually a PDF'], 'cv.pdf', { type: 'application/pdf' })
  await assert.rejects(careerResumeMetadata(renamed), /Invalid CV \/ résumé PDF/)
  const spoofedMime = new File(['%PDF-1.7\n'], 'cv.pdf', { type: 'text/plain' })
  assert.match(validateCareerResumePdf(spoofedMime), /not identified as a PDF/)
})

test('Careers PDF names and exact hash match enforce the one-use email bridge', async () => {
  const expected = await careerResumeMetadata(valid)
  const changed = new File(['%PDF-1.7\nDifferent file\n%%EOF'], 'candidate-cv.pdf', { type: 'application/pdf' })
  const actual = await careerResumeMetadata(changed)
  assert.notEqual(expected.attachmentSha256, actual.attachmentSha256)
})
