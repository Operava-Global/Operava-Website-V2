import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, NumberPanel, SectionHead, Section, SplitText, Bullets, Card, Kicker, SmartLink } from '../site/ui'
import AcademyEnrollmentForm from '../components/forms/AcademyEnrollmentForm'
import { COMPANY } from '../site/content/company'
import { PHOTO } from '../site/media'

const learningPillars = [
  {
    title: 'Online Learning',
    desc: 'Flexible, self-paced and instructor-supported programs designed for working professionals, remote teams and lifelong learners — accessible anytime, anywhere.',
    points: [
      'Structured digital courses with practical exercises',
      'Live and recorded sessions for different schedules',
      'Progress tracking and completion records',
      'Aligned with real workplace skills and OPERAVA delivery practice',
    ],
  },
  {
    title: 'Professional Certifications',
    desc: 'Focused certification pathways in Artificial Intelligence, Human Resources and Leadership — built for career mobility and organizational capability.',
    points: [
      'Industry-relevant curriculum and assessments',
      'Certificates issued upon successful completion',
      'Pathways from foundational to advanced levels',
      'Suitable for individuals and sponsored corporate cohorts',
    ],
  },
  {
    title: 'Institutional Partnerships',
    desc: 'Collaborations with academic and professional institutions to support degree and diploma pathways, bridging Academy learning with formal higher-education credentials.',
    points: [
      'Partnerships for degree and diploma issuance where authorized',
      'Articulation and credit-transfer discussions with partner schools',
      'Joint programs and recognition of prior learning where applicable',
      'Clear disclosure of awarding body and credential type',
    ],
  },
]

const certificationTracks = [
  {
    title: 'Artificial Intelligence',
    subtitle: 'AI literacy to applied practice',
    topics: [
      'AI fundamentals and responsible use',
      'Prompting, evaluation and workflow design',
      'AI in business processes and automation',
      'Data awareness, privacy and human oversight',
      'Applied projects for workplace scenarios',
    ],
  },
  {
    title: 'Human Resources',
    subtitle: 'People operations and modern HR',
    topics: [
      'HR fundamentals and employee lifecycle',
      'Recruitment, onboarding and documentation',
      'Performance, engagement and workplace policy',
      'Remote and distributed workforce practices',
      'Compliance awareness and professional conduct',
    ],
  },
  {
    title: 'Leadership',
    subtitle: 'Lead teams and outcomes',
    topics: [
      'Leadership foundations and decision-making',
      'Communication, coaching and feedback',
      'Remote team leadership and accountability',
      'Operational excellence and continuous improvement',
      'Ethics, culture and stakeholder management',
    ],
  },
]

const partnershipFeatures = [
  { n: 'Degree pathways', d: 'Through approved institutional partners, learners may progress toward degree programs where the partner institution is the degree-awarding body.' },
  { n: 'Diploma programs', d: 'Diploma-level credentials developed or co-delivered with partner institutions, subject to each partner’s academic standards and regulations.' },
  { n: 'Recognition & articulation', d: 'Where agreements exist, completed Academy certifications may support admission, credit consideration or advanced standing at partner schools.' },
  { n: 'Global accessibility', d: 'Online delivery supports learners across regions while formal credentials remain governed by the issuing institution’s jurisdiction and rules.' },
]

const howItWorks = [
  { n: 'Explore programs', d: 'Review online learning options and certification tracks in AI, HR and Leadership.' },
  { n: 'Enroll or partner', d: 'Individuals enroll in open programs; organizations can sponsor cohorts. Institutions inquire about partnership frameworks.' },
  { n: 'Learn and demonstrate', d: 'Complete modules, practical work and assessments under Academy standards.' },
  { n: 'Credential outcomes', d: 'Earn OPERAVA Academy professional certificates and — where partnered — pursue diploma or degree pathways with awarding institutions.' },
]

export default function Academy() {
  usePageMeta({
    title: 'OPERAVA Academy',
    description:
      'OPERAVA Academy: online learning and professional certifications in Artificial Intelligence, Human Resources and Leadership, plus institutional partnerships for degree and diploma pathways.',
    crumbs: [
      { name: 'Careers', path: '/careers' },
      { name: 'OPERAVA Academy', path: '/academy' },
    ],
    faqs: [
      { q: 'What is OPERAVA Academy?', a: 'OPERAVA Academy delivers online learning and professional certifications in Artificial Intelligence, Human Resources and Leadership.' },
      { q: 'Does OPERAVA Academy issue university degrees?', a: 'No. Academic degrees and formal diplomas are issued only by authorized partner institutions under applicable law and their own academic governance.' },
    ],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'Careers', to: '/careers' }, { label: 'OPERAVA Academy' }]} />
      <PageHero
        image={PHOTO.developer}
        alt="OPERAVA Academy"
        pill="OPERAVA Academy"
        title={
          <>
            Learn.
            <br />
            Certify.
            <br />
            <span className="text-neutral-400">Partner.</span>
          </>
        }
        lead="Online learning and professional certifications in Artificial Intelligence, Human Resources and Leadership — with institutions supporting degree and diploma pathways."
        height="h-[600px]"
      >
        <div className="mt-8 flex flex-wrap gap-4">
          <SmartLink
            to={COMPANY.academy}
            className="inline-flex items-center h-12 px-8 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-accent-solid hover:text-white transition-colors"
          >
            Learning platform ↗
          </SmartLink>
          <SmartLink to="/learning" className="inline-flex items-center h-12 px-8 border border-accent text-xs tracking-widest font-semibold uppercase hover:bg-accent-solid hover:text-white transition-colors">Free public lessons →</SmartLink>
          <a
            href="#enroll"
            className="inline-flex items-center h-12 px-8 border border-white text-xs tracking-widest font-semibold uppercase hover:bg-white hover:text-black transition-colors"
          >
            Enrollment inquiry
          </a>
        </div>
      </PageHero>

      <Section>
        <SectionHead
          kicker="What the Academy offers"
          title={
            <>
              A practical
              <br />
              <span className="text-neutral-600">learning ecosystem</span>
            </>
          }
          note="Online education, professional certificates and formal pathways through institutional partners."
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {learningPillars.map((p, i) => (
            <Card key={p.title} accent={i === 1}>
              <Kicker className={i === 1 ? '!text-white/80' : ''}>{String(i + 1).padStart(2, '0')}</Kicker>
              <h3 className="mt-4 font-black uppercase text-2xl leading-none">{p.title}</h3>
              <p className={`mt-4 text-sm leading-relaxed ${i === 1 ? 'text-white/90' : 'text-neutral-400'}`}>{p.desc}</p>
              <ul className="mt-8 space-y-3">
                {p.points.map((pt) => (
                  <li key={pt} className={`flex gap-3 text-sm ${i === 1 ? 'text-white' : 'text-neutral-300'}`}>
                    <span aria-hidden className={`mt-[7px] w-1.5 h-1.5 shrink-0 ${i === 1 ? 'bg-white' : 'bg-accent'}`} />
                    {pt}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead kicker="Certification tracks" title={<>Three tracks</>} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1px] bg-neutral-900 border border-neutral-900 rounded-[12px] overflow-hidden reveal">
          {certificationTracks.map((t, i) => (
            <div key={t.title} style={{ ['--i' as string]: i }} className="bg-black p-8 lg:p-10 reveal-child spotlight">
              <p className="text-[10px] tracking-widest uppercase text-neutral-600">{String(i + 1).padStart(2, '0')} · {t.subtitle}</p>
              <h3 className="mt-6 text-[24px] font-black uppercase leading-[0.95]">{t.title}</h3>
              <Bullets items={t.topics} className="mt-6" />
            </div>
          ))}
        </div>
      </Section>

      <SplitText label="Online learning" title={<>Built for remote-first professionals</>}>
        <p>
          OPERAVA Academy’s online model mirrors how modern work happens: digital tools, clear outcomes and accountability. Courses combine conceptual
          foundations with practical application so learners can use skills immediately in technology, operations and people-leadership roles.
        </p>
        <Bullets
          items={[
            'Self-paced modules with optional live facilitation',
            'Assessments tied to workplace-relevant scenarios',
            'Corporate cohort options for teams and departments',
            'Records suitable for internal L&D and career development',
          ]}
        />
        <p className="text-neutral-400">
          <strong className="text-white">Who it is for:</strong> individuals building AI fluency, HR capability or leadership readiness; employers upskilling
          teams with structured, certifiable learning; and institutions seeking industry-aligned partnership models.
        </p>
      </SplitText>

      <section id="enroll" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 py-12 border-t border-neutral-900">
        <div className="lg:col-span-5">
          <Kicker>Learning Management System</Kicker>
          <h2 className="mt-4 text-[32px] lg:text-[44px] font-black uppercase leading-[0.9]">Learn on the Academy platform</h2>
          <p className="mt-6 text-sm text-neutral-400 leading-relaxed">
            Access courses, progress tracking and Academy resources through the Learning Management System. For course or training enrollment and
            program questions, use the form — submissions use the same email verification as other OPERAVA forms.
          </p>
          <SmartLink to={COMPANY.academy} className="mt-8 inline-block text-[11px] tracking-widest uppercase border-b border-white pb-2 hover:text-accent hover:border-accent">
            academy.operavaglobal.com ↗
          </SmartLink>
        </div>
        <div className="lg:col-span-7 bg-[#0a0a0a] border border-neutral-900 rounded-[12px] p-6 sm:p-8 lg:p-12">
          <Kicker className="mb-3">Secure form · email verified</Kicker>
          <h2 className="text-[26px] lg:text-[32px] font-black uppercase leading-[0.95] mb-4">Enrollment &amp; details inquiry</h2>
          <p className="mb-8 text-sm text-neutral-500">Course enrollment, training enrollment, or questions about programs and certifications.</p>
          <AcademyEnrollmentForm />
        </div>
      </section>

      <Section id="partnerships">
        <SectionHead
          kicker="Institutional partnerships"
          title={
            <>
              Degree &amp; diploma
              <br />
              <span className="text-neutral-600">pathways</span>
            </>
          }
          note="Where a degree or diploma is issued, the partner institution is the awarding body under its own authority and regulations."
        />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-4" size="md" items={partnershipFeatures} />
        </div>
        <div className="mt-6 border border-neutral-900 rounded-[12px] p-8 reveal">
          <p className="text-sm text-neutral-300 leading-relaxed max-w-[860px]">
            <strong className="text-white">Important:</strong> OPERAVA Academy professional certificates are issued by OPERAVA Global Solutions for
            completed Academy programs. Academic degrees and formal diplomas are issued only by authorized partner institutions under applicable law and
            their own academic governance. Program availability, admission and credential titles depend on each partnership agreement.
          </p>
          <a href={`mailto:${COMPANY.email.partners}`} className="mt-6 inline-block text-[11px] tracking-widest uppercase border-b border-white pb-1 hover:text-accent hover:border-accent">
            {COMPANY.email.partners} →
          </a>
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead kicker="How it works" title={<>Four steps</>} />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-4" size="md" items={howItWorks} />
        </div>
      </Section>
    </Page>
  )
}
