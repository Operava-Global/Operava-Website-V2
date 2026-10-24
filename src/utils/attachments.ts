/** Shared client-side checks. File bytes stay in the browser until OTP verification. */
export const MAX_ATTACHMENT_BYTES = 5_000_000
export const ATTACHMENT_ACCEPT = '.pdf,.doc,.docx,.txt'

const types: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
}

export function validateAttachment(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!types[ext] || !file.name.trim() || file.name.length > 120 || /[\\/\x00-\x1f\x7f]/.test(file.name)) {
    return 'Choose a PDF, DOC, DOCX, or TXT file.'
  }
  if (file.size < 1 || file.size >= MAX_ATTACHMENT_BYTES) return 'File must be smaller than 5 MB.'
  if (file.type && file.type !== 'application/octet-stream' && file.type !== types[ext]) {
    return 'File type does not match its extension.'
  }
  return null
}

export async function attachmentMetadata(file: File): Promise<{ attachmentName: string; attachmentSize: number; attachmentSha256: string }> {
  const error = validateAttachment(file)
  if (error) throw new Error(error)
  const bytes = new Uint8Array(await file.arrayBuffer())
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const prefix = String.fromCharCode(...bytes.subarray(0, Math.min(8, bytes.length)))
  if (ext === 'pdf' && !prefix.startsWith('%PDF-')) throw new Error('Invalid PDF file.')
  if (ext === 'doc' && ![0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every((x, i) => bytes[i] === x)) {
    throw new Error('Invalid DOC file.')
  }
  if (ext === 'docx' && !prefix.startsWith('PK\x03\x04')) throw new Error('Invalid DOCX file.')
  if (ext === 'txt') {
    try { new TextDecoder('utf-8', { fatal: true }).decode(bytes) }
    catch { throw new Error('TXT files must be UTF-8.') }
    if (bytes.includes(0)) throw new Error('Invalid TXT file.')
  }
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return {
    attachmentName: file.name,
    attachmentSize: file.size,
    attachmentSha256: Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join(''),
  }
}
