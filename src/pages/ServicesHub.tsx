import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, NumberPanel, SectionHead, Section, CtaBanner, ArrowLink } from '../site/ui'
import { SERVICE_CATEGORIES, CATEGORY_ORDER } from '../site/content/serviceCategories'
import { DELIVERY_MODELS } from '../site/content/company'
import { serviceHref } from '../site/nav'
import { LOCAL, PHOTO } from '../site/media'

export default function ServicesHub() {
  usePageMeta({
    title: 'Services',
    description:
      'OPERAVA services: Information Technology, Business Process Outsourcing and Automation — delivered remotely through one professional, one team or multiple teams.',
    crumbs: [{ name: 'Services', path: '/services' }],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'Services' }]} />
      <PageHero
        image={LOCAL.network}
        alt="Connected operations"
        kicker="Services"
        gradient="right"
        align="center"
        brightness="brightness-[0.55]"
        title={
          <>
            Technology,
            <br />
            Outsourcing &amp;
            <br />
            Automation
          </>
        }
        lead="Build, modernize, connect and operate your digital and business processes — with technology, skilled people and well-designed processes working together."
      />

      <div className="mt-12 reveal">
        <NumberPanel
          cols="lg:grid-cols-4"
          items={[
            ...CATEGORY_ORDER.map((c) => ({
              n: SERVICE_CATEGORIES[c].name,
              d: `${SERVICE_CATEGORIES[c].services.length} services. ${SERVICE_CATEGORIES[c].lead.split('—')[0].trim()}`,
              to: `/services/${c}`,
            })),
            { n: 'Engagement Models', d: 'Dedicated teams, project-based delivery or staff augmentation — sized to what the business needs.', to: '/services/engagement-models' },
          ]}
        />
      </div>

      {CATEGORY_ORDER.map((c, idx) => {
        const cat = SERVICE_CATEGORIES[c]
        return (
          <Section key={c} id={c}>
            <SectionHead
              kicker={`0${idx + 1} · ${cat.short}`}
              title={
                <>
                  {cat.title[0]}
                  <br />
                  {cat.title[1]}
                </>
              }
              note={cat.lead}
            />
            <div className="reveal">
              <NumberPanel
                cols="lg:grid-cols-4"
                size="md"
                items={cat.services.map((s) => ({ n: s.name, d: s.shortDescription, to: serviceHref(c, s.slug) }))}
              />
            </div>
            <div className="mt-8 reveal">
              <ArrowLink to={`/services/${c}`}>All {cat.name} →</ArrowLink>
            </div>
          </Section>
        )
      })}

      <Section>
        <SectionHead
          kicker="Delivery model"
          title={
            <>
              Sized to the
              <br />
              <span className="text-neutral-600">work, not more</span>
            </>
          }
          note="The client should not have to build more internal capacity than the business actually needs."
        />
        <div className="reveal">
          <NumberPanel cols="lg:grid-cols-3" items={DELIVERY_MODELS.map((m) => ({ ...m, to: '/services/engagement-models' }))} />
        </div>
      </Section>

      <CtaBanner
        image={PHOTO.handshake}
        kicker="Talk to us"
        title="Discuss the functions you need — we will recommend the right mix"
        cta="Request a quote →"
        to="/quote"
        secondary={{ label: 'Contact us', to: '/contact' }}
      />
    </Page>
  )
}
