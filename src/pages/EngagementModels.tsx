import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, NumberPanel, SectionHead, Section, SplitText, Bullets, CtaBanner, Card, Kicker } from '../site/ui'
import { DELIVERY_MODELS, ENGAGEMENT_MODELS, ENGAGEMENT_STEPS, CLIENT_SIZES } from '../site/content/company'
import { PHOTO } from '../site/media'

export default function EngagementModels() {
  usePageMeta({
    title: 'Engagement Models',
    description:
      'How OPERAVA engagements work: one professional, one team or multiple teams; dedicated teams, project-based delivery or staff augmentation; proposal-based pricing.',
    crumbs: [
      { name: 'Services', path: '/services' },
      { name: 'Engagement Models', path: '/services/engagement-models' },
    ],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'Services', to: '/services' }, { label: 'Engagement Models' }]} />
      <PageHero
        image={PHOTO.handshake}
        alt="OPERAVA engagement"
        kicker="Engagement models"
        title={
          <>
            Build only the
            <br />
            capacity you need
          </>
        }
        lead="The client should not have to build more internal capacity than the business actually needs. Start with one professional and scale to teams as the business grows."
      />

      <Section>
        <SectionHead
          kicker="Structure"
          title={
            <>
              One, one team
              <br />
              <span className="text-neutral-600">or many</span>
            </>
          }
          note="Business Process Outsourcing and technology work can be structured around your actual requirements."
        />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-3" items={DELIVERY_MODELS} />
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead
          kicker="Engagement types"
          title={
            <>
              How we
              <br />
              work together
            </>
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ENGAGEMENT_MODELS.map((m, i) => (
            <Card key={m.n} accent={i === 0}>
              <p className={`text-[10px] tracking-widest uppercase font-bold ${i === 0 ? 'text-white/80' : 'text-accent'}`}>{m.tag}</p>
              <h3 className="mt-4 font-black uppercase text-2xl leading-none">{m.n}</h3>
              <p className={`mt-4 text-sm leading-relaxed ${i === 0 ? 'text-white/90' : 'text-neutral-400'}`}>{m.d}</p>
              <ul className="mt-8 space-y-3">
                {m.points.map((pt) => (
                  <li key={pt} className={`flex gap-3 text-sm ${i === 0 ? 'text-white' : 'text-neutral-300'}`}>
                    <span aria-hidden className={`mt-[7px] w-1.5 h-1.5 shrink-0 ${i === 0 ? 'bg-white' : 'bg-accent'}`} />
                    {pt}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead
          kicker="Client size"
          title={
            <>
              From small business
              <br />
              <span className="text-neutral-600">to enterprise</span>
            </>
          }
        />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-4" size="md" items={CLIENT_SIZES} />
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead kicker="Process" title={<>How an engagement runs</>} />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-5" size="md" items={ENGAGEMENT_STEPS} />
        </div>
      </Section>

      <SplitText label="Pricing & service levels" title={<>Proposal-based</>}>
        <p>
          OPERAVA does not publish fixed prices. Each engagement is quoted from its scope — the functions involved, volumes, coverage hours,
          tools, security requirements and the delivery model.
        </p>
        <Bullets
          items={[
            'Dedicated team members are invoiced monthly, with no hidden setup charges.',
            'Project-based work is invoiced against agreed milestones and client sign-off.',
            'Service levels, response targets, reporting and escalation paths are agreed in each proposal and contract.',
            'For dedicated roles, you take part in interviews and approve every professional placed on your account.',
          ]}
        />
      </SplitText>

      <div className="py-12 border-t border-neutral-900 grid grid-cols-1 lg:grid-cols-12 gap-8 reveal">
        <div className="lg:col-span-4">
          <Kicker>Not sure where to start?</Kicker>
        </div>
        <p className="lg:col-span-8 text-sm text-neutral-400 leading-relaxed max-w-[760px]">
          Describe the work in the inquiry form or ask AVA. If you need several functions, OPERAVA will clarify them and recommend a combined or
          multi-team IT and BPO engagement.
        </p>
      </div>

      <CtaBanner
        image={PHOTO.analyst}
        kicker="Request a quote"
        title="Tell us the functions — we will propose the team"
        cta="Request a quote →"
        to="/quote"
        secondary={{ label: 'Browse services', to: '/services' }}
      />
    </Page>
  )
}
