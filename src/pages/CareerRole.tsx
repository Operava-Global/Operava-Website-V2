import { useParams } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, SectionHead, Section, SplitText, Bullets, Tags, NumberPanel, CtaBanner, SolidButton, OutlineButton, Stat, ListPanel } from '../site/ui'
import { SKILLS_SPECIALIZATIONS, CAREER_OPENINGS } from '../data/careersData'
import { HIRING_STEPS } from '../site/content/company'
import { roleBySlug, roleHref } from '../site/nav'
import { CAREER_PHOTO, PHOTO } from '../site/media'
import NotFound from './NotFound'

export default function CareerRole() {
  const { roleSlug = '' } = useParams<{ roleSlug: string }>()
  const role = roleBySlug(roleSlug)

  usePageMeta({
    title: role ? role.title : 'Careers',
    description: role ? `${role.title} — ${role.location}, ${role.type}. ${role.desc}` : 'OPERAVA careers',
    crumbs: role
      ? [
          { name: 'Careers', path: '/careers' },
          { name: role.shortTitle, path: roleHref(role) },
        ]
      : [],
  })

  if (!role) return <NotFound />
  const apply = `/apply?position=${encodeURIComponent(role.title)}`
  const specs = SKILLS_SPECIALIZATIONS[role.title] || []

  return (
    <Page>
      <Crumbs items={[{ label: 'Careers', to: '/careers' }, { label: role.shortTitle }]} />
      <PageHero
        image={CAREER_PHOTO[role.code]}
        alt={role.shortTitle}
        pill="Now hiring"
        title={role.shortTitle}
        lead={role.desc}
        height="h-[560px]"
      >
        <div className="mt-8 flex flex-wrap gap-4">
          <SolidButton to={apply}>Apply now →</SolidButton>
          <OutlineButton to="/ai-job-screening" className="h-12 px-8">
            Recruitment AVA
          </OutlineButton>
        </div>
      </PageHero>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8 border-y border-neutral-900 py-10 reveal">
        <Stat value={role.type.split(' (')[0]} label={role.type.includes('(') ? role.type.slice(role.type.indexOf('(') + 1, -1) : 'Employment type'} />
        <Stat value={role.location.split(' (')[0].split(' / ')[0]} label={role.location} />
        <Stat value="All levels" label={role.level} />
      </div>

      <SplitText label="The role" title={<>{role.title}</>}>
        <p>{role.desc}</p>
        <p className="text-neutral-400">
          Assignments depend on available posts and your skills. Professionals are matched to each client’s requirements rather than treated as
          interchangeable — the quality of the assigned professional directly affects the quality of the client’s operation.
        </p>
      </SplitText>

      <SplitText label="Typical assignments" title={<>What you may work on</>}>
        <Bullets items={role.assignments} />
      </SplitText>

      <SplitText label="Specializations" title={<>Skills tracks</>}>
        <p className="text-neutral-400">Choose the specialization that best fits your experience when you apply.</p>
        <div className="pt-2">
          <Tags items={specs} />
        </div>
      </SplitText>

      <Section>
        <SectionHead kicker="How hiring works" title={<>Five steps</>} />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-5" size="md" items={HIRING_STEPS} />
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead kicker="Other tracks" title={<>More open roles</>} />
        <div className="reveal">
          <ListPanel
            cols="lg:grid-cols-3"
            items={[
              ...CAREER_OPENINGS.filter((o) => o.id !== role.id).map((o) => ({ label: o.shortTitle, to: roleHref(o) })),
              { label: 'All careers', to: '/careers' },
            ]}
          />
        </div>
      </Section>

      <CtaBanner
        image={PHOTO.developer}
        kicker={role.shortTitle}
        title="Ready to apply? It takes a few minutes"
        cta="Apply now →"
        to={apply}
        secondary={{ label: 'Hiring process', to: '/careers/hiring-process' }}
      />
    </Page>
  )
}
