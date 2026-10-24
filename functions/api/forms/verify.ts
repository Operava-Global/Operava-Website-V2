import {
  applicantConfirmationEmail,
  clientConfirmationEmail,
  ensureTables,
  otpCodeMatches,
  json,
  makeReference,
  sendEmail,
  resolveSecret,
  otpSecretMissingResponse,
  readSignedDraft,
  staffNotificationEmail,
  senderFor,
  extractPlainEmail,
  ACADEMY_INBOX_DEFAULT,
  type FormEnv,
  type FormType,
} from '../../lib/formCore'
import {
  backupFormSubmissionToMega,
  type MegaBackupEnv,
} from '../../lib/megaBackupHook'
import { getResumeByKey, mergeResumeIntoPayload, ensureResumeTables } from '../../lib/resumeDb'
import { MAX_MULTIPART_BYTES, readEmailAttachment, attachmentSha256, type EmailAttachment } from '../../lib/emailAttachment'

type Env = FormEnv & MegaBackupEnv

const LABEL_MAP: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  company: 'Company',
  phone: 'Phone',
  country: 'Country / Location',
  category: 'Inquiry Type',
  service: 'Program / Track',
  description: 'Description',
  message: 'Message',
  budget: 'Budget',
  websiteUrl: 'Website / System URL',
  contactMethod: 'Preferred contact',
  position: 'Position',
  availability: 'Availability',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  portfolio: 'Portfolio',
  additional: 'Additional notes',
}

function payloadRows(payload: Record<string, unknown>): Array<{ label: string; value: string }> {
  const skip = new Set([
    'website',
    'accurate',
    'privacy',
    'formType',
    'resumeKey',
    'resumeText',
    'resumeDataMandatory',
    'attachmentSha256',
    'attachmentSize',
    'cf-turnstile-response',
    'turnstileToken',
    'turnstileResponse',
  ])
  return Object.entries(payload)
    .filter(([key, value]) => !skip.has(key) && !/turnstile|captcha|token|secret/i.test(key) && value != null && String(value).trim() !== '')
    .map(([key, value]) => ({
      label: LABEL_MAP[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    }))
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  try {
    if (!env.SES_SMTP_USERNAME || !env.SES_SMTP_PASSWORD) {
      return json({ error: 'Email verification is temporarily unavailable. Please contact hello@operavaglobal.com.', code: 'SES_SMTP_NOT_CONFIGURED' }, 503)
    }
    const secret = resolveSecret(env)
    if (!secret) return otpSecretMissingResponse()
    const db = env.SUBMISSIONS_DB
    if (!db) return json({ error: 'Secure form storage is temporarily unavailable.', code: 'STORAGE_UNAVAILABLE' }, 503)

    let body: { draftId?: string; code?: string }
    let submittedFile: File | null = null
    const contentType = request.headers.get('Content-Type') || ''
    if (Number(request.headers.get('Content-Length') || 0) > MAX_MULTIPART_BYTES) {
      return json({ error: 'File must be smaller than 5 MB.' }, 413)
    }
    try {
      if (contentType.toLowerCase().startsWith('multipart/form-data')) {
        const form = await request.formData()
        const files = [...form.values()].filter((v): v is File => v instanceof File)
        if (files.length > 1 || (files.length === 1 && form.get('file') !== files[0])) {
          return json({ error: 'Choose one supported attachment.' }, 400)
        }
        submittedFile = files[0] || null
        body = { draftId: String(form.get('draftId') || ''), code: String(form.get('code') || '') }
      } else if (contentType.toLowerCase().startsWith('application/json')) {
        body = (await request.json()) as { draftId?: string; code?: string }
      } else {
        return json({ error: 'Invalid request type.' }, 415)
      }
    } catch {
      return json({ error: 'Invalid request body.' }, 400)
    }
    const draftId = String(body.draftId || '').trim()
    const code = String(body.code || '').replace(/\D/g, '').slice(0, 6)
    if (!draftId) return json({ error: 'Verification session is missing. Return to the Careers form to request a new email code.', code: 'OTP_SESSION_MISSING' }, 400)
    if (code.length !== 6) return json({ error: 'Incorrect verification code format: enter exactly 6 digits from your latest OPERAVA email.', code: 'OTP_CODE_FORMAT' }, 400)

    const signed = await readSignedDraft(secret, draftId)
    if (!signed) return json({ error: 'This verification session is invalid or no longer available. Return to the form and request a new six-digit code.', code: 'OTP_SESSION_INVALID' }, 400)
    if (Date.now() > Number(signed.expiresAt)) return json({ error: 'The verification code expired after 10 minutes. Return to the form and request a new code.', code: 'OTP_EXPIRED' }, 400)
    // The database, not the browser's signed draft, is the verification authority.
    try {
      await ensureTables(db)
      const record = await db.prepare('SELECT code_hash, attempts, consumed, expires_at, email, form_type FROM form_otps WHERE draft_id = ? ORDER BY id DESC LIMIT 1')
        .bind(draftId).first<{ code_hash: string; attempts: number; consumed: number; expires_at: number; email: string; form_type: string }>()
      if (!record) return json({ error: 'No verification session was found for this code. Return to the form and request a new code.', code: 'OTP_NOT_FOUND' }, 400)
      if (record.consumed) return json({ error: 'This verification code has already been used. To submit another application, start a new verification.', code: 'OTP_ALREADY_USED' }, 409)
      if (record.expires_at < Date.now()) return json({ error: 'The verification code has expired (10-minute limit). Return to the form and request a new code.', code: 'OTP_EXPIRED' }, 400)
      if (record.email !== signed.email || record.form_type !== signed.formType) {
        return json({ error: 'Verification session does not match this form or email address. Restart verification from your application.', code: 'OTP_SESSION_MISMATCH' }, 400)
      }
      if (record.attempts >= 5) return json({ error: 'Too many incorrect code attempts (5 maximum). Return to the form and request a new verification session.', code: 'OTP_TOO_MANY_ATTEMPTS' }, 429)
      if (!(await otpCodeMatches(secret, code, record.code_hash))) {
        await db.prepare('UPDATE form_otps SET attempts = attempts + 1 WHERE draft_id = ? AND consumed = 0 AND attempts < 5')
          .bind(draftId).run()
        return json({
          error: 'The six-digit code is incorrect. Check the latest OPERAVA verification email and enter its code exactly.',
          code: 'OTP_CODE_INCORRECT',
          attemptsRemaining: Math.max(0, 4 - record.attempts),
        }, 401)
      }
    } catch (storageError) {
      console.error('OTP lookup failed', storageError instanceof Error ? storageError.message : 'unknown')
      return json({ error: 'Unable to verify this code right now.', code: 'STORAGE_FAILED' }, 503)
    }

    let payload: Record<string, unknown> = {}
    try {
      payload = JSON.parse(signed.payload || '{}') as Record<string, unknown>
    } catch {
      payload = {}
    }

    // Exactly the file selected before OTP must accompany the verified submission.
    // Never write attachment bytes into R2, D1, logs or background backups.
    let attachment: EmailAttachment | undefined
    const declaredName = String(payload.attachmentName || '')
    if (signed.formType === 'CAREERS' && (!declaredName || !declaredName.toLowerCase().endsWith('.pdf'))) {
      return json({
        error: 'Careers CV / résumé requirement not met: a valid PDF (.pdf) under 5 MB is mandatory. Return to the application and request a new verification code.',
        code: 'CAREER_RESUME_PDF_REQUIRED',
      }, 400)
    }
    if (declaredName) {
      if (!submittedFile) return json({
        error: signed.formType === 'CAREERS'
          ? 'CV / résumé was not received with your verification. Return to the Careers form, reselect your PDF and request a new email code.'
          : 'Your selected file was not included. Return to the form and reselect it.',
        code: 'ATTACHMENT_MISSING',
      }, 400)
      try {
        attachment = await readEmailAttachment(submittedFile)
      } catch (err) {
        return json({
          error: 'Attached file rejected: ' + (err instanceof Error ? err.message : 'Invalid attachment.') + ' Please select a valid document and restart verification.',
          code: 'ATTACHMENT_REJECTED',
        }, 400)
      }
      if (signed.formType === 'CAREERS' && attachment.contentType !== 'application/pdf') {
        return json({ error: 'Incorrect Careers CV / résumé format: only PDF documents are allowed. DOC, DOCX, TXT and images are not accepted.', code: 'CAREER_RESUME_PDF_ONLY' }, 400)
      }
      const expectedSize = Number(payload.attachmentSize)
      const expectedHash = String(payload.attachmentSha256 || '')
      const hash = await attachmentSha256(attachment.bytes)
      if (attachment.filename !== declaredName || attachment.bytes.length !== expectedSize || hash !== expectedHash) {
        return json({
          error: 'CV / attachment mismatch: the filename, file size, or file contents differ from the file selected before OTP. Return to the form, reselect the correct PDF, and request a new verification code.',
          code: 'ATTACHMENT_CHANGED',
        }, 400)
      }
    } else if (submittedFile) {
      return json({ error: 'Unexpected attachment: this file was not selected when verification started. Return to the form and request a new code for the selected document.', code: 'ATTACHMENT_UNDECLARED' }, 400)
    }

    const resumeKey = String(payload.resumeKey || '').trim()
    if (resumeKey && env.SUBMISSIONS_DB) {
      try {
        const resume = await getResumeByKey(env.SUBMISSIONS_DB, resumeKey)
        payload = mergeResumeIntoPayload(payload, resume)
      } catch (resumeErr) {
        console.error('resume merge failed', resumeErr instanceof Error ? resumeErr.message : 'unknown')
      }
    }

    const name = String(payload.name || '')
    const email = extractPlainEmail(signed.email)
    const formType = signed.formType as FormType
    const referenceId = makeReference(formType)
    const nowIso = new Date().toISOString()
    const payloadJson = JSON.stringify(payload)

    // A single D1 transaction stores the verified submission and consumes its OTP.
    // The insert only runs for an unused, unexpired code. Replayed requests create no new records.
    try {
      const time = Date.now()
      const results = await db.batch([
        db.prepare(
          "INSERT INTO form_submissions (reference_id, form_type, name, email, payload, verification_status, status, resume_key, created_at, verified_at) SELECT ?, ?, ?, ?, ?, 'VERIFIED', 'VERIFIED', ?, ?, ? FROM form_otps WHERE draft_id = ? AND code_hash = ? AND consumed = 0 AND expires_at > ? AND attempts < 5",
        ).bind(referenceId, formType, name, email, payloadJson, resumeKey, nowIso, nowIso, draftId, signed.codeHash, time),
        db.prepare(
          'UPDATE form_otps SET consumed = 1 WHERE draft_id = ? AND code_hash = ? AND consumed = 0 AND expires_at > ?',
        ).bind(draftId, signed.codeHash, time),
      ])
      if (Number(results[0]?.meta?.changes || 0) !== 1 || Number(results[1]?.meta?.changes || 0) !== 1) {
        return json({ error: 'This verification was already completed or expired. Start again.' }, 409)
      }
      if (payload.resumeText) {
        try {
          await ensureResumeTables(db)
          await db.prepare('UPDATE form_submissions SET resume_text = ?, resume_parsed = ? WHERE reference_id = ?')
            .bind(String(payload.resumeText).slice(0, 200000), JSON.stringify(payload.resumeDataMandatory || {}), referenceId).run()
        } catch (resumeErr) { console.error('optional resume update failed', resumeErr) }
      }
    } catch (storageError) {
      console.error('Verified submission transaction failed', storageError instanceof Error ? storageError.message : 'unknown')
      return json({ error: 'Unable to save your verified form. Please try again later.', code: 'SUBMISSION_SAVE_FAILED' }, 503)
    }

    const megaTask = backupFormSubmissionToMega(env, {
      formType,
      referenceId,
      name,
      email,
      payload,
      verifiedAt: nowIso,
    })
    try {
      const ctx = context as { waitUntil?: (p: Promise<unknown>) => void }
      if (typeof ctx.waitUntil === 'function') ctx.waitUntil(megaTask)
      else void megaTask
    } catch {
      void megaTask
    }

    const rows = payloadRows(payload)
    const isCareer = formType === 'CAREERS'
    const isAcademy = formType === 'ACADEMY'

    const subject = isCareer
      ? 'WE RECEIVED YOUR APPLICATION'
      : isAcademy
        ? 'WE RECEIVED YOUR ACADEMY INQUIRY'
        : 'WE RECEIVED YOUR INQUIRY'

    const html = isCareer
      ? applicantConfirmationEmail({
          name,
          email,
          referenceId,
          sourceLabel: 'Careers application form',
          rows,
        })
      : clientConfirmationEmail({
          name,
          email,
          referenceId,
          sourceLabel: isAcademy
            ? 'OPERAVA Academy enrollment / inquiry form'
            : formType === 'SERVICES'
              ? 'Services / Request a Quote form'
              : 'Contact form',
          rows,
        })

    const text = isCareer
      ? 'CONFIRMATION\n\nHi ' +
        name +
        ',\n\nThank you for contacting OPERAVA and for your interest in our opportunities.\n\nWe confirm that we have received your application. Reference: ' +
        referenceId +
        '.\n\nYour application will be reviewed by the appropriate team.\n\nRegards,\nTalent Acquisition Team\nOPERAVA Global Solutions\n\nwww.operavaglobal.com'
      : isAcademy
        ? 'CONFIRMATION\n\nHi ' +
          name +
          ',\n\nThank you for contacting OPERAVA Academy.\n\nWe confirm that we have received your course/training enrollment or details inquiry. Reference: ' +
          referenceId +
          '.\n\nThe Academy team will review your request. Learning Management System: https://academy.operavaglobal.com\n\nRegards,\nOPERAVA Academy\nOPERAVA Global Solutions\n\nwww.operavaglobal.com'
        : 'CONFIRMATION\n\nHi ' +
          name +
          ',\n\nThank you for contacting OPERAVA and for your interest in our services and business solutions.\n\nWe confirm that we have received your service inquiry. Reference: ' +
          referenceId +
          '.\n\nYour service inquiry will be reviewed by the appropriate OPERAVA team.\n\nRegards,\nClient Support Team\nOPERAVA Global Solutions\n\nwww.operavaglobal.com'

    const staffInbox = isCareer
      ? env.TALENT_INBOX || 'talents@operavaglobal.com'
      : isAcademy
        ? env.ACADEMY_INBOX || ACADEMY_INBOX_DEFAULT
        : env.CLIENT_INBOX || 'hello@operavaglobal.com'

    const staffSubject = isCareer
      ? 'New application — ' + referenceId
      : isAcademy
        ? 'New Academy enrollment / inquiry — ' + referenceId
        : 'New inquiry — ' + referenceId

    const staffHtml = staffNotificationEmail({
      formType,
      referenceId,
      email,
      submittedAt: nowIso,
      rows,
    })

    const staffText =
      (isCareer ? 'APPLICATION' : isAcademy ? 'ACADEMY' : 'INQUIRY') +
      ' received\nReference: ' +
      referenceId +
      '\nFrom: ' +
      name +
      ' <' +
      email +
      '>\n\nReply to this message to contact the ' +
      (isCareer ? 'applicant' : isAcademy ? 'learner' : 'customer') +
      ' directly.\n'

    let emailWarning: string | undefined
    const careerDeliveryWarnings: string[] = []
    const from = senderFor(formType, env)

    try {
      await sendEmail(env, {
        from,
        to: [email],
        ...(isAcademy ? { bcc: [env.ACADEMY_INBOX || ACADEMY_INBOX_DEFAULT] } : {}),
        subject,
        html,
        text,
      })
    } catch (mailErr) {
      console.error('confirmation email failed', mailErr instanceof Error ? mailErr.message : 'unknown')
      emailWarning = 'Submission recorded; confirmation email could not be delivered right now.'
      if (isCareer) careerDeliveryWarnings.push('Applicant confirmation email: SES rejected or could not accept the message. Your verified application is saved, but we cannot confirm that a confirmation email was sent.')
    }

    try {
      if (attachment || staffInbox.toLowerCase() !== email.toLowerCase()) {
        await sendEmail(env, {
          from,
          to: [staffInbox],
          reply_to: email,
          subject: staffSubject,
          html: staffHtml,
          text: staffText,
          ...(attachment ? { attachments: [attachment] } : {}),
        })
      }
    } catch (staffErr) {
      console.error('staff notification failed', staffErr instanceof Error ? staffErr.message : 'unknown')
      emailWarning = attachment
        ? 'Your form was recorded but the attachment email could not be sent. Please contact the team with your reference ID.'
        : 'Your form was recorded but the team notification email could not be sent. Please contact the team with your reference ID.'
      if (isCareer) careerDeliveryWarnings.push('Talent Acquisition notification: SES could not accept the CV / résumé PDF attachment. Your application was recorded, but the file has not been confirmed sent. Contact Talent Acquisition and quote your reference ID.')
    }

    if (isCareer && careerDeliveryWarnings.length) emailWarning = careerDeliveryWarnings.join(' ')

    return json({
      ok: true,
      referenceId,
      formType,
      name,
      ...(emailWarning ? { emailWarning } : {}),
    })
  } catch (err) {
    console.error('verify failed', err instanceof Error ? err.message : 'unknown')
    return json({ error: 'Unable to verify this code.' }, 500)
  }
}
