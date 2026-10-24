/** Optional, transient resume parsing for browser autofill. NEVER stores the uploaded file. */
import { json, type FormEnv } from '../../lib/formCore'
import { parseResumeFile } from '../../lib/resumeParse'
import { MAX_MULTIPART_BYTES, readEmailAttachment } from '../../lib/emailAttachment'

export const onRequestPost: PagesFunction<FormEnv> = async ({ request }) => {
  try {
    if (Number(request.headers.get('Content-Length') || 0) > MAX_MULTIPART_BYTES) {
      return json({ error: 'File must be smaller than 5 MB.' }, 413)
    }
    const form = await request.formData()
    const files = [...form.values()].filter((part): part is File => part instanceof File)
    if (files.length !== 1 || !(form.get('file') instanceof File)) {
      return json({ error: 'Choose one PDF, DOC, DOCX, or TXT file.' }, 400)
    }
    let attachment
    try { attachment = await readEmailAttachment(files[0]) }
    catch (error) { return json({ error: error instanceof Error ? error.message : 'Unsupported file.' }, 400) }
    let parsed
    try {
      parsed = await parseResumeFile(attachment.filename, attachment.contentType, attachment.bytes.slice().buffer as ArrayBuffer)
    } catch {
      // Scanned or image-only PDFs are still eligible attachments; parsing is best effort.
    }
    return json({
      ok: true,
      fileName: attachment.filename,
      parsed: {
        fullName: parsed?.fullName || '',
        email: parsed?.email || '',
        phone: parsed?.phone || '',
        location: parsed?.location || '',
        education: parsed?.education || '',
        experience: parsed?.experience || '',
        skills: parsed?.skills || '',
        summary: parsed?.summary || '',
      },
      notice: 'Autofill is optional. The original file remains in your browser until email verification; it is not saved to R2 or D1.',
    })
  } catch (error) {
    console.error('transient resume inspection failed', error instanceof Error ? error.name : 'unknown')
    return json({ error: 'Unable to inspect the file.' }, 400)
  }
}
