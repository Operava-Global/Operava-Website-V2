import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CAREER_OPENINGS, type CareerOpening } from '../data/careersData'
import { Crumbs } from '../site/ui'
import { usePageMeta } from '../site/seo'

type Stage = 'position' | 'email' | 'otp' | 'session'

const POSITIONS = CAREER_OPENINGS
const SESSION_KEY = 'operava_recruitment_session_v1'

export default function AiJobScreening() {
  usePageMeta({
    title: 'Recruitment AVA',
    description: 'Recruitment AVA — start your OPERAVA application with an AI-assisted first evaluation and email verification.',
    crumbs: [
      { name: 'Careers', path: '/careers' },
      { name: 'Recruitment AVA', path: '/ai-job-screening' },
    ],
  })
  const [stage, setStage] = useState<Stage>('position')
  const [position, setPosition] = useState<CareerOpening | null>(null)
  const [emailName, setEmailName] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [draftId, setDraftId] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [sessionToken, setSessionToken] = useState('')
  const [profileName, setProfileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const draftIdRef = useRef('')
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const clearDraft = () => {
    draftIdRef.current = ''
    setDraftId('')
  }

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as {
        sessionToken?: string
        name?: string
        email?: string
        positionCode?: string
        expiresAt?: number
        applicationId?: string
      }
      if (!data.sessionToken || !data.expiresAt || Date.now() > data.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY)
        return
      }
      const pos = POSITIONS.find((p) => p.code === data.positionCode)
      if (!pos) return
      setPosition(pos)
      setSessionToken(data.sessionToken)
      setProfileName(data.name || '')
      if (data.email) setEmailValue(data.email)
      setStage('session')
    } catch {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [])

  const sendOtp = async () => {
    if (!position || busy) return
    setError('')
    const name = emailName.trim()
    const email = emailValue.trim().toLowerCase()
    if (name.length < 2) return setError('Enter your full name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email.')
    setBusy(true)
    try {
      const res = await fetch('/api/recruitment/email-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          position: position.title,
          positionCode: position.code,
          website: '',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return setError(String(data.error || 'Unable to send code.'))
      const nextDraft = String(data.draftId || '')
      if (!nextDraft || !nextDraft.startsWith('s1.')) {
        return setError('Verification session did not start correctly. Please try again.')
      }
      draftIdRef.current = nextDraft
      setDraftId(nextDraft)
      setMaskedEmail(String(data.maskedEmail || email))
      setOtpDigits(['', '', '', '', '', ''])
      setStage('otp')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const resendOtp = async () => {
    const currentDraft = draftIdRef.current || draftId
    if (!currentDraft || busy) return
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/recruitment/email-resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: currentDraft }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return setError(String(data.error || 'Unable to resend code.'))
      const nextDraft = String(data.draftId || currentDraft)
      if (!nextDraft || !nextDraft.startsWith('s1.')) {
        return setError('Verification session is invalid. Please request a new code.')
      }
      draftIdRef.current = nextDraft
      setDraftId(nextDraft)
      if (data.maskedEmail) setMaskedEmail(String(data.maskedEmail))
      setOtpDigits(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const verifyOtp = async (forcedCode?: string) => {
    if (busy || !position) return
    setError('')
    const code = (forcedCode ?? otpDigits.join('')).replace(/\D/g, '').slice(0, 6)
    if (code.length !== 6) return setError('Enter the 6-digit code from your email.')
    const currentDraft = draftIdRef.current || draftId
    if (!currentDraft || !currentDraft.startsWith('s1.')) {
      return setError('Verification session missing. Go back and request a new code.')
    }
    setBusy(true)
    try {
      const res = await fetch('/api/recruitment/email-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: currentDraft, code }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.draftId) {
        const rotated = String(data.draftId)
        if (rotated.startsWith('s1.')) {
          draftIdRef.current = rotated
          setDraftId(rotated)
        }
      }
      if (!res.ok) {
        const remaining = data.attemptsRemaining
        const base = String(data.error || 'Invalid verification code.')
        if (typeof remaining === 'number') {
          return setError(base + (remaining > 0 ? ` (${remaining} attempts left)` : ''))
        }
        return setError(base)
      }
      const token = String(data.sessionToken || '')
      if (!token) return setError('Verification succeeded but session was not created. Please try again.')
      const applicationId = String(data.applicationId || '')
      const name = String(data.name || emailName)
      const email = String(data.email || emailValue)
      setSessionToken(token)
      setProfileName(name)
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          sessionToken: token,
          applicationId,
          name,
          email,
          positionCode: position.code,
          expiresAt: data.expiresAt || Date.now() + 86400000,
        }),
      )
      setStage('session')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const header = (
    <div className="px-6 lg:px-12">
      <Crumbs items={[{ label: 'Careers', to: '/careers' }, { label: 'Recruitment AVA' }]} />
      <div className="pt-10 pb-10 border-b border-neutral-900 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-accent font-bold mb-4">Recruitment AVA · AI-assisted first evaluation</p>
          <h1 className="text-[44px] sm:text-[64px] lg:text-[88px] font-black uppercase leading-[0.85] tracking-[-0.04em]">
            Recruitment
            <br />
            <span className="text-neutral-600">AVA</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/apply" className="inline-flex items-center h-10 px-6 border border-white text-xs tracking-widest font-semibold uppercase hover:bg-white hover:text-black transition-colors">
            Formal application
          </Link>
          <Link to="/careers/hiring-process" className="inline-flex items-center h-10 text-[11px] tracking-widest uppercase border-b border-white hover:text-accent hover:border-accent">
            Hiring process →
          </Link>
        </div>
      </div>
    </div>
  )

  if (stage === 'position') {
    return (
      <div className="pb-20">
        {header}
        <div className="px-6 lg:px-12 py-12">
          <p className="text-[11px] tracking-[0.3em] uppercase text-accent font-bold mb-4">Step 1 · Application entry</p>
          <h2 className="text-[28px] lg:text-[40px] font-black uppercase leading-[0.9] mb-4">Select the position you are applying for</h2>
          <p className="text-sm text-neutral-400 mb-10 max-w-[620px]">
            Choose one track to begin. You will verify your application email before information is saved.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1px] bg-neutral-900 border border-neutral-900 rounded-[12px] overflow-hidden">
            {POSITIONS.map((p) => (
              <button
                key={p.code}
                type="button"
                onClick={() => {
                  setPosition(p)
                  setStage('email')
                  setError('')
                  clearDraft()
                }}
                className="text-left bg-black p-8 lg:p-10 hover:bg-[#0a0a0a] transition-colors group"
              >
                <p className="text-[10px] tracking-widest uppercase text-neutral-600 group-hover:text-accent">{p.type}</p>
                <p className="mt-5 font-black uppercase text-[20px] leading-[0.95]">{p.shortTitle}</p>
                <p className="text-xs text-neutral-500 mt-3 uppercase tracking-widest">{p.location || 'Remote / Global'}</p>
                <span className="mt-8 inline-flex w-10 h-10 rounded-full border border-neutral-800 items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'email' || stage === 'otp') {
    return (
      <div className="pb-20">
        {header}
        <div className="max-w-xl mx-auto px-6 py-12">
          <p className="text-[11px] tracking-[0.3em] uppercase text-accent font-bold mb-4">
            {position?.title}
          </p>
          {stage === 'email' ? (
            <div className="space-y-5 bg-[#0a0a0a] border border-neutral-900 rounded-[12px] p-6 sm:p-8">
              <h2 className="text-[28px] font-black uppercase leading-[0.9]">Verify your email</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">We will send a 6-digit code to confirm this is your application email.</p>
              <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400">
                Full name
                <input
                  className="mt-2 w-full px-4 h-12 bg-black border border-neutral-800 text-sm text-white normal-case tracking-normal outline-none focus:border-accent"
                  value={emailName}
                  onChange={(e) => setEmailName(e.target.value)}
                  autoComplete="name"
                />
              </label>
              <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400">
                Email
                <input
                  className="mt-2 w-full px-4 h-12 bg-black border border-neutral-800 text-sm text-white normal-case tracking-normal outline-none focus:border-accent"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => void sendOtp()}
                className="w-full h-12 bg-white text-black text-xs tracking-widest uppercase font-bold hover:bg-accent-solid hover:text-white transition-colors disabled:opacity-50"
              >
                {busy ? 'Sending…' : 'Send verification code'}
              </button>
              <button
                type="button"
                className="w-full text-xs text-neutral-500 hover:text-white underline-offset-4 hover:underline"
                onClick={() => {
                  setStage('position')
                  setError('')
                  clearDraft()
                }}
              >
                Back to positions
              </button>
            </div>
          ) : (
            <div className="space-y-5 bg-[#0a0a0a] border border-neutral-900 rounded-[12px] p-6 sm:p-8">
              <h2 className="text-[28px] font-black uppercase leading-[0.9]">Enter verification code</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Code sent to <strong className="text-white">{maskedEmail}</strong>. Use the <em>latest</em> email only.
              </p>
              <div className="flex justify-center gap-2" role="group" aria-label="Verification code">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el
                    }}
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Digit ${index + 1}`}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '')
                      if (raw.length > 1) {
                        const pasted = raw.slice(0, 6).split('')
                        const filled = ['', '', '', '', '', ''].map((_, i) => pasted[i] || '')
                        setOtpDigits(filled)
                        if (pasted.length === 6) void verifyOtp(pasted.join(''))
                        return
                      }
                      const ch = raw.slice(-1)
                      const copy = [...otpDigits]
                      copy[index] = ch
                      setOtpDigits(copy)
                      if (ch && index < 5) otpRefs.current[index + 1]?.focus()
                      if (copy.join('').length === 6) void verifyOtp(copy.join(''))
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
                        otpRefs.current[index - 1]?.focus()
                      }
                      if (e.key === 'Enter') void verifyOtp()
                    }}
                    className="w-11 h-14 text-center text-xl font-black bg-black text-white border border-neutral-800 focus:border-accent outline-none"
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={busy || otpDigits.join('').replace(/\D/g, '').length !== 6}
                onClick={() => void verifyOtp()}
                className="w-full h-12 bg-white text-black text-xs tracking-widest uppercase font-bold hover:bg-accent-solid hover:text-white transition-colors disabled:opacity-50"
              >
                {busy ? (
                  'Verifying…'
                ) : (
                  'Verify & continue'
                )}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void resendOtp()}
                className="w-full py-2 text-[11px] tracking-widest uppercase font-semibold text-accent hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setStage('email')
                  setOtpDigits(['', '', '', '', '', ''])
                  setError('')
                  clearDraft()
                }}
                className="w-full py-1 text-xs text-neutral-500 hover:text-white hover:underline"
              >
                Use a different email
              </button>
            </div>
          )}
          {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      {header}
      <div className="max-w-xl mx-auto px-6 py-16 text-center space-y-5">
        <p className="text-[11px] tracking-[0.3em] uppercase text-emerald-400 font-bold">✓ Email verified</p>
        <h2 className="text-[36px] font-black uppercase leading-[0.9]">Welcome{profileName ? `, ${profileName}` : ''}</h2>
        <p className="text-sm text-neutral-400 leading-relaxed">
          Your session is active for <strong className="text-white">{position?.title}</strong>.
        </p>
        <p className="text-[10px] tracking-widest uppercase text-neutral-500">Session: {sessionToken ? 'active' : 'missing'}</p>
        <p className="text-sm text-neutral-400 leading-relaxed">
          The interactive screening step is being prepared. Continue with the formal application now — your verified session stays active in this
          browser tab.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            to={`/apply?position=${encodeURIComponent(position?.title || '')}`}
            className="inline-flex items-center justify-center h-12 px-8 bg-white text-black text-xs tracking-widest uppercase font-bold hover:bg-accent-solid hover:text-white transition-colors"
          >
            Continue formal application
          </Link>
          <button
            type="button"
            className="h-12 px-8 border border-white text-xs tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-colors"
            onClick={() => {
              sessionStorage.removeItem(SESSION_KEY)
              setSessionToken('')
              setStage('position')
              setPosition(null)
              clearDraft()
            }}
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  )
}
