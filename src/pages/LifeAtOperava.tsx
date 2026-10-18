import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, NumberPanel, SectionHead, Section, SplitText, Bullets, CtaBanner, Card, Kicker } from '../site/ui'
import { CAREER_PERKS, PRINCIPLES, REMOTE } from '../site/content/company'
import { PHOTO, CAREER_PHOTO } from '../site/media'

export default function LifeAtOperava() {
  usePageMeta({
    title: 'Life at OPERAVA',
    description:
      'Life at OPERAVA: remote-first work, international exposure, continuous upskilling and clear growth paths across technology, operations and customer experience.',
    crumbs: [
      { name: 'Careers', path: '/careers' },
      { name: 'Life at OPERAVA', path: '/careers/life-at-operava' },
    ],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'Careers', to: '/careers' }, { label: 'Life at OPERAVA' }]} />
      <PageHero
        image={CAREER_PHOTO.cx}
        alt="Life at OPERAVA"
        kicker="Life at OPERAVA"
        title={
          <>
            Work that
            <br />
            travels with you
          </>
        }
        lead="Remote-first roles, distributed teams and growth based on skills, capability, professionalism and potential — not geographic proximity."
      />

      <Section>
        <SectionHead
          kicker="What to expect"
          title={
            <>
              Why people
              <br />
              <span className="text-neutral-600">join us</span>
            </>
          }
        />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-4" size="md" items={CAREER_PERKS} />
        </div>
      </Section>

      <SplitText label="Remote-first" title={<>How we work</>}>
        <p>{REMOTE.model[0]}</p>
        <p>
          Most roles are remote with working hours aligned to the team and client. Customer experience roles may follow rotational shifts to cover
          different time zones. Occasional in-person or virtual meetups are arranged when collaboration calls for them.
        </p>
        <p className="text-neutral-400">
          Work arrangements, schedules, compensation, qualifications and legal requirements remain subject to the specific position and applicable laws.
        </p>
      </SplitText>

      <SplitText label="For professionals" title={<>Why remote matters</>}>
        <Bullets items={REMOTE.forProfessionals} twoCol />
      </SplitText>

      <Section>
        <SectionHead kicker="Principles" title={<>How we operate</>} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRINCIPLES.map((p, i) => (
            <Card key={p.n}>
              <Kicker>{String(i + 1).padStart(2, '0')}</Kicker>
              <h3 className="mt-4 font-black uppercase text-xl leading-none">{p.n}</h3>
              <p className="mt-4 text-sm text-neutral-400 leading-relaxed">{p.d}</p>
            </Card>
          ))}
        </div>
      </Section>

      <CtaBanner
        image={PHOTO.developer}
        kicker="Open roles"
        title="Find your track and apply"
        cta="View open roles →"
        to="/careers#open-roles"
        secondary={{ label: 'Talent development', to: '/careers/talent-development' }}
      />
    </Page>
  )
}
