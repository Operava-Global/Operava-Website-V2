import { useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import OtpVerify from './OtpVerify'
import FormSuccess from './FormSuccess'
import { ATTACHMENT_ACCEPT, attachmentMetadata, validateAttachment } from '../../utils/attachments'

const INQUIRY_TYPES = [
  'Course Enrollment',
  'Training Enrollment',
  'Details Inquiry',
  'Corporate Cohort',
  'Institutional Partnership',
]

const PROGRAM_TRACKS = [
  'Artificial Intelligence',
  'Human Resources',
  'Leadership',
  'Online Learning (general)',
  'Degree / Diploma pathway (partner institutions)',
  'Not sure yet',
]

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export default function AcademyEnrollmentForm() {
  const [step, setStep] = useState<'form' | 'otp' | 'done'>('form')
  const [draftId, setDraftId] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [result, setResult] = useState<{ referenceId: string; name: string; formType: string; emailWarning?: string }>({ referenceId: '', name: '', formType: 'ACADEMY' })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    category: 'Course Enrollment',
    service: 'Artificial Intelligence',
    description: '',
    contactMethod: 'Email',
    accurate: false,
    privacy: false,
    website: '',
  })

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
      setForm((prev) => ({ ...prev, [key]: value }))
    }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (form.name.trim().length < 2) errs.name = 'Full name is required.'
    if (!EMAIL_RE.test(form.email.trim())) errs.email = 'A valid email is required.'
    if (form.phone.trim().length < 6) errs.phone = 'Phone number is required.'
    if (form.country.trim().length < 2) errs.country = 'Country / location is required.'
    if (!form.category) errs.category = 'Select an inquiry type.'
    if (form.description.trim().length < 10) errs.description = 'Please add a short description (at least 10 characters).'
    if (!form.accurate) errs.accurate = 'Please confirm the information is accurate.'
    if (!form.privacy) errs.privacy = 'Please accept the privacy notice.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setTouched({
      name: true,
      email: true,
      phone: true,
      country: true,
      category: true,
      description: true,
      accurate: true,
      privacy: true,
    })
    if (!validate()) {
      setError('Please correct the highlighted fields before continuing.')
      return
    }
    setSending(true)
    try {
      const attachmentInfo = attachment ? await attachmentMetadata(attachment) : {}
      const res = await fetch('/api/forms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'ACADEMY',
          ...attachmentInfo,
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          country: form.country,
          category: form.category,
          service: form.service,
          description: form.description,
          contactMethod: form.contactMethod,
          accurate: form.accurate,
          privacy: form.privacy,
          website: form.website,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to send verification code.')
      setDraftId(data.draftId)
      setMaskedEmail(data.maskedEmail)
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit.')
    } finally {
      setSending(false)
    }
  }

  if (step === 'done') {
    return <FormSuccess formType={result.formType} name={result.name} referenceId={result.referenceId} emailWarning={result.emailWarning} />
  }

  if (step === 'otp') {
    return (
      <OtpVerify
        maskedEmail={maskedEmail}
        draftId={draftId}
        attachment={attachment}
        onDraftIdChange={setDraftId}
        onVerified={(value) => {
          setResult(value)
          setStep('done')
        }}
        onChangeEmail={() => setStep('form')}
        onBack={() => setStep('form')}
      />
    )
  }

  const fieldClass = (key: string) =>
    touched[key] && fieldErrors[key]
      ? 'w-full px-4 py-3 min-h-12 text-sm border border-red-500/70 bg-red-500/5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-red-400'
      : 'w-full px-4 py-3 min-h-12 text-sm border border-neutral-800 bg-black text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent'

  return (
    <form noValidate onSubmit={submit} className="space-y-6 max-w-2xl">
      <input className="hidden" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />

      <div>
        <label htmlFor="academy-name" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">
          Full Name <span className="text-accent">*</span>
        </label>
        <input
          id="academy-name"
          autoComplete="name" autoCapitalize="words" spellCheck autoCorrect="on"
          required
          value={form.name}
          onChange={set('name')}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          placeholder="Jane Doe"
          className={fieldClass('name')}
        />
        {touched.name && fieldErrors.name && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="academy-company" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">
          Company / Organization (optional)
        </label>
        <input
          id="academy-company"
          autoComplete="organization" spellCheck autoCorrect="on"
          value={form.company}
          onChange={set('company')}
          placeholder="Acme Corp"
          className={fieldClass('company')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="academy-email" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">
            Email <span className="text-accent">*</span>
          </label>
          <input
            id="academy-email"
            autoComplete="email" autoCapitalize="none" spellCheck={false} autoCorrect="off"
            type="email"
            required
            value={form.email}
            onChange={set('email')}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            placeholder="name@email.com"
            className={fieldClass('email')}
          />
          {touched.email && fieldErrors.email && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="academy-phone" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">
            Phone <span className="text-accent">*</span>
          </label>
          <input
            id="academy-phone"
            autoComplete="tel" spellCheck={false} autoCorrect="off"
            type="tel"
            required
            value={form.phone}
            onChange={set('phone')}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            placeholder="+1 …"
            className={fieldClass('phone')}
          />
          {touched.phone && fieldErrors.phone && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="academy-country" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">
          Country / Location <span className="text-accent">*</span>
        </label>
        <input
          id="academy-country"
          autoComplete="country-name" autoCapitalize="words" spellCheck autoCorrect="on"
          required
          value={form.country}
          onChange={set('country')}
          onBlur={() => setTouched((t) => ({ ...t, country: true }))}
          placeholder="Philippines, United States, …"
          className={fieldClass('country')}
        />
        {touched.country && fieldErrors.country && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.country}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="academy-type" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">
            Inquiry type <span className="text-accent">*</span>
          </label>
          <select id="academy-type" value={form.category} onChange={set('category')} className={fieldClass('category')}>
            {INQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="academy-track" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">
            Program / track
          </label>
          <select id="academy-track" value={form.service} onChange={set('service')} className={fieldClass('service')}>
            {PROGRAM_TRACKS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="academy-desc" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">
          Details <span className="text-accent">*</span>
        </label>
        <textarea
          id="academy-desc"
          autoCapitalize="sentences" spellCheck autoCorrect="on"
          required
          rows={4}
          value={form.description}
          onChange={set('description')}
          onBlur={() => setTouched((t) => ({ ...t, description: true }))}
          placeholder="Tell us about the course or training you want, preferred schedule, or questions for the Academy team."
          className={fieldClass('description')}
        />
        {touched.description && fieldErrors.description && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Supporting document (optional)</label>
        <input type="file" accept={ATTACHMENT_ACCEPT}
          className="block w-full text-sm text-neutral-400"
          onChange={(e) => {
            const file = e.target.files?.[0] || null
            const problem = file ? validateAttachment(file) : null
            if (problem) { setAttachment(null); setError(problem); e.target.value = ''; return }
            setAttachment(file); setError('')
          }}
        />
        <p className="text-xs text-neutral-500 mt-2">PDF, DOC, DOCX or TXT · strictly under 5 MB · emailed only to our team after verification; not saved to R2.</p>
      </div>

      <div className="space-y-3 pt-6 border-t border-neutral-900">
        <label className="flex items-start gap-3 text-xs text-neutral-300 leading-relaxed cursor-pointer">
          <input type="checkbox" checked={form.accurate} onChange={set('accurate')} className="mt-0.5 w-4 h-4 shrink-0" />
          <span>I confirm the information provided is accurate.</span>
        </label>
        <label className="flex items-start gap-3 text-xs text-neutral-300 leading-relaxed cursor-pointer">
          <input type="checkbox" checked={form.privacy} onChange={set('privacy')} className="mt-0.5 w-4 h-4 shrink-0" />
          <span>I agree that OPERAVA may contact me about this Academy inquiry.</span>
        </label>
      </div>

      {error && (
        <div className="flex items-start gap-2 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 bg-white text-black text-xs tracking-widest uppercase font-bold hover:bg-accent-solid hover:text-white disabled:opacity-60 transition-colors"
      >
        {sending ? 'Sending verification…' : 'Continue with email verification'}
        {!sending && <CheckCircle2 className="w-4 h-4" />}
      </button>
      <p className="text-xs text-neutral-500">
        Same secure process as other OPERAVA forms: we email a one-time code from our notification address, then confirm your submission. Academy
        confirmations are copied to academy@operavaglobal.com.
      </p>
    </form>
  )
}
