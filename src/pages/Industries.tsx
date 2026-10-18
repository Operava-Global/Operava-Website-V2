import { Link } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import { Page, Crumbs, Img, StoryCard, ListPanel, SectionHead, Section, CtaBanner } from '../site/ui'
import { industries, otherIndustries } from '../site/content/industries'
import { PHOTO } from '../site/media'

export default function Industries() {
  usePageMeta({
    title: 'Industries',
    description:
      'OPERAVA adapts technology and BPO capabilities to e-commerce, SaaS, financial services, insurance, healthcare administration, logistics, real estate, education, professional services and more.',
    crumbs: [{ name: 'Industries', path: '/industries' }],
  })

  const [lead, second, third, ...rest] = industries

  return (
    <Page>
      <Crumbs items={[{ label: 'Industries' }]} />
      <h1 className="mt-10 text-[48px] sm:text-[64px] lg:text-[96px] font-black uppercase leading-[0.85] tracking-[-0.04em] reveal">
        Industries
        <br />
        <span className="text-neutral-600">we support</span>
      </h1>
      <p className="mt-8 max-w-[640px] text-neutral-400 leading-relaxed reveal">
        OPERAVA’s technology and BPO capabilities can be adapted to a wide range of industries — from one professional supporting a defined function
        to multiple teams across products, regions and customer groups.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
        <Link to={`/industries/${lead.slug}`} className="lg:col-span-2 relative h-[420px] lg:h-[520px] rounded-[12px] overflow-hidden border border-neutral-900 group reveal">
          <Img src={lead.image} alt={lead.name} className="absolute inset-0 w-full h-full object-cover brightness-[0.65] group-hover:scale-[1.02] transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 lg:p-10">
            <p className="text-[10px] tracking-widest uppercase text-accent font-bold">{lead.tag}</p>
            <h2 className="mt-3 text-[30px] lg:text-[36px] font-black uppercase leading-[0.9]">{lead.name}</h2>
            <p className="mt-3 text-sm text-neutral-300 max-w-[420px]">{lead.short}</p>
          </div>
        </Link>
        <div className="space-y-6">
          {[second, third].map((ind) => (
            <Link
              key={ind.slug}
              to={`/industries/${ind.slug}`}
              className="block relative h-[200px] lg:h-[250px] rounded-[12px] overflow-hidden border border-neutral-900 group reveal"
            >
              <Img src={ind.image} alt={ind.name} className="absolute inset-0 w-full h-full object-cover brightness-[0.7] group-hover:scale-[1.05] transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="font-black uppercase">{ind.name}</h3>
                <p className="text-xs text-neutral-300 mt-1">{ind.short}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Section>
        <SectionHead
          title={
            <>
              More industries
              <br />
              <span className="text-neutral-600">in focus</span>
            </>
          }
          note="Each industry page lists the services OPERAVA typically applies and how."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rest.map((ind, n) => (
            <StoryCard
              key={ind.slug}
              image={ind.image}
              tag={ind.tag}
              title={ind.name}
              sub={ind.short}
              to={`/industries/${ind.slug}`}
              delay={(n % 4) * 80}
              className="h-[420px]"
            />
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead kicker="Also supported" title={<>Across 19 industries</>} />
        <div className="reveal">
          <ListPanel items={otherIndustries.map((label) => ({ label }))} />
        </div>
        <p className="mt-6 max-w-[760px] text-xs text-neutral-500 leading-relaxed">
          Specific regulated industries or activities may require additional licenses, permits, registrations, professional qualifications, privacy controls,
          security requirements or other applicable authorizations.
        </p>
      </Section>

      <CtaBanner
        image={PHOTO.handshake}
        kicker="Your industry"
        title="Don’t see your industry? Tell us how you operate"
        cta="Talk to us →"
        to="/contact"
        secondary={{ label: 'Browse services', to: '/services' }}
      />
    </Page>
  )
}
