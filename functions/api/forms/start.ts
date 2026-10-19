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
      body = (await request.json()) as Record<string, unknown>
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
    if (name.length < 2) return json({ error: 'Full name is required.' }, 400)
    if (!EMAIL_RE.test(email)) return json({ error: 'A valid email is required.' }, 400)
    if (body.accurate !== true || body.privacy !== true) {
      return json({ error: 'Required confirmations are missing.' }, 400)
    }
    if (formType === 'SERVICES' && clean(body.description, 4000).length < 15) {
      return json({ error: 'Project description is required.' }, 400)
    }
    if (formType === 'CAREERS' && !clean(body.position, 180)) {
      return json({ error: 'Position applying for is required.' }, 400)
    }
    if (formType === 'CONTACT' && clean(body.message || body.description, 4000).length < 10) {
      return json({ error: 'Message is required.' }, 400)
    }
    if (formType === 'ACADEMY') {
      if (!clean(body.category, 180)) {
        return json({ error: 'Inquiry type is required.' }, 400)
      }
      if (clean(body.description || body.message, 4000).length < 10) {
        return json({ error: 'Please describe your enrollment or inquiry.' }, 400)
      }
    }

    const now = Date.now()
    const code = generateOtp()
    const codeHash = await hashOtp(secret, code)
    // Anti-bot tokens must never be persisted, echoed, or included in confirmation email details.
    const safeFields = Object.fromEntries(Object.entries(body).filter(([key]) => !/turnstile|captcha|token|secret/i.test(key)))
    const payload = JSON.stringify({ ...safeFields, name, email, formType })
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
