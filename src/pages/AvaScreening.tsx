import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, ChevronRight, ClipboardCheck, ClipboardList, FileCheck2, Clock3, Headphones, Sparkles, LockKeyhole, MailCheck, Mic, MonitorCheck, ShieldCheck, Smartphone, TriangleAlert, LogOut } from 'lucide-react'
import { usePageMeta } from '../site/seo'
import { cameraErrorMessage, cameraIsLive, inspectCameraBrowser, requestIdentityCamera, type CameraCheck } from '../utils/avaCamera'
import { inspectProctorSupport, proctorErrorMessage, proctorTrackIsLive, createProctorRecorder, type ProctorSupport } from '../utils/avaProctorMedia'
import ThemeToggle from '../site/ThemeToggle'
import './AvaScreening.css'

type Role = 'tech' | 'ops' | 'cx'
type Profile = { fullName: string; phone: string; education: string; experience: string; motivation: string }
type ScreenState = {
  ok: boolean
  applicant: { name: string; email: string; role: Role; roleTitle: string }
  identityStatus: 'not_submitted' | 'pending_verification' | 'pending_review' | 'approved' | 'needs_resubmission' | 'rejected'
  identityKind: string | null
  identityVerification?: string
  verifiedApplicantProfile?: boolean
  faceMatchScore?: number | null
  identityProviderAvailable?: boolean
  recordingStorageReady?: boolean
  proctorConsentGiven?: boolean
  identityConsentGiven?: boolean
  assessmentRulesAccepted?: boolean
  proctorPausedAt?: number | null
  proctorPauseReason?: string | null
  proctorIncidentCount?: number
  applicationReference?: string | null
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
type OnboardingRecord = {
  id:string; document_type:string; request_note:string; status:string;
  original_name:string|null;requested_at:number;submitted_at:number|null;
  reviewed_at:number|null;review_note:string|null
}
const ONBOARDING_LABELS:Record<string,string> = {
  education_certificate:'Education certificate', employment_reference:'Employment reference',
  proof_of_address:'Proof of address', signed_agreement:'Signed agreement',
  tax_details:'Tax / payroll form', other:'Requested documentation',
}
type ApplicationRecord = {
  referenceId: string; position: string; submittedAt: string; applicationStatus: string;
  assessmentStatus: string; reviewStatus: string; profileComplete: boolean;
  requiredAction: string | null; isSelected: boolean
}
type ApiPayload = ScreenState & {
  error?: string; message?: string; sessionToken?: string; maskedEmail?: string; turnstileSiteKey?: string;
  applicationReference?: string | null; applications?: ApplicationRecord[]; verificationUrl?: string
  challenge?: string; challengeCode?: string; expiresAt?: number
  documents?: OnboardingRecord[]; configured?: boolean
}
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
const IS_PREVIEW = typeof window !== 'undefined' && window.location.hostname.endsWith('.operava-website-v2.pages.dev')
const API = '/api/ava-screening'
const BLANK_PROFILE: Profile = { fullName: '', phone: '', education: '', experience: '', motivation: '' }
const FORM_FIELDS: { key: keyof Profile; label: string; placeholder: string; rows?: number }[] = [
  { key: 'fullName', label: 'Legal full name', placeholder: 'As it appears on your identity document' },
  { key: 'phone', label: 'Phone / mobile number (optional)', placeholder: 'Country code + number' },
  { key: 'education', label: 'Education and qualifications', placeholder: 'Degree, institution, relevant courses and certifications', rows: 3 },
  { key: 'experience', label: 'Work experience and achievements', placeholder: 'Your previous responsibilities, years of experience and examples', rows: 4 },
  { key: 'motivation', label: 'Why this role?', placeholder: 'What makes you interested in this OPERAVA position?', rows: 3 },
]
const STEPS = ['Verify email', 'Your profile', 'Assessment']
const STEP_ILLUSTRATIONS: Record<string, { src: string; label: string }> = {
  email: { src: '/media/ava-assessment-verified.svg', label: '01 / Secure access' },
  profile: { src: '/media/ava-assessment-profile.svg', label: '02 / Candidate background' },
  ready: { src: '/media/ava-assessment-ready.svg', label: '03 / Ready to begin' },
  assessment: { src: '/media/ava-assessment-question.svg', label: '03 / Timed assessment' },
  finished: { src: '/media/ava-assessment-complete.svg', label: 'Complete / Submitted for review' },
}
const detectSpeech = (): SpeechCtor | null => {
  const scope = window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor }
  return scope.SpeechRecognition || scope.webkitSpeechRecognition || null
}
const formatRemaining = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

export default function AvaScreening() {
  usePageMeta({ title: 'Ava Assessment | Public Applicant Portal', description: 'Register and securely sign in with email OTP to complete your OPERAVA candidate profile and role assessment.' })
  const reduceMotion = useReducedMotion()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const invitation = params.get('invite') || ''
  const [session, setSession] = useState(() => { try { return sessionStorage.getItem(SESSION_KEY) || '' } catch { return '' } })
  const [screen, setScreen] = useState<ScreenState | null>(null)
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [applicationsError, setApplicationsError] = useState('')
  const [documents,setDocuments] = useState<OnboardingRecord[]>([])
  const [onboardingConfigured,setOnboardingConfigured] = useState(false)
  const [selectedDocuments,setSelectedDocuments] = useState<Record<string,File|null>>({})
  const [onboardingError,setOnboardingError] = useState('')
  const [otpRequested, setOtpRequested] = useState(false)
  const [entryMode,setEntryMode] = useState<'login'|'register'>('login')
  const [workspaceView,setWorkspaceView] = useState<'assessment'|'applications'|'documents'>('assessment')
  const [profilePage,setProfilePage] = useState(0)
  const [readyPage,setReadyPage] = useState(0)
  const [instructionAcknowledged,setInstructionAcknowledged] = useState(false)
  const [focusPaused,setFocusPaused] = useState(false)
  const [itemPage,setItemPage] = useState(0)
  const deckRef=useRef<HTMLDivElement|null>(null)
  const [registerName,setRegisterName] = useState('')
  const [registerEmail,setRegisterEmail] = useState('')
  const [registerRole,setRegisterRole] = useState<Role>('tech')
  const [pendingEmail,setPendingEmail] = useState('')
  const [turnstileKey,setTurnstileKey] = useState('')
  const [turnstileToken,setTurnstileToken] = useState('')
  const turnstileNode = useRef<HTMLDivElement | null>(null)
  const turnstileWidget = useRef<string | undefined>(undefined)
  const [maskedEmail, setMaskedEmail] = useState('')
  const [code, setCode] = useState('')
  const [profile, setProfile] = useState<Profile>(BLANK_PROFILE)
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [monitorConsent, setMonitorConsent] = useState(false)
  const [aiConsent, setAiConsent] = useState(false)
  const [answer, setAnswer] = useState('')
  const [answerSource, setAnswerSource] = useState<'typed' | 'dictation'>('typed')
  const [seconds, setSeconds] = useState(45 * 60)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechAvailable, setSpeechAvailable] = useState(false)
  const recognition = useRef<SpeechClient | null>(null)
  const captures = useRef<{screen:MediaStream;camera:MediaStream}|null>(null)
  const preparedCamera=useRef<MediaStream|null>(null)
  const [proctorCameraReady,setProctorCameraReady]=useState(false)
  const [proctorSupport,setProctorSupport]=useState<ProctorSupport|null>(null)
  const proctorWatchdog=useRef<number|null>(null)
  const lastRecordingData=useRef({camera:0,screen:0})
  const recorders = useRef<MediaRecorder[]>([])
  const audioContext = useRef<AudioContext|null>(null)
  const soundPoll = useRef<number|null>(null)
  const [proctorReady,setProctorReady] = useState(false)
  const [proctorBusy,setProctorBusy] = useState(false)
  const [proctorSaved,setProctorSaved] = useState({camera:false,screen:false})
  const [recordingConsent,setRecordingConsent] = useState(false)
  const [permissionTest,setPermissionTest] = useState<'idle'|'testing'|'camera-ok'|'screen-ok'|'unsupported'>('idle')
  const [cameraChecked,setCameraChecked] = useState(false)
  const [screenChecked,setScreenChecked] = useState(false)
  const captureActive = useRef(false)
  const screenRef=useRef<ScreenState|null>(null)
  const stopCaptureRef=useRef<()=>void>(()=>{})
  const pauseEventSent=useRef(false)
  const [identityBusy,setIdentityBusy] = useState(false)
  const [identityChallenge,setIdentityChallenge]=useState<{token:string;code:string;expires:number}|null>(null)
  const [identityStep,setIdentityStep]=useState(0)
  const [identityDocType,setIdentityDocType]=useState<'passport'|'national_id'|'drivers_license'>('national_id')
  const [identityConsent,setIdentityConsent]=useState(false)
  const [identityFrames,setIdentityFrames]=useState<{document:Blob|null;selfie:Blob|null;motion:Blob|null}>({document:null,selfie:null,motion:null})
  const identityStream=useRef<MediaStream|null>(null)
  const identityVideo=useRef<HTMLVideoElement|null>(null)
  const identityNativeInput=useRef<HTMLInputElement|null>(null)
  const [identityCaptureMode,setIdentityCaptureMode]=useState<'live_preview'|'device_camera_fallback'>('live_preview')
  const identityCameraGeneration=useRef(0)
  const [identityCameraStatus,setIdentityCameraStatus]=useState<'idle'|'requesting'|'ready'|'blocked'|'unsupported'|'interrupted'>('idle')
  const [identityBrowser,setIdentityBrowser]=useState<CameraCheck|null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const consentRef = useRef(false)
  const sessionRef = useRef(session)
  useEffect(() => { consentRef.current = Boolean(screen?.consentGiven && screen.assessmentStatus === 'in_progress') }, [screen])
  useEffect(() => { screenRef.current = screen }, [screen])
  useEffect(() => { sessionRef.current = session }, [session])

  const submit = useCallback(async (action: string, body: Record<string, unknown> = {}, form?: FormData): Promise<ApiPayload> => {
    const res = await fetch(form ? API+'?action='+encodeURIComponent(action) : API, {
      method: 'POST', cache: 'no-store', credentials: 'same-origin',
      headers: form ? { ...(sessionRef.current ? { Authorization: `Bearer ${sessionRef.current}` } : {}) }
        : { 'Content-Type': 'application/json', ...(sessionRef.current ? { Authorization: `Bearer ${sessionRef.current}` } : {}) },
      body: form || JSON.stringify({ ...body, action }),
    })
    const data = await res.json().catch(() => ({})) as ApiPayload
    if (!res.ok || data.error) throw new Error(data.error || `Request unsuccessful (${res.status}).`)
    return data
  }, [])
  // Public entry must not require an invitation. The site key is public; the
  // Turnstile verification secret is held only in Cloudflare Pages environment.
  useEffect(() => {
    if (invitation || session || IS_PREVIEW) return
    void submit('publicConfig').then(data => setTurnstileKey(data.turnstileSiteKey || ''))
      .catch(() => setError('Registrations are temporarily unavailable. Please try again later.'))
  }, [invitation,session,submit])
  useEffect(() => {
    if (invitation || session || otpRequested || !turnstileKey || !turnstileNode.current) return
    const external = window as unknown as { turnstile?: {
      render: (container:HTMLElement,options:{sitekey:string;theme:string;callback:(token:string)=>void;
        'expired-callback':()=>void;'error-callback':()=>void}) => string
      remove:(id:string)=>void;reset:(id:string)=>void;
    } }
    let active = true
    const render = () => {
      if (!active || !turnstileNode.current || !external.turnstile || turnstileWidget.current) return
      turnstileWidget.current = external.turnstile.render(turnstileNode.current,{
        sitekey:turnstileKey,theme:'auto',callback:token=>setTurnstileToken(token),
        'expired-callback':()=>setTurnstileToken(''),'error-callback':()=>setTurnstileToken(''),
      })
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-ava-turnstile]')
    if (existing) { if (external.turnstile) render(); else existing.addEventListener('load',render) }
    else { const script=document.createElement('script')
      script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async=true; script.defer=true;script.dataset.avaTurnstile='1'
      script.addEventListener('load',render);document.head.appendChild(script) }
    return () => {active=false;if (existing)existing.removeEventListener('load',render)
      if (turnstileWidget.current && external.turnstile) {external.turnstile.remove(turnstileWidget.current);turnstileWidget.current=undefined} }
  }, [invitation,session,otpRequested,turnstileKey])
  const refresh = useCallback(async () => {
    if (!sessionRef.current) return
    try {
      const value = await submit('state')
      setScreen(value)
      setProfile({ ...BLANK_PROFILE, ...value.profile })
      setPrivacyConsent(value.consentGiven)
      setMonitorConsent(value.consentGiven)
      setAiConsent(value.aiConsentGiven)
      setIdentityConsent(Boolean(value.identityConsentGiven))
      setInstructionAcknowledged(Boolean(value.assessmentRulesAccepted))
      setFocusPaused(Boolean(value.proctorPausedAt)||
        (value.assessmentStatus==='in_progress'&&value.total===30&&!captureActive.current))
      if(!value.proctorPausedAt)pauseEventSent.current=false
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
  useEffect(()=>{
    if(!session||screen?.identityStatus!=='pending_verification')return
    const timer=window.setInterval(()=>void refresh(),5000)
    return ()=>window.clearInterval(timer)
  },[session,screen?.identityStatus,refresh])
  useEffect(()=>{
    if(!session||screen?.assessmentStatus!=='in_progress'||screen.total!==30)return
    const heartbeat=()=>{
      if(focusPaused||screen?.proctorPausedAt||document.visibilityState!=='visible'||
        !document.hasFocus()||!document.fullscreenElement)return
      void fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${session}`},
        body:JSON.stringify({action:'proctorHeartbeat'})})
        .then(response=>{
          if(!response.ok){
            setFocusPaused(true);setAnswer('');setAnswerSource('typed')
            recognition.current?.stop();setIsSpeaking(false);stopCaptureRef.current()
            setNotice('Proctor focus check failed. The assessment is paused; restore recording and resume.')
          }
        }).catch(()=>{
          setFocusPaused(true);setAnswer('');setAnswerSource('typed')
          recognition.current?.stop();setIsSpeaking(false);stopCaptureRef.current()
          setNotice('Proctor connection was interrupted. The assessment is paused; restore recording and resume.')
        })
    }
    heartbeat()
    const timer=window.setInterval(heartbeat,3000)
    return ()=>window.clearInterval(timer)
  },[session,screen?.assessmentStatus,screen?.total,screen?.proctorPausedAt,focusPaused])
  useEffect(() => {
    if(screen?.applicant.email) setWorkspaceView(screen.assessmentStatus==='in_progress'?'assessment':'applications')
  },[screen?.applicant.email])
  const loadApplications = useCallback(async () => {
    if (!sessionRef.current) return
    try {
      const result = await submit('applications')
      const items=result.applications||[]
      setApplications(items)
      if(!items.length)setWorkspaceView(prev=>prev==='applications'?'assessment':prev)
      setApplicationsError('')
    } catch (e) {
      setApplicationsError(e instanceof Error ? e.message : 'Application status is unavailable.')
    }
  }, [submit])
  useEffect(() => {
    if (screen?.applicant.email) void loadApplications()
  }, [screen?.applicant.email,screen?.assessmentStatus,session,loadApplications])
  const loadOnboarding = useCallback(async () => {
    if(!sessionRef.current)return
    try{
      const data=await submit('onboardingDocuments')
      setDocuments(data.documents||[])
      setOnboardingConfigured(Boolean(data.configured))
      setOnboardingError('')
    }catch(e){
      setOnboardingError(e instanceof Error?e.message:'Document status unavailable.')
    }
  },[submit])
  useEffect(()=>{
    if(screen?.applicant.email)void loadOnboarding()
  },[screen?.applicant.email,screen?.applicationReference,session,loadOnboarding])
  const uploadOnboarding = async (documentId:string) => {
    const file=selectedDocuments[documentId]
    if(!file||file.type!=='application/pdf'||!file.name.toLowerCase().endsWith('.pdf')||file.size>=5_000_000){
      setOnboardingError('Choose a valid PDF under 5 MB.');return
    }
    setBusy(true);setOnboardingError('')
    try{
      const data=new FormData()
      data.append('documentId',documentId)
      data.append('document',file)
      const response=await fetch(API+'?action=submitOnboardingDocument',{
        method:'POST',credentials:'same-origin',cache:'no-store',
        headers:{Authorization:`Bearer ${sessionRef.current}`},body:data
      })
      const result=await response.json().catch(()=>({})) as {ok?:boolean;error?:string}
      if(!response.ok||!result.ok)throw Error(result.error||'Secure document upload failed.')
      setSelectedDocuments(prev=>({...prev,[documentId]:null}))
      await loadOnboarding()
      setNotice('Your document is securely submitted for recruiter review.')
    }catch(e){setOnboardingError(e instanceof Error?e.message:'Unable to submit document.')}
    finally{setBusy(false)}
  }
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
      const pauseEvents=['focus_lost','visibility_hidden','fullscreen_exited','capture_interrupted','microphone_denied','microphone_muted','audio_interrupted']
      const active=screenRef.current?.assessmentStatus==='in_progress'&&screenRef.current.total===30
      if(active&&pauseEvents.includes(event)&&!pauseEventSent.current){
        pauseEventSent.current=true
        setFocusPaused(true)
        setAnswer('')
        setAnswerSource('typed')
        recognition.current?.stop()
        setIsSpeaking(false)
        stopCaptureRef.current()
        setNotice('Assessment paused. Your unsaved answer was cleared; previously submitted answers remain saved.')
      }
      void fetch(API, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionRef.current}` }, body: JSON.stringify({ action: 'event', event }) }).catch(() => {})
    }
    const visibility = () => log(document.visibilityState === 'hidden' ? 'visibility_hidden' : 'visibility_visible')
    const blur = () => log('focus_lost')
    const focus = () => log('focus_returned')
    const changed = () => { setFullscreen(Boolean(document.fullscreenElement)); if (!document.fullscreenElement) log('fullscreen_exited') }
    const clipboard=(event:Event)=>{
      if(screenRef.current?.assessmentStatus==='in_progress'&&screenRef.current.total===30){
        event.preventDefault()
        log('clipboard_blocked')
      }
    }
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('blur', blur)
    window.addEventListener('focus', focus)
    document.addEventListener('fullscreenchange', changed)
    document.addEventListener('copy',clipboard)
    document.addEventListener('cut',clipboard)
    document.addEventListener('paste',clipboard)
    return () => {
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('blur', blur)
      window.removeEventListener('focus', focus)
      document.removeEventListener('fullscreenchange', changed)
      document.removeEventListener('copy',clipboard)
      document.removeEventListener('cut',clipboard)
      document.removeEventListener('paste',clipboard)
    }
  }, [])
  useEffect(() => () => {
    recognition.current?.stop()
    for (const recorder of recorders.current) {if(recorder.state!=='inactive')recorder.stop()}
    captures.current?.screen.getTracks().forEach(track=>track.stop())
    captures.current?.camera.getTracks().forEach(track=>track.stop())
    if(soundPoll.current!==null)window.clearInterval(soundPoll.current)
    void audioContext.current?.close()
  }, [])

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
  const startPublic = async () => {
    const email=registerEmail.trim().toLowerCase()
    const success=await perform(()=>submit('publicStart',{
      name:registerName.trim(),email,role:registerRole,turnstileToken,loginOnly:entryMode==='login'
    }),'If this email has an applicant account, check its inbox for a six-digit login code.')
    setTurnstileToken('')
    if (success) {setPendingEmail(email);setOtpRequested(true)}
    else if (turnstileWidget.current) {
      const ts = (window as unknown as { turnstile?: {reset:(id:string)=>void} }).turnstile
      ts?.reset(turnstileWidget.current)
    }
  }
  const verifyPublic = async () => {
    if (await perform(()=>submit('publicVerify',{email:pendingEmail,code,
      name:registerName.trim(),role:registerRole,loginOnly:entryMode==='login'}),'Your email is verified.')) {
      setCode('')
    }
  }
  const logout = async () => {
    stopCapture()
    stopIdentityCamera()
    setIdentityChallenge(null)
    setIdentityFrames({document:null,selfie:null,motion:null})
    try {await submit('logout')} catch { /* expiration also invalidates the browser session */ }
    try {sessionStorage.removeItem(SESSION_KEY)} catch { /* private browsing */ }
    recognition.current?.stop()
    recognition.current=null
    setIsSpeaking(false)
    setAnswer('')
    setAnswerSource('typed')
    stopCapture();setWorkspaceView('assessment');setScreen(null);setApplications([]);setDocuments([]);setOnboardingConfigured(false);setSelectedDocuments({});setSession('');sessionRef.current='';setOtpRequested(false)
    setProfile(BLANK_PROFILE);setPrivacyConsent(false);setMonitorConsent(false);setAiConsent(false)
    setRegisterName('');setRegisterEmail('');setPendingEmail('');setCode('')
    setEntryMode('login');setTurnstileToken('');setProfilePage(0);setReadyPage(0);setNotice('You have signed out.')
    // Clear legacy invitation query to offer public email OTP login for resuming.
    if (invitation) navigate('/ava-screening/',{replace:true})
  }
  const openApplication = async (referenceId: string) => {
    const opened = await perform(() => submit('selectApplication', { referenceId }),
      'Application selected. Complete your profile and assessment if required.')
    if (opened) {setWorkspaceView('assessment');await loadApplications()}
  }
  const verifyCode = async () => { if (await perform(() => submit('verifyCode', { invitation, code }), 'Email address verified.')) setCode('') }
  const saveProfile = async () => { if(await perform(() => submit('profile', { ...profile, privacyConsent, monitorConsent, aiConsent }), 'Profile saved securely.')) { setProfilePage(0); setReadyPage(0) } }
  // Diagnostic permissions checks never send or retain any media.
  // Every request runs from a direct button gesture and stops all tracks.
  const checkCameraMic = async () => {
    setError('');setPermissionTest('testing');setCameraChecked(false)
    try {
      if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)
        throw Error('Camera and microphone require a current HTTPS browser. Open the applicant portal directly.')
      const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true})
      try {
        if(!stream.getVideoTracks().length||!stream.getAudioTracks().length)
          throw Error('Camera and microphone must both be enabled.')
        setCameraChecked(true);setPermissionTest('camera-ok')
        setNotice('Camera and microphone were accessible. No diagnostic recording was saved.')
      } finally {stream.getTracks().forEach(track=>track.stop())}
    } catch(e){setPermissionTest('unsupported');setError(cameraErrorMessage(e))}
  }
  const checkScreenShare = async () => {
    setError('');setPermissionTest('testing');setScreenChecked(false)
    try {
      if(!navigator.mediaDevices?.getDisplayMedia)throw Error('This browser cannot share a screen. Try a supported desktop browser.')
      const stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false})
      try {
        const track=stream.getVideoTracks()[0]
        if(!track)throw Error('A display capture must be selected.')
        const selected=track.getSettings().displaySurface
        if(selected&&selected!=='monitor')throw Error('Select the entire screen, not one application or browser tab.')
        setScreenChecked(true);setPermissionTest('screen-ok')
        setNotice('Screen sharing is supported. The diagnostic capture was stopped immediately; no recording was saved.')
      } finally {stream.getTracks().forEach(track=>track.stop())}
    } catch(e){setPermissionTest('unsupported');setError(e instanceof Error?e.message:'Screen recording permission was denied.')}
  }
  const stopIdentityCamera=()=>{
    // Invalidate pending permission prompts. A late stream must be discarded
    // after cancel, logout, leaving this step or switching cameras.
    identityCameraGeneration.current+=1
    identityStream.current?.getTracks().forEach(track=>track.stop())
    identityStream.current=null
    if(identityVideo.current)identityVideo.current.srcObject=null
    setIdentityCameraStatus('idle')
  }
  const inspectIdentityBrowser=useCallback(async()=>{
    try {setIdentityBrowser(await inspectCameraBrowser())}
    catch {setIdentityBrowser(null)}
  },[])
  useEffect(()=>{
    void inspectIdentityBrowser()
    const update=()=>void inspectIdentityBrowser()
    window.addEventListener('focus',update)
    navigator.mediaDevices?.addEventListener?.('devicechange',update)
    return ()=>{
      window.removeEventListener('focus',update)
      navigator.mediaDevices?.removeEventListener?.('devicechange',update)
    }
  },[inspectIdentityBrowser])
  const startIdentityCamera=async(facing:'environment'|'user')=>{
    stopIdentityCamera()
    const generation=identityCameraGeneration.current
    setIdentityCameraStatus('requesting')
    setError('')
    let stream:MediaStream|null=null
    try{
      if(!window.isSecureContext)
        throw Error('The camera only works on a secure HTTPS site. Open the OPERAVA applicant portal directly.')
      const policy=document as Document & {permissionsPolicy?:{allowsFeature:(feature:string)=>boolean};featurePolicy?:{allowsFeature:(feature:string)=>boolean}}
      if((policy.permissionsPolicy||policy.featurePolicy)?.allowsFeature('camera')===false)
        throw Error('This page is blocked by its browser Camera Permissions Policy. Reload this website and try again.')
      // The native permission request is started directly from this button
      // event, before any asynchronous inspection or network operation.
      stream=await requestIdentityCamera(facing)
      if(generation!==identityCameraGeneration.current){
        stream.getTracks().forEach(t=>t.stop())
        return
      }
      const video=identityVideo.current
      const track=stream.getVideoTracks()[0]
      if(!video||!track||track.readyState!=='live')
        throw Error('No live video track is available. Check the device camera and retry.')
      identityStream.current=stream
      track.addEventListener('ended',()=>{
        if(generation!==identityCameraGeneration.current)return
        stopIdentityCamera()
        setIdentityCameraStatus('interrupted')
        setError('Camera disconnected or permission ended. Allow the camera again to continue.')
      },{once:true})
      track.addEventListener('mute',()=>{
        if(generation!==identityCameraGeneration.current)return
        setIdentityCameraStatus('interrupted')
        setError('Camera video is paused. Resume it in the browser or device settings, then enable the camera again.')
      })
      video.srcObject=stream
      // Muted playsInline previews normally autoplay on mobile, but never
      // silently treat a rejected play() or zero video dimensions as success.
      let playbackTimeout:number|undefined
      try{
        await Promise.race([
          video.play(),
          new Promise<void>((_,reject)=>{
            playbackTimeout=window.setTimeout(()=>reject(Error('Live preview did not start. Allow camera playback, update the browser or retry.')),8000)
          })
        ])
      }finally{if(playbackTimeout!==undefined)window.clearTimeout(playbackTimeout)}
      if(video.readyState<2||video.videoWidth===0){
        await new Promise<void>((resolve,reject)=>{
          const timeout=window.setTimeout(()=>{clear();reject(Error('Camera opened but no video frame appeared. Retry the camera or update your browser.'))},8000)
          const clear=()=>{window.clearTimeout(timeout);video.removeEventListener('loadeddata',check);video.removeEventListener('loadedmetadata',check)}
          const check=()=>{if(video.readyState>=2&&video.videoWidth>0){clear();resolve()}}
          video.addEventListener('loadeddata',check)
          video.addEventListener('loadedmetadata',check)
          check()
        })
      }
      if(generation!==identityCameraGeneration.current)return
      if(!cameraIsLive(stream)||video.videoWidth<160||video.videoHeight<120)
        throw Error('The camera has not produced a usable video frame. Retry or choose another camera.')
      setIdentityCameraStatus('ready')
      setNotice('Camera access confirmed with a live preview. Capture this image to advance to the next step.')
      void inspectIdentityBrowser()
    }catch(e){
      if(generation!==identityCameraGeneration.current)return
      const message=cameraErrorMessage(e)
      stopIdentityCamera()
      setIdentityCameraStatus(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia?'unsupported':'blocked')
      setError(message)
      void inspectIdentityBrowser()
    }
  }
  useEffect(()=>()=>{identityCameraGeneration.current+=1;identityStream.current?.getTracks().forEach(track=>track.stop())},[])
  const requestIdentity=async()=>{
    setIdentityBusy(true);setError('');setNotice('')
    try {
      if(!identityConsent)throw Error('Consent to the secure Veriff ID and live selfie check before requesting your link.')
      if(!screen?.identityProviderAvailable)throw Error('Automatic phone identity verification is not configured yet. Contact Talent Acquisition.')
      const result=await submit('identityStart',{identityConsent:true})
      setNotice(result.message||'A secure verification link was sent to your verified email. Open it on your phone; this desktop page will update automatically.')
      await refresh()
    }catch(e){setError(e instanceof Error?e.message:'Unable to send the secure phone verification link.')}
    finally{setIdentityBusy(false)}
  }
  const acceptAssessmentRules=async()=>{
    if(!instructionAcknowledged){setError('Read the instructions and confirm that you understand the assessment rules.');return}
    const ok=await perform(()=>submit('acceptAssessmentRules',{accepted:true}),'Assessment rules acknowledged. Continue to device permissions.')
    if(ok)setReadyPage(2)
  }
  const captureIdentity=async()=>{
    setIdentityBusy(true);setError('')
    try {
      if(!identityChallenge||Date.now()>identityChallenge.expires)throw Error('The camera challenge expired. Start again.')
      if(identityCameraStatus!=='ready'||!cameraIsLive(identityStream.current))
        throw Error('Enable the camera and verify a live preview before taking a photo.')
      const video=identityVideo.current
      if(!video||video.readyState<2||video.videoWidth<160||video.videoHeight<120)
        throw Error('Camera preview is not ready. Retry Enable camera and check the live image.')
      const canvas=document.createElement('canvas')
      const ratio=Math.min(1,1280/video.videoWidth)
      canvas.width=Math.round(video.videoWidth*ratio);canvas.height=Math.round(video.videoHeight*ratio)
      const ctx=canvas.getContext('2d')
      if(!ctx)throw Error('Camera capture is unavailable in this browser.')
      ctx.drawImage(video,0,0,canvas.width,canvas.height)
      const shot=await new Promise<Blob>((resolve,reject)=>
        canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Unable to save camera frame.')),'image/jpeg',.86))
      if(shot.size<8000||shot.size>2_500_000)throw Error('Photo quality is insufficient or image too large. Try again.')
      const key=(['document','selfie','motion'] as const)[identityStep]
      setIdentityFrames(previous=>({...previous,[key]:shot}))
      if(identityStep===0){
        stopIdentityCamera()
        setIdentityStep(1)
        setNotice('ID photo captured. Select Enable front camera to open the selfie camera, then take your first selfie.')
      }else if(identityStep===1){
        setIdentityStep(2)
        setNotice('First selfie saved. Turn your face slightly and capture a second distinct moment with the camera still active.')
      }else{
        stopIdentityCamera()
        setIdentityStep(3)
        setNotice('All three live camera images captured. Review and submit them privately for human identity verification.')
      }
    }catch(e){setError(e instanceof Error?e.message:'Unable to capture identity photo.')}
    finally{setIdentityBusy(false)}
  }
  // Native mobile camera-picker fallback. It can offer a photo library on
  // some devices; every frame remains a visual human-review observation, not
  // proof of physical liveness. Convert to JPEG before private upload.
  const captureNativeIdentityFile=async(file:File|null)=>{
    if(!file)return
    setIdentityBusy(true);setError('')
    try{
      if(!identityChallenge||Date.now()>identityChallenge.expires)
        throw Error('Your secure identity challenge expired. Restart capture.')
      if(!file.type.startsWith('image/')||file.size>15_000_000)
        throw Error('Select one clear photo captured with your device camera (maximum 15 MB).')
      const url=URL.createObjectURL(file)
      let image:HTMLImageElement
      try {
        image=await new Promise<HTMLImageElement>((resolve,reject)=>{
          const img=new Image()
          img.onload=()=>resolve(img)
          img.onerror=()=>reject(Error('The selected image could not be opened. Use your device camera with JPEG capture.'))
          img.src=url
        })
      }finally{URL.revokeObjectURL(url)}
      if(image.naturalWidth<320||image.naturalHeight<240)
        throw Error('Camera photo is too small. Retake it with a higher resolution.')
      const canvas=document.createElement('canvas')
      const scale=Math.min(1,1280/image.naturalWidth,1280/image.naturalHeight)
      canvas.width=Math.floor(image.naturalWidth*scale)
      canvas.height=Math.floor(image.naturalHeight*scale)
      const context=canvas.getContext('2d')
      if(!context)throw Error('This browser cannot process captured photos.')
      context.drawImage(image,0,0,canvas.width,canvas.height)
      const jpeg=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>
        blob?resolve(blob):reject(Error('Unable to convert photo to a private JPEG.')),'image/jpeg',0.83))
      if(jpeg.size<8000||jpeg.size>=2_500_000)
        throw Error('Captured image is not usable. Retake it in good lighting.')
      stopIdentityCamera()
      setIdentityCaptureMode('device_camera_fallback')
      const part=(['document','selfie','motion'] as const)[identityStep]
      setIdentityFrames(previous=>({...previous,[part]:jpeg}))
      if(identityStep===0){setIdentityStep(1);setNotice('ID photo captured. Use the device camera again for your first selfie.')}
      else if(identityStep===1){setIdentityStep(2);setNotice('First selfie captured. Turn your face for the second selfie.')}
      else{setIdentityStep(3);setNotice('Three photos prepared for restricted human review. Device camera-picker captures are not independent liveness proof.')}
    }catch(e){setError(cameraErrorMessage(e))}
    finally{setIdentityBusy(false)}
  }
  const submitIdentity=async()=>{
    setIdentityBusy(true);setError('')
    try{
      if(!identityChallenge||Date.now()>identityChallenge.expires)
        throw Error('Your camera challenge expired. Restart live capture.')
      if(!identityConsent||!identityFrames.document||!identityFrames.selfie||!identityFrames.motion)
        throw Error('Explicit consent and all three camera captures are required.')
      const form=new FormData()
      form.set('challenge',identityChallenge.token);form.set('documentType',identityDocType);form.set('consent','true')
      form.set('captureMethod',identityCaptureMode)
      for(const key of ['document','selfie','motion'] as const)
        form.set(key,new File([identityFrames[key]!],key+'.jpg',{type:'image/jpeg'}))
      await submit('identitySubmit',{},form)
      setIdentityFrames({document:null,selfie:null,motion:null})
      setIdentityChallenge(null);stopIdentityCamera()
      setNotice('Identity photos are privately submitted. An authorized OPERAVA reviewer must compare the evidence and approve your profile before the assessment.')
      await refresh()
    }catch(e){setError(e instanceof Error?e.message:'Unable to submit your identity evidence.')}
    finally{setIdentityBusy(false)}
  }
  const stopCapture = () => {
    captureActive.current=false
    if(proctorWatchdog.current!==null)window.clearInterval(proctorWatchdog.current)
    proctorWatchdog.current=null
    for(const recorder of recorders.current){
      if(recorder.state!=='inactive'){try{recorder.stop()}catch{/* stopped */}}
    }
    recorders.current=[]
    captures.current?.screen.getTracks().forEach(track=>track.stop())
    captures.current?.camera.getTracks().forEach(track=>track.stop())
    captures.current=null
    preparedCamera.current?.getTracks().forEach(track=>track.stop())
    preparedCamera.current=null
    setProctorCameraReady(false)
    if(soundPoll.current!==null)window.clearInterval(soundPoll.current)
    soundPoll.current=null
    void audioContext.current?.close()
    audioContext.current=null
    setProctorReady(false)
    setProctorSaved({camera:false,screen:false})
  }
  stopCaptureRef.current=stopCapture
  useEffect(() => {
    setProctorSupport(inspectProctorSupport())
    const recheck=()=>setProctorSupport(inspectProctorSupport())
    window.addEventListener('focus',recheck)
    return ()=>window.removeEventListener('focus',recheck)
  },[])
  useEffect(() => {
    if(screen?.assessmentStatus==='submitted'||screen?.assessmentStatus==='time_expired')stopCapture()
  },[screen?.assessmentStatus])
  // A user gesture first grants webcam and mic access. A separate user gesture
  // starts getDisplayMedia, required by the browser's transient-activation rule.
  const prepareProctorCamera=async()=>{
    if(!recordingConsent){setError('Please consent to camera, microphone and screen recording first.');return}
    setProctorBusy(true);setError('')
    try {
      stopCapture()
      if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera and microphone are not supported in this browser.')
      const camera=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'user'}},audio:{echoCancellation:true,noiseSuppression:true}})
      if(!proctorTrackIsLive(camera,'video')||!proctorTrackIsLive(camera,'audio')){
        camera.getTracks().forEach(track=>track.stop())
        throw Error('The camera and microphone did not become active. Grant both permissions and try again.')
      }
      preparedCamera.current=camera
      for(const track of camera.getTracks()) {
        track.addEventListener('ended',()=>{
          if(preparedCamera.current!==camera)return
          stopCapture()
          setError('Webcam or microphone was disconnected. Restore permission and try again.')
        },{once:true})
      }
      setProctorCameraReady(true)
      setNotice('Webcam and microphone are active. Next, select Share entire screen to start the secure recording.')
    }catch(e){setProctorCameraReady(false);setError(proctorErrorMessage(e,'camera'))}
    finally{setProctorBusy(false)}
  }
  const isCaptureLive = () => Boolean(captures.current &&
    proctorTrackIsLive(captures.current.screen,'video') &&
    proctorTrackIsLive(captures.current.camera,'video') &&
    proctorTrackIsLive(captures.current.camera,'audio') &&
    recorders.current.length===2&&recorders.current.every(r=>r.state==='recording'))
  const startCapture = async () => {
    if(!recordingConsent){setError('Explicit recording consent is required.');return}
    if(!screen?.verifiedApplicantProfile){setError('Verified identity is required before recording.');return}
    if(!screen?.recordingStorageReady){setError('Secure private recording storage is not configured.');return}
    if(!proctorCameraReady||!preparedCamera.current||
      !proctorTrackIsLive(preparedCamera.current,'video')||
      !proctorTrackIsLive(preparedCamera.current,'audio')){
      setError('Enable your webcam and microphone in the previous step before sharing your screen.')
      return
    }
    setProctorBusy(true);setError('');setProctorSaved({camera:false,screen:false})
    let display:MediaStream|null=null
    const webcam=preparedCamera.current
    let source:'screen'|'camera'|'recorder'|'upload'='screen'
    try {
      if(!navigator.mediaDevices?.getDisplayMedia)
        throw Error('This browser does not support screen sharing. Use a current desktop browser with full-screen capture.')
      // Must be the first browser permission call in this direct click handler.
      display=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false})
      if(!proctorTrackIsLive(display,'video'))
        throw Error('Screen capture did not become active. Select Share in the browser dialog.')
      const surface=display.getVideoTracks()[0]?.getSettings().displaySurface
      if(surface!=='monitor'){
        display.getTracks().forEach(track=>track.stop())
        display=null
        throw Error('Select Entire Screen / Monitor in the browser sharing dialog. Tabs and individual application windows are not accepted.')
      }
      if(!proctorTrackIsLive(webcam,'video')||!proctorTrackIsLive(webcam,'audio'))
        throw Error('Your webcam or microphone disconnected while screen sharing was enabled.')
      source='upload'
      await submit('proctorConsent',{recordingConsent:true})
      captures.current={screen:display,camera:webcam}
      preparedCamera.current=null
      captureActive.current=true
      const onLost=()=>{
        if(!captureActive.current)return
        if(screenRef.current?.assessmentStatus==='in_progress')
          void submit('event',{event:'capture_interrupted'}).catch(()=>{})
        stopCapture()
        setFocusPaused(screenRef.current?.assessmentStatus==='in_progress')
        setError('A required camera, microphone or screen stream ended. The assessment is paused; restore all three permissions before resuming.')
      }
      for(const track of [...display.getTracks(),...webcam.getTracks()]){
        track.addEventListener('ended',onLost,{once:true})
        track.addEventListener('mute',onLost)
      }
      source='recorder'
      const sendChunk=(kind:'camera'|'screen',blob:Blob)=>{
        if(!captureActive.current||!blob.size)return
        lastRecordingData.current[kind]=Date.now()
        const form=new FormData()
        form.append('kind',kind)
        form.append('chunk',new File([blob],kind+'.recording',{type:blob.type||'video/webm'}))
        void fetch(API+'?action=proctorChunk',{
          method:'POST',credentials:'same-origin',cache:'no-store',body:form,
          headers:{Authorization:`Bearer ${sessionRef.current}`}
        }).then(async response=>{
          const result=await response.json().catch(()=>({})) as {ok?:boolean;error?:string}
          if(!response.ok||!result.ok)throw Error(result.error||'Private recording upload was rejected.')
          if(captureActive.current)setProctorSaved(previous=>({...previous,[kind]:true}))
        }).catch(e=>{
          if(!captureActive.current)return
          stopCapture()
          setError(proctorErrorMessage(e,'upload'))
        })
      }
      const now=Date.now()
      lastRecordingData.current={camera:now,screen:now}
      for(const [kind,stream] of [['camera',webcam],['screen',display]] as const) {
        const recorder=createProctorRecorder(stream,kind)
        recorder.ondataavailable=event=>sendChunk(kind,event.data)
        recorder.onerror=onLost
        recorders.current.push(recorder)
        recorder.start(8000)
      }
      proctorWatchdog.current=window.setInterval(()=>{
        if(!captureActive.current)return
        for(const [index,kind] of ['camera','screen'].entries()){
          const recorder=recorders.current[index]
          if(recorder?.state==='recording'&&Date.now()-lastRecordingData.current[kind as 'camera'|'screen']>14_000){
            try{recorder.requestData()}catch{/* onLost handles recorder failure */}
          }
        }
      },5000)
      try{
        const context=new AudioContext()
        audioContext.current=context
        const sourceNode=context.createMediaStreamSource(webcam)
        const analyser=context.createAnalyser();analyser.fftSize=512
        sourceNode.connect(analyser)
        const samples=new Uint8Array(analyser.fftSize)
        let sustained=0,lastEvent=0
        soundPoll.current=window.setInterval(()=>{
          if(!consentRef.current||!captures.current)return
          analyser.getByteTimeDomainData(samples)
          let sum=0
          for(const sample of samples){const level=(sample-128)/128;sum+=level*level}
          sustained=Math.sqrt(sum/samples.length)>0.24?sustained+1:0
          if(sustained>=3&&Date.now()-lastEvent>=60_000){
            lastEvent=Date.now();sustained=0
            void submit('event',{event:'sound_flag'}).catch(()=>{})
          }
        },1000)
      }catch{/* Sound events are only advisory. */}
      setProctorReady(true)
      setNotice('Screen, webcam and microphone recording has started. The assessment opens after both private recording segments are saved.')
    }catch(e){
      display?.getTracks().forEach(track=>track.stop())
      stopCapture()
      setError(proctorErrorMessage(e,source))
    }finally{setProctorBusy(false)}
  }
  const beginAssessment = async () => {
    if(!instructionAcknowledged||!screen?.assessmentRulesAccepted){
      setError('Read and acknowledge the assessment rules before starting.')
      return
    }
    if(!screen?.verifiedApplicantProfile||!proctorReady||!proctorSaved.camera||!proctorSaved.screen||!isCaptureLive()){
      setError('Allow screen, webcam and microphone recording and wait until both streams are securely saved.')
      return
    }
    if(!document.fullscreenEnabled){
      setError('This browser does not support the required full-screen assessment mode. Use a current desktop browser.')
      return
    }
    try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen()}
    catch{setError('Full-screen mode is required. Allow full-screen mode and try again.');return}
    const ok = await perform(() => submit('begin'), 'Your 45-minute assessment has started.')
    if(ok){setFocusPaused(false);pauseEventSent.current=false}
  }
  const resumeAssessment=async()=>{
    if(!proctorReady||!proctorSaved.camera||!proctorSaved.screen||!isCaptureLive()){
      setError('Restore screen, webcam and microphone recording and wait for both private segments before resuming.')
      return
    }
    const ok=await perform(()=>submit('proctorResume'),'Assessment resumed. Your unsaved response was reset; submitted answers remain saved.')
    if(ok){setFocusPaused(false);pauseEventSent.current=false}
  }
  const sendAnswer = async () => {
    if(screen?.proctorPausedAt||focusPaused){
      setError('The assessment is paused. Restore recording and explicitly resume before submitting an answer.')
      return
    }
    if(screen?.total===30&&(!proctorReady||!proctorSaved.camera||!proctorSaved.screen||!isCaptureLive())){
      setError('Screen, webcam and microphone recording must remain active before answering.')
      return
    }
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

  const stageIndex = !screen ? 0 : !screen.profile?.fullName || !screen.consentGiven ? 1 : 2
  const stage = !screen ? 'email' : screen.assessmentStatus === 'submitted' || screen.assessmentStatus === 'time_expired' ? 'finished'
    : screen.assessmentStatus === 'in_progress' ? 'assessment'
    : !screen.profile?.fullName || !screen.consentGiven ? 'profile' : 'ready'
  const finished = stage === 'finished'
  // Scale only the active stage to the available viewport; the main document,
  // exam scene and inner forms never become vertical scrolling containers.
  // Re-measure when content/pages change or the viewport is resized.
  useLayoutEffect(() => {
    const deck=deckRef.current
    if(!deck)return
    let frame=0
    const fit=()=>{
      const scene=deck.querySelector<HTMLElement>('.ava-horizontal-scene')
      const content=scene?.querySelector<HTMLElement>('.ava-scene-fit')
      if(!scene||!content)return
      content.style.zoom='1'
      const needed=content.scrollHeight
      const available=scene.clientHeight
      if(!needed||!available)return
      const scale=Math.min(1,Math.max(0.35,(available-8)/(needed+8)))
      content.style.zoom=String(Math.floor(scale*1000)/1000)
    }
    const schedule=()=>{window.cancelAnimationFrame(frame);frame=window.requestAnimationFrame(fit)}
    const resized=new ResizeObserver(schedule)
    resized.observe(deck)
    const updated=new MutationObserver(schedule)
    updated.observe(deck,{childList:true,subtree:true,characterData:true})
    schedule()
    return ()=>{window.cancelAnimationFrame(frame);resized.disconnect();updated.disconnect()}
  },[stage,profilePage,readyPage,workspaceView,itemPage,screen?.question?.number,applications.length,documents.length])
  useEffect(()=>setItemPage(0),[workspaceView])
  const visibleApplications=applications.slice(itemPage,itemPage+1)
  const visibleDocuments=documents.slice(itemPage,itemPage+1)

  return (
    <div className="ava-screening">
      <div className="ava-wrap">
        {params.get('identity')==='complete' ? <section className="ava-identity-return" role="status">
          <div className="ava-check-icon"><ShieldCheck size={28}/></div>
          <p className="ava-label">IDENTITY SUBMISSION RECEIVED</p>
          <h1>Return to your computer</h1>
          <p>Your phone verification has been submitted to the identity provider. Return to the desktop browser where you started Ava Assessment. That page will update automatically when the final verification decision is received.</p>
          <p className="ava-muted">A submitted check is not the same as an approved check. You may close this phone page once you have returned to your desktop.</p>
          <Link className="ava-secondary" to="/ava-screening/">Open the applicant portal</Link>
        </section> : <div className="ava-app-shell">
        <header className="ava-app-topbar">
          <div className="ava-app-brand" aria-label="Operava Ava Screening">
            <span className="ava-app-symbol" aria-hidden="true"><ShieldCheck size={22} strokeWidth={2} /></span>
            <div><strong>OPERAVA</strong><span>AVA · APPLICANT PORTAL</span></div>
          </div>
          <div className="ava-app-controls">
            <Link className="ava-topnav-link" to="/careers">Careers</Link>
            <span className="ava-access-label"><LockKeyhole size={13} /> PRIVATE WORKSPACE · OTP SIGN-IN</span>
            <ThemeToggle />
            {screen && <button type="button" className="ava-header-signout" aria-label="Sign out of applicant portal" title="Sign out" onClick={()=>void logout()}><LogOut size={16}/></button>}
          </div>
        </header>
        <div className="ava-workspace-main">
        <div className="ava-app-heading">
          <div>
            <p className="ava-kicker"><span className="ava-dot" /> SECURE CANDIDATE WORKSPACE</p>
            <h1>AVA <span>ASSESSMENT</span></h1>
            <p>Secure applicant sign-in, applications, assessments and recruitment status — one place.</p>
          </div>
          <div className="ava-app-heading-state"><ShieldCheck size={17} /><span>{screen ? screen.verifiedApplicantProfile?'Verified Applicant Profile':'Email-verified applicant workspace':'Secure email verification'}</span></div>
        </div>
        <div className="ava-steps" aria-label="Screening stages">{STEPS.map((label, i) => <div className={`ava-step ${i <= stageIndex ? 'is-active' : ''}`} key={label}><span>{i < stageIndex ? <CheckCircle2 size={15} /> : String(i + 1).padStart(2, '0')}</span><strong>{label}</strong></div>)}</div>
        {screen && <nav className="ava-workspace-nav" aria-label="Applicant workspace views">
          <div className="ava-workspace-tabs">
            <button type="button" className={workspaceView==='applications'&&stage!=='assessment'?'is-active':''}
              disabled={stage==='assessment'} aria-current={workspaceView==='applications'&&stage!=='assessment'?'page':undefined}
              onClick={()=>setWorkspaceView('applications')}><ClipboardList size={16}/> My Applications
              {applications.filter(item=>item.requiredAction).length>0 && <span className="ava-tab-count">{applications.filter(item=>item.requiredAction).length}</span>}
            </button>
            <button type="button" className={workspaceView==='assessment'||stage==='assessment'?'is-active':''}
              aria-current={workspaceView==='assessment'||stage==='assessment'?'page':undefined}
              onClick={()=>setWorkspaceView('assessment')}><ClipboardCheck size={16}/> Ava Assessment</button>
            <button type="button" className={workspaceView==='documents'&&stage!=='assessment'?'is-active':''}
              disabled={stage==='assessment'} aria-current={workspaceView==='documents'&&stage!=='assessment'?'page':undefined}
              onClick={()=>setWorkspaceView('documents')}><FileCheck2 size={16}/> Documents
              {documents.filter(doc=>doc.status==='requested'||doc.status==='resubmission_required').length>0 &&
                <span className="ava-tab-count">{documents.filter(doc=>doc.status==='requested'||doc.status==='resubmission_required').length}</span>}
            </button>
          </div>
          <div className="ava-workspace-user"><span>{screen.applicant.email}</span>
            <button type="button" onClick={()=>void logout()}><LogOut size={14}/> Sign out</button>
          </div>
        </nav>}
        <div className="ava-workspace-body">
        <div className="ava-assessment-deck" ref={deckRef}>
        <AnimatePresence mode="wait" initial={false}>
        <motion.div key={`${stage}-${stage==='profile'?profilePage:stage==='ready'?readyPage:workspaceView}-${screen?.question?.number||0}`}
          className="ava-horizontal-scene" initial={{opacity:0,x:reduceMotion?0:'14%'}} animate={{opacity:1,x:0}} exit={{opacity:0,x:reduceMotion?0:'-14%'}}
          transition={{duration:reduceMotion?0:0.65,ease:[0.22,1,0.36,1]}}>
        <div className="ava-scene-fit">
        {(workspaceView==='assessment'||!screen||stage==='assessment') && <div className="ava-shell">
          <aside className="ava-sidebar" aria-label="Assessment guidance">
            {stage !== 'assessment' && stage !== 'finished' && <div className="ava-team-art"><img src="/media/ava-assessment-team.svg" alt="Connected Operava professionals, secure assessment and teamwork" width={660} height={400} decoding="async" /></div>}
            <div className="ava-sidebar-block"><p className="ava-label">APPLICANT WORKSPACE</p><h2>{screen?.applicant.roleTitle || 'Application access'}</h2><p>{screen?.applicant.email || 'Sign in with an email one-time code to manage recruitment applications.'}</p>{screen && <p className={screen.verifiedApplicantProfile?'ava-identity-verified':'ava-identity-pending'}><ShieldCheck size={14}/>{screen.verifiedApplicantProfile?'Verified Applicant Profile':'Identity verification required'}</p>}{screen?.applicationReference && <p className="ava-ref">APPLICATION · {screen.applicationReference}</p>}</div>
            <div className="ava-sidebar-block"><p className="ava-label">ASSESSMENT PROTOCOL</p><div className="ava-sidebar-info"><Clock3 size={18}/><span>45-minute, server-enforced timer</span></div><div className="ava-sidebar-info"><MonitorCheck size={18}/><span>Consent-based focus and visibility logs</span></div><div className="ava-sidebar-info"><ClipboardCheck size={18}/><span>Written and role-based responses</span></div><div className="ava-sidebar-info"><Headphones size={18}/><span>Optional speech-to-text dictation</span></div></div>
            <div className="ava-sidebar-note"><LockKeyhole size={17}/><span>New assessments require consented webcam, microphone and screen recording. Sound and focus flags require human review; AI feedback is advisory.</span></div>
            {screen?.assessmentStatus === 'in_progress' && <div className="ava-timer"><span>TIME REMAINING</span><strong aria-live="off" className={seconds < 300 ? 'ava-time-low' : ''}>{formatRemaining(seconds)}</strong><small>Time runs even if this tab closes.</small></div>}
          </aside>
          <section className={`ava-content ${stage==='assessment'?'ava-content--question-board':''}`} aria-live="polite">
            {stage!=='assessment' && <div className="ava-stage-heading">
              <div><span>AVA SCREENING JOURNEY</span><strong>{STEP_ILLUSTRATIONS[stage].label}</strong></div>
              <img src={STEP_ILLUSTRATIONS[stage].src} alt="" aria-hidden="true" width={112} height={112} decoding="async" />
            </div>}
            {stage === 'email' && <div className="ava-panel"><div className="ava-icon"><MailCheck /></div><p className="ava-label">STEP 01 — FREE APPLICANT REGISTRATION</p><h2>Register or sign in with email.</h2>
              <p>Existing applicants can sign in with their email and a one-time code. New applicants can create a profile to apply and complete their required assessment.</p>
              {!invitation && IS_PREVIEW ? <div className="ava-invitation ava-preview-login">
                <LockKeyhole size={20}/><span>This is a design preview without applicant login credentials. To protect applicant records, sign in using the secure production portal instead.
                  <a href="https://www.operavaglobal.com/applicant-portal/"> Open the live Applicant Portal</a>.</span>
              </div> : invitation ? <><div className="ava-invitation"><ShieldCheck size={20}/> A private invitation was detected. Do not forward or share its link.</div>
                {!otpRequested ? <button className="ava-primary" disabled={busy} onClick={() => void requestCode()}>{busy ? 'Sending code…' : 'Send verification code'}<ChevronRight size={17}/></button>
                  : <form onSubmit={(e) => { e.preventDefault(); void verifyCode() }}><label className="ava-field">Verification code<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0,6))} required /></label>
                    <p className="ava-muted">Sent to {maskedEmail}. Expires in 10 minutes.</p><button className="ava-primary" disabled={busy || code.length !== 6}>{busy ? 'Verifying…' : 'Verify and continue'}<ChevronRight size={17}/></button>
                    <button type="button" className="ava-text-button" disabled={busy} onClick={() => void requestCode()}>Resend code (after 60 seconds)</button></form>}
                <button className="ava-secondary" onClick={() => void copyPhoneLink()}><Smartphone size={16}/> Copy mobile verification link</button>
              </> : otpRequested ? <form className="ava-form" onSubmit={e=>{e.preventDefault();void verifyPublic()}}>
                  <div className="ava-invitation"><MailCheck size={19}/> Verification code sent to {maskedEmail||pendingEmail}.</div>
                  <label className="ava-field">Six-digit email code<input inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                    pattern="[0-9]{6}" required placeholder="000000" value={code}
                    onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}/></label>
                  <button type="submit" className="ava-primary" disabled={busy||code.length!==6}>
                    {busy?'Verifying…':'Verify email and continue'}<ChevronRight size={16}/></button>
                  <button className="ava-secondary" type="button" onClick={()=>{setOtpRequested(false);setCode('');setTurnstileToken('');
                    const turnstile=(window as unknown as {turnstile?:{reset:(id:string)=>void}}).turnstile
                    if(turnstileWidget.current)turnstile?.reset(turnstileWidget.current)}}
                    disabled={busy}>Use another email / request a new code</button>
                </form> : <form className="ava-form" onSubmit={e=>{e.preventDefault();void startPublic()}}>
                  <div className="ava-entry-options" role="group" aria-label="Choose applicant access">
                    <button type="button" className={entryMode==='login'?'is-active':''} aria-pressed={entryMode==='login'} onClick={()=>{setEntryMode('login');setTurnstileToken('');if(turnstileWidget.current){(window as unknown as {turnstile?:{reset:(id:string)=>void}}).turnstile?.reset(turnstileWidget.current)}}}>Existing applicant · Log in</button>
                    <button type="button" className={entryMode==='register'?'is-active':''} aria-pressed={entryMode==='register'} onClick={()=>{setEntryMode('register');setTurnstileToken('');if(turnstileWidget.current){(window as unknown as {turnstile?:{reset:(id:string)=>void}}).turnstile?.reset(turnstileWidget.current)}}}>New applicant · Register</button>
                  </div>
                  {entryMode==='register' && <label className="ava-field">Full legal name<input required minLength={2} maxLength={100} autoComplete="name"
                    placeholder="As it appears on your identity document" value={registerName} onChange={e=>setRegisterName(e.target.value)}/></label>}
                  <label className="ava-field">Email address<input required type="email" maxLength={180} autoComplete="email"
                    placeholder="you@example.com" value={registerEmail} onChange={e=>setRegisterEmail(e.target.value)}/></label>
                  {entryMode==='register' && <label className="ava-field">Assessment track<select value={registerRole}
                    onChange={e=>setRegisterRole(e.target.value as Role)}>
                    <option value="tech">Technology Executive</option>
                    <option value="ops">Business Operations Executive</option>
                    <option value="cx">Customer Experience Executive</option>
                  </select></label>}
                  <div className="ava-human-check"><div ref={turnstileNode} aria-label="Automated abuse protection challenge" />
                    {!turnstileKey && <p className="ava-muted">Registration is not yet available. Security verification is being configured.</p>}</div>
                  <button className="ava-primary" type="submit" disabled={busy||!turnstileKey||!turnstileToken}>
                    {busy?'Sending code…':entryMode==='login'?'Email my login code':'Register and email a code'}<ChevronRight size={16}/></button>
                  <p className="ava-muted">{entryMode==='login'?'Use the same email address from your Careers application. If you have never registered, select New applicant.':'You will verify your email before your new profile is activated.'}</p>
                </form>}
            </div>}
            {stage === 'profile' && <div className="ava-panel ava-form-slide"><p className="ava-label">STEP 02 — CANDIDATE BACKGROUND · PAGE {profilePage+1} / 3</p><h2>{['Your details.','Your experience.','Confirm and consent.'][profilePage]}</h2><p>Complete your profile and review consent before identity verification. Every field is saved together when you finish page three.</p>
              <div className="ava-slide-progress" aria-label={`Profile page ${profilePage+1} of 3`}>{[0,1,2].map(i=><span key={i} className={i<=profilePage?'is-complete':''}/>)}</div>
              <form onSubmit={(e) => { e.preventDefault(); void saveProfile() }} className="ava-form">{FORM_FIELDS.filter((_,i)=>profilePage===0?i<2:profilePage===1?i>=2&&i<4:i===4).map((field) => <label className="ava-field" key={field.key}>{field.label}{field.rows ? <textarea rows={field.rows} value={profile[field.key]} placeholder={field.placeholder} onChange={(e) => setProfile((old) => ({ ...old, [field.key]: e.target.value }))} /> : <input value={profile[field.key]} placeholder={field.placeholder} onChange={(e) => setProfile((old) => ({ ...old, [field.key]: e.target.value }))} />}</label>)}
                {profilePage===2 && <><label className="ava-check"><input type="checkbox" checked={privacyConsent} onChange={(e) => setPrivacyConsent(e.target.checked)}/><span>I agree to the <Link to="/privacy" target="_blank">Privacy Policy</Link> and the processing of my screening information for recruitment.</span></label>
                <label className="ava-check"><input type="checkbox" checked={monitorConsent} onChange={(e) => setMonitorConsent(e.target.checked)}/><span>I consent to assessment integrity monitoring (tab focus, visibility, fullscreen exits and security events). Before assessment start, additional consent and permissions are required to record screen, webcam and microphone. These recordings are reviewed only by authorized recruitment personnel.</span></label>
                <label className="ava-check"><input type="checkbox" checked={aiConsent} onChange={(e) => setAiConsent(e.target.checked)}/><span>Optional: I consent to AI-generated feedback on my written answers. Choosing not to consent does not prevent screening or human review.</span></label>
                </>}
                <div className="ava-slide-actions">
                  {profilePage>0 && <button type="button" className="ava-secondary" onClick={()=>setProfilePage(page=>Math.max(0,page-1))}>Previous page</button>}
                  {profilePage<2 ? <button type="button" className="ava-primary" disabled={profilePage===0?profile.fullName.trim().length<2:profile.education.trim().length<10||profile.experience.trim().length<10} onClick={()=>setProfilePage(page=>Math.min(2,page+1))}>Next page <ChevronRight size={17}/></button>
                    : <button className="ava-primary" disabled={busy||!privacyConsent||!monitorConsent}>{busy ? 'Saving…' : 'Save profile and continue'}<ChevronRight size={17}/></button>}
                </div></form>
            </div>}
            {stage === 'ready' && <div className="ava-panel ava-readiness">
              <p className="ava-label">03 / SECURE PRE-ASSESSMENT CHECKLIST</p>
              <h2>Your assessment, securely.</h2>
              <p className="ava-muted">The 45-minute assessment has 30 questions: 15 role-specific and 15 English reading/writing. A new question is presented only after the previous response. Resume an existing assessment without resetting the timer.</p>
              <div className="ava-slide-progress" aria-label={`Readiness page ${readyPage+1} of 3`}>{[0,1,2].map(i=><span key={i} className={i<=readyPage?'is-complete':''}/>)}</div>
              <div className="ava-readiness-grid">
                {readyPage===0 && <article className="ava-check-card">
                  <div className="ava-check-icon"><ShieldCheck size={24}/></div>
                  <h3>01 · Verify your identity on your phone</h3>
                  <p>Start here on your computer. OPERAVA will email a private, single-use verification link to your verified email address. Open that email on your phone and follow Veriff’s live camera flow to capture your government ID and complete a live selfie/liveness check.</p>
                  <p className={screen?.verifiedApplicantProfile?'ava-status-good':'ava-status-warn'}>
                    {screen?.verifiedApplicantProfile?'Identity verified · You may continue':
                      screen?.identityStatus==='pending_verification'&&screen?.identityVerification==='review'?'Provider review in progress · Waiting for the final decision':
                      screen?.identityStatus==='pending_verification'?'Secure link sent · Waiting for phone verification':
                      screen?.identityStatus==='pending_review'?'Additional review is required':
                      screen?.identityStatus==='needs_resubmission'?'A new identity verification attempt is required':
                      screen?.identityStatus==='rejected'?'Identity verification was not approved · Contact Talent Acquisition':
                      'Required · Not yet verified'}
                  </p>
                  {!screen?.verifiedApplicantProfile&&screen?.identityProviderAvailable&&<>
                    <label className="ava-check"><input type="checkbox" checked={identityConsent} onChange={e=>setIdentityConsent(e.target.checked)}/>
                      <span>I consent to sharing my name and email with Veriff and to Veriff processing my government ID and live selfie/video for identity and liveness verification on behalf of OPERAVA. I have read the <a href="https://www.veriff.com/privacy" target="_blank" rel="noreferrer">Veriff privacy information</a> and the <Link to="/privacy" target="_blank">OPERAVA Privacy Policy</Link>. OPERAVA receives the verification decision and limited status metadata; the identity media is processed by Veriff under its service and retention terms.</span></label>
                    <button type="button" className="ava-primary" disabled={identityBusy||!identityConsent||screen?.identityStatus==='pending_verification'||screen?.identityStatus==='pending_review'||screen?.identityStatus==='rejected'} onClick={()=>void requestIdentity()}>
                      <MailCheck size={16}/>{identityBusy?'Sending secure link…':'Email me a secure phone verification link'}<ChevronRight size={17}/>
                    </button>
                  </>}
                  {!screen?.identityProviderAvailable&&!screen?.verifiedApplicantProfile&&<p className="ava-small-warning">Automatic identity verification is not connected yet. The assessment remains locked until OPERAVA configures its Veriff integration. Please contact Talent Acquisition; do not send ID photos by ordinary email.</p>}
                  {screen?.identityStatus==='pending_verification'&&!screen?.verifiedApplicantProfile&&<div className="ava-invitation" role="status">
                    <Smartphone size={20}/><span>Open your email on your phone and tap the secure link. It expires after 15 minutes and can be used once. Keep this desktop page open; it checks for the provider result automatically every five seconds. If the link expires before you use it, request a new one.</span>
                  </div>}
                  {screen?.identityStatus==='needs_resubmission'&&<p className="ava-muted">The previous provider attempt was not approved or needs another capture. Review your email and document quality, then request a fresh secure link. If the provider declined your identity, contact Talent Acquisition.</p>}
                  {screen?.identityStatus==='pending_review'&&<p className="ava-muted">Additional review is required. The assessment remains locked until Talent Acquisition resolves the exception.</p>}
                  {screen?.identityStatus==='rejected'&&<p className="ava-muted">The provider did not approve this identity. Contact Talent Acquisition; another verification link cannot be requested from this account.</p>}
                  <button type="button" className="ava-text-button" onClick={()=>void refresh()}>Refresh verification status</button>
                  <div className="ava-slide-actions">
                    <button type="button" className="ava-primary" disabled={!screen?.verifiedApplicantProfile} onClick={()=>setReadyPage(1)}>Next: assessment rules <ChevronRight size={17}/></button>
                  </div>
                </article>}
                {readyPage===1 && <article className="ava-check-card">
                  <div className="ava-check-icon"><ShieldCheck size={24}/></div>
                  <h3>02 · Assessment instructions and prohibited conduct</h3>
                  <p>Read these rules before starting. The assessment is timed, individually completed and monitored for integrity. Your submitted answers are saved; an unfinished answer is not.</p>
                  <div className="ava-instruction-columns">
                    <section><h4>What you must do</h4><ul>
                      <li>Stay alone in a quiet, well-lit room and remain visible to the webcam.</li>
                      <li>Keep the same assessment page active, share your entire display, and keep your camera and microphone enabled.</li>
                      <li>Answer every question independently and in your own words.</li>
                      <li>Keep your internet connection and power stable; contact Talent Acquisition if a technical issue prevents you from continuing.</li>
                    </ul></section>
                    <section><h4>What you must not do</h4><ul>
                      <li>Do not switch tabs, browser windows, applications or desktops during the assessment.</li>
                      <li>Do not use another phone, computer, person, notes, websites, search engines or AI tools for assistance.</li>
                      <li>Do not copy, paste, cut, share or externally record assessment content.</li>
                      <li>Do not mute the microphone, cover the camera, stop screen sharing or leave the assessment room.</li>
                    </ul></section>
                  </div>
                  <div className="ava-invitation"><TriangleAlert size={19}/><span>A detected window/tab focus loss, hidden page, full-screen exit or recording interruption automatically pauses the assessment and clears the current unsaved answer. Previously submitted answers stay saved. The 45-minute timer continues. You must restore all permissions and explicitly resume. Repeated incidents are recorded for recruiter review.</span></div>
                  <p className="ava-muted">Browser monitoring detects supported focus and visibility changes; it cannot guarantee detection of every operating-system action, external device or screenshot. Do not attempt to bypass the rules.</p>
                  <label className="ava-check"><input type="checkbox" checked={instructionAcknowledged} onChange={e=>setInstructionAcknowledged(e.target.checked)}/>
                    <span>I have read and understood the assessment instructions and prohibited conduct. I agree to follow them throughout the assessment.</span></label>
                  <div className="ava-slide-actions">
                    <button type="button" className="ava-secondary" onClick={()=>setReadyPage(0)}>Previous: identity</button>
                    <button type="button" className="ava-primary" disabled={busy||!instructionAcknowledged} onClick={()=>void acceptAssessmentRules()}>I understand — continue to permissions <ChevronRight size={17}/></button>
                  </div>
                </article>}
                {readyPage===2 && <article className="ava-check-card">
                  <div className="ava-check-icon"><MonitorCheck size={24}/></div>
                  <h3>03 · Grant proctor permissions</h3>
                  <p>Record your entire screen, webcam and microphone throughout the assessment. If permission is denied, revoked, or storage is interrupted, you cannot begin or continue. Use the tests below to check your browser without uploading media.</p>
                  <div className="ava-proctor-browser-check" role="status">
                    <strong>Browser capture compatibility</strong>
                    <span>{proctorSupport?.compatible?'Screen, webcam, microphone and recording APIs are available.':'This browser or site cannot provide all required recording capabilities.'}</span>
                    <span>Screen sharing: {proctorSupport?.screen&&proctorSupport.screenPolicy?'supported':'unavailable or blocked'} · Webcam: {proctorSupport?.camera&&proctorSupport.cameraPolicy?'supported':'unavailable'} · Mic: {proctorSupport?.microphonePolicy?'allowed by site':'blocked by policy'} · Recorder: {proctorSupport?.recorder?'supported':'unavailable'}</span>
                    {!proctorSupport?.compatible&&<span>For a proctored assessment, use a current browser supporting full-screen sharing, typically desktop Chrome, Edge, Firefox or Safari. Complete phone ID capture first and reopen the assessment on your computer with the same account.</span>}
                    <button type="button" className="ava-text-button" onClick={()=>setProctorSupport(inspectProctorSupport())}>Recheck device support</button>
                  </div>
                  <div className="ava-permission-tests" aria-label="Local device permission diagnostics">
                    <button type="button" className="ava-secondary" disabled={proctorBusy||permissionTest==='testing'} onClick={()=>void checkCameraMic()}><Mic size={16}/>{cameraChecked?'Camera & mic: checked':'Test camera & microphone'}</button>
                    <button type="button" className="ava-secondary" disabled={proctorBusy||permissionTest==='testing'} onClick={()=>void checkScreenShare()}><MonitorCheck size={16}/>{screenChecked?'Screen: checked':'Test full-screen sharing'}</button>
                  </div>
                  <p className="ava-muted">These tests stop capture immediately and never upload media. Permission may need to be granted again when you start the exam.</p>
                  <label className="ava-check"><input type="checkbox" checked={recordingConsent} onChange={e=>setRecordingConsent(e.target.checked)}/>
                    <span>I explicitly consent to screen, webcam and microphone recording for proctoring, restricted reviewer access and approved retention.</span></label>
                  <div className="ava-proctor-device-steps">
                    <button type="button" className="ava-secondary" disabled={proctorBusy||!recordingConsent||!screen?.recordingStorageReady||!screen?.verifiedApplicantProfile||!proctorSupport?.camera||!proctorSupport.microphonePolicy} onClick={()=>void prepareProctorCamera()}>
                      <Mic size={16}/>{proctorBusy?'Requesting device access…':proctorCameraReady?'Webcam & microphone active ✓':'1 · Enable webcam & microphone'}
                    </button>
                    <button type="button" className="ava-primary" disabled={proctorBusy||!proctorCameraReady||!proctorSupport?.screen||!proctorSupport.screenPolicy} onClick={()=>void startCapture()}>
                      <MonitorCheck size={16}/>{proctorBusy?'Starting secure recording…':proctorReady?'Restart screen recording':'2 · Share entire screen & record'}<ChevronRight size={16}/>
                    </button>
                  </div>
                  <p className={proctorReady&&proctorSaved.camera&&proctorSaved.screen?'ava-status-good':'ava-status-warn'}>
                    {proctorReady&&proctorSaved.camera&&proctorSaved.screen?'Both recordings saved · Capture active':'Required · Live recording not ready'}
                  </p>
                  {!screen?.recordingStorageReady && <p className="ava-small-warning">Private recording storage is not configured. Capture remains disabled for your privacy.</p>}
                  {!screen?.verifiedApplicantProfile && <p className="ava-small-warning">OPERAVA identity review must be approved before starting continuous recording. Use the local permission diagnostics above to check device compatibility.</p>}
                  {proctorReady && <button type="button" className="ava-text-button" onClick={stopCapture}>Stop recording</button>}
                  <div className="ava-slide-actions"><button type="button" className="ava-secondary" onClick={()=>setReadyPage(1)}>Previous: instructions</button></div>
                </article>}
              </div>
              {readyPage===2 && <div className="ava-readiness-footer">
                <div><strong>04 · Ready to proceed?</strong><p>Your secure server enforces identity verification and saved live capture segments. Unverified or unsupported browsers cannot begin.</p></div>
                <button type="button" className="ava-primary" disabled={busy||!screen?.verifiedApplicantProfile||!screen?.assessmentRulesAccepted||!proctorReady||!proctorSaved.camera||!proctorSaved.screen}
                  onClick={() => void beginAssessment()}>{busy?'Starting…':'Begin Ava Assessment'}<ChevronRight size={17}/></button>
              </div>}
            </div>}
            {stage === 'assessment' && <div className="ava-panel ava-assessment ava-ai-board">
              <header className="ava-ai-board-head">
                <div className="ava-ai-board-identity">
                  <span className="ava-ai-board-icon" aria-hidden="true"><Sparkles size={21}/></span>
                  <div><p className="ava-ai-eyebrow">OPERAVA / AVA ASSESSMENT</p><h2>Question board</h2><p className="ava-ai-board-subtitle">Secure, step-by-step assessment · One question at a time</p></div>
                </div>
                <div className="ava-ai-board-session" aria-label="Assessment timer"><Clock3 size={16}/><span>{formatRemaining(seconds)}</span><small>remaining</small></div>
              </header>
              <div className="ava-ai-board-progress">
                <div><span>Question {screen?.question?.number || screen?.answered || 0} of {screen?.total || 30}</span><span>{screen?.answered || 0} completed</span></div>
                <div className="ava-progress" role="progressbar" aria-label="Assessment completed" aria-valuemin={0} aria-valuemax={screen?.total||30} aria-valuenow={screen?.answered||0}>
                  <span style={{width:`${((screen?.answered || 0) / (screen?.total || 1)) * 100}%`}} />
                </div>
              </div>
              {screen?.total===30 && (focusPaused||Boolean(screen.proctorPausedAt)||!proctorReady||!proctorSaved.camera||!proctorSaved.screen||!isCaptureLive()) ? <div className="ava-proctor-reconnect" role="status">
                <MonitorCheck size={24}/><h2>{focusPaused||screen.proctorPausedAt?'Assessment paused — focus or capture change detected':'Restore assessment permissions'}</h2>
                <p>{focusPaused||screen.proctorPausedAt
                  ? 'The current unsaved answer has been cleared and reset. Previously submitted answers remain saved. Your 45-minute timer continues. Return to this assessment window, restore the required recordings, and explicitly resume.'
                  : 'The timer continues, but questions and answer submission are paused until live screen, webcam and microphone recording is restored. Browsers require you to approve screen sharing again.'}</p>
                <label className="ava-check"><input type="checkbox" checked={recordingConsent} onChange={e=>setRecordingConsent(e.target.checked)}/><span>I consent to continuing screen, webcam and microphone recording for this assessment.</span></label>
                <div className="ava-proctor-device-steps">
                  <button type="button" className="ava-secondary" disabled={proctorBusy||!recordingConsent||!screen?.verifiedApplicantProfile||!screen.recordingStorageReady} onClick={()=>void prepareProctorCamera()}>{proctorCameraReady?'Webcam & microphone active ✓':'1 · Enable webcam & microphone'}</button>
                  <button type="button" className="ava-primary" disabled={proctorBusy||!proctorCameraReady||!proctorSupport?.screen} onClick={()=>void startCapture()}>2 · Restore entire screen sharing <ChevronRight size={17}/></button>
                </div>
                <p className="ava-muted">{proctorReady&&proctorSaved.camera&&proctorSaved.screen?'Fresh private recordings are saved. You can now resume.':'No recording permission means no further assessment answers.'}</p>
                {(focusPaused||Boolean(screen.proctorPausedAt))&&<button type="button" className="ava-primary" disabled={busy||proctorBusy||!proctorReady||!proctorSaved.camera||!proctorSaved.screen||!isCaptureLive()} onClick={()=>void resumeAssessment()}>Resume assessment <ChevronRight size={17}/></button>}
                {Boolean(screen.proctorIncidentCount)&&<p className="ava-muted">Recorded proctor interruptions: {screen.proctorIncidentCount}</p>}
              </div> : <>
                <div className="ava-ai-conversation" aria-label="AVA questions and instructions">
                  <div className="ava-ai-message ava-ai-message--instructions">
                    <span className="ava-ai-message-avatar" aria-hidden="true"><Sparkles size={17}/></span>
                    <div className="ava-ai-message-body">
                      <div className="ava-ai-message-meta"><strong>AVA · Instructions</strong><span>Before you answer</span></div>
                      <p>Read the question carefully and respond in your own words. Submit one answer to receive the next question. Your 45-minute timer continues if you leave or refresh this page; submitted responses cannot be edited.</p>
                    </div>
                  </div>
                  <div className="ava-ai-message ava-ai-message--question">
                    <span className="ava-ai-message-avatar" aria-hidden="true"><Sparkles size={17}/></span>
                    <div className="ava-ai-message-body">
                      <div className="ava-ai-message-meta"><strong>AVA · Question {screen?.question?.number}</strong><span>{screen?.question?.section === 'english' ? 'English communication' : 'Role assessment'}</span></div>
                      <h3>{screen?.question?.prompt || 'Loading next question…'}</h3>
                    </div>
                  </div>
                </div>
                <div className="ava-ai-composer">
                  <div className="ava-ai-composer-head"><label htmlFor="ava-ai-response">Your response</label><span>{answer.length} / 4000 characters</span></div>
                  <textarea id="ava-ai-response" className="ava-answer" rows={5} value={answer} maxLength={4000}
                    onChange={(e) => { setAnswer(e.target.value); setAnswerSource('typed') }}
                    aria-describedby="ava-ai-response-help"
                    placeholder="Type your response here. Write naturally, using examples where helpful…" />
                  <div className="ava-ai-composer-actions">
                    <div className="ava-ai-composer-utilities">
                      <button type="button" className="ava-secondary" disabled={!speechAvailable} onClick={startDictation}><Mic size={17}/>{isSpeaking ? 'Stop dictation' : 'Dictate answer'}</button>
                      <span id="ava-ai-response-help">{speechAvailable ? 'Dictation is converted to editable text. Check it before submitting.' : 'Speech recognition is unavailable here; typing is supported.'}</span>
                    </div>
                    <button type="button" className="ava-primary" disabled={busy || answer.trim().length < 15 || seconds === 0 || (screen?.total === 30 && !proctorReady)}
                      onClick={() => void sendAnswer()}>{busy ? 'Saving response…' : 'Submit & next question'}<ChevronRight size={17}/></button>
                  </div>
                </div>
                <p className="ava-ai-security-note"><ShieldCheck size={14}/> Verified identity <span aria-hidden="true">·</span> <MonitorCheck size={14}/> Consented recording {fullscreen?'· Fullscreen on':'· Fullscreen optional'} <span aria-hidden="true">·</span> Focus and sound events require human review</p>
              </>}
            </div>}
            {finished && <div className="ava-panel"><div className="ava-icon"><ClipboardCheck /></div><p className="ava-label">SCREENING RECORD — SUBMITTED</p><h2>{screen?.assessmentStatus === 'time_expired' ? 'Time has elapsed.' : 'Assessment completed.'}</h2><p>Your submitted responses are saved for Talent Acquisition’s review. No AI-generated feedback or scores make an automatic employment decision.</p><div className="ava-summary"><div><span>Answers received</span><strong>{screen?.answered} / {screen?.total}</strong></div><div><span>AI writing reviews</span><strong>{screen?.reviewProgress.reviewed} / {screen?.reviewProgress.total}</strong></div><div><span>Hiring decision</span><strong>Human review</strong></div></div>
              {Boolean(screen?.reviewResults.length) && <div className="ava-review-results"><h3>Provisional writing feedback</h3>{screen?.reviewResults.map((r) => <div key={r.questionId}><strong>{r.questionId}</strong><span>{r.review?.feedback || 'Feedback unavailable'}</span></div>)}</div>}
              <button className="ava-secondary" disabled={busy} onClick={() => void refresh()}>Refresh review progress</button></div>}
            {error && <p className="ava-alert" role="alert"><TriangleAlert size={16}/>{error}</p>}
            {notice && <p className="ava-note" role="status"><CheckCircle2 size={16}/>{notice}</p>}
          </section>
        </div>}
        {screen && stage !== 'assessment' && workspaceView==='applications' && <section className="ava-applications" aria-label="Your Careers applications">
          <div className="ava-applications-header">
            <div><p className="ava-label">MY APPLICATIONS · VERIFIED ACCOUNT</p>
              <h2>Track your applications</h2>
              <p>Signed in as {screen.applicant.email}. Each verified Careers application has its own assessment record.</p>
            </div>
            <button type="button" className="ava-secondary" onClick={() => void loadApplications()}>Refresh status</button>
          </div>
          {applicationsError && <p role="alert" className="ava-alert">{applicationsError}</p>}
          {!applications.length && !applicationsError && <p className="ava-muted">No verified Careers applications found for this email. You can still continue your existing Ava screening or <Link to="/apply">apply for a role</Link>.</p>}
          <div className="ava-application-grid">
            {visibleApplications.map(item => <article key={item.referenceId} className="ava-application-card">
              <p className="ava-label">{item.referenceId}</p>
              <h3>{item.position}</h3>
              <p>Application: <strong>{item.applicationStatus === 'VERIFIED' ? 'Application received' : item.applicationStatus}</strong></p>
              <p>Assessment: <strong>{item.assessmentStatus.replace(/_/g,' ')}</strong></p>
              <p>Recruitment: <strong>{item.reviewStatus.replace(/_/g,' ')}</strong></p>
              {item.requiredAction && <p className="ava-required-action">Required action: {item.requiredAction}</p>}
              {item.isSelected
                ? <div className="ava-current-actions"><span className="ava-current-label">Current application</span>
                    {item.requiredAction && <>
                      <span className="ava-required-action">{item.profileComplete ? 'Required action · '+item.requiredAction : 'Required action · Complete profile to unlock assessment'}</span>
                      <button type="button" className="ava-primary" onClick={()=>setWorkspaceView('assessment')}>
                        {item.profileComplete ? item.requiredAction : 'Complete Profile & Assessment'} <ChevronRight size={16}/>
                      </button>
                    </>}
                  </div>
                : <button className="ava-primary" type="button" disabled={busy} onClick={() => void openApplication(item.referenceId)}>
                  {item.requiredAction || 'View application'} <ChevronRight size={16}/>
                </button>}
            </article>)}
          </div>
          {applications.length>1 && <div className="ava-record-pager"><button className="ava-secondary" type="button" disabled={itemPage===0} onClick={()=>setItemPage(p=>Math.max(0,p-1))}>Previous application</button><span aria-live="polite">{Math.min(itemPage+1,applications.length)} / {applications.length}</span><button className="ava-secondary" type="button" disabled={itemPage>=applications.length-1} onClick={()=>setItemPage(p=>Math.min(applications.length-1,p+1))}>Next application <ChevronRight size={16}/></button></div>}
          <p className="ava-muted">Verification and recruitment statuses are controlled by OPERAVA reviewers. Assessment submission does not automatically determine employment eligibility. Passport NFC and certified face-liveness verification are not yet available; do not submit identity photos through email.</p>
        </section>}
        {screen && stage !== 'assessment' && workspaceView==='documents' && <section className="ava-applications" aria-label="Required onboarding documents">
          <div className="ava-applications-header">
            <div>
              <p className="ava-label">DOCUMENT CENTER · PRIVATE APPLICATION RECORD</p>
              <h2>Onboarding &amp; documents</h2>
              <p>Recruitment may request additional documentation after assessment review. Only the applicant signed into this application can submit the requested PDF.</p>
            </div>
            <button type="button" className="ava-secondary" onClick={()=>void loadOnboarding()}>Refresh documents</button>
          </div>
          {screen.applicationReference && <p className="ava-document-context">Selected application · <strong>{screen.applicationReference}</strong></p>}
          {onboardingError && <p role="alert" className="ava-alert">{onboardingError}</p>}
          {!documents.length && <p className="ava-muted ava-document-empty">No onboarding documents have been requested for this application. When Talent Acquisition needs one, it will appear here with a required action.</p>}
          <div className="ava-application-grid">
            {visibleDocuments.map(doc=><article key={doc.id} className="ava-application-card ava-document-card">
              <p className="ava-label">{ONBOARDING_LABELS[doc.document_type]||'Requested document'}</p>
              <h3>{doc.status==='approved'?'Document accepted':doc.status==='submitted'?'Submitted for review':doc.status==='resubmission_required'?'Resubmission required':'Required action · Upload document'}</h3>
              {doc.request_note && <p>Recruitment request: {doc.request_note}</p>}
              {doc.review_note && <p>Reviewer response: {doc.review_note}</p>}
              {doc.original_name && <p>File submitted: {doc.original_name}</p>}
              {(doc.status==='requested'||doc.status==='resubmission_required') && <>
                <p className="ava-muted">Onboarding paperwork only (PDF, max 5 MB). Government ID and passport verification use the separate live mobile capture process.</p>
                <label className="ava-field">Requested PDF
                  <input type="file" accept=".pdf,application/pdf" disabled={!onboardingConfigured||busy}
                    onChange={e=>setSelectedDocuments(prev=>({...prev,[doc.id]:e.target.files?.[0]||null}))}/>
                </label>
                <button type="button" className="ava-primary"
                  disabled={!onboardingConfigured||busy||!selectedDocuments[doc.id]}
                  onClick={()=>void uploadOnboarding(doc.id)}>Submit document securely <ChevronRight size={16}/></button>
                {!onboardingConfigured && <p className="ava-small-warning">Secure document storage is not configured. Contact Talent Acquisition; never email sensitive documents.</p>}
              </>}
              {doc.status==='approved' && <p className="ava-status-good">Approved by Talent Acquisition</p>}
            </article>)}
          </div>
          {documents.length>1 && <div className="ava-record-pager"><button className="ava-secondary" type="button" disabled={itemPage===0} onClick={()=>setItemPage(p=>Math.max(0,p-1))}>Previous document</button><span aria-live="polite">{Math.min(itemPage+1,documents.length)} / {documents.length}</span><button className="ava-secondary" type="button" disabled={itemPage>=documents.length-1} onClick={()=>setItemPage(p=>Math.min(documents.length-1,p+1))}>Next document <ChevronRight size={16}/></button></div>}
        </section>}
        </div>
        </motion.div>
        </AnimatePresence>
        </div>
        <div className="ava-app-support"><LockKeyhole size={13} aria-hidden="true" /> Secure email OTP sign-in · For assistance, email <a href="mailto:talents@operavaglobal.com">talents@operavaglobal.com</a></div>
        </div>
        </div>}
        </div>
      </div>
    </div>
    </div>
  )
}