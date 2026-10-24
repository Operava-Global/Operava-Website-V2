/** Attachments are transient: inspected in memory, sent via SES, never stored in R2/D1. */
export const MAX_ATTACHMENT_BYTES = 5_000_000 // Strictly LESS than 5 MB.
export const MAX_MULTIPART_BYTES = MAX_ATTACHMENT_BYTES + 100_000
export const ATTACHMENT_ACCEPT = '.pdf,.doc,.docx,.txt'

export type EmailAttachment = { filename: string; contentType: string; bytes: Uint8Array }

const types: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
}

export function checkAttachmentName(name: string): string {
  const value = String(name || '').trim()
  const ext = value.split('.').pop()?.toLowerCase() || ''
  if (!value || value.length > 120 || /[\\/\x00-\x1f\x7f]/.test(value) || !types[ext]) {
    throw new Error('Attach a PDF, DOC, DOCX, or TXT document.')
  }
  return types[ext]
}

export async function readEmailAttachment(file: File): Promise<EmailAttachment> {
  const contentType = checkAttachmentName(file.name)
  if (file.size < 1 || file.size >= MAX_ATTACHMENT_BYTES) {
    throw new Error('Attachment must be smaller than 5 MB.')
  }
  if (file.type && file.type !== 'application/octet-stream' && file.type !== contentType &&
      !(contentType === 'text/plain' && file.type === 'text/plain')) {
    throw new Error('File type does not match its extension.')
  }
  const bytes = new Uint8Array(await file.arrayBuffer())
  const prefix = String.fromCharCode(...bytes.subarray(0, Math.min(8, bytes.length)))
  if (contentType === 'application/pdf' && !prefix.startsWith('%PDF-')) throw new Error('Invalid PDF file.')
  if (contentType === 'application/msword' &&
      ![0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every((x, i) => bytes[i] === x)) {
    throw new Error('Invalid DOC file.')
  }
  if (contentType.includes('wordprocessingml') && !prefix.startsWith('PK\x03\x04')) {
    throw new Error('Invalid DOCX file.')
  }
  if (contentType === 'text/plain') {
    try { new TextDecoder('utf-8', { fatal: true }).decode(bytes) }
    catch { throw new Error('TXT attachments must use UTF-8 text.') }
    if (bytes.includes(0)) throw new Error('Invalid TXT file.')
  }
  return { filename: file.name, contentType, bytes }
}

export async function attachmentSha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}
