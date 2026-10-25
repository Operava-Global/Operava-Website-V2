import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Camera, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, FileBadge, Headphones, LockKeyhole, MailCheck, Mic, MonitorCheck, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react'
import { usePageMeta } from '../site/seo'
import './AvaScreening.css'

type Role = 'tech' | 'ops' | 'cx'
type Profile = { fullName: string; phone: string; education: string; experience: string; motivation: string }
type ScreenState = {
  ok: boolean
  applicant: { name: string; email: string; role: Role; roleTitle: string }
  identityStatus: 'not_submitted' | 'pending_review' | 'approved' | 'needs_resubmission'
  identityKind: string | null
  profile: Partial<Profile>
  consentGiven: boolean
  aiConsentGiven: boolean
  assessmentStatus: 'not_started' | 'in_progress' | 'submitted' | 'time_expired'
  deadline: number | null
  total: number
  answered: number
  question: { number: number; section: string; prompt: string } | null
  reviewProgress: { reviewed: number; pending: number; total: number }
  reviewResults: { questionId: string; review: { relevance: number; grammar: number; clarity: number; coherence: number; feedback: string } | null }[]
}
type ApiPayload = ScreenState & { error?: string; sessionToken?: string; maskedEmail?: string }
type SpeechResult = { results: ArrayLike<ArrayLike<{ transcript: string }>> }
type SpeechClient = {
  lang: string; interimResults: boolean; continuous: boolean
  onresult: ((event: SpeechResult) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void; stop: () => void
}
type SpeechCtor = new () => SpeechClient
const SESSION_KEY = 'operava_ava_screening_session_v1'
const API = '/api/ava-screening'
const BLANK_PROFILE: Profile = { fullName: '', phone: '', education: '', experience: '', motivation: '' }
const FORM_FIELDS: { key: keyof Profile; label: string; placeholder: string; rows?: number }[] = [
  { key: 'fullName', label: 'Legal full name', placeholder: 'As it appears on your identity document' },
  { key: 'phone', label: 'Phone / mobile number (optional)', placeholder: 'Country code + number' },
  { key: 'education', label: 'Education and qualifications', placeholder: 'Degree, institution, relevant courses and certifications', rows: 3 },
  { key: 'experience', label: 'Work experience and achievements', placeholder: 'Your previous responsibilities, years of experience and examples', rows: 4 },
  { key: 'motivation', label: 'Why this role?', placeholder: 'What makes you interested in this OPERAVA position?', rows: 3 },
]
const STEPS = ['Verify email', 'Your profile', 'Review identity', 'Assessment']
const detectSpeech = (): SpeechCtor | null => {
  const scope = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor }
  return scope.SpeechRecognition || scope.webkitSpeechRecognition || null
}
const formatRemaining = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

export default function AvaScreening() {
  usePageMeta({ title: 'Ava Screening | Secure Recruitment Portal', description: 'Invitation-only, verified OPERAVA role assessment.', crumbs: [{ name: 'Careers', path: '/careers' }, { name: 'Ava Screening', path: '/ava-screening/' }] })
  const [params] = useSearchParams()
  const invitation = params.get('invite') || ''
  const [session, setSession] = useState(() => { try { return sessionStorage.getItem(SESSION_KEY) || '' } catch { return '' } })
  const [screen, setScreen] = useState<ScreenState | null>(null)
  const [otpRequested, setOtpRequested] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState('')
  const [code, setCode] = useState('')
  const [profile, setProfile] = useState<Profile>(BLANK_PROFILE)
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [monitorConsent, setMonitorConsent] = useState(false)
  const [aiConsent, setAiConsent] = useState(false)
  const [identityKind, setIdentityKind] = useState<'passport' | 'national_id'>('passport')
  const [identityFile, setIdentityFile] = useState<File | null>(null)
  const [answer, setAnswer] = useState('')
  const [answerSource, setAnswerSource] = useState<'typed' | 'dictation'>('typed')
  const [seconds, setSeconds] = useState(45 * 60)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechAvailable, setSpeechAvailable] = useState(false)
  const recognition = useRef<SpeechClient | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const consentRef = useRef(false)
  const sessionRef = useRef(session)
  useEffect(() => { consentRef.current = Boolean(screen?.consentGiven && screen.assessmentStatus === 'in_progress') }, [screen])
  useEffect(() => { sessionRef.current = session }, [session])

  const submit = useCallback(async (action: string, body: Record<string, unknown> = {}, form?: FormData): Promise<ApiPayload> => {
    const res = await fetch(API, {
      method: 'POST', cache: 'no-store', credentials: 'same-origin',
      headers: form ? { ...(sessionRef.current ? { Authorization: `Bearer ${sessionRef.current}` } : {}) }
        : { 'Content-Type': 'application/json', ...(sessionRef.current ? { Authorization: `Bearer ${sessionRef.current}` } : {}) },
      body: form || JSON.stringify({ ...body, action }),
    })
    const data = await res.json().catch(() => ({})) as ApiPayload
    if (!res.ok || data.error) throw new Error(data.error || `Request unsuccessful (${res.status}).`)
    return data
  }, [])
  const refresh = useCallback(async () => {
    if (!sessionRef.current) return
    try {
      const value = await submit('state')
      setScreen(value)
      setProfile({ ...BLANK_PROFILE, ...value.profile })
      setPrivacyConsent(value.consentGiven)
      setMonitorConsent(value.consentGiven)
      setAiConsent(value.aiConsentGiven)
      setError('')
    } catch (e) {
      if (/expired|missing|unauthorized/i.test(String(e))) {
        sessionStorage.removeItem(SESSION_KEY)
        sessionRef.current = ''
        setSession('')
      }
      setError(e instanceof Error ? e.message : 'Unable to load screening.')
    }
  }, [submit])
  useEffect(() => { if (session) void refresh() }, [session, refresh])
  useEffect(() => { setSpeechAvailable(Boolean(detectSpeech())) }, [])
  useEffect(() => {
    if (!screen?.deadline || screen.assessmentStatus !== 'in_progress') return
    const tick = () => setSeconds(Math.max(0, Math.ceil((screen.deadline! - Date.now()) / 1000)))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [screen?.deadline, screen?.assessmentStatus])
  useEffect(() => { if (seconds === 0 && screen?.assessmentStatus === 'in_progress') void refresh() }, [seconds, screen?.assessmentStatus, refresh])
  useEffect(() => {
    const log = (event: string) => {
      if (!consentRef.current || !sessionRef.current) return
      void fetch(API, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionRef.current}` }, body: JSON.stringify({ action: 'event', event }) }).catch(() => {})
    }
    const visibility = () => log(document.visibilityState === 'hidden' ? 'visibility_hidden' : 'visibility_visible')
    const blur = () => log('focus_lost')
    const focus = () => log('focus_returned')
    const changed = () => { setFullscreen(Boolean(document.fullscreenElement)); if (!document.fullscreenElement) log('fullscreen_exited') }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('blur', blur)
    window.addEventListener('focus', focus)
    document.addEventListener('fullscreenchange', changed)
    return () => { document.removeEventListener('visibilitychange', visibility); window.removeEventListener('blur', blur); window.removeEventListener('focus', focus); document.removeEventListener('fullscreenchange', changed) }
  }, [])
  useEffect(() => () => { recognition.current?.stop() }, [])

  const perform = async (fn: () => Promise<ApiPayload>, success?: string) => {
    setBusy(true); setError(''); setNotice('')
    try {
      const data = await fn()
      if (data.sessionToken) {
        sessionStorage.setItem(SESSION_KEY, data.sessionToken)
        sessionRef.current = data.sessionToken
        setSession(data.sessionToken)
      }
      if (data.applicant) {
        setScreen(data)
        setProfile({ ...BLANK_PROFILE, ...data.profile })
      }
      if (data.maskedEmail) setMaskedEmail(data.maskedEmail)
      if (success) setNotice(success)
      return true
    } catch (e) { setError(e instanceof Error ? e.message : 'Request could not be completed.'); return false }
    finally { setBusy(false) }
  }
  const requestCode = async () => { if (await perform(() => submit('requestCode', { invitation }), 'A six-digit code was sent. Check your inbox and spam folder.')) setOtpRequested(true) }
  const verifyCode = async () => { if (await perform(() => submit('verifyCode', { invitation, code }), 'Email address verified.')) setCode('') }
  const saveProfile = async () => { await perform(() => submit('profile', { ...profile, privacyConsent, monitorConsent, aiConsent }), 'Profile saved securely.') }
  const uploadIdentity = async () => {
    if (!identityFile) { setError('Select an identity file first.'); return }
    if (identityFile.size >= 5_000_000) { setError('File must be smaller than 5 MB.'); return }
    const data = new FormData(); data.append('document', identityFile); data.append('kind', identityKind)
    if (await perform(() => submit('identity', {}, data), 'Identity evidence received. A human reviewer must approve it.')) setIdentityFile(null)
  }
  const beginAssessment = async () => {
    const ok = await perform(() => submit('begin'), 'Your 45-minute assessment has started.')
    if (ok && document.fullscreenEnabled) {
      try { await document.documentElement.requestFullscreen() } catch { /* Fullscreen is optional; record only actual exits. */ }
    }
  }
  const sendAnswer = async () => {
    if (await perform(() => submit('answer', { answer, source: answerSource }))) {
      setAnswer(''); setAnswerSource('typed'); recognition.current?.stop(); setIsSpeaking(false)
    }
  }
  const startDictation = () => {
    if (isSpeaking) { recognition.current?.stop(); setIsSpeaking(false); return }
    const Ctor = detectSpeech()
    if (!Ctor) { setError('Voice dictation is not supported in this browser. You can type your answer instead.'); return }
    const speech = new Ctor()
    recognition.current = speech
    speech.lang = 'en-US'; speech.interimResults = false; speech.continuous = false
    speech.onresult = (event) => {
      const transcript = Array.from(event.results).map((res) => res[0]?.transcript || '').join(' ').trim()
      if (transcript) { setAnswer((previous) => `${previous}${previous ? ' ' : ''}${transcript}`); setAnswerSource('dictation') }
    }
    speech.onerror = () => { setIsSpeaking(false); setError('Microphone could not be used. Please allow access or type your answer.'); void submit('event', { event: 'microphone_denied' }).catch(() => {}) }
    speech.onend = () => setIsSpeaking(false)
    try { speech.start(); setIsSpeaking(true); setError('') } catch { setError('Voice dictation is unavailable. Please type your answer.') }
  }
  const copyPhoneLink = async () => {
    if (!invitation) return
    try { await navigator.clipboard.writeText(window.location.href); setNotice('Private invitation link copied for use on your phone. Verify your email again on that device.') }
    catch { setError('Unable to copy the link. Use your browser’s Share option.') }
  }

  const stageIndex = !screen ? 0 : !screen.profile?.fullName || !screen.consentGiven ? 1 : screen.identityStatus !== 'approved' ? 2 : 3
  const stage = !screen ? 'email' : screen.assessmentStatus === 'submitted' || screen.assessmentStatus === 'time_expired' ? 'finished'
    : screen.assessmentStatus === 'in_progress' ? 'assessment'
    : !screen.profile?.fullName || !screen.consentGiven ? 'profile'
    : screen.identityStatus === 'pending_review' ? 'waiting'
    : screen.identityStatus !== 'approved' ? 'identity' : 'ready'
  const finished = stage === 'finished'

  return (
    <div className="ava-screening">
      <div className="ava-wrap">
        <nav className="ava-crumbs" aria-label="Breadcrumb"><Link to="/careers">Careers</Link><span>/</span><span>Ava Screening</span></nav>
        <header className="ava-hero">
          <div><p className="ava-kicker"><span className="ava-dot" /> OPERAVA / SECURE RECRUITMENT</p><h1>AVA <span>SCREENING</span></h1>
            <p>Identity-aware, role-specific screening with a clear, protected candidate journey.</p>
          </div>
          <div className="ava-hero-mark" aria-hidden="true"><ShieldCheck size={44} strokeWidth={1.2} /><span>PRIVATE · VERIFIED · MONITORED</span></div>
        </header>
        <div className="ava-steps" aria-label="Screening stages">{STEPS.map((label, i) => <div className={`ava-step ${i <= stageIndex ? 'is-active' : ''}`} key={label}><span>{i < stageIndex ? <CheckCircle2 size={15} /> : String(i + 1).padStart(2, '0')}</span><strong>{label}</strong></div>)}</div>
        <div className="ava-shell">
          <aside className="ava-sidebar">
            <div className="ava-sidebar-block"><p className="ava-label">CANDIDATE ACCESS</p><h2>{screen?.applicant.roleTitle || 'By invitation only'}</h2><p>{screen?.applicant.email || 'Your access is linked to an OPERAVA Talent Acquisition invitation.'}</p></div>
            <div className="ava-sidebar-block"><p className="ava-label">ASSESSMENT PROTOCOL</p><div className="ava-sidebar-info"><Clock3 size={18}/><span>45-minute, server-enforced timer</span></div><div className="ava-sidebar-info"><MonitorCheck size={18}/><span>Consent-based focus and visibility logs</span></div><div className="ava-sidebar-info"><ClipboardCheck size={18}/><span>Written and role-based responses</span></div><div className="ava-sidebar-info"><Headphones size={18}/><span>Optional speech-to-text dictation</span></div></div>
            <div className="ava-sidebar-note"><LockKeyhole size={17}/><span>No continuous video/audio recording. AI writing feedback is advisory; a person makes recruitment decisions.</span></div>
            {screen?.assessmentStatus === 'in_progress' && <div className="ava-timer"><span>TIME REMAINING</span><strong aria-live="off" className={seconds < 300 ? 'ava-time-low' : ''}>{formatRemaining(seconds)}</strong><small>Time runs even if this tab closes.</small></div>}
          </aside>
          <section className="ava-content" aria-live="polite">
            {stage === 'email' && <div className="ava-panel"><div className="ava-icon"><MailCheck /></div><p className="ava-label">STEP 01 — PRE-ASSESSMENT VERIFICATION</p><h2>Confirm your email.</h2>
              <p>Only candidates invited by OPERAVA Talent Acquisition can access this assessment. We’ll send a one-time verification code to the address associated with your invitation.</p>
              {invitation ? <><div className="ava-invitation"><ShieldCheck size={20}/> A private invitation was detected. Do not forward or share its link.</div>
                {!otpRequested ? <button className="ava-primary" disabled={busy} onClick={() => void requestCode()}>{busy ? 'Sending code…' : 'Send verification code'}<ChevronRight size={17}/></button>
                  : <form onSubmit={(e) => { e.preventDefault(); void verifyCode() }}><label className="ava-field">Verification code<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0,6))} required /></label>
                    <p className="ava-muted">Sent to {maskedEmail}. Expires in 10 minutes.</p><button className="ava-primary" disabled={busy || code.length !== 6}>{busy ? 'Verifying…' : 'Verify and continue'}<ChevronRight size={17}/></button>
                    <button type="button" className="ava-text-button" disabled={busy} onClick={() => void requestCode()}>Resend code (after 60 seconds)</button></form>}
                <button className="ava-secondary" onClick={() => void copyPhoneLink()}><Smartphone size={16}/> Copy mobile verification link</button>
              </> : <div className="ava-invitation ava-invitation--warning"><TriangleAlert size={20}/> No invitation link was supplied. Request one from <a href="mailto:talents@operavaglobal.com">Talent Acquisition</a>.</div>}
            </div>}
            {stage === 'profile' && <div className="ava-panel"><p className="ava-label">STEP 02 — CANDIDATE BACKGROUND</p><h2>Tell us about yourself.</h2><p>Complete your education, professional experience, and motivation before identity review. Your responses are saved to the secure screening record.</p>
              <form onSubmit={(e) => { e.preventDefault(); void saveProfile() }} className="ava-form">{FORM_FIELDS.map((field) => <label className="ava-field" key={field.key}>{field.label}{field.rows ? <textarea rows={field.rows} value={profile[field.key]} placeholder={field.placeholder} onChange={(e) => setProfile((old) => ({ ...old, [field.key]: e.target.value }))} /> : <input value={profile[field.key]} placeholder={field.placeholder} onChange={(e) => setProfile((old) => ({ ...old, [field.key]: e.target.value }))} />}</label>)}
                <label className="ava-check"><input type="checkbox" checked={privacyConsent} onChange={(e) => setPrivacyConsent(e.target.checked)}/><span>I agree to the <Link to="/privacy" target="_blank">Privacy Policy</Link> and the processing of my screening information for recruitment.</span></label>
                <label className="ava-check"><input type="checkbox" checked={monitorConsent} onChange={(e) => setMonitorConsent(e.target.checked)}/><span>I consent to event-only monitoring during the assessment (tab focus, visibility and fullscreen exits). I understand that no ongoing webcam or microphone recording occurs.</span></label>
                <label className="ava-check"><input type="checkbox" checked={aiConsent} onChange={(e) => setAiConsent(e.target.checked)}/><span>Optional: I consent to AI-generated feedback on my written answers. Choosing not to consent does not prevent screening or human review.</span></label>
                <button className="ava-primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile and continue'}<ChevronRight size={17}/></button></form>
            </div>}
            {stage === 'identity' && <div className="ava-panel"><p className="ava-label">STEP 03 — IDENTITY EVIDENCE</p><h2>Submit your document.</h2><p>Upload a clear scan or photo of your passport or government ID. Files are stored privately for authorized manual review; uploading does <strong>not</strong> automatically prove authenticity.</p>
              <div className="ava-identity-grid"><label className="ava-field">Document type<select value={identityKind} onChange={(e) => setIdentityKind(e.target.value as 'passport' | 'national_id')}><option value="passport">Passport</option><option value="national_id">Government identity card</option></select></label>
                <label className="ava-upload"><Camera size={26}/><strong>{identityFile?.name || 'Choose an image / document'}</strong><span>JPEG, PNG or PDF · strictly under 5 MB</span><input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setIdentityFile(e.target.files?.[0] || null)}/></label></div>
              {screen?.identityStatus === 'needs_resubmission' && <p className="ava-warning">A reviewer requested a clearer or replacement identity file. Submit a new document.</p>}
              <button className="ava-primary" disabled={busy || !identityFile} onClick={() => void uploadIdentity()}>{busy ? 'Uploading securely…' : 'Submit for human verification'}<ChevronRight size={17}/></button>
              <div className="ava-mini"><Smartphone size={19}/><div><strong>Using your phone?</strong><p>Open your original invitation on the phone, then complete email verification on that device. The camera can capture an ID photograph.</p></div></div>
              <div className="ava-mini"><FileBadge size={19}/><div><strong>NFC passport scanning</strong><p>Browser NFC cannot verify passport identity. Chip authentication requires an approved identity verification provider; manual document review is available here.</p></div></div>
            </div>}
            {stage === 'waiting' && <div className="ava-panel"><div className="ava-icon"><ShieldCheck /></div><p className="ava-label">IDENTITY STATUS — MANUAL REVIEW</p><h2>Verification pending.</h2><p>Your evidence has been submitted to the private review queue. An authorized reviewer must approve it before your assessment becomes available.</p><div className="ava-invitation">Current status: Pending human identity review.</div><button className="ava-secondary" disabled={busy} onClick={() => void refresh()}>Check review status</button></div>}
            {stage === 'ready' && <div className="ava-panel"><div className="ava-icon"><CheckCircle2 /></div><p className="ava-label">STEP 04 — ASSESSMENT READY</p><h2>You are ready to begin.</h2><p>Your email, identity review and candidate profile are complete. You’ll have 45 minutes to answer {screen?.total} questions, including role-specific and English communication prompts.</p><div className="ava-invitation"><CheckCircle2 size={18}/> Identity evidence approved by an authorized reviewer.</div>
              <p className="ava-muted">Your clock starts when you select Begin. Answers are submitted one at a time; refresh or tab changes do not reset the deadline.</p><button className="ava-primary" disabled={busy} onClick={() => void beginAssessment()}>{busy ? 'Starting…' : 'Begin monitored assessment'}<ChevronRight size={17}/></button></div>}
            {stage === 'assessment' && <div className="ava-panel ava-assessment"><div className="ava-assessment-top"><span className="ava-label">QUESTION {screen?.question?.number} / {screen?.total}</span><span className="ava-badge">{screen?.question?.section === 'english' ? 'ENGLISH COMMUNICATION' : 'ROLE ASSESSMENT'}</span></div>
              <div className="ava-progress"><span style={{width:`${((screen?.answered || 0) / (screen?.total || 1)) * 100}%`}} /></div><h2>{screen?.question?.prompt || 'Loading next question…'}</h2><label className="ava-field">Your response<textarea className="ava-answer" rows={8} value={answer} maxLength={4000} onChange={(e) => { setAnswer(e.target.value); setAnswerSource('typed') }} placeholder="Write your response in your own words. You can also dictate, then review the transcript before submitting." /></label>
              <div className="ava-tools"><button type="button" className="ava-secondary" disabled={!speechAvailable} onClick={startDictation}><Mic size={17}/>{isSpeaking ? 'Stop dictation' : 'Dictate answer'}</button><span>{answer.length}/4000 characters</span></div>
              {!speechAvailable && <p className="ava-muted">Speech recognition isn’t available in this browser. Typing is supported.</p>}
              <p className="ava-muted">Dictation converts speech to editable text using your browser’s speech recognition service. Transcript-only review cannot reliably score spoken fluency or pronunciation.</p>
              <div className="ava-bottom"><span><MonitorCheck size={15}/> Event-only monitoring {fullscreen ? '· Fullscreen on' : '· Fullscreen optional'}</span><button className="ava-primary" disabled={busy || answer.trim().length < 15 || seconds === 0} onClick={() => void sendAnswer()}>{busy ? 'Submitting…' : 'Save answer and continue'}<ChevronRight size={17}/></button></div>
            </div>}
            {finished && <div className="ava-panel"><div className="ava-icon"><ClipboardCheck /></div><p className="ava-label">SCREENING RECORD — SUBMITTED</p><h2>{screen?.assessmentStatus === 'time_expired' ? 'Time has elapsed.' : 'Assessment completed.'}</h2><p>Your submitted responses are saved for Talent Acquisition’s review. No AI-generated feedback or scores make an automatic employment decision.</p><div className="ava-summary"><div><span>Answers received</span><strong>{screen?.answered} / {screen?.total}</strong></div><div><span>AI writing reviews</span><strong>{screen?.reviewProgress.reviewed} / {screen?.reviewProgress.total}</strong></div><div><span>Hiring decision</span><strong>Human review</strong></div></div>
              {Boolean(screen?.reviewResults.length) && <div className="ava-review-results"><h3>Provisional writing feedback</h3>{screen?.reviewResults.map((r) => <div key={r.questionId}><strong>{r.questionId}</strong><span>{r.review?.feedback || 'Feedback unavailable'}</span></div>)}</div>}
              <button className="ava-secondary" disabled={busy} onClick={() => void refresh()}>Refresh review progress</button></div>}
            {error && <p className="ava-alert" role="alert"><TriangleAlert size={16}/>{error}</p>}
            {notice && <p className="ava-note" role="status"><CheckCircle2 size={16}/>{notice}</p>}
          </section>
        </div>
        <footer className="ava-footer"><span>OPERAVA GLOBAL SOLUTIONS · RECRUITMENT SECURITY</span><a href="mailto:talents@operavaglobal.com">Contact Talent Acquisition</a></footer>
      </div>
    </div>
  )
}