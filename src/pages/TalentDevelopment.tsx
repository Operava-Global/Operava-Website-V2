import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, SectionHead, Section, SplitText, ListPanel, CtaBanner, Card, Kicker } from '../site/ui'
import { ACCESSIBILITY_GROUPS, DEVELOPMENT_INITIATIVES } from '../site/content/company'
import { PHOTO, CAREER_PHOTO } from '../site/media'
import { Link } from 'react-router-dom'

export default function TalentDevelopment() {
  usePageMeta({
    title: 'Talent Development',
    description:
      'OPERAVA talent development: employment accessibility through remote work, skills development, mentorship and future merit-based scholarship initiatives.',
    crumbs: [
      { name: 'Careers', path: '/careers' },
      { name: 'Talent Development', path: '/careers/talent-development' },
    ],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'Careers', to: '/careers' }, { label: 'Talent Development' }]} />
      <PageHero
        image={CAREER_PHOTO.ops}
        alt="Talent development"
        kicker="Talent development"
        title={
          <>
            Opportunity,
            <br />
            made accessible
          </>
        }
        lead="Meaningful opportunities based on skills, capability, professionalism and potential — not simply geographic proximity."
      />

      <SplitText label="Employment accessibility" title={<>Who we build for</>}>
        <p>
          OPERAVA is building a workforce model intended to make professional opportunities more accessible through remote employment. The organization
          seeks to create opportunities for:
        </p>
      </SplitText>
      <div className="reveal -mt-4 mb-6">
        <ListPanel cols="lg:grid-cols-3" items={ACCESSIBILITY_GROUPS.map((label) => ({ label }))} />
      </div>
      <p className="text-xs text-neutral-500 max-w-[760px] leading-relaxed">
        Employment eligibility, work arrangements, schedules, compensation, qualifications and legal requirements remain subject to the specific
        position and applicable laws.
      </p>

      <Section>
        <SectionHead
          kicker="Scholarship & development"
          title={
            <>
              Growing
              <br />
              <span className="text-neutral-600">digital talent</span>
            </>
          }
          note="As the organization grows, OPERAVA intends to support talent development through merit-based opportunities, learning initiatives and scholarship programs."
        />
        <div className="reveal">
          <ListPanel items={DEVELOPMENT_INITIATIVES.map((label) => ({ label }))} />
        </div>
        <p className="mt-6 text-sm text-neutral-400 max-w-[760px] leading-relaxed reveal">
          The objective is to help develop professionals who can compete in an increasingly digital and globally connected economy.
        </p>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
        <Card accent>
          <Kicker className="!text-white/80">OPERAVA Academy</Kicker>
          <h3 className="mt-4 font-black uppercase text-2xl leading-none">Learn online, get certified</h3>
          <p className="mt-4 text-sm text-white/90 leading-relaxed">Online learning and professional certification pathways for working professionals and teams.</p>
          <Link to="/academy" className="mt-8 inline-flex items-center h-9 px-5 bg-black text-white text-[11px] tracking-widest uppercase font-bold">
            Visit Academy →
          </Link>
        </Card>
        <Card>
          <Kicker>Careers</Kicker>
          <h3 className="mt-4 font-black uppercase text-2xl leading-none">Start your track</h3>
          <p className="mt-4 text-sm text-neutral-400 leading-relaxed">Technology, business operations and customer experience roles for every experience level.</p>
          <Link
            to="/careers#open-roles"
            className="mt-8 inline-flex items-center h-9 px-5 border border-white text-[11px] tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-colors"
          >
            Open roles →
          </Link>
        </Card>
      </div>

      <CtaBanner
        image={PHOTO.developer}
        kicker="Join OPERAVA"
        title="Your skills, your location, your career"
        cta="Apply now →"
        to="/apply"
        secondary={{ label: 'Life at OPERAVA', to: '/careers/life-at-operava' }}
      />
    </Page>
  )
}
