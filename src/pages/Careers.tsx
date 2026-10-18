import { Link } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import { Img, Page, Crumbs, PageHero, NumberPanel, SectionHead, Section, Card, CtaBanner, OutlineButton, ArrowLink } from '../site/ui'
import { CAREER_OPENINGS } from '../data/careersData'
import { CAREER_PERKS, HIRING_STEPS } from '../site/content/company'
import { roleHref } from '../site/nav'
import { CAREER_PHOTO, PHOTO } from '../site/media'

export default function Careers() {
  usePageMeta({
    title: 'Careers',
    description:
      'Remote-first careers at OPERAVA Global Solutions: Technology Executive, Business Operations Executive and Customer Experience Executive tracks for professionals in the Philippines and globally.',
    crumbs: [{ name: 'Careers', path: '/careers' }],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'Careers' }]} />
      <PageHero
        image={CAREER_PHOTO.tech}
        alt="OPERAVA careers"
        pill="We’re hiring"
        height="h-[600px] lg:h-[640px]"
        title={
          <>
            Grow here.
            <br />
            Work from
            <br />
            anywhere.
          </>
        }
        lead="Build skills for the future with a remote-first company connecting technology, skilled professionals and business processes across markets."
      />

      <Section id="open-roles">
        <SectionHead
          kicker="Open roles"
          title={
            <>
              Three tracks,
              <br />
              <span className="text-neutral-600">every level</span>
            </>
          }
          note="Associate to senior. You may be assigned to specific related tasks on available posts based on your skills."
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CAREER_OPENINGS.map((o) => (
            <div key={o.id} className="bg-[#0a0a0a] border border-neutral-900 rounded-[12px] overflow-hidden hover:border-white transition-colors flex flex-col reveal spotlight">
              <Link to={roleHref(o)} className="block h-[200px] overflow-hidden group" tabIndex={-1} aria-hidden>
                <Img src={CAREER_PHOTO[o.code]} alt="" className="w-full h-full object-cover brightness-[0.8] group-hover:scale-[1.05] transition-transform duration-700" />
              </Link>
              <div className="p-8 flex flex-col flex-1">
                <p className="text-[10px] tracking-widest uppercase text-accent font-bold">{o.type}</p>
                <h3 className="mt-3 text-[20px] font-bold uppercase leading-tight">
                  <Link to={roleHref(o)} className="hover:text-accent transition-colors">
                    {o.shortTitle}
                  </Link>
                </h3>
                <p className="mt-2 text-xs text-neutral-500 uppercase tracking-widest">{o.location}</p>
                <p className="mt-4 text-sm text-neutral-400 leading-relaxed">{o.desc}</p>
                <div className="mt-auto pt-8 flex flex-wrap items-center gap-5">
                  <OutlineButton to={`/apply?position=${encodeURIComponent(o.title)}`} size="sm">
                    Apply →
                  </OutlineButton>
                  <Link to={roleHref(o)} className="text-[11px] tracking-widest uppercase border-b border-white pb-1 hover:text-accent hover:border-accent transition-colors">
                    View role
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead
          kicker="Why OPERAVA"
          title={
            <>
              Built for
              <br />
              <span className="text-neutral-600">remote careers</span>
            </>
          }
        />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-4" size="md" items={CAREER_PERKS} />
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead kicker="Hiring process" title={<>Five steps</>} note="From first evaluation to your first day." />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-5" size="md" items={HIRING_STEPS} />
        </div>
        <div className="mt-8 reveal">
          <ArrowLink to="/careers/hiring-process">See the hiring process →</ArrowLink>
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4">
        <Card>
          <h3 className="font-black uppercase text-xl">Life at OPERAVA</h3>
          <p className="mt-3 text-sm text-neutral-400">Remote-first work, international exposure and clear growth paths.</p>
          <ArrowLink to="/careers/life-at-operava" className="mt-8">
            Explore →
          </ArrowLink>
        </Card>
        <Card>
          <h3 className="font-black uppercase text-xl">Talent Development</h3>
          <p className="mt-3 text-sm text-neutral-400">Employment accessibility, mentorship and future merit-based scholarships.</p>
          <ArrowLink to="/careers/talent-development" className="mt-8">
            Explore →
          </ArrowLink>
        </Card>
        <Card accent>
          <h3 className="font-black uppercase text-xl">OPERAVA Academy</h3>
          <p className="mt-3 text-sm font-medium text-white/90">Online learning and professional certification pathways.</p>
          <Link to="/academy" className="mt-8 inline-flex items-center h-9 px-5 bg-black text-white text-[11px] tracking-widest uppercase font-bold">
            Visit Academy →
          </Link>
        </Card>
      </div>

      <CtaBanner
        image={PHOTO.developer}
        kicker="Recruitment AVA"
        title="Start with an AI-assisted first evaluation"
        cta="Open Recruitment AVA →"
        to="/ai-job-screening"
        secondary={{ label: 'Apply with the form', to: '/apply' }}
      />
    </Page>
  )
}
