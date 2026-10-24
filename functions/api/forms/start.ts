import {
  EMAIL_RE,
  clean,
  ensureTables,
  generateOtp,
  hashOtp,
  json,
  maskEmail,
  otpEmailHtml,
  otpEmailText,
  purposeLabel,
  sendEmail,
  resolveSecret,
  otpSecretMissingResponse,
  issueSignedDraft,
  senderFor,
  type FormEnv,
  type FormType,
} from '../../lib/formCore'

import { checkAttachmentName, MAX_ATTACHMENT_BYTES } from '../../lib/emailAttachment'

const TYPES = new Set(['SERVICES', 'CAREERS', 'CONTACT', 'ACADEMY'])

function mailErrorResponse(msg: string) {
  const code = msg === 'SES_SMTP_NOT_CONFIGURED'
    ? 'SES_SMTP_NOT_CONFIGURED'
    : msg.includes('SES_SMTP_REJECTED_535')
      ? 'SES_SMTP_AUTH_FAILED'
      : 'EMAIL_SEND_FAILED'
  const error = code === 'SES_SMTP_NOT_CONFIGURED'
    ? 'Email delivery is not configured. Please contact hello@operavaglobal.com.'
    : 'Unable to send the verification email at this time. Please try again, or contact hello@operavaglobal.com.'
  return json({ error, code }, code === 'SES_SMTP_NOT_CONFIGURED' ? 503 : 502)
}

export const onRequestPost: PagesFunction<FormEnv> = async ({ request, env }) => {
  try {
    if (!env.SES_SMTP_USERNAME || !env.SES_SMTP_PASSWORD) {
      return json({ error: 'Email verification is temporarily unavailable. Please contact hello@operavaglobal.com.', code: 'SES_SMTP_NOT_CONFIGURED' }, 503)
    }

    const secret = resolveSecret(env)
    if (!secret) return otpSecretMissingResponse()
    if (!env.SUBMISSIONS_DB) return json({ error: 'Submission storage is not configured.', code: 'STORAGE_NOT_CONFIGURED' }, 503)
    const db = env.SUBMISSIONS_DB
    if (!db) return json({ error: 'Secure form storage is temporarily unavailable.', code: 'STORAGE_UNAVAILABLE' }, 503)

    let body: Record<string, unknown>
    try {
      const parsed = await request.json()
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return json({ error: 'Invalid request body.' }, 400)
      }
      body = parsed as Record<string, unknown>
    } catch {
      return json({ error: 'Invalid request body.' }, 400)
    }

    if (clean(body.website, 80)) {
      return json({ ok: true, draftId: 'filtered', maskedEmail: 'hidden' })
    }

    const formType = clean(body.formType, 20).toUpperCase() as FormType
    if (!TYPES.has(formType)) return json({ error: 'Unknown form type.' }, 400)

    const name = clean(body.name, 120)
    const email = clean(body.email, 180).toLowerCase()
    const phone = clean(body.phone, 40)
    const country = clean(body.country, 80)
    const phoneDigits = phone.replace(/\D/g, '')
    if (name.length < 2) return json({ error: 'Full name is required.' }, 400)
    if (!EMAIL_RE.test(email)) return json({ error: 'A valid email is required.' }, 400)
    if (phoneDigits.length < 7 || phoneDigits.length > 15 || !/^[+]?[\d\s().-]{7,40}$/.test(phone)) {
      return json({ error: 'Enter a valid phone number (7–15 digits).' }, 400)
    }
    if (country.length < 2) return json({ error: 'Country / location is required.' }, 400)
    if (body.accurate !== true || body.privacy !== true) {
      return json({ error: 'Required confirmations are missing.' }, 400)
    }

    if (formType === 'SERVICES' || formType === 'CONTACT') {
      if (!clean(body.category, 180) || !clean(body.service, 180)) {
        return json({ error: 'Select an inquiry category and service.' }, 400)
      }
      if (clean(body.description || body.message, 4000).length < 15) {
        return json({ error: 'Please describe your requirements (at least 15 characters).' }, 400)
      }
    }
    if (formType === 'ACADEMY') {
      if (!clean(body.category, 180)) return json({ error: 'Inquiry type is required.' }, 400)
      if (clean(body.description || body.message, 4000).length < 10) {
        return json({ error: 'Please describe your enrollment or inquiry.' }, 400)
      }
    }
    if (formType === 'CAREERS') {
      if (!clean(body.position, 180) || !clean(body.specialization, 180) || !clean(body.availability, 180)) {
        return json({ error: 'Position, specialization and availability are required.' }, 400)
      }
      if (!clean(body.education, 300) || clean(body.experience, 4000).length < 15) {
        return json({ error: 'Education and work experience are required.' }, 400)
      }
      // Careers always requires the actual PDF CV, not a portfolio URL or a legacy resume key.
      if (!String(body.attachmentName || '').trim()) {
        return json({
          error: 'CV / résumé is missing. Attach one non-editable PDF (.pdf) smaller than 5 MB. A portfolio or LinkedIn URL does not replace the PDF.',
          code: 'CAREER_RESUME_REQUIRED',
          fieldErrors: { resume: 'A PDF CV / résumé under 5 MB is required.' },
        }, 400)
      }
      if (!String(body.attachmentName).toLowerCase().endsWith('.pdf')) {
        return json({
          error: 'Incorrect CV / résumé file type. Careers accepts PDF (.pdf) only; Word, TXT and image files are not allowed.',
          code: 'CAREER_RESUME_PDF_ONLY',
          fieldErrors: { resume: 'Upload a PDF document, not DOC, DOCX, TXT or an image.' },
        }, 400)
      }
    }

    // Bind the selected file's SHA-256, filename, and size to the signed OTP draft.
    // The bytes stay in the browser and will only arrive at /verify after OTP entry.
    const hasAttachment = body.attachmentName != null || body.attachmentSha256 != null || body.attachmentSize != null
    if (hasAttachment) {
      const filename = String(body.attachmentName || '')
      const size = Number(body.attachmentSize)
      const hash = String(body.attachmentSha256 || '')
      try { checkAttachmentName(filename) }
      catch { return json({
        error: formType === 'CAREERS' ? 'CV / résumé must be a valid PDF (.pdf).' : 'Attach a PDF, DOC, DOCX, or TXT file.',
        code: 'ATTACHMENT_TYPE_INVALID',
        ...(formType === 'CAREERS' ? { fieldErrors: { resume: 'Select a valid PDF CV / résumé.' } } : {}),
      }, 400) }
      if (!Number.isSafeInteger(size) || size < 1 || size >= MAX_ATTACHMENT_BYTES ||
          !/^[a-f0-9]{64}$/.test(hash)) {
        return json({
          error: 'Incorrect attachment size or security hash. The file must contain data and be strictly smaller than 5 MB (5,000,000 bytes). Select the file again.',
          code: 'ATTACHMENT_METADATA_INVALID',
          ...(formType === 'CAREERS' ? { fieldErrors: { resume: 'CV / résumé must be a valid PDF smaller than 5 MB.' } } : {}),
        }, 400)
      }
    }

    const now = Date.now()
    const code = generateOtp()
    const codeHash = await hashOtp(secret, code)
    // Only approved, bounded fields may be signed, stored or emailed.
    // Never persist anti-bot tokens, arbitrary nested objects or internal secrets.
    const fieldLimits: Record<string, number> = {
      company: 160, phone: 40, country: 80, category: 180, service: 180,
      description: 4000, message: 4000, budget: 160, websiteUrl: 500,
      contactMethod: 80, position: 180, specialization: 180,
      availability: 180, experience: 4000, education: 300, skills: 2000,
      portfolio: 500, additional: 4000, resumeKey: 240, attachmentName: 120, attachmentSha256: 64,
    }
    const safeFields: Record<string, string> = {}
    for (const [field, limit] of Object.entries(fieldLimits)) {
      if (Object.prototype.hasOwnProperty.call(body, field)) safeFields[field] = clean(body[field], limit)
    }
    if (hasAttachment) safeFields.attachmentSize = String(body.attachmentSize)
    const payload = JSON.stringify({ ...safeFields, name, email, formType, accurate: true, privacy: true })
    const expiresAt = now + 10 * 60 * 1000

    const draftId = await issueSignedDraft(secret, {
      email,
      formType,
      payload,
      codeHash,
      expiresAt,
      attempts: 0,
      resends: 0,
      lastSentAt: now,
    })

    // A durable OTP record is mandatory: signed drafts alone are replayable.
    try {
      await ensureTables(db)
      const existing = await db.prepare(
        'SELECT last_sent_at FROM form_otps WHERE email = ? AND form_type = ? ORDER BY id DESC LIMIT 1',
      ).bind(email, formType).first<{ last_sent_at: number }>()
      if (existing && now - Number(existing.last_sent_at) < 45000) {
        return json({ error: 'Please wait before requesting another code.', retryAfterSec: 45 }, 429)
      }
      await db.prepare(
        'UPDATE form_otps SET consumed = 1 WHERE email = ? AND form_type = ? AND consumed = 0',
      ).bind(email, formType).run()
      await db.prepare(
        'INSERT INTO form_otps (email, form_type, draft_id, code_hash, payload, expires_at, attempts, resends, last_sent_at, consumed) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, 0)',
      ).bind(email, formType, draftId, codeHash, payload, expiresAt, now).run()
    } catch (storageError) {
      console.error('OTP storage failed', storageError instanceof Error ? storageError.message : 'unknown')
      return json({ error: 'Unable to save this verification session. Please try again.', code: 'STORAGE_FAILED' }, 503)
    }

    try {
      await sendEmail(env, {
        from: senderFor(formType, env),
        to: [email],
        subject: 'Verification Code',
        html: otpEmailHtml(name, purposeLabel(formType), code),
        text: otpEmailText(name, purposeLabel(formType), code),
      })
    } catch (mailErr) {
      const msg = mailErr instanceof Error ? mailErr.message : 'unknown'
      console.error('OTP email send failed', msg)
      await db.prepare('UPDATE form_otps SET consumed = 1 WHERE draft_id = ?').bind(draftId).run().catch(() => {})
      return mailErrorResponse(msg)
    }

    return json({
      ok: true,
      draftId,
      maskedEmail: maskEmail(email),
      expiresInSec: 600,
    })
  } catch (err) {
    console.error('form start failed', err instanceof Error ? err.message : 'unknown')
    return json({ error: 'Unable to start verification.' }, 500)
  }
}
