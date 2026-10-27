import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ChevronRight, ClipboardCheck, Clock3, Headphones, LockKeyhole, MailCheck, Mic, MonitorCheck, ShieldCheck, Smartphone, TriangleAlert, LogOut } from 'lucide-react'
import { usePageMeta } from '../site/seo'
import ThemeToggle from '../site/ThemeToggle'
import './AvaScreening.css'

type Role = 'tech' | 'ops' | 'cx'
type Profile = { fullName: string; phone: string; education: string; experience: string; motivation: string }
type ScreenState = {
  ok: boolean
  applicant: { name: string; email: string; role: Role; roleTitle: string }
  identityStatus: 'not_submitted' | 'pending_review' | 'approved' | 'needs_resubmission'
  identityKind: string | null
  identityVerification?: string
  verifiedApplicantProfile?: boolean
  faceMatchScore?: number | null
  identityProviderAvailable?: boolean
  recordingStorageReady?: boolean
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
  error?: string; sessionToken?: string; maskedEmail?: string; turnstileSiteKey?: string;
  applicationReference?: string | null; applications?: ApplicationRecord[]; verificationUrl?: string
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
  const recorders = useRef<MediaRecorder[]>([])
  const audioContext = useRef<AudioContext|null>(null)
  const soundPoll = useRef<number|null>(null)
  const [proctorReady,setProctorReady] = useState(false)
  const [proctorBusy,setProctorBusy] = useState(false)
  const [proctorSaved,setProctorSaved] = useState({camera:false,screen:false})
  const [recordingConsent,setRecordingConsent] = useState(false)
  const [identityBusy,setIdentityBusy] = useState(false)
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
  const loadApplications = useCallback(async () => {
    if (!sessionRef.current) return
    try {
      const result = await submit('applications')
      setApplications(result.applications || [])
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
    try {await submit('logout')} catch { /* expiration also invalidates the browser session */ }
    try {sessionStorage.removeItem(SESSION_KEY)} catch { /* private browsing */ }
    recognition.current?.stop()
    recognition.current=null
    setIsSpeaking(false)
    setAnswer('')
    setAnswerSource('typed')
    setScreen(null);setApplications([]);setDocuments([]);setOnboardingConfigured(false);setSelectedDocuments({});setSession('');sessionRef.current='';setOtpRequested(false)
    setProfile(BLANK_PROFILE);setPrivacyConsent(false);setMonitorConsent(false);setAiConsent(false)
    setRegisterName('');setRegisterEmail('');setPendingEmail('');setCode('')
    setEntryMode('login');setTurnstileToken('');setNotice('You have signed out.')
    // Clear legacy invitation query to offer public email OTP login for resuming.
    if (invitation) navigate('/ava-screening/',{replace:true})
  }
  const openApplication = async (referenceId: string) => {
    const opened = await perform(() => submit('selectApplication', { referenceId }),
      'Application selected. Complete your profile and assessment if required.')
    if (opened) await loadApplications()
  }
  const verifyCode = async () => { if (await perform(() => submit('verifyCode', { invitation, code }), 'Email address verified.')) setCode('') }
  const saveProfile = async () => { await perform(() => submit('profile', { ...profile, privacyConsent, monitorConsent, aiConsent }), 'Profile saved securely.') }
  const requestIdentity = async () => {
    setIdentityBusy(true);setError('')
    try {
      await submit('identityStart')
      setNotice('A live identity verification link was sent to your email. Open it on your phone, grant camera permission and complete the provider checks; then refresh this portal.')
    } catch(e){setError(e instanceof Error?e.message:'Identity verification is unavailable.')}
    finally{setIdentityBusy(false)}
  }
  const stopCapture = () => {
    for(const recorder of recorders.current) {if(recorder.state!=='inactive'){try{recorder.stop()}catch{ /* already stopped */ }}}
    recorders.current=[]
    captures.current?.screen.getTracks().forEach(t=>t.stop())
    captures.current?.camera.getTracks().forEach(t=>t.stop())
    captures.current=null
    if(soundPoll.current!==null)window.clearInterval(soundPoll.current)
    soundPoll.current=null
    void audioContext.current?.close()
    audioContext.current=null
    setProctorReady(false)
    setProctorSaved({camera:false,screen:false})
  }
  useEffect(() => {
    if(screen?.assessmentStatus==='submitted'||screen?.assessmentStatus==='time_expired')stopCapture()
    // Capture must end promptly when the assessment ends; don't record the result page.
  },[screen?.assessmentStatus])
  const isCaptureLive = () => Boolean(captures.current &&
    captures.current.screen.getVideoTracks().length &&
    captures.current.screen.getVideoTracks().every(t=>t.readyState==='live'&&t.enabled&&!t.muted) &&
    captures.current.camera.getVideoTracks().length &&
    captures.current.camera.getVideoTracks().every(t=>t.readyState==='live'&&t.enabled&&!t.muted) &&
    captures.current.camera.getAudioTracks().length &&
    captures.current.camera.getAudioTracks().every(t=>t.readyState==='live'&&t.enabled&&!t.muted) &&
    recorders.current.length===2&&recorders.current.every(r=>r.state==='recording'))
  const startCapture = async () => {
    if(!recordingConsent){setError('Explicit recording consent is required.');return}
    if(!screen?.recordingStorageReady){setError('Secure private recording storage is not yet configured.');return}
    setProctorBusy(true);setError('');setProctorSaved({camera:false,screen:false})
    let display:MediaStream|null=null,webcam:MediaStream|null=null
    try {
      if(!navigator.mediaDevices?.getDisplayMedia||!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')
        throw Error('Required screen, camera and microphone capture is not supported in this browser.')
      // A direct click must initiate the native browser screen-share permission dialog.
      display=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false})
      webcam=await navigator.mediaDevices.getUserMedia({video:true,audio:true})
      if(!display.getVideoTracks().length||!webcam.getVideoTracks().length||!webcam.getAudioTracks().length)
        throw Error('Screen, webcam, and microphone permissions are all required.')
      captures.current={screen:display,camera:webcam}
      const onLost=()=>{
        setProctorReady(false)
        setError('A required recording device was stopped or revoked. Restore all permissions to continue.')
      }
      for(const track of [...display.getTracks(),...webcam.getTracks()]){
        track.addEventListener('ended',onLost,{once:true})
        if(track.kind==='audio')track.addEventListener('mute',onLost)
      }
      const mime=['video/webm;codecs=vp8,opus','video/webm','video/mp4'].find(x=>MediaRecorder.isTypeSupported(x))
      if(!mime)throw Error('Recording is not supported with a secure video format in this browser.')
      const sendChunk=(kind:'camera'|'screen',blob:Blob)=>{
        if(!blob.size)return
        const form=new FormData()
        form.append('kind',kind)
        form.append('chunk',new File([blob],kind+'.recording',{type:blob.type||mime}))
        void fetch(API+'?action=proctorChunk',{
          method:'POST',body:form,headers:{Authorization:`Bearer ${sessionRef.current}`}
        }).then(async response=>{
          const result=await response.json().catch(()=>({})) as {ok?:boolean;error?:string}
          if(!response.ok||!result.ok)throw Error(result.error||'Recording segment was rejected.')
          setProctorSaved(prev=>({...prev,[kind]:true}))
        }).catch(e=>{
          setProctorReady(false)
          setError(e instanceof Error?e.message:'A recording segment could not be stored.')
        })
      }
      for(const [kind,stream] of [['camera',webcam],['screen',display]] as const){
        const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:500_000})
        recorder.ondataavailable=event=>sendChunk(kind,event.data)
        recorder.onerror=onLost
        recorders.current.push(recorder)
        recorder.start(8000)
      }
      try {
        const context=new AudioContext()
        audioContext.current=context
        const source=context.createMediaStreamSource(webcam)
        const analyser=context.createAnalyser();analyser.fftSize=512
        source.connect(analyser)
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
      } catch{ /* Background sound analysis is advisory only. */ }
      setProctorReady(true)
      setNotice('Live recording started. Allow the first secure screen and camera segments to upload before beginning.')
    }catch(e){
      display?.getTracks().forEach(t=>t.stop())
      webcam?.getTracks().forEach(t=>t.stop())
      stopCapture()
      setError(e instanceof Error?e.message:'Recording permissions are required.')
    } finally{setProctorBusy(false)}
  }
  const beginAssessment = async () => {
    if(!proctorReady||!proctorSaved.camera||!proctorSaved.screen||!isCaptureLive()){
      setError('Allow screen, webcam and microphone recording and wait until both streams are securely saved.')
      return
    }
    const ok = await perform(() => submit('begin'), 'Your 45-minute assessment has started.')
    if (ok && document.fullscreenEnabled) {
      try { await document.documentElement.requestFullscreen() } catch { /* Fullscreen is optional; record only actual exits. */ }
    }
  }
  const sendAnswer = async () => {
    if(screen?.total===30&&(!proctorReady||!isCaptureLive())){
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

  return (
    <div className="ava-screening">
      <div className="ava-wrap">
        <header className="ava-app-topbar">
          <div className="ava-app-brand" aria-label="Operava Ava Screening">
            <span className="ava-app-symbol" aria-hidden="true"><ShieldCheck size={22} strokeWidth={2} /></span>
            <div><strong>OPERAVA</strong><span>AVA · APPLICANT PORTAL</span></div>
          </div>
          <div className="ava-app-controls">
            <Link className="ava-topnav-link" to="/careers">Careers</Link>
            <span className="ava-access-label"><LockKeyhole size={13} /> PRIVATE WORKSPACE · OTP SIGN-IN</span>
            <ThemeToggle />
          </div>
        </header>
        <div className="ava-app-heading">
          <div>
            <p className="ava-kicker"><span className="ava-dot" /> SECURE CANDIDATE WORKSPACE</p>
            <h1>AVA <span>ASSESSMENT</span></h1>
            <p>Secure applicant sign-in, applications, assessments and recruitment status — one place.</p>
          </div>
          <div className="ava-app-heading-state"><ShieldCheck size={17} /><span>Open registration · Secure email verification</span></div>
        </div>
        <div className="ava-steps" aria-label="Screening stages">{STEPS.map((label, i) => <div className={`ava-step ${i <= stageIndex ? 'is-active' : ''}`} key={label}><span>{i < stageIndex ? <CheckCircle2 size={15} /> : String(i + 1).padStart(2, '0')}</span><strong>{label}</strong></div>)}</div>
        <div className="ava-shell">
          <aside className="ava-sidebar" aria-label="Assessment guidance">
            {stage !== 'assessment' && stage !== 'finished' && <div className="ava-team-art"><img src="/media/ava-assessment-team.svg" alt="Connected Operava professionals, secure assessment and teamwork" width={660} height={400} decoding="async" /></div>}
            <div className="ava-sidebar-block"><p className="ava-label">APPLICANT WORKSPACE</p><h2>{screen?.applicant.roleTitle || 'Application access'}</h2><p>{screen?.applicant.email || 'Sign in with an email one-time code to manage recruitment applications.'}</p>{screen && <p className={screen.verifiedApplicantProfile?'ava-identity-verified':'ava-identity-pending'}><ShieldCheck size={14}/>{screen.verifiedApplicantProfile?'Verified Applicant Profile':'Identity verification required'}</p>}{screen?.applicationReference && <p className="ava-ref">APPLICATION · {screen.applicationReference}</p>}</div>
            <div className="ava-sidebar-block"><p className="ava-label">ASSESSMENT PROTOCOL</p><div className="ava-sidebar-info"><Clock3 size={18}/><span>45-minute, server-enforced timer</span></div><div className="ava-sidebar-info"><MonitorCheck size={18}/><span>Consent-based focus and visibility logs</span></div><div className="ava-sidebar-info"><ClipboardCheck size={18}/><span>Written and role-based responses</span></div><div className="ava-sidebar-info"><Headphones size={18}/><span>Optional speech-to-text dictation</span></div></div>
            <div className="ava-sidebar-note"><LockKeyhole size={17}/><span>New assessments require consented webcam, microphone and screen recording. Sound and focus flags require human review; AI feedback is advisory.</span></div>
            {screen?.assessmentStatus === 'in_progress' && <div className="ava-timer"><span>TIME REMAINING</span><strong aria-live="off" className={seconds < 300 ? 'ava-time-low' : ''}>{formatRemaining(seconds)}</strong><small>Time runs even if this tab closes.</small></div>}
          </aside>
          <section className="ava-content" aria-live="polite">
            <div className="ava-stage-heading">
              <div><span>AVA SCREENING JOURNEY</span><strong>{STEP_ILLUSTRATIONS[stage].label}</strong></div>
              <img src={STEP_ILLUSTRATIONS[stage].src} alt="" aria-hidden="true" width={112} height={112} decoding="async" />
            </div>
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
            {stage === 'profile' && <div className="ava-panel"><p className="ava-label">STEP 02 — CANDIDATE BACKGROUND</p><h2>Tell us about yourself.</h2><p>Complete your education, professional experience, and motivation before identity review. Your responses are saved to the secure screening record.</p>
              <form onSubmit={(e) => { e.preventDefault(); void saveProfile() }} className="ava-form">{FORM_FIELDS.map((field) => <label className="ava-field" key={field.key}>{field.label}{field.rows ? <textarea rows={field.rows} value={profile[field.key]} placeholder={field.placeholder} onChange={(e) => setProfile((old) => ({ ...old, [field.key]: e.target.value }))} /> : <input value={profile[field.key]} placeholder={field.placeholder} onChange={(e) => setProfile((old) => ({ ...old, [field.key]: e.target.value }))} />}</label>)}
                <label className="ava-check"><input type="checkbox" checked={privacyConsent} onChange={(e) => setPrivacyConsent(e.target.checked)}/><span>I agree to the <Link to="/privacy" target="_blank">Privacy Policy</Link> and the processing of my screening information for recruitment.</span></label>
                <label className="ava-check"><input type="checkbox" checked={monitorConsent} onChange={(e) => setMonitorConsent(e.target.checked)}/><span>I consent to assessment integrity monitoring (tab focus, visibility, fullscreen exits and security events). Before assessment start, additional consent and permissions are required to record screen, webcam and microphone. These recordings are reviewed only by authorized recruitment personnel.</span></label>
                <label className="ava-check"><input type="checkbox" checked={aiConsent} onChange={(e) => setAiConsent(e.target.checked)}/><span>Optional: I consent to AI-generated feedback on my written answers. Choosing not to consent does not prevent screening or human review.</span></label>
                <button className="ava-primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile and continue'}<ChevronRight size={17}/></button></form>
            </div>}
            {stage === 'ready' && <div className="ava-panel ava-readiness">
              <p className="ava-label">03 / SECURE PRE-ASSESSMENT CHECKLIST</p>
              <h2>Your assessment, securely.</h2>
              <p className="ava-muted">The 45-minute assessment has 30 questions: 15 role-specific and 15 English reading/writing. A new question is presented only after the previous response. Resume an existing assessment without resetting the timer.</p>
              <div className="ava-readiness-grid">
                <article className="ava-check-card">
                  <div className="ava-check-icon"><ShieldCheck size={24}/></div>
                  <h3>01 · Verify your identity</h3>
                  <p>Complete a live selfie and government ID or passport scan on your phone. For passports, a certified provider must validate the NFC chip. Your verified profile requires liveness, ID authenticity, matching name and at least 95% face similarity.</p>
                  <p className={screen?.verifiedApplicantProfile?'ava-status-good':'ava-status-warn'}>{screen?.verifiedApplicantProfile?'Verified Applicant Profile · Approved':'Required · Not yet verified'}</p>
                  {!screen?.verifiedApplicantProfile && <button type="button" className="ava-secondary" disabled={identityBusy||!screen?.identityProviderAvailable} onClick={() => void requestIdentity()}>
                    <Smartphone size={16}/>{identityBusy?'Sending link…':'Email my secure phone verification link'}
                  </button>}
                  {!screen?.identityProviderAvailable && <p className="ava-small-warning">Certified identity provider is not configured. Verification and assessment are unavailable until OPERAVA enables it.</p>}
                  <button type="button" className="ava-text-button" onClick={() => void refresh()}>Refresh verified profile</button>
                </article>
                <article className="ava-check-card">
                  <div className="ava-check-icon"><MonitorCheck size={24}/></div>
                  <h3>02 · Grant proctor permissions</h3>
                  <p>Record your screen, webcam and microphone throughout the assessment. If a capture stream stops or recording segments fail to save, the assessment cannot start or continue.</p>
                  <label className="ava-check"><input type="checkbox" checked={recordingConsent} onChange={e=>setRecordingConsent(e.target.checked)}/>
                    <span>I explicitly consent to screen, webcam and microphone recording for proctoring, restricted reviewer access and approved retention.</span></label>
                  <button type="button" className="ava-secondary" disabled={proctorBusy||!recordingConsent||!screen?.recordingStorageReady} onClick={() => void startCapture()}>
                    <Mic size={16}/>{proctorBusy?'Requesting permissions…':proctorReady?'Restart recording':'Allow screen, webcam & mic'}
                  </button>
                  <p className={proctorReady&&proctorSaved.camera&&proctorSaved.screen?'ava-status-good':'ava-status-warn'}>
                    {proctorReady&&proctorSaved.camera&&proctorSaved.screen?'Both recordings saved · Capture active':'Required · Live recording not ready'}
                  </p>
                  {!screen?.recordingStorageReady && <p className="ava-small-warning">Private recording storage is not configured. Capture remains disabled for your privacy.</p>}
                  {proctorReady && <button type="button" className="ava-text-button" onClick={stopCapture}>Stop recording</button>}
                </article>
              </div>
              <div className="ava-readiness-footer">
                <div><strong>03 · Ready to proceed?</strong><p>Your secure server enforces identity verification and saved live capture segments. Unverified or unsupported browsers cannot begin.</p></div>
                <button type="button" className="ava-primary" disabled={busy||!screen?.verifiedApplicantProfile||!proctorReady||!proctorSaved.camera||!proctorSaved.screen}
                  onClick={() => void beginAssessment()}>{busy?'Starting…':'Begin Ava Assessment'}<ChevronRight size={17}/></button>
              </div>
            </div>}
            {stage === 'assessment' && <div className="ava-panel ava-assessment"><div className="ava-assessment-top"><span className="ava-label">LIVE ASSESSMENT · QUESTION {screen?.question?.number} / {screen?.total}</span><span className="ava-badge">{screen?.question?.section === 'english' ? 'ENGLISH COMMUNICATION' : 'ROLE ASSESSMENT'}</span></div>
              <div className="ava-progress"><span style={{width:`${((screen?.answered || 0) / (screen?.total || 1)) * 100}%`}} /></div><div className="ava-exam-meta"><span><ShieldCheck size={15}/> Identity verified</span><span><MonitorCheck size={15}/> Consent-based recording active</span><span><Clock3 size={15}/> {formatRemaining(seconds)} remaining</span></div><h2>{screen?.question?.prompt || 'Loading next question…'}</h2><label className="ava-field">Your response<textarea className="ava-answer" rows={8} value={answer} maxLength={4000} onChange={(e) => { setAnswer(e.target.value); setAnswerSource('typed') }} placeholder="Write your response in your own words. You can also dictate, then review the transcript before submitting." /></label>
              <div className="ava-tools"><button type="button" className="ava-secondary" disabled={!speechAvailable} onClick={startDictation}><Mic size={17}/>{isSpeaking ? 'Stop dictation' : 'Dictate answer'}</button><span>{answer.length}/4000 characters</span></div>
              {!speechAvailable && <p className="ava-muted">Speech recognition isn’t available in this browser. Typing is supported.</p>}
              <p className="ava-muted">Dictation converts speech to editable text using your browser’s speech recognition service. Transcript-only review cannot reliably score spoken fluency or pronunciation.</p>
              <div className="ava-bottom"><span><MonitorCheck size={15}/> Proctored session {fullscreen ? '· Fullscreen on' : '· Fullscreen optional'} · Focus &amp; sound events logged</span><button className="ava-primary" disabled={busy || answer.trim().length < 15 || seconds === 0 || (screen?.total === 30 && !proctorReady)} onClick={() => void sendAnswer()}>{busy ? 'Submitting…' : 'Save answer and continue'}<ChevronRight size={17}/></button></div>
            </div>}
            {finished && <div className="ava-panel"><div className="ava-icon"><ClipboardCheck /></div><p className="ava-label">SCREENING RECORD — SUBMITTED</p><h2>{screen?.assessmentStatus === 'time_expired' ? 'Time has elapsed.' : 'Assessment completed.'}</h2><p>Your submitted responses are saved for Talent Acquisition’s review. No AI-generated feedback or scores make an automatic employment decision.</p><div className="ava-summary"><div><span>Answers received</span><strong>{screen?.answered} / {screen?.total}</strong></div><div><span>AI writing reviews</span><strong>{screen?.reviewProgress.reviewed} / {screen?.reviewProgress.total}</strong></div><div><span>Hiring decision</span><strong>Human review</strong></div></div>
              {Boolean(screen?.reviewResults.length) && <div className="ava-review-results"><h3>Provisional writing feedback</h3>{screen?.reviewResults.map((r) => <div key={r.questionId}><strong>{r.questionId}</strong><span>{r.review?.feedback || 'Feedback unavailable'}</span></div>)}</div>}
              <button className="ava-secondary" disabled={busy} onClick={() => void refresh()}>Refresh review progress</button></div>}
            {error && <p className="ava-alert" role="alert"><TriangleAlert size={16}/>{error}</p>}
            {notice && <p className="ava-note" role="status"><CheckCircle2 size={16}/>{notice}</p>}
          </section>
        </div>
        {screen && stage !== 'assessment' && <section className="ava-applications" aria-label="Your Careers applications">
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
            {applications.map(item => <article key={item.referenceId} className="ava-application-card">
              <p className="ava-label">{item.referenceId}</p>
              <h3>{item.position}</h3>
              <p>Application: <strong>{item.applicationStatus === 'VERIFIED' ? 'Application received' : item.applicationStatus}</strong></p>
              <p>Assessment: <strong>{item.assessmentStatus.replace(/_/g,' ')}</strong></p>
              <p>Recruitment: <strong>{item.reviewStatus.replace(/_/g,' ')}</strong></p>
              {item.requiredAction && <p className="ava-required-action">Required action: {item.requiredAction}</p>}
              {item.isSelected
                ? <div className="ava-current-actions"><span className="ava-current-label">Current application</span>{item.requiredAction && <span className="ava-required-action">{item.profileComplete ? item.requiredAction : 'Required action · Complete profile to unlock assessment'}</span>}</div>
                : <button className="ava-primary" type="button" disabled={busy} onClick={() => void openApplication(item.referenceId)}>
                  {item.requiredAction || 'View application'} <ChevronRight size={16}/>
                </button>}
            </article>)}
          </div>
          <p className="ava-muted">Verification and recruitment statuses are controlled by OPERAVA reviewers. Assessment submission does not automatically determine employment eligibility. Passport NFC and certified face-liveness verification are not yet available; do not submit identity photos through email.</p>
        </section>}
        {screen && stage !== 'assessment' && <section className="ava-applications" aria-label="Required onboarding documents">
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
            {documents.map(doc=><article key={doc.id} className="ava-application-card ava-document-card">
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
        </section>}
        <div className="ava-app-support"><LockKeyhole size={13} aria-hidden="true" /> Secure email OTP sign-in · {screen && <button className="ava-signout" type="button" onClick={()=>void logout()}><LogOut size={14} /> Sign out</button>} For assistance, email <a href="mailto:talents@operavaglobal.com">talents@operavaglobal.com</a></div>
      </div>
    </div>
  )
}