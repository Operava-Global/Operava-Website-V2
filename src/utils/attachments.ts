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

/**
 * Careers policy: a CV/résumé must be submitted as PDF, not DOC/DOCX/TXT.
 * The file is held in browser memory until verified SES delivery, never R2.
 */
export const CAREER_RESUME_ACCEPT = '.pdf,application/pdf'

export function validateCareerResumePdf(file: File): string | null {
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return 'Incorrect CV / résumé format: only a non-editable PDF (.pdf) is accepted. Please export your document as PDF; DOC, DOCX, TXT, JPEG and PNG cannot be submitted.'
  }
  if (file.size === 0) return 'CV / résumé file is empty. Export a complete PDF and select it again.'
  if (file.size >= MAX_ATTACHMENT_BYTES) {
    return 'CV / résumé is too large. The limit is strictly less than 5 MB (5,000,000 bytes). Compress the PDF or export a smaller copy.'
  }
  if (file.type && file.type !== 'application/pdf' && file.type !== 'application/octet-stream') {
    return 'Incorrect CV / résumé file type: the selected document is not identified as a PDF. Export a valid .pdf and try again.'
  }
  return validateAttachment(file)
}

export async function careerResumeMetadata(file: File): Promise<Awaited<ReturnType<typeof attachmentMetadata>>> {
  const error = validateCareerResumePdf(file)
  if (error) throw new Error(error)
  try {
    return await attachmentMetadata(file)
  } catch (cause) {
    if (cause instanceof Error && /Invalid PDF/.test(cause.message)) {
      throw new Error('Invalid CV / résumé PDF: the file does not contain a valid PDF header. Re-export it as PDF instead of renaming its extension.')
    }
    throw cause
  }
}
