import {
  clean,
  generateOtp,
  hashOtp,
  json,
  maskEmail,
  otpEmailHtml,
  otpEmailText,
  purposeLabel,
  readSignedDraft,
  resolveSecret,
  otpSecretMissingResponse,
  issueSignedDraft,
  sendEmail,
  senderFor,
  type FormEnv,
} from '../../lib/formCore'

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
    const db = env.SUBMISSIONS_DB
    if (!db) return json({ error: 'Secure form storage is temporarily unavailable.', code: 'STORAGE_UNAVAILABLE' }, 503)

    let body: Record<string, unknown>
    try {
      body = (await request.json()) as Record<string, unknown>
    } catch {
      return json({ error: 'Invalid request body.' }, 400)
    }

    const draftId = clean(body.draftId, 30000)
    if (!draftId) return json({ error: 'Missing draft.' }, 400)

    const draft = await readSignedDraft(secret, draftId)
    if (!draft) return json({ error: 'Verification session expired. Please start again.' }, 400)

    let current: { consumed: number; expires_at: number; last_sent_at: number; resends: number; attempts: number } | null
    try {
      current = await db.prepare('SELECT consumed, expires_at, last_sent_at, resends, attempts FROM form_otps WHERE draft_id = ? ORDER BY id DESC LIMIT 1')
        .bind(draftId).first<{ consumed: number; expires_at: number; last_sent_at: number; resends: number; attempts: number }>()
    } catch (storageError) {
      console.error('OTP resend lookup failed', storageError)
      return json({ error: 'Verification service is temporarily unavailable.' }, 503)
    }
    if (!current || current.consumed) return json({ error: 'This verification session has ended. Please start again.' }, 409)

    const now = Date.now()
    if (now > Number(current.expires_at)) {
      return json({ error: 'Verification session expired. Please start again.' }, 400)
    }
    if (now - Number(current.last_sent_at || 0) < 45000) {
      return json({ error: 'Please wait before requesting another code.', retryAfterSec: 45 }, 429)
    }
    if (Number(current.resends || 0) >= 5) {
      return json({ error: 'Resend limit reached. Please start again.' }, 429)
    }

    const code = generateOtp()
    const codeHash = await hashOtp(secret, code)
    const nextDraftId = await issueSignedDraft(secret, {
      email: draft.email,
      formType: draft.formType,
      payload: draft.payload,
      codeHash,
      expiresAt: draft.expiresAt,
      attempts: draft.attempts || 0,
      resends: (draft.resends || 0) + 1,
      lastSentAt: now,
    })

    try {
      const updated = await db.prepare(
        'UPDATE form_otps SET draft_id = ?, code_hash = ?, last_sent_at = ?, resends = resends + 1 WHERE draft_id = ? AND consumed = 0 AND expires_at > ? AND resends < 5',
      ).bind(nextDraftId, codeHash, now, draftId, now).run()
      if (!updated.meta?.changes) return json({ error: 'Session has changed. Start again.' }, 409)
    } catch (storageError) {
      console.error('OTP resend storage failed', storageError)
      return json({ error: 'Unable to save the new verification code.' }, 503)
    }

    let displayName = ''
    try {
      const parsed = JSON.parse(draft.payload) as { name?: string }
      displayName = typeof parsed.name === 'string' ? parsed.name : ''
    } catch {
      displayName = ''
    }

    try {
      await sendEmail(env, {
        from: senderFor(draft.formType, env),
        to: [draft.email],
        subject: 'Verification Code',
        html: otpEmailHtml(displayName, purposeLabel(draft.formType), code),
        text: otpEmailText(displayName, purposeLabel(draft.formType), code),
      })
    } catch (mailErr) {
      const msg = mailErr instanceof Error ? mailErr.message : 'unknown'
      console.error('OTP resend failed', msg)
      await db.prepare('UPDATE form_otps SET consumed = 1 WHERE draft_id = ?').bind(nextDraftId).run().catch(() => {})
      return mailErrorResponse(msg)
    }

    return json({
      ok: true,
      draftId: nextDraftId,
      maskedEmail: maskEmail(draft.email),
      expiresInSec: Math.max(0, Math.floor((Number(draft.expiresAt) - now) / 1000)),
    })
  } catch (err) {
    console.error('form resend failed', err instanceof Error ? err.message : 'unknown')
    return json({ error: 'Unable to resend verification code.' }, 500)
  }
}
