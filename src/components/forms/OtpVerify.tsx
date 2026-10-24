import { useEffect, useRef, useState } from 'react'

interface Props {
  maskedEmail: string
  draftId: string
  onVerified: (result: { referenceId: string; name: string; formType: string; emailWarning?: string }) => void
  attachment?: File | null
  careerMode?: boolean
  onChangeEmail: () => void
  onBack: () => void
  onDraftIdChange?: (draftId: string) => void
}

export default function OtpVerify({
  maskedEmail,
  draftId: initialDraftId,
  onVerified,
  onChangeEmail,
  onBack,
  onDraftIdChange,
  attachment,
  careerMode = false,
}: Props) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [issueCode, setIssueCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [seconds, setSeconds] = useState(45)
  const [draftId, setDraftId] = useState(initialDraftId)
  const refs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    setDraftId(initialDraftId)
  }, [initialDraftId])

  useEffect(() => {
    refs.current[0]?.focus()
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [])

  const code = digits.join('')

  const verify = async (value = code) => {
    if (value.length !== 6 || busy) return
    setBusy(true)
    setError('')
    setIssueCode('')
    try {
      const body = new FormData()
      body.set('draftId', draftId)
      body.set('code', value)
      if (attachment) body.set('file', attachment, attachment.name)
      const res = await fetch('/api/forms/verify', {
        method: 'POST',
        // The browser sets the multipart boundary; do not set Content-Type manually.
        body,
      })
      const data = await res.json()
      if (data.draftId) {
        setDraftId(String(data.draftId))
        onDraftIdChange?.(String(data.draftId))
      }
      if (!res.ok) {
        setIssueCode(String(data.code || 'OTP_VERIFICATION_FAILED'))
        const remaining = data.attemptsRemaining
        const base = String(data.error || 'Email verification could not be completed. Check your code and try again.')
        if (typeof remaining === 'number') {
          throw new Error(base + ` (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`)
        }
        throw new Error(base)
      }
      onVerified({ referenceId: data.referenceId, name: data.name, formType: data.formType, emailWarning: data.emailWarning })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.')
    } finally {
      setBusy(false)
    }
  }

  const onChange = (index: number, raw: string) => {
    const next = raw.replace(/\D/g, '')
    if (next.length > 1) {
      const pasted = next.slice(0, 6).split('')
      const filled = ['', '', '', '', '', ''].map((_, i) => pasted[i] || '')
      setDigits(filled)
      if (pasted.length === 6) void verify(pasted.join(''))
      return
    }
    const ch = next.slice(-1)
    const copy = [...digits]
    copy[index] = ch
    setDigits(copy)
    if (ch && index < 5) refs.current[index + 1]?.focus()
    if (copy.join('').length === 6) void verify(copy.join(''))
  }

  const resend = async () => {
    if (seconds > 0 || busy) return
    setBusy(true)
    setError('')
    setIssueCode('')
    try {
    const res = await fetch('/api/forms/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setIssueCode(String(data.code || 'OTP_RESEND_FAILED'))
      if (typeof data.retryAfterSec === 'number') setSeconds(Math.max(1, data.retryAfterSec))
      setError(data.error || 'Unable to resend a new verification code. Return to the application and try again.')
      return
    }
    if (data.draftId) {
      setDraftId(data.draftId)
      onDraftIdChange?.(data.draftId)
    }
    setSeconds(45)
    setError('')
    setDigits(['', '', '', '', '', ''])
    refs.current[0]?.focus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-6">
      <h2 className="text-[32px] font-black uppercase leading-[0.9]">Verify your email</h2>
      <p className="text-sm text-neutral-400 leading-relaxed">We sent a 6-digit verification code to:<br /><strong className="text-white">{maskedEmail}</strong></p>
      {careerMode && <p className="text-xs text-neutral-400">Careers application: your required PDF CV / résumé stays attached to this verification session. It will be emailed to Talent Acquisition only after successful verification; no R2 storage.</p>}
      <div className="flex justify-center gap-2" role="group" aria-label="Verification code">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { refs.current[index] = el }}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${index + 1}`}
            maxLength={1}
            value={digit}
            onChange={(e) => onChange(index, e.target.value)}
            className="w-11 h-14 text-center text-xl font-black bg-black text-white border border-neutral-800 focus:border-accent outline-none"
          />
        ))}
      </div>
      {error && (
        <div role="alert" className="border border-red-500/40 bg-red-500/10 px-3 py-3 text-left">
          <p className="text-sm font-semibold text-red-300">{careerMode ? 'Verification error' : 'Verification could not continue'}</p>
          <p className="mt-1 text-xs text-red-200">{error}</p>
          {careerMode && /^(ATTACHMENT_|CAREER_RESUME_)/.test(issueCode) &&
            <p className="mt-2 text-xs text-red-200">The PDF was not sent. Select “Return to Form”, choose a genuine PDF under 5 MB again, and request a new six-digit code.</p>}
          {careerMode && /^(OTP_EXPIRED|OTP_SESSION_|OTP_NOT_FOUND|OTP_TOO_MANY_ATTEMPTS|OTP_ALREADY_USED)/.test(issueCode) &&
            <p className="mt-2 text-xs text-red-200">The current code cannot be used. Return to the Careers form and start a new verification session.</p>}
        </div>
      )}
      <button type="button" disabled={busy || code.length !== 6} onClick={() => verify()} className="w-full h-12 bg-white text-black text-xs tracking-widest uppercase font-bold hover:bg-accent-solid hover:text-white transition-colors disabled:opacity-50">
        {busy ? 'Verifying…' : 'VERIFY EMAIL'}
      </button>
      <p className="text-xs text-neutral-500">Didn't receive the code?</p>
      <button type="button" onClick={resend} disabled={seconds > 0 || busy} className="text-[11px] tracking-widest uppercase font-semibold text-accent disabled:text-neutral-600">
        Resend code{seconds > 0 ? ` in 00:${String(seconds).padStart(2, '0')}` : ''}
      </button>
      <div className="flex justify-center gap-4 text-xs">
        <button type="button" onClick={onChangeEmail} className="underline underline-offset-4 text-neutral-400 hover:text-white">Change Email Address</button>
        <button type="button" onClick={onBack} className="underline underline-offset-4 text-neutral-400 hover:text-white">Return to Form</button>
      </div>
    </div>
  )
}
