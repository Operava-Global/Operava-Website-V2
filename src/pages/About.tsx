import { Link } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import { Page, Crumbs, Img, NumberPanel, SectionHead, Section, SplitText, Card, CtaBanner, Stat, ArrowLink, ListPanel } from '../site/ui'
import { COMPANY, OVERVIEW, PILLARS, CLIENT_SIZES, QUALITY_STANDARDS } from '../site/content/company'
import { itServices, bpoServices } from '../data/services'
import { automationServices } from '../data/automationServices'
import { LOCAL, PHOTO } from '../site/media'

export default function About() {
  usePageMeta({
    title: 'About Us',
    description:
      'OPERAVA Global Solutions is a Philippine-based technology, workforce and BPO company, SEC-registered as a One Person Corporation, operating remotely and globally.',
    crumbs: [{ name: 'About', path: '/about' }],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'About' }]} />
      <section className="relative h-auto min-h-[560px] rounded-[12px] overflow-hidden border border-neutral-900 mt-6">
        <Img src={LOCAL.dataCenter} alt="OPERAVA operations" eager className="absolute inset-0 w-full h-full object-cover brightness-[0.65]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="relative z-10 h-full min-h-[560px] flex flex-col justify-center p-8 sm:p-10 lg:p-16 max-w-[760px]">
          <h1 className="text-[52px] lg:text-[84px] font-black uppercase leading-[0.85]">
            We are
            <br />
            OPERAVA
          </h1>
          <p className="mt-6 text-lg text-neutral-200 leading-relaxed">
            A Philippine-based technology, workforce and business process solutions company — connecting technology, skilled professionals and
            business processes to help organizations operate more efficiently, remotely and globally.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6 lg:gap-8 border-t border-white/20 pt-8">
            <Stat value={String(itServices.length + bpoServices.length)} label="IT & BPO services" />
            <Stat value={String(automationServices.length)} label="Automation services" />
            <Stat value="3" label="Delivery models" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-12">
        <Card>
          <h3 className="font-black uppercase text-xl">Operating Philosophy</h3>
          <p className="mt-3 text-sm text-neutral-400">Operating in advance — technology, people and process, with quality first.</p>
          <ArrowLink to="/about/operating-philosophy" className="mt-8">
            Our principles →
          </ArrowLink>
        </Card>
        <Card>
          <h3 className="font-black uppercase text-xl">Remote-First Model</h3>
          <p className="mt-3 text-sm text-neutral-400">A Philippine foundation with a distributed, globally oriented operating model.</p>
          <ArrowLink to="/about/remote-first-model" className="mt-8">
            How we operate →
          </ArrowLink>
        </Card>
        <Card accent>
          <h3 className="font-black uppercase text-xl">Corporate Registration</h3>
          <p className="mt-3 text-sm font-medium text-white/90">SEC Registration No. {COMPANY.sec} · One Person Corporation</p>
          <Link to="/about/corporate-registration" className="mt-8 inline-flex items-center h-9 px-5 bg-black text-white text-[11px] tracking-widest uppercase font-bold">
            Registration details →
          </Link>
        </Card>
      </div>

      <SplitText label="Company overview" title={<>Who we are</>}>
        {OVERVIEW.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </SplitText>

      <section className="border-y border-neutral-900 py-16 lg:py-24 reveal">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-accent font-bold mb-8">Our purpose</p>
          <p className="text-[30px] lg:text-[52px] font-black uppercase leading-[0.95] tracking-[-0.02em]">{COMPANY.mission}</p>
        </div>
      </section>

      <Section>
        <SectionHead
          kicker="What we connect"
          title={
            <>
              Technology,
              <br />
              people &amp; <span className="text-neutral-600">process</span>
            </>
          }
          note="Digital transformation should not become simply a technology implementation exercise."
        />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-3" items={PILLARS} />
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead
          kicker="Who we serve"
          title={
            <>
              Startups to
              <br />
              <span className="text-neutral-600">enterprises</span>
            </>
          }
        />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-4" size="md" items={CLIENT_SIZES} />
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead kicker="Quality first" title={<>Standards we keep</>} note="Outsourcing is not simply about reducing cost — its value is the quality of people, process, communication and outcomes." />
        <div className="reveal">
          <ListPanel items={QUALITY_STANDARDS.map((label) => ({ label }))} />
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4">
        <Card>
          <h3 className="font-black uppercase text-xl">Contact Directory</h3>
          <p className="mt-3 text-sm text-neutral-400">The right inbox for clients, HR, billing, compliance and verification.</p>
          <ArrowLink to="/contacts" className="mt-8">
            Find a contact →
          </ArrowLink>
        </Card>
        <Card>
          <h3 className="font-black uppercase text-xl">Document Verification</h3>
          <p className="mt-3 text-sm text-neutral-400">Check an OPERAVA-issued document reference ID.</p>
          <ArrowLink to="/verification" className="mt-8">
            Verify a document →
          </ArrowLink>
        </Card>
        <Card>
          <h3 className="font-black uppercase text-xl">FAQ</h3>
          <p className="mt-3 text-sm text-neutral-400">Answers about services, engagements, registration and careers.</p>
          <ArrowLink to="/faq" className="mt-8">
            Read the FAQ →
          </ArrowLink>
        </Card>
      </div>

      <CtaBanner
        image={PHOTO.handshake}
        kicker={COMPANY.motto}
        title="Let’s build the operation your business needs"
        cta="Talk to us →"
        to="/contact"
        secondary={{ label: 'Careers', to: '/careers' }}
      />
    </Page>
  )
}
