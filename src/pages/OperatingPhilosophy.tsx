import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, NumberPanel, SectionHead, Section, SplitText, ListPanel, CtaBanner, Card, Kicker } from '../site/ui'
import { PILLARS, PRINCIPLES, WORKING_PHILOSOPHY, QUALITY_STANDARDS, TRANSFORMATION_OUTCOMES } from '../site/content/company'
import { LOCAL, PHOTO } from '../site/media'

export default function OperatingPhilosophy() {
  usePageMeta({
    title: 'Operating Philosophy',
    description:
      'Operating in Advance: OPERAVA’s philosophy of connecting businesses, technology, talent and process — with quality-first standards and clear operating principles.',
    crumbs: [
      { name: 'About', path: '/about' },
      { name: 'Operating Philosophy', path: '/about/operating-philosophy' },
    ],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'About', to: '/about' }, { label: 'Operating Philosophy' }]} />
      <PageHero
        image={LOCAL.network}
        alt="Operating in advance"
        kicker="Operating philosophy"
        title={
          <>
            Operating
            <br />
            in advance.
          </>
        }
        lead="The name OPERAVA reflects the philosophy of operating ahead of changing business needs — anticipating how technology, employment, digital services and operations are changing."
      />

      <section className="border-b border-neutral-900 py-16 lg:py-24 reveal">
        <p className="text-center text-[11px] tracking-[0.3em] uppercase text-accent font-bold mb-8">We connect</p>
        <p className="text-center text-[30px] sm:text-[40px] lg:text-[64px] font-black uppercase leading-[0.9] tracking-[-0.02em]">
          Businesses + Technology
          <br />
          <span className="text-neutral-600">+ Talent + Process</span>
        </p>
        <p className="mt-8 text-center max-w-[640px] mx-auto text-neutral-400 leading-relaxed">
          …into an environment where work can be performed efficiently, professionally and remotely.
        </p>
      </section>

      <Section>
        <SectionHead
          kicker="Three elements"
          title={
            <>
              Technology
              <br />
              <span className="text-neutral-600">with people &amp; process</span>
            </>
          }
          note="OPERAVA’s objective is not simply to move work online — it is to transform operations without compromising the quality of service or work."
        />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-3" items={PILLARS} />
        </div>
      </Section>

      <SplitText label="Digital transformation" title={<>Technology should make operations more…</>}>
        <div className="flex flex-wrap gap-3">
          {TRANSFORMATION_OUTCOMES.map((o) => (
            <span key={o} className="text-sm font-black uppercase tracking-tight px-4 py-2 border border-neutral-800 rounded-full">
              {o}
            </span>
          ))}
        </div>
        <p className="pt-4">At the same time, technology should be supported by capable people and well-designed processes.</p>
      </SplitText>

      <Section>
        <SectionHead kicker="Operating principles" title={<>What we hold to</>} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRINCIPLES.map((p, i) => (
            <Card key={p.n} accent={i === 0}>
              <Kicker className={i === 0 ? '!text-white/80' : ''}>{String(i + 1).padStart(2, '0')}</Kicker>
              <h3 className="mt-4 font-black uppercase text-xl leading-none">{p.n}</h3>
              <p className={`mt-4 text-sm leading-relaxed ${i === 0 ? 'text-white/90' : 'text-neutral-400'}`}>{p.d}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead kicker="Working philosophy" title={<>How teams work</>} />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-3" items={WORKING_PHILOSOPHY} />
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead
          kicker="Quality-first"
          title={<>Service standards</>}
          note="OPERAVA matches professionals to the requirements of each role rather than treating all staffing requirements as interchangeable."
        />
        <div className="reveal">
          <ListPanel items={QUALITY_STANDARDS.map((label) => ({ label }))} />
        </div>
      </Section>

      <CtaBanner
        image={PHOTO.handshake}
        kicker="Work with us"
        title="Operate ahead of what your business needs next"
        cta="Talk to us →"
        to="/contact"
        secondary={{ label: 'Remote-first model', to: '/about/remote-first-model' }}
      />
    </Page>
  )
}
