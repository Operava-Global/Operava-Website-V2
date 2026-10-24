import assert from 'node:assert/strict'
import { test } from 'node:test'
import { File } from 'node:buffer'
import { readEmailAttachment, attachmentSha256, MAX_ATTACHMENT_BYTES } from '../functions/lib/emailAttachment.ts'
import { validateAttachment, attachmentMetadata } from '../src/utils/attachments.ts'

test('TXT attachment is inspected in memory and its SHA-256 matches the browser draft', async () => {
  const file = new File(['A secure personal document'], 'notes.txt', { type: 'text/plain' })
  assert.equal(validateAttachment(file), null)
  const inspected = await readEmailAttachment(file)
  const metadata = await attachmentMetadata(file)
  assert.equal(inspected.filename, metadata.attachmentName)
  assert.equal(inspected.bytes.length, metadata.attachmentSize)
  assert.equal(await attachmentSha256(inspected.bytes), metadata.attachmentSha256)
})

test('rejects files at or over 5 MB (not 5 MiB)', async () => {
  const exactlyFiveMB = new File([new Uint8Array(MAX_ATTACHMENT_BYTES)], 'large.txt', { type: 'text/plain' })
  assert.match(validateAttachment(exactlyFiveMB), /smaller than 5 MB/)
  await assert.rejects(readEmailAttachment(exactlyFiveMB), /smaller than 5 MB/)
})

test('rejects disallowed and misleading formats', async () => {
  const exe = new File(['MZ'], 'payload.exe', { type: 'application/octet-stream' })
  assert.match(validateAttachment(exe), /PDF/)
  await assert.rejects(readEmailAttachment(exe), /PDF/)
  const fakePdf = new File(['not a PDF'], 'resume.pdf', { type: 'application/pdf' })
  await assert.rejects(readEmailAttachment(fakePdf), /Invalid PDF/)
  const fakeDocx = new File(['not a ZIP'], 'resume.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  await assert.rejects(readEmailAttachment(fakeDocx), /Invalid DOCX/)
})

test('rejects MIME extension disagreement and invalid text', async () => {
  const fakeMime = new File(['%PDF-1.7'], 'letter.pdf', { type: 'text/plain' })
  await assert.rejects(readEmailAttachment(fakeMime), /does not match/)
  const binaryTxt = new File([new Uint8Array([0xff, 0x00])], 'bad.txt', { type: 'text/plain' })
  await assert.rejects(readEmailAttachment(binaryTxt), /UTF-8/)
})

test('accepts valid PDF signature and rejects path-like names', async () => {
  const pdf = new File(['%PDF-1.7\\n1 0 obj\\n'], 'letter.pdf', { type: 'application/pdf' })
  const checked = await readEmailAttachment(pdf)
  assert.equal(checked.contentType, 'application/pdf')
  const path = new File(['hello'], '../escape.txt', { type: 'text/plain' })
  await assert.rejects(readEmailAttachment(path), /PDF, DOC/)
})
