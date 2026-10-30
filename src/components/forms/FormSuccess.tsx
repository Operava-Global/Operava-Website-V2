interface Props {
  formType: string
  name: string
  referenceId: string
  emailWarning?: string
}

export default function FormSuccess({ formType, name, referenceId, emailWarning }: Props) {
  const copy =
    formType === 'CAREERS'
      ? 'Your email address has been verified, and we have received your job application. Our Talent Acquisition Team will review your application and contact you if your qualifications match an available opportunity.'
      : formType === 'SERVICES'
        ? 'Your service inquiry has been successfully submitted and your email address has been verified. Our team will review your inquiry and contact you if additional information is required.'
        : formType === 'ACADEMY'
          ? 'Your OPERAVA Academy enrollment or details inquiry has been submitted and your email is verified. The Academy team will review your request. You can also access the Learning Management System at academy.operavaglobal.com.'
          : formType === 'PARTNERSHIP'
            ? 'Your partnership proposal has been submitted and your email address is verified. Our partnerships team will review the opportunity and contact you about potential next steps.'
          : 'Your message has been successfully submitted and your email address has been verified. We will respond if further action or information is required.'

  return (
    <div className="max-w-xl mx-auto text-center space-y-5 py-10">
      <p className="text-[11px] tracking-[0.3em] uppercase text-accent font-bold">{formType === 'CAREERS' ? 'Job application received' : 'Verified & submitted'}</p>
      <h2 className="text-[36px] font-black uppercase leading-[0.9]">{formType === 'CAREERS' ? 'Thank you for submitting your application.' : <>Thank you, {name}.</>}</h2>
      <p className="text-sm text-neutral-400 leading-relaxed">{copy}</p>
      {emailWarning && <p role="alert" className="text-sm text-amber-300 border border-amber-500/30 p-3">{emailWarning}</p>}
      <p className="pt-4 text-[10px] uppercase tracking-widest text-neutral-500">{formType === 'CAREERS' ? 'Application reference ID' : 'Reference ID'}</p>
      <p className="font-mono text-xl font-bold text-white border border-neutral-800 inline-block px-5 py-3">{referenceId}</p>
      {formType === 'ACADEMY' && (
        <a
          href="https://academy.operavaglobal.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block mx-auto w-fit text-[11px] tracking-widest uppercase border-b border-white pb-1 hover:text-accent hover:border-accent"
        >
          Open Learning Management System →
        </a>
      )}
    </div>
  )
}
