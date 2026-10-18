import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, SectionHead, Section, SplitText, Bullets, CtaBanner, Card, Kicker } from '../site/ui'
import { REMOTE, COMPANY } from '../site/content/company'
import { LOCAL, PHOTO } from '../site/media'

export default function RemoteFirstModel() {
  usePageMeta({
    title: 'Remote-First Model',
    description:
      'OPERAVA’s remote-first model: Philippine-built talent, global recruitment for specialized skills, an initial office in Pagudpud, Ilocos Norte, and a plan for distributed operational hubs.',
    crumbs: [
      { name: 'About', path: '/about' },
      { name: 'Remote-First Model', path: '/about/remote-first-model' },
    ],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'About', to: '/about' }, { label: 'Remote-First Model' }]} />
      <PageHero
        image={LOCAL.network}
        alt="Global network"
        kicker="Remote-first model"
        title={
          <>
            Rooted in the
            <br />
            Philippines.
            <br />
            <span className="text-neutral-400">Built for the world.</span>
          </>
        }
        lead="Services and employment opportunities that extend beyond a single physical office — supported by the people, processes and standards that keep quality high."
        height="h-[580px]"
      />

      <div className="mt-12">
        <SplitText label="The model" title={<>Remote by design</>}>
          {REMOTE.model.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </SplitText>
        <SplitText label="Global talent" title={<>Philippines first, global when needed</>}>
          {REMOTE.talent.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </SplitText>
      </div>

      <Section>
        <SectionHead
          kicker="Why remote operations matter"
          title={
            <>
              Advantages
              <br />
              <span className="text-neutral-600">on both sides</span>
            </>
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Kicker className="mb-6">For businesses</Kicker>
            <Bullets items={REMOTE.forBusinesses} />
          </Card>
          <Card>
            <Kicker className="mb-6">For professionals</Kicker>
            <Bullets items={REMOTE.forProfessionals} />
          </Card>
        </div>
        <p className="mt-8 max-w-[760px] text-sm text-neutral-400 leading-relaxed reveal">{REMOTE.quality}</p>
      </Section>

      <SplitText label="Initial office & expansion" title={<>Where we are</>}>
        {REMOTE.expansion.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="text-neutral-400">
          Initial office: <span className="text-white">{COMPANY.address}</span>
        </p>
      </SplitText>

      <section className="border-y border-neutral-900 py-16 lg:py-24 my-6 reveal">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-accent font-bold mb-8">Global vision</p>
          <p className="text-[22px] lg:text-[32px] font-light italic leading-[1.2] tracking-tight">“{REMOTE.vision}”</p>
        </div>
      </section>

      <CtaBanner
        image={PHOTO.developer}
        kicker="Remote careers"
        title="Work with international organizations — without relocating"
        cta="View careers →"
        to="/careers"
        secondary={{ label: 'Talk to us', to: '/contact' }}
      />
    </Page>
  )
}
