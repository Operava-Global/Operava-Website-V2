import { useParams } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import {
  Page,
  Crumbs,
  PageHero,
  NumberPanel,
  SectionHead,
  Section,
  SplitText,
  Bullets,
  ListPanel,
  CtaBanner,
  SolidButton,
  OutlineButton,
} from '../site/ui'
import { SERVICE_CATEGORIES, CATEGORY_ORDER, type ServiceCat } from '../site/content/serviceCategories'
import { DELIVERY_MODELS } from '../site/content/company'
import { serviceHref } from '../site/nav'
import { PHOTO } from '../site/media'
import NotFound from './NotFound'

export default function ServiceCategory({ cat: forced }: { cat?: ServiceCat }) {
  const params = useParams<{ cat: string }>()
  const id = (forced || params.cat) as ServiceCat
  const cat = SERVICE_CATEGORIES[id]

  usePageMeta({
    title: cat ? `${cat.name} Services` : 'Services',
    description: cat ? `${cat.lead} ${cat.services.map((s) => s.name).join(', ')}.` : 'OPERAVA services',
    crumbs: cat ? [{ name: 'Services', path: '/services' }, { name: cat.name, path: `/services/${id}` }] : [],
  })

  if (!cat) return <NotFound />

  const quote = `/quote?category=${encodeURIComponent(cat.formCategory)}`

  return (
    <Page>
      <Crumbs items={[{ label: 'Services', to: '/services' }, { label: cat.name }]} />
      <PageHero
        image={cat.image}
        alt={cat.name}
        kicker={`Services · ${cat.services.length} capabilities`}
        gradient="right"
        align="center"
        brightness="brightness-[0.55]"
        title={
          <>
            {cat.title[0]}
            <br />
            {cat.title[1]}
          </>
        }
        lead={cat.lead}
      >
        <div className="mt-8 flex flex-wrap gap-4">
          <SolidButton to={quote}>Discuss your requirements →</SolidButton>
          <OutlineButton to="/services/engagement-models" className="h-12 px-8">
            Engagement models
          </OutlineButton>
        </div>
      </PageHero>

      <div className="mt-12">
        <SplitText label="Overview" title={<>How we {id === 'bpo' ? 'operate' : id === 'it' ? 'build' : 'automate'}</>}>
          {cat.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </SplitText>
      </div>

      <Section className="!pt-4">
        <SectionHead
          kicker={cat.short}
          title={
            <>
              {cat.services.length} {cat.short === 'Automation' ? 'automation' : cat.short.toLowerCase()}
              <br />
              <span className="text-neutral-600">services</span>
            </>
          }
          note="Select a service to see what it covers, related roles, industries and common questions."
        />
        <div className="reveal">
          <NumberPanel
            cols="lg:grid-cols-4"
            size="md"
            items={cat.services.map((s) => ({ n: s.name, d: s.shortDescription, to: serviceHref(id, s.slug) }))}
          />
        </div>
      </Section>

      {cat.extras && (
        <SplitText label={cat.extras.heading} title={<>Cloud &amp; infrastructure</>}>
          <p>{cat.extras.text}</p>
          <Bullets items={cat.extras.items} twoCol className="pt-2" />
        </SplitText>
      )}

      {id !== 'automation' && (
        <Section>
          <SectionHead
            kicker="Delivery"
            title={
              <>
                One professional
                <br />
                <span className="text-neutral-600">to multiple teams</span>
              </>
            }
          />
          <div className="reveal">
            <NumberPanel cols="lg:grid-cols-3" items={DELIVERY_MODELS} />
          </div>
        </Section>
      )}

      <Section>
        <SectionHead kicker="Explore" title={<>Other services</>} />
        <div className="reveal">
          <ListPanel
            cols="lg:grid-cols-3"
            items={[
              ...CATEGORY_ORDER.filter((c) => c !== id).map((c) => ({ label: SERVICE_CATEGORIES[c].name, to: `/services/${c}` })),
              { label: 'Engagement Models', to: '/services/engagement-models' },
            ]}
          />
        </div>
      </Section>

      <CtaBanner
        image={PHOTO.handshake}
        kicker={cat.name}
        title="Tell us what you need to operate — we will scope the right team"
        cta="Request a quote →"
        to={quote}
        secondary={{ label: 'Contact us', to: '/contact' }}
      />
    </Page>
  )
}
