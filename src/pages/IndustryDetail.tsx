import { useParams } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, SectionHead, Section, SplitText, Bullets, ListPanel, CtaBanner, SolidButton, OutlineButton, Kicker, SmartLink } from '../site/ui'
import { getIndustry, industries } from '../site/content/industries'
import { findService } from '../site/content/serviceCategories'
import { serviceHref } from '../site/nav'
import { PHOTO } from '../site/media'
import NotFound from './NotFound'

export default function IndustryDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const ind = getIndustry(slug)

  usePageMeta({
    title: ind ? `${ind.name} — Industries` : 'Industries',
    description: ind ? `${ind.intro}` : 'OPERAVA industries',
    crumbs: ind
      ? [
          { name: 'Industries', path: '/industries' },
          { name: ind.name, path: `/industries/${ind.slug}` },
        ]
      : [],
    image: ind?.image,
  })

  if (!ind) return <NotFound />

  const services = ind.services
    .map((r) => ({ ref: r, found: findService(r.cat, r.slug) }))
    .filter((x) => x.found)
  const others = industries.filter((i) => i.slug !== ind.slug)
  const quote = `/quote?category=${encodeURIComponent('Combined IT & BPO')}`

  return (
    <Page>
      <Crumbs items={[{ label: 'Industries', to: '/industries' }, { label: ind.name }]} />
      <PageHero
        image={ind.image}
        alt={ind.name}
        kicker={`Industries · ${ind.tag}`}
        title={ind.name}
        lead={ind.short}
      >
        <div className="mt-8 flex flex-wrap gap-4">
          <SolidButton to={quote}>Discuss your operation →</SolidButton>
          <OutlineButton to="/industries" className="h-12 px-8">
            All industries
          </OutlineButton>
        </div>
      </PageHero>

      <div className="mt-12">
        <SplitText label="Overview" title={<>How OPERAVA helps</>}>
          <p>{ind.intro}</p>
        </SplitText>
        <SplitText label="Focus areas" title={<>Where we support</>}>
          <Bullets items={ind.focus} />
          {ind.note && <p className="pt-4 text-xs text-neutral-500 leading-relaxed">{ind.note}</p>}
        </SplitText>
      </div>

      <Section className="!pt-4">
        <SectionHead
          kicker="Services applied"
          title={
            <>
              The service
              <br />
              <span className="text-neutral-600">mix</span>
            </>
          }
          note="Typical OPERAVA services for this industry — combined into one professional, one team or multiple teams."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-neutral-900 border border-neutral-900 rounded-[12px] overflow-hidden reveal">
          {services.map(({ ref, found }, i) => (
            <SmartLink
              key={ref.slug}
              to={serviceHref(found!.cat, found!.service.slug)}
              style={{ ['--i' as string]: i }}
              className="bg-black p-8 lg:p-10 hover:bg-[#0a0a0a] transition-colors group flex flex-col reveal-child spotlight"
            >
              <p className="text-[10px] tracking-widest uppercase text-neutral-600 group-hover:text-accent transition-colors">
                {String(i + 1).padStart(2, '0')} · {found!.cat === 'it' ? 'Technology' : found!.cat === 'bpo' ? 'Outsourcing' : 'Automation'}
              </p>
              <h3 className="mt-6 text-[20px] font-black uppercase leading-[0.95]">{found!.service.name}</h3>
              <p className="mt-4 text-sm text-neutral-400 leading-relaxed">{ref.use}</p>
              <div className="mt-auto pt-8">
                <span className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                  <span className="arrow-nudge">→</span>
                </span>
              </div>
            </SmartLink>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <Kicker className="mb-6">Other industries</Kicker>
        <div className="reveal">
          <ListPanel cols="lg:grid-cols-3" items={others.map((o) => ({ label: o.name, to: `/industries/${o.slug}` }))} />
        </div>
      </Section>

      <CtaBanner
        image={PHOTO.handshake}
        kicker={ind.name}
        title="Start with one professional — scale when demand grows"
        cta="Request a quote →"
        to={quote}
        secondary={{ label: 'Engagement models', to: '/services/engagement-models' }}
      />
    </Page>
  )
}
