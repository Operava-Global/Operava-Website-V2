import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import OtpVerify from './OtpVerify'
import FormSuccess from './FormSuccess'
import { ATTACHMENT_ACCEPT, attachmentMetadata, validateAttachment, CAREER_RESUME_ACCEPT, careerResumeMetadata, validateCareerResumePdf } from '../../utils/attachments'
import {
  CAREER_POSITIONS,
  SKILLS_SPECIALIZATIONS,
  type CareerPosition,
} from '../../data/careersData'
import {
  validateSingleField,
  validateIntakeForm,
  type FormValidationState,
} from '../../utils/formValidation'

export type IntakeKind = 'SERVICES' | 'CAREERS' | 'CONTACT'

const SERVICE_CATEGORIES = [
  'Information Technology',
  'Business Process Outsourcing',
  'Combined IT & BPO',
  'General Business Inquiry & Consultation',
  'Other',
]

const IT_SERVICES = [
  'Software Development',
  'Web & Mobile Application Development',
  'SaaS & Platform Development',
  'IT Systems Development',
  'Computer Programming',
  'IT Consulting',
  'Systems Integration',
  'Database Services',
  'Cloud & Digital Infrastructure',
]

const BPO_SERVICES = [
  'Customer Service',
  'Technical Support',
  'Help Desk Operations',
  'Back-Office Operations',
  'Data Processing',
  'Data Entry',
  'Document Processing',
  'Virtual Assistance',
]

const AUTOMATION_SERVICES = [
  'Workflow Automation',
  'Business Process Automation',
  'AI Automation',
  'Customer Service Automation',
  'Email Automation',
  'Lead & Sales Automation',
  'Data & Reporting Automation',
  'Document Automation',
  'HR & Workforce Automation',
  'Finance & Invoicing Automation',
]

/** Map public service names to the option labels used by this form */
const SERVICE_ALIASES: Record<string, string> = {
  'Help Desk': 'Help Desk Operations',
}

const GENERAL_SERVICES = [
  'General Business Consultation',
  'Strategic IT & BPO Partnership',
  'Custom Enterprise Solutions',
  'General Operational Inquiry',
  'Other Inquiry',
]

function normalizeCareerPosition(raw?: string): CareerPosition {
  if (!raw) return 'OPERAVA Technology Executive'
  const lower = raw.toLowerCase()
  if (lower.includes('customer') || lower.includes('cx') || lower.includes('support') || lower.includes('service')) {
    return 'OPERAVA Customer Experience Executive'
  }
  if (lower.includes('operations') || lower.includes('ops') || lower.includes('hr') || lower.includes('finance') || lower.includes('accounting') || lower.includes('recruitment')) {
    return 'OPERAVA Business Operations Executive'
  }
  if (lower.includes('tech') || lower.includes('software') || lower.includes('developer') || lower.includes('engineer') || lower.includes('cloud')) {
    return 'OPERAVA Technology Executive'
  }
  return 'OPERAVA Technology Executive'
}

interface Props {
  kind: IntakeKind
  defaultPosition?: string
  defaultService?: string
  defaultCategory?: string
}

export default function OperavaIntakeForm({
  kind: rawKind,
  defaultPosition,
  defaultService,
  defaultCategory,
}: Props) {
  const kind = rawKind === 'CAREERS' ? 'CAREERS' : 'SERVICES'
  const formType: IntakeKind = rawKind === 'CONTACT' ? 'CONTACT' : kind

  const [step, setStep] = useState<'form' | 'otp' | 'done'>('form')
  const [draftId, setDraftId] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [result, setResult] = useState<{ referenceId: string; name: string; formType: string; emailWarning?: string }>({
    referenceId: '',
    name: '',
    formType: kind,
  })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [resumeName, setResumeName] = useState('')
  const [inspectingResume, setInspectingResume] = useState(false)
  const [errors, setErrors] = useState<FormValidationState>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormValidationState, boolean>>>({})

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    category: defaultCategory || (rawKind === 'CONTACT' ? 'General Business Inquiry & Consultation' : 'Information Technology'),
    service: (defaultService && (SERVICE_ALIASES[defaultService] || defaultService)) || (rawKind === 'CONTACT' ? 'General Business Consultation' : ''),
    description: '',
    budget: '',
    websiteUrl: '',
    contactMethod: 'Email',
    position: normalizeCareerPosition(defaultPosition),
    specialization: '',
    availability: '',
    experience: '',
    education: '',
    skills: '',
    portfolio: '',
    additional: '',
    accurate: false,
    privacy: false,
    website: '',
  })

  useEffect(() => {
    if (defaultPosition) {
      const normalized = normalizeCareerPosition(defaultPosition)
      setForm((prev) => ({
        ...prev,
        position: normalized,
        specialization:
          SKILLS_SPECIALIZATIONS[normalized]?.includes(prev.specialization)
            ? prev.specialization
            : '',
      }))
    }
  }, [defaultPosition])

  useEffect(() => {
    if (defaultService) {
      setForm((prev) => ({ ...prev, service: SERVICE_ALIASES[defaultService] || defaultService }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next.service
        return next
      })
    }
  }, [defaultService])

  useEffect(() => {
    if (defaultCategory) {
      setForm((prev) => ({ ...prev, category: defaultCategory }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next.category
        return next
      })
    }
  }, [defaultCategory])

  const handleBlur = (key: keyof FormValidationState) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
    const fieldError = validateSingleField(key, form[key as keyof typeof form], kind, {
      hasResume: Boolean(attachment),
      formValues: form,
    })
    setErrors((prev) => {
      const next = { ...prev }
      if (fieldError) next[key] = fieldError
      else delete next[key]
      return next
    })
  }

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
      setForm((prev) => {
        const nextForm = { ...prev, [key]: value }
        if (touched[key as keyof FormValidationState] || errors[key as keyof FormValidationState]) {
          const fieldError = validateSingleField(key as keyof FormValidationState, value, kind, {
            hasResume: Boolean(attachment),
            formValues: nextForm,
          })
          setErrors((prevErr) => {
            const nextErr = { ...prevErr }
            if (fieldError) nextErr[key as keyof FormValidationState] = fieldError
            else delete nextErr[key as keyof FormValidationState]
            return nextErr
          })
        }
        return nextForm
      })
    }

  const uploadResume = async (file: File) => {
    const problem = validateCareerResumePdf(file)
    if (problem) throw new Error(problem)
    await careerResumeMetadata(file)
    setAttachment(file)
    setResumeName(file.name)
    setErrors(prev => ({ ...prev, resume: undefined }))
    // Optional in-memory autofill: an unavailable parser does not reject a valid PDF.
    const data = new FormData()
    data.append('file', file)
    let json: { parsed?: Record<string, string> } = {}
    try {
      const res = await fetch('/api/forms/upload', { method: 'POST', body: data })
      if (res.ok) json = await res.json()
    } catch { /* autofill is optional */ }
    const p = json.parsed || {}
    setForm((prev) => {
      const next = { ...prev }
      const fill = (key: keyof typeof prev, value?: string) => {
        const v = String(value || '').trim()
        if (!v) return
        if (!String(next[key] || '').trim()) {
          // @ts-expect-error dynamic form keys
          next[key] = v
        }
      }
      fill('name', p.fullName)
      fill('email', p.email)
      fill('phone', p.phone)
      fill('country', p.location)
      fill('education', p.education)
      fill('experience', p.experience)
      if (p.skills && !String(next.skills || '').trim()) next.skills = String(p.skills).slice(0, 2000)
      if (p.summary && !String(next.additional || '').trim()) next.additional = String(p.summary).slice(0, 2000)
      return next
    })

    setErrors((prev) => {
      const next = { ...prev }
      delete next.portfolio
      return next
    })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const validationErrors = validateIntakeForm(form, kind, Boolean(attachment))
    const errorKeys = Object.keys(validationErrors) as (keyof FormValidationState)[]
    if (errorKeys.length > 0) {
      setErrors(validationErrors)
      setTouched((prev) => {
        const next = { ...prev }
        errorKeys.forEach((k) => {
          next[k] = true
        })
        return next
      })
      const count = errorKeys.length
      setError(kind === 'CAREERS' ? `Please correct the ${count} specific Careers issue${count === 1 ? '' : 's'} listed below before continuing.` : `Please correct the ${count} highlighted ${count === 1 ? 'field' : 'fields'} below before continuing.`)
      const firstKey = errorKeys[0]
      const firstElement = document.getElementById(`field-${firstKey}`)
      if (firstElement) {
        firstElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        firstElement.focus()
      }
      return
    }

    setSending(true)
    try {
      const attachmentInfo = attachment ? kind === 'CAREERS' ? await careerResumeMetadata(attachment) : await attachmentMetadata(attachment) : {}
      const res = await fetch('/api/forms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType,
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          country: form.country,
          category: form.category,
          service: form.service,
          description: form.description,
          budget: form.budget,
          websiteUrl: form.websiteUrl,
          contactMethod: form.contactMethod,
          position: form.position,
          specialization: form.specialization,
          availability: form.availability,
          experience: form.experience,
          education: form.education,
          skills: form.specialization + (form.skills.trim() ? ` — Additional: ${form.skills.trim()}` : ''),
          portfolio: form.portfolio,
          additional: form.additional,
          ...attachmentInfo,
          accurate: form.accurate,
          privacy: form.privacy,
          website: form.website,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (kind === 'CAREERS' && data.fieldErrors && typeof data.fieldErrors === 'object') {
          setErrors(prev => ({ ...prev, ...data.fieldErrors }))
          setTouched(prev => ({ ...prev, ...Object.fromEntries(Object.keys(data.fieldErrors).map(key => [key, true])) }))
        }
        throw new Error(data.error || 'Unable to send verification code.')
      }
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
        careerMode={kind === 'CAREERS'}
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

  const getFieldClass = (hasError?: boolean, isTouched?: boolean) => {
    if (isTouched && hasError) {
      return 'w-full px-4 py-3 min-h-12 text-sm border border-red-500/70 bg-red-500/5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-red-400 transition-colors'
    }
    return 'w-full px-4 py-3 min-h-12 text-sm border border-neutral-800 bg-black text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent transition-colors'
  }

  const currentSpecializations = SKILLS_SPECIALIZATIONS[form.position as CareerPosition] || []
  const careerErrorLabels: Partial<Record<keyof FormValidationState, string>> = {
    name: 'Full name', email: 'Email address', phone: 'Phone',
    country: 'Country / location', position: 'Position', specialization: 'Specialization',
    availability: 'Availability', experience: 'Experience', education: 'Education',
    portfolio: 'Portfolio / LinkedIn', resume: 'CV / résumé (PDF)',
    accurate: 'Accuracy confirmation', privacy: 'Privacy consent',
  }
  const careerFieldError = (key: keyof FormValidationState) =>
    kind === 'CAREERS' && errors[key]
      ? <p id={`error-${key}`} role="alert" className="mt-1.5 text-xs text-red-400 font-medium">{errors[key]}</p>
      : null

  return (
    <form noValidate onSubmit={submit} className="space-y-6 max-w-2xl">
      <input className="hidden" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="field-name" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400">
              Full Name <span className="text-accent">*</span>
            </label>
          </div>
          <input id="field-name" name="name" autoComplete="name" autoCapitalize="words" spellCheck autoCorrect="on" required value={form.name} onChange={set('name')} onBlur={() => handleBlur('name')} placeholder="Jane Doe" className={getFieldClass(Boolean(errors.name), Boolean(touched.name))} />
          {touched.name && errors.name && (
            <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {kind === 'SERVICES' && (
          <div>
            <label htmlFor="field-company" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Company / Organization Name (Optional)</label>
            <input id="field-company" name="company" autoComplete="organization" spellCheck autoCorrect="on" value={form.company} onChange={set('company')} placeholder="Acme Corp" className={getFieldClass(false, false)} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field-email" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">{kind === 'SERVICES' ? 'Business Email Address' : 'Email Address'} <span className="text-accent">*</span></label>
            <input id="field-email" name="email" autoComplete="email" autoCapitalize="none" spellCheck={false} autoCorrect="off" required type="email" value={form.email} onChange={set('email')} onBlur={() => handleBlur('email')} placeholder="name@company.com" className={getFieldClass(Boolean(errors.email), Boolean(touched.email))} />
            {touched.email && errors.email && (
              <p role="alert" className="mt-1.5 text-xs text-red-400 font-medium">{errors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="field-phone" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Contact / Phone Number <span className="text-accent">*</span></label>
            <input id="field-phone" name="phone" autoComplete="tel" spellCheck={false} autoCorrect="off" required type="tel" value={form.phone} onChange={set('phone')} onBlur={() => handleBlur('phone')} placeholder="+1 (555) 000-0000" className={getFieldClass(Boolean(errors.phone), Boolean(touched.phone))} />
            {touched.phone && errors.phone && (
              <p role="alert" className="mt-1.5 text-xs text-red-400 font-medium">{errors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="field-country" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">{kind === 'CAREERS' ? 'Country / Current Location' : 'Country / Location'} <span className="text-accent">*</span></label>
          <input id="field-country" name="country" autoComplete="country-name" autoCapitalize="words" spellCheck autoCorrect="on" required value={form.country} onChange={set('country')} onBlur={() => handleBlur('country')} placeholder="United States, Philippines, Canada, etc." className={getFieldClass(Boolean(errors.country), Boolean(touched.country))} />
          {touched.country && errors.country && (
            <p role="alert" className="mt-1.5 text-xs text-red-400 font-medium">{errors.country}</p>
          )}
        </div>
      </div>

      {kind === 'SERVICES' && (
        <div className="space-y-4 pt-6 border-t border-neutral-900">
          <div>
            <label htmlFor="field-category" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Inquiry / Project Category <span className="text-accent">*</span></label>
            <select id="field-category" value={form.category} onChange={set('category')} onBlur={() => handleBlur('category')} className={getFieldClass(Boolean(errors.category), Boolean(touched.category))}>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="field-service" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Service / Focus <span className="text-accent">*</span></label>
            <select id="field-service" value={form.service} onChange={set('service')} onBlur={() => handleBlur('service')} className={getFieldClass(Boolean(errors.service), Boolean(touched.service))}>
              <option value="">Select a service</option>
              <optgroup label="Information Technology">
                {IT_SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </optgroup>
              <optgroup label="Business Process Outsourcing">
                {BPO_SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </optgroup>
              <optgroup label="Automation">
                {AUTOMATION_SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </optgroup>
              <optgroup label="General">
                {GENERAL_SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label htmlFor="field-description" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Project description <span className="text-accent">*</span></label>
            <textarea id="field-description" spellCheck autoCorrect="on" autoCapitalize="sentences" rows={4} value={form.description} onChange={set('description')} onBlur={() => handleBlur('description')} className={getFieldClass(Boolean(errors.description), Boolean(touched.description))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Budget (optional)</label>
              <input value={form.budget} onChange={set('budget')} className={getFieldClass(false, false)} />
            </div>
            <div>
              <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Website / System URL (optional)</label>
              <input value={form.websiteUrl} onChange={set('websiteUrl')} className={getFieldClass(false, false)} />
            </div>
          </div>
          <div>
            <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Preferred contact method</label>
            <select value={form.contactMethod} onChange={set('contactMethod')} className={getFieldClass(false, false)}>
              <option>Email</option>
              <option>Phone</option>
              <option>Either</option>
            </select>
          </div>
        </div>
      )}

      {kind === 'SERVICES' && (
        <div>
          <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Supporting document (optional)</label>
          <input type="file" accept={ATTACHMENT_ACCEPT}
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              const problem = file ? validateAttachment(file) : null
              if (problem) { setAttachment(null); setError(problem); e.target.value = ''; return }
              setAttachment(file); setError('')
            }}
            className="block w-full text-sm text-neutral-400"
          />
          <p className="text-xs text-neutral-500 mt-2">PDF, DOC, DOCX or TXT · strictly under 5 MB · emailed to our team after verification; not saved to R2.</p>
        </div>
      )}

      {kind === 'CAREERS' && (
        <div className="space-y-4 pt-6 border-t border-neutral-900">
          <div>
            <label htmlFor="field-position" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Position <span className="text-accent">*</span></label>
            <select id="field-position" aria-invalid={Boolean(errors.position)} value={form.position} onChange={set('position')} onBlur={() => handleBlur('position')} className={getFieldClass(Boolean(errors.position), Boolean(touched.position))}>
              {CAREER_POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {careerFieldError('position')}
          </div>
          <div>
            <label htmlFor="field-specialization" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Specialization / Skills track <span className="text-accent">*</span></label>
            <select id="field-specialization" aria-invalid={Boolean(errors.specialization)} value={form.specialization} onChange={set('specialization')} onBlur={() => handleBlur('specialization')} className={getFieldClass(Boolean(errors.specialization), Boolean(touched.specialization))}>
              <option value="">Select specialization</option>
              {currentSpecializations.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {careerFieldError('specialization')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Availability</label>
              <input id="field-availability" aria-invalid={Boolean(errors.availability)} value={form.availability} onChange={set('availability')} onBlur={() => handleBlur('availability')} className={getFieldClass(Boolean(errors.availability), Boolean(touched.availability))} />
                {careerFieldError('availability')}
            </div>
            <div>
              <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Experience</label>
              <input id="field-experience" aria-invalid={Boolean(errors.experience)} value={form.experience} onChange={set('experience')} onBlur={() => handleBlur('experience')} className={getFieldClass(Boolean(errors.experience), Boolean(touched.experience))} />
                {careerFieldError('experience')}
            </div>
          </div>
          <div>
            <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Education</label>
            <input id="field-education" aria-invalid={Boolean(errors.education)} value={form.education} onChange={set('education')} onBlur={() => handleBlur('education')} className={getFieldClass(Boolean(errors.education), Boolean(touched.education))} />
              {careerFieldError('education')}
          </div>
          <div>
            <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Additional skills</label>
            <input value={form.skills} onChange={set('skills')} className={getFieldClass(false, false)} />
          </div>
          <div>
            <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Portfolio / LinkedIn (optional)</label>
            <input id="field-portfolio" aria-invalid={Boolean(errors.portfolio)} value={form.portfolio} onChange={set('portfolio')} onBlur={() => handleBlur('portfolio')} className={getFieldClass(Boolean(errors.portfolio), Boolean(touched.portfolio))} />
              {careerFieldError('portfolio')}
          </div>
          <div>
            <label htmlFor="field-resume" className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">CV / Résumé — non-editable PDF only, under 5 MB <span className="text-accent">*</span></label>
            <input
              id="field-resume"
              type="file"
              accept={CAREER_RESUME_ACCEPT}
              required
              aria-invalid={Boolean(errors.resume)}
              aria-describedby="resume-guidance"
              onChange={async (e) => {
                const file = e.target.files?.[0] || null
                setAttachment(null)
                setResumeName('')
                setTouched(prev => ({ ...prev, resume: true }))
                if (!file) {
                  setErrors(prev => ({ ...prev, resume: 'CV / résumé missing: select one PDF file smaller than 5 MB.' }))
                  return
                }
                setInspectingResume(true)
                setError('')
                try {
                  await uploadResume(file)
                } catch (err) {
                  const message = err instanceof Error ? err.message : 'Unable to inspect the PDF CV / résumé.'
                  setErrors(prev => ({ ...prev, resume: message }))
                  setError('CV / résumé: ' + message)
                  e.target.value = ''
                } finally {
                  setInspectingResume(false)
                }
              }}
              className="block w-full text-sm text-neutral-400"
            />
            <p id="resume-guidance" className="mt-2 text-xs text-neutral-500">Required: genuine non-editable-format PDF (.pdf), strictly less than 5 MB (5,000,000 bytes). Export your CV from Word as PDF; DOC, DOCX, TXT, JPEG and PNG are rejected. The file is sent directly to Talent Acquisition by email after OTP verification; it is not stored in R2.</p>
            {careerFieldError('resume')}
            {resumeName && attachment && !errors.resume && (
              <p className="mt-2 text-xs text-emerald-400 font-medium">PDF verified: {resumeName} ({(attachment.size / 1_000_000).toFixed(2)} MB). Ready for email submission.</p>
            )}
          </div>
          <div>
            <label className="block text-[11px] tracking-widest uppercase font-semibold text-neutral-400 mb-2">Additional notes</label>
            <textarea spellCheck autoCorrect="on" autoCapitalize="sentences" rows={3} value={form.additional} onChange={set('additional')} className={getFieldClass(false, false)} />
          </div>
        </div>
      )}

      <div className="space-y-3 pt-6 border-t border-neutral-900">
        <label className="flex items-start gap-3 text-xs text-neutral-300 leading-relaxed">
          <input id="field-accurate" type="checkbox" aria-invalid={Boolean(errors.accurate)} checked={form.accurate} onChange={set('accurate')} className="mt-0.5 w-4 h-4 shrink-0" />
          <span>I confirm the information provided is accurate. <span className="text-accent">*</span></span>
        </label>
        {careerFieldError('accurate')}
        <label className="flex items-start gap-3 text-xs text-neutral-300 leading-relaxed">
          <input id="field-privacy" type="checkbox" aria-invalid={Boolean(errors.privacy)} checked={form.privacy} onChange={set('privacy')} className="mt-0.5 w-4 h-4 shrink-0" />
          <span>I agree to the processing of my data as described in the <Link to="/privacy" className="underline underline-offset-4 hover:text-accent">Privacy Policy</Link>. <span className="text-accent">*</span></span>
        </label>
        {careerFieldError('privacy')}
      </div>

      {(error || (kind === 'CAREERS' && Object.values(errors).some(Boolean))) && (
        <div role="alert" className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error && <p className="flex items-start gap-2"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}</p>}
          {kind === 'CAREERS' && Object.values(errors).some(Boolean) && (
            <ul className="mt-2 list-disc pl-5 space-y-1" aria-label="Specific Careers application errors">
              {(Object.entries(errors) as Array<[keyof FormValidationState, string | undefined]>)
                .filter(([, message]) => Boolean(message))
                .map(([key, message]) => (
                  <li key={key}>
                    <a href={`#field-${key}`} className="underline underline-offset-2 font-semibold">{careerErrorLabels[key] || key}</a>: {message}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      <button type="submit" disabled={sending || inspectingResume} className="w-full sm:w-auto h-12 px-8 bg-white text-black text-xs tracking-widest uppercase font-bold hover:bg-accent-solid hover:text-white transition-colors disabled:opacity-60">
        {inspectingResume ? 'Checking PDF…' : sending ? 'Sending verification…' : 'Continue to email verification'}
      </button>


    </form>
  )
}
