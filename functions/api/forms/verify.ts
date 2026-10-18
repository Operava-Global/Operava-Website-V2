import {
  applicantConfirmationEmail,
  clientConfirmationEmail,
  ensureTables,
  otpCodeMatches,
  json,
  makeReference,
  sendResend,
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
  ])
  return Object.entries(payload)
    .filter(([key, value]) => !skip.has(key) && value != null && String(value).trim() !== '')
    .map(([key, value]) => ({
      label: LABEL_MAP[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    }))
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  try {
    if (!env.RESEND_API_KEY || String(env.RESEND_API_KEY).trim().length < 8) {
      return json({ error: 'Email delivery is not configured.' }, 503)
    }
    const secret = resolveSecret(env)
    if (!secret) return otpSecretMissingResponse()
    const db = env.SUBMISSIONS_DB
    if (!db) return json({ error: 'Secure form storage is temporarily unavailable.', code: 'STORAGE_UNAVAILABLE' }, 503)

    let body: { draftId?: string; code?: string }
    try {
      body = (await request.json()) as { draftId?: string; code?: string }
    } catch {
      return json({ error: 'Invalid request body.' }, 400)
    }
    const draftId = String(body.draftId || '').trim()
    const code = String(body.code || '').replace(/\D/g, '').slice(0, 6)
    if (!draftId || code.length !== 6) return json({ error: 'Enter the 6-digit code.' }, 400)

    const signed = await readSignedDraft(secret, draftId)
    if (!signed) return json({ error: 'This code is no longer valid. Start the form again.' }, 400)
    if (Date.now() > Number(signed.expiresAt)) return json({ error: 'This code has expired.' }, 400)
    // The database, not the browser's signed draft, is the verification authority.
    try {
      await ensureTables(db)
      const record = await db.prepare('SELECT code_hash, attempts, consumed, expires_at, email, form_type FROM form_otps WHERE draft_id = ? ORDER BY id DESC LIMIT 1')
        .bind(draftId).first<{ code_hash: string; attempts: number; consumed: number; expires_at: number; email: string; form_type: string }>()
      if (!record || record.consumed || record.expires_at < Date.now() || record.email !== signed.email || record.form_type !== signed.formType) {
        return json({ error: 'This verification session is no longer valid. Request a new code.' }, 400)
      }
      if (record.attempts >= 5) return json({ error: 'Too many attempts. Start the verification again.' }, 429)
      if (!(await otpCodeMatches(secret, code, record.code_hash))) {
        await db.prepare('UPDATE form_otps SET attempts = attempts + 1 WHERE draft_id = ? AND consumed = 0 AND attempts < 5')
          .bind(draftId).run()
        return json({ error: 'Invalid verification code.', attemptsRemaining: Math.max(0, 4 - record.attempts) }, 401)
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
    const from = senderFor(formType, env)

    try {
      await sendResend(env, {
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
    }

    try {
      if (staffInbox.toLowerCase() !== email.toLowerCase()) {
        await sendResend(env, {
          from,
          to: [staffInbox],
          reply_to: email,
          subject: staffSubject,
          html: staffHtml,
          text: staffText,
        })
      }
    } catch (staffErr) {
      console.error('staff notification failed', staffErr instanceof Error ? staffErr.message : 'unknown')
    }

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
