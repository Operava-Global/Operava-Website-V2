/** Shared client-side checks. File bytes remain in the browser until OTP verification. */
export const MAX_ATTACHMENT_BYTES = 5_000_000
export const ATTACHMENT_ACCEPT = '.pdf,.doc,.docx,.txt'

export function validateAttachment(file: File): string | null {
  if (!/\.(pdf|doc|docx|txt)$/i.test(file.name)) return 'Choose a PDF, DOC, DOCX, or TXT file.'
  if (file.size < 1 || file.size >= MAX_ATTACHMENT_BYTES) return 'File must be smaller than 5 MB.'
  return null
}

export async function attachmentMetadata(file: File): Promise<{ attachmentName: string; attachmentSize: number; attachmentSha256: string }> {
  const error = validateAttachment(file)
  if (error) throw new Error(error)
  const bytes = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return {
    attachmentName: file.name,
    attachmentSize: file.size,
    attachmentSha256: Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join(''),
  }
}
