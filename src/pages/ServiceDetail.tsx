import { useParams } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import {
  Page,
  Crumbs,
  PageHero,
  SectionHead,
  Section,
  SplitText,
  Bullets,
  Tags,
  Faq,
  ImageCard,
  CtaBanner,
  SolidButton,
  OutlineButton,
  Kicker,
} from '../site/ui'
import { SERVICE_CATEGORIES, findService, type ServiceCat } from '../site/content/serviceCategories'
import { SERVICE_REFERENCES } from '../site/content/serviceReferences'
import { serviceHref } from '../site/nav'
import { servicePhoto, LOCAL, PHOTO } from '../site/media'
import NotFound from './NotFound'

const AUTOMATION_ROTATION = [LOCAL.aiDashboard, LOCAL.network, PHOTO.analyst, LOCAL.dataCenter, PHOTO.cloudEngineer]

function photoFor(cat: ServiceCat, slug: string, index: number) {
  if (cat === 'automation') return AUTOMATION_ROTATION[index % AUTOMATION_ROTATION.length]
  return servicePhoto(slug)
}

export default function ServiceDetail({ cat: forced }: { cat?: ServiceCat }) {
  const params = useParams<{ cat: string; slug: string }>()
  const found = findService(forced || params.cat || '', params.slug || '')
  const ref = found ? SERVICE_REFERENCES[found.service.slug] : undefined
  const category = found ? SERVICE_CATEGORIES[found.cat] : undefined

  usePageMeta({
    title: found ? `${found.service.name} — ${category!.name}` : 'Service',
    description: found ? found.service.description : 'OPERAVA service',
    crumbs: found
      ? [
          { name: 'Services', path: '/services' },
          { name: category!.name, path: `/services/${found.cat}` },
          { name: found.service.name, path: serviceHref(found.cat, found.service.slug) },
        ]
      : [],
    faqs: ref?.faqs,
    image: found ? photoFor(found.cat, found.service.slug, 0) : undefined,
  })

  if (!found || !category) return <NotFound />
  const { service, cat } = found
  const index = category.services.findIndex((s) => s.slug === service.slug)
  const benefits = ref?.benefits || service.benefits
  const industries = ref?.industries || service.industries
  const positions = ref?.positions || service.relatedPositions || []
  const message = ref?.message || service.serviceMessage
  const related = [1, 2, 3].map((k) => category.services[(index + k) % category.services.length]).filter((s) => s.slug !== service.slug)
  const quote = `/quote?category=${encodeURIComponent(category.formCategory)}&service=${encodeURIComponent(service.name)}`

  return (
    <Page>
      <Crumbs items={[{ label: 'Services', to: '/services' }, { label: category.name, to: `/services/${cat}` }, { label: service.name }]} />
      <PageHero
        image={photoFor(cat, service.slug, index)}
        alt={service.name}
        kicker={`${service.number} · ${category.name}`}
        gradient="right"
        align="center"
        brightness="brightness-[0.5]"
        title={service.name}
        lead={ref?.positioning || service.shortDescription}
      >
        <div className="mt-8 flex flex-wrap gap-4">
          <SolidButton to={quote}>{service.cta || 'Discuss your requirements'} →</SolidButton>
          <OutlineButton to={`/services/${cat}`} className="h-12 px-8">
            All {category.short} services
          </OutlineButton>
        </div>
      </PageHero>

      <div className="mt-12">
        <SplitText label="Overview" title={<>What it covers</>}>
          <p>{service.description}</p>
          {ref && ref.positioning !== service.description && <p className="text-neutral-400">{ref.positioning}</p>}
        </SplitText>
      </div>

      {message && (
        <section className="border-y border-neutral-900 py-16 lg:py-20 reveal">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[22px] lg:text-[32px] font-light italic leading-[1.2] tracking-tight">“{message}”</p>
            <p className="mt-8 text-[11px] text-neutral-500 uppercase tracking-widest">OPERAVA service message</p>
          </div>
        </section>
      )}

      <Section>
        <SectionHead
          kicker="Capabilities"
          title={
            <>
              What we
              <br />
              <span className="text-neutral-600">deliver</span>
            </>
          }
          note={`${service.capabilities.length} core capabilities within ${service.name}.`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-neutral-900 border border-neutral-900 rounded-[12px] overflow-hidden reveal">
          {service.capabilities.map((c, i) => (
            <div key={c} style={{ ['--i' as string]: i }} className="bg-black p-8 lg:p-10 group hover:bg-[#0a0a0a] transition-colors reveal-child spotlight">
              <p className="text-[10px] tracking-widest uppercase text-neutral-600 group-hover:text-accent transition-colors">{String(i + 1).padStart(2, '0')}</p>
              <p className="mt-5 text-[17px] font-bold leading-snug">{c}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
        <div className="bg-[#0a0a0a] border border-neutral-900 p-8 lg:p-12 rounded-[12px] reveal">
          <Kicker className="mb-6">Core benefits</Kicker>
          <Bullets items={benefits} />
        </div>
        <div className="bg-[#0a0a0a] border border-neutral-900 p-8 lg:p-12 rounded-[12px] reveal space-y-10">
          <div>
            <p className="text-[11px] tracking-widest uppercase text-neutral-500 font-bold mb-5">Related industries</p>
            <Tags items={industries} />
          </div>
          {positions.length > 0 && (
            <div>
              <p className="text-[11px] tracking-widest uppercase text-neutral-500 font-bold mb-5">Related positions</p>
              <Tags items={positions} />
            </div>
          )}
        </div>
      </section>

      {ref && ref.faqs.length > 0 && (
        <Section>
          <SectionHead kicker="Questions" title={<>Most relevant Q&amp;A</>} />
          <div className="reveal">
            <Faq items={ref.faqs} />
          </div>
        </Section>
      )}

      <Section>
        <SectionHead kicker={category.short} title={<>Related services</>} note={`More ${category.name.toLowerCase()} capabilities.`} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map((s) => (
            <ImageCard
              key={s.slug}
              image={photoFor(cat, s.slug, category.services.indexOf(s))}
              kicker={`${s.number} · ${category.short}`}
              title={s.name}
              desc={s.shortDescription}
              to={serviceHref(cat, s.slug)}
              cta="View service →"
            />
          ))}
        </div>
      </Section>

      <CtaBanner
        image={PHOTO.handshake}
        kicker={service.name}
        title="One professional, one team or multiple teams — let’s scope it"
        cta={`${service.cta || 'Discuss your requirements'} →`}
        to={quote}
        secondary={{ label: 'Engagement models', to: '/services/engagement-models' }}
      />
    </Page>
  )
}
