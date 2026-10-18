import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, SplitText, Section, SectionHead, CtaBanner, Stat } from '../site/ui'
import { REGISTRATION, COMPANY } from '../site/content/company'
import { LOCAL, PHOTO } from '../site/media'

export default function CorporateRegistration() {
  usePageMeta({
    title: 'Corporate Registration',
    description: `OPERAVA Global Solutions is a Philippine One Person Corporation registered with the SEC (Registration No. ${COMPANY.sec}). Regulatory positioning, BIR and data privacy.`,
    crumbs: [
      { name: 'About', path: '/about' },
      { name: 'Corporate Registration', path: '/about/corporate-registration' },
    ],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'About', to: '/about' }, { label: 'Corporate Registration' }]} />
      <PageHero
        image={LOCAL.dataCenter}
        alt="Corporate registration"
        kicker="Corporate registration"
        title={
          <>
            SEC-registered
            <br />
            Philippine
            <br />
            corporation
          </>
        }
        lead="How OPERAVA is organized and registered — and how we communicate our regulatory status accurately."
        height="h-[560px]"
      />

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 border-y border-neutral-900 py-10 reveal">
        <Stat value={COMPANY.sec} label="SEC Registration No." />
        <Stat value="OPC" label="One Person Corporation" />
        <Stat value="PH" label={COMPANY.address} />
      </div>

      <SplitText label="Securities and Exchange Commission" title={<>Corporate status</>}>
        {REGISTRATION.sec.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </SplitText>
      <SplitText label="Regulatory positioning" title={<>Registration ≠ blanket license</>}>
        {REGISTRATION.positioning.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </SplitText>
      <SplitText label="Bureau of Internal Revenue" title={<>Tax registration</>}>
        {REGISTRATION.bir.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </SplitText>
      <SplitText label="Data privacy" title={<>Personal information</>}>
        {REGISTRATION.privacy.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </SplitText>

      <Section className="!pt-4">
        <SectionHead kicker="Official sources" title={<>Government references</>} note="Links open the official Philippine government websites." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-neutral-900 border border-neutral-900 rounded-[12px] overflow-hidden reveal">
          {REGISTRATION.links.map((l, i) => (
            <a key={l.href} style={{ ['--i' as string]: i }} href={l.href} target="_blank" rel="noopener noreferrer" className="bg-black p-8 hover:bg-[#0a0a0a] group reveal-child spotlight">
              <p className="text-[10px] tracking-widest uppercase text-neutral-600 group-hover:text-accent transition-colors">{new URL(l.href).hostname}</p>
              <p className="mt-4 font-bold uppercase text-sm leading-snug">{l.label} ↗</p>
            </a>
          ))}
        </div>
        <p className="mt-8 max-w-[760px] text-xs text-neutral-500 leading-relaxed reveal">
          Statements about registrations, permits, licenses, data privacy compliance, employment status, international operations or regulated services
          are matched to OPERAVA’s current certificates, registrations, approved corporate purposes, contracts and actual compliance status. For
          compliance documentation requests, contact {COMPANY.email.compliance}.
        </p>
      </Section>

      <CtaBanner
        image={PHOTO.handshake}
        kicker="Compliance"
        title="Need registration documents for vendor onboarding?"
        cta="Contact compliance →"
        to={`mailto:${COMPANY.email.compliance}`}
        secondary={{ label: 'Privacy policy', to: '/privacy' }}
      />
    </Page>
  )
}
