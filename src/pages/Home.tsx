import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import { Img, NumberPanel, StoryCard, CtaBanner, SectionHead, OutlineButton } from '../site/ui'
import { LOCAL, PHOTO, SERVICE_PHOTO, CAREER_PHOTO } from '../site/media'
import { industries } from '../site/content/industries'
import { COMPANY, STATEMENT } from '../site/content/company'
import { itServices, bpoServices } from '../data/services'
import { automationServices } from '../data/automationServices'

interface Slide {
  kicker: string
  title: string
  desc: string
  img: string
  to: string
  cta: string
}

const SLIDES: Slide[] = [
  {
    kicker: 'Who we are',
    title: 'Make work and services accessible — anytime, anywhere',
    desc: 'Technology, skilled professionals and digitally enabled processes, connected remotely and globally from the Philippines.',
    img: LOCAL.dataCenter,
    to: '/about',
    cta: 'About OPERAVA',
  },
  {
    kicker: 'Information Technology',
    title: 'Build technology around your business',
    desc: 'Software, web and mobile, SaaS platforms, IT systems, programming, consulting, integration and database services.',
    img: SERVICE_PHOTO['software-development'],
    to: '/services/it',
    cta: 'Explore IT services',
  },
  {
    kicker: 'Business Process Outsourcing',
    title: 'Delegate defined processes to skilled professionals',
    desc: 'Customer service, technical support, help desk, back-office, data and document operations and virtual assistance.',
    img: SERVICE_PHOTO['customer-service'],
    to: '/services/bpo',
    cta: 'Explore BPO services',
  },
  {
    kicker: 'Automation',
    title: 'Automate repetitive work and connect your systems',
    desc: 'Workflow, AI, document, reporting and finance automation — designed around how people, systems and decisions interact.',
    img: LOCAL.aiDashboard,
    to: '/services/automation',
    cta: 'Explore automation',
  },
  {
    kicker: 'Delivery model',
    title: 'One professional. One team. Multiple teams.',
    desc: 'The client should not have to build more internal capacity than the business actually needs.',
    img: PHOTO.handshake,
    to: '/services/engagement-models',
    cta: 'See engagement models',
  },
  {
    kicker: 'Partnerships',
    title: 'Create more value together',
    desc: 'Strategic alliances, technology integrations, referral networks and delivery partnerships with a clear operational purpose.',
    img: PHOTO.handshake,
    to: '/partnerships',
    cta: 'Become a partner',
  },
  {
    kicker: 'Careers',
    title: 'Remote careers built on skills — not geography',
    desc: 'Technology, business operations and customer experience tracks for professionals across the Philippines and beyond.',
    img: CAREER_PHOTO.tech,
    to: '/careers',
    cta: 'View open roles',
  },
]

export default function Home() {
  usePageMeta({
    title: 'OPERAVA GLOBAL SOLUTIONS',
    description:
      'OPERAVA Global Solutions — Philippine-based technology, workforce and business process outsourcing company. IT services, BPO, automation and remote teams, operating remotely and globally.',
    keywords: 'OPERAVA, IT services, BPO, outsourcing, automation, remote teams, Philippines',
  })

  const [i, setI] = useState(0)
  // Autoplay is driven by the active indicator's fill animation (pauses on hover/focus,
  // and is off entirely for reduced-motion users because the animation never runs).
  const [paused, setPaused] = useState(false)
  const go = (n: number) => setI((n + SLIDES.length) % SLIDES.length)

  return (
    <>
      {/* HERO */}
      <section className="px-6 lg:px-12 pt-10 lg:pt-16 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0 items-stretch">
          <div className="lg:w-[40%] flex flex-col justify-between lg:pr-8">
            <h1 className="text-[48px] sm:text-[64px] lg:text-[length:min(6.6vw,108px)] font-black uppercase leading-[0.85] tracking-[-0.04em]">
              {['Operate,', 'Automate,', 'Accelerate.'].map((w, n) => (
                <span key={w} className="line-mask">
                  <span className={`line-rise ${n === 2 ? 'text-neutral-600' : ''}`} style={{ ['--d' as string]: `${0.15 + n * 0.12}s` }}>
                    {w}
                  </span>
                </span>
              ))}
            </h1>
            <div className="hidden lg:flex items-center gap-3 mt-10 hero-in" style={{ ['--d' as string]: '0.7s' }}>
              <a
                href="#what-we-do"
                aria-label="Scroll to explore"
                className="w-12 h-12 shrink-0 rounded-full bg-accent-solid flex items-center justify-center font-bold hover:bg-accent transition-colors relative before:absolute before:inset-0 before:rounded-full before:border before:border-accent before:animate-ping"
              >
                ↓
              </a>
              <p className="text-xs tracking-widest uppercase text-neutral-500 max-w-[220px] leading-relaxed">
                Discover how we operate, automate and accelerate business
              </p>
            </div>
          </div>

          <div className="lg:w-[60%] relative hero-in" style={{ ['--d' as string]: '0.3s' }}>
            <div aria-hidden className="hero-aura absolute -inset-10 pointer-events-none" />
            <div
              className="relative h-[600px] lg:h-[600px] bg-[#0f0f0f] rounded-[12px] border border-neutral-900 overflow-hidden glow"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={() => setPaused(false)}
              aria-roledescription="carousel"
              aria-label="Featured"
            >
              <Link
                to={SLIDES[i].to}
                aria-label={`Open: ${SLIDES[i].title}`}
                className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
              >
                ⤢
              </Link>
              <div className="absolute inset-0 overflow-hidden">
                <div className="carousel-track flex h-full w-full" style={{ transform: `translateX(-${i * 100}%)` }}>
                  {SLIDES.map((s, n) => (
                    <div
                      key={s.title}
                      className="min-w-full h-full flex flex-col lg:flex-row"
                      aria-hidden={n !== i}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${n + 1} of ${SLIDES.length}`}
                    >
                      <div className="lg:w-[45%] p-8 lg:p-10 flex flex-col justify-between">
                        <div className={n === i ? 'hero-in' : ''} style={{ ['--d' as string]: '0.25s' }}>
                          <p className="text-[10px] tracking-[0.25em] uppercase text-accent font-bold mb-6">{s.kicker}</p>
                          <h3 className="text-[26px] sm:text-[28px] lg:text-[34px] font-bold leading-[0.95] tracking-tight uppercase">{s.title}</h3>
                          <p className="mt-6 text-sm text-neutral-400 leading-relaxed">{s.desc}</p>
                        </div>
                        <Link
                          to={s.to}
                          tabIndex={n === i ? 0 : -1}
                          className="mt-8 text-[11px] tracking-widest uppercase border-b border-white w-fit pb-2 hover:border-accent hover:text-accent transition-colors lg:mb-10"
                        >
                          {s.cta} <span className="arrow-nudge">→</span>
                        </Link>
                      </div>
                      <div className="lg:w-[55%] relative flex-1 lg:h-full overflow-hidden min-h-[200px]">
                        <Img
                          src={s.img}
                          alt={s.title}
                          eager={n === 0}
                          className={`absolute inset-0 w-full h-full object-cover brightness-[0.75] ${n === i ? 'hero-zoom' : ''}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full flex items-center justify-between p-6 z-20 pointer-events-none">
                <div className="flex gap-2 pointer-events-auto">
                  {SLIDES.map((s, n) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => go(n)}
                      aria-label={`Show slide ${n + 1}: ${s.kicker}`}
                      aria-current={n === i}
                      className={`relative h-[3px] overflow-hidden transition-all duration-500 ${n === i ? 'w-10 bg-neutral-700' : 'w-6 bg-neutral-700 hover:bg-neutral-500'}`}
                    >
                      {n === i && (
                        <span
                          key={`p-${i}`}
                          className="slide-progress absolute inset-0 bg-white origin-left"
                          style={{ animationPlayState: paused ? 'paused' : 'running' }}
                          onAnimationEnd={() => go(i + 1)}
                        />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => go(i - 1)}
                    aria-label="Previous slide"
                    className="w-10 h-10 rounded-full border border-neutral-700 bg-black/40 flex items-center justify-center hover:border-white hover:bg-white hover:text-black transition-colors"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => go(i + 1)}
                    aria-label="Next slide"
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-accent-solid hover:text-white transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATEMENT */}

      <section className="border-y border-neutral-900 py-16 lg:py-20 px-6 lg:px-12 reveal">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[22px] lg:text-[34px] font-light italic leading-[1.15] tracking-tight">“{STATEMENT}”</p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-widest">{COMPANY.name}</p>
              <p className="text-[11px] text-neutral-500 uppercase tracking-widest">Company statement</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section id="what-we-do" className="px-6 lg:px-12 py-16 scroll-mt-20">
        <SectionHead
          title={
            <>
              What we
              <br />
              operate
            </>
          }
          note="Technology, outsourcing and automation — structured from one professional to multiple teams."
        />
        <div className="reveal home-card-glow rounded-[12px]">
          <NumberPanel
            cols="lg:grid-cols-4"
            items={[
              { n: 'Information Technology', d: `${itServices.length} services to build, modernize and connect your digital operations.`, to: '/services/it' },
              { n: 'Business Process Outsourcing', d: `${bpoServices.length} services that run defined business processes with skilled people.`, to: '/services/bpo' },
              { n: 'Automation', d: `${automationServices.length} automation services that remove repetitive manual work.`, to: '/services/automation' },
              { n: 'Engagement Models', d: 'Dedicated teams, project delivery or staff augmentation — sized to your needs.', to: '/services/engagement-models' },
            ]}
          />
        </div>
      </section>

      {/* INDUSTRY STORIES */}
      <section className="px-6 lg:px-12 py-16">
        <SectionHead
          title={
            <>
              Built for
              <br />
              your industry
            </>
          }
          note="Drag or scroll to explore how OPERAVA adapts technology and BPO capabilities to each industry."
        />
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory">
          {industries.slice(0, 6).map((ind, n) => (
            <StoryCard key={ind.slug} image={ind.image} tag={ind.tag} title={ind.name} sub={ind.short} to={`/industries/${ind.slug}`} delay={n * 80} className="min-w-[300px] sm:min-w-[340px] lg:min-w-[400px] h-[500px] home-card-glow" />
          ))}
          <Link
            to="/industries"
            className="min-w-[260px] h-[500px] rounded-[12px] border border-neutral-900 bg-[#0a0a0a] flex flex-col justify-end p-8 snap-start hover:border-accent/50 transition-colors group reveal home-card-glow"
          >
            <p className="text-[10px] tracking-[0.25em] uppercase text-accent font-bold">19 industries</p>
            <p className="mt-4 text-[28px] font-black uppercase leading-[0.9]">All industries</p>
            <span className="mt-6 w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
              →
            </span>
          </Link>
        </div>
      </section>

      {/* TRUST BAND */}
      <section className="px-6 lg:px-12 py-16 border-t border-neutral-900 grid grid-cols-1 lg:grid-cols-2 gap-0 reveal">
        <div className="border border-neutral-900 p-10 lg:p-14 bg-[#0a0a0a] home-card-glow">
          <p className="text-[11px] tracking-widest uppercase text-neutral-500 mb-10">Corporate registration</p>
          <h3 className="text-[34px] sm:text-[42px] font-black uppercase leading-[0.9]">
            Corporate
            <br />
            registration
            <br />
            Philippines
          </h3>
          <p className="mt-6 text-sm text-neutral-400 max-w-[360px] leading-relaxed">
            {COMPANY.registrationStatement}
          </p>
          <div className="mt-10 flex flex-col items-start gap-6">
            <img
              src="/brand/sec-registration-badge.svg"
              alt={COMPANY.registrationStatement}
              className="block w-full max-w-[420px] h-auto"
              width="940"
              height="515"
              loading="lazy"
              decoding="async"
            />
            <Link to="/about/corporate-registration" className="text-[11px] tracking-widest uppercase border-b border-white pb-1 hover:text-accent hover:border-accent transition-colors">
              Registration details →
            </Link>
          </div>
        </div>
        <div className="border border-neutral-900 lg:border-l-0 border-t-0 lg:border-t p-10 lg:p-14 bg-[#0a0a0a] home-card-glow">
          <p className="text-[11px] tracking-widest uppercase text-accent mb-10">Capabilities</p>
          <h3 className="text-[96px] font-black leading-[0.8]">{itServices.length + bpoServices.length}</h3>
          <p className="mt-2 text-[18px] font-bold uppercase">Core IT &amp; BPO services</p>
          <p className="mt-6 text-sm text-neutral-400 max-w-[360px] leading-relaxed">
            {itServices.length} Information Technology and {bpoServices.length} Business Process Outsourcing services, plus {automationServices.length} automation
            services — delivered remotely through one professional, one team or multiple teams.
          </p>
          <OutlineButton to="/services" className="mt-10">
            See services
          </OutlineButton>
        </div>
      </section>

      {/* PARTNERSHIP CTA */}
      <div className="px-6 lg:px-12 mb-8 reveal">
        <CtaBanner
          image={PHOTO.handshake}
          kicker="Partnerships"
          title="Let's build more together — explore a partnership with OPERAVA"
          cta="Propose a partnership →"
          to="/partnerships"
          secondary={{ label: 'Explore our services', to: '/services' }}
          className="home-card-glow"
        />
      </div>

      {/* CAREERS CTA */}
      <div className="px-6 lg:px-12">
        <CtaBanner
          image={PHOTO.developer}
          kicker="Careers"
          title="Build a career from anywhere — on your skills, not your location"
          cta="Join us →"
          to="/careers"
          secondary={{ label: 'Talk to us', to: '/contact' }}
          className="home-card-glow"
        />
      </div>
    </>
  )
}
