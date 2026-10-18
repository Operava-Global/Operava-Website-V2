import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, SectionHead, Section, SplitText, Bullets, CtaBanner, Kicker, ArrowLink } from '../site/ui'
import { HIRING_STEPS } from '../site/content/company'
import { PHOTO, CAREER_PHOTO } from '../site/media'

export default function HiringProcess() {
  usePageMeta({
    title: 'Hiring Process',
    description:
      'How OPERAVA hires: AI-assisted evaluation, skills assessment, talent acquisition interview, client alignment interview and engagement documentation.',
    crumbs: [
      { name: 'Careers', path: '/careers' },
      { name: 'Hiring Process', path: '/careers/hiring-process' },
    ],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'Careers', to: '/careers' }, { label: 'Hiring Process' }]} />
      <PageHero
        image={CAREER_PHOTO.ops}
        alt="OPERAVA hiring"
        kicker="Hiring process"
        title={
          <>
            Hiring is not
            <br />
            filling vacancies
          </>
        }
        lead="We look for professionals whose skills, work quality, reliability, communication and ability to follow client requirements fit the role."
      />

      <Section>
        <SectionHead
          kicker="Five steps"
          title={
            <>
              From application
              <br />
              <span className="text-neutral-600">to day one</span>
            </>
          }
        />
        <ol className="border-t border-neutral-900">
          {HIRING_STEPS.map((s, i) => (
            <li key={s.n} className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 py-10 border-b border-neutral-900 reveal group">
              <p className="lg:col-span-2 text-[56px] lg:text-[72px] font-black leading-none text-neutral-800 group-hover:text-accent transition-colors duration-500">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="lg:col-span-4 text-[22px] lg:text-[28px] font-black uppercase leading-[0.95] self-center">{s.n}</h3>
              <p className="lg:col-span-6 text-sm lg:text-base text-neutral-400 leading-relaxed self-center">{s.d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <SplitText label="Before you apply" title={<>Good to know</>}>
        <Bullets
          items={[
            'Apply through the online application form — please don’t send resumes by email only unless instructed.',
            'Choose the career track and specialization that best matches your experience; you can attach a resume (PDF, Word or TXT).',
            'Your email is verified with a one-time code and you receive a reference ID for your application.',
            'AI-assisted steps support — not replace — human review by the Talent Acquisition team.',
            'Personal data is processed as described in the Privacy Policy, including its section on AI-assisted recruitment.',
          ]}
        />
      </SplitText>

      <div className="py-12 border-t border-neutral-900 grid grid-cols-1 lg:grid-cols-12 gap-8 reveal">
        <div className="lg:col-span-4">
          <Kicker>Questions about an application?</Kicker>
        </div>
        <div className="lg:col-span-8 space-y-4">
          <p className="text-sm text-neutral-400 leading-relaxed max-w-[760px]">
            The Talent Acquisition team can be reached at <a className="text-white underline underline-offset-4" href="mailto:talents@operavaglobal.com">talents@operavaglobal.com</a>.
          </p>
          <ArrowLink to="/privacy">Read the Privacy Policy →</ArrowLink>
        </div>
      </div>

      <CtaBanner
        image={PHOTO.developer}
        kicker="Step one"
        title="Start your application today"
        cta="Apply now →"
        to="/apply"
        secondary={{ label: 'Browse open roles', to: '/careers#open-roles' }}
      />
    </Page>
  )
}
