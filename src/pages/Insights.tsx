import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, ImageCard, NumberPanel, SectionHead, Section, CtaBanner } from '../site/ui'
import { insightCategories, insightArticles } from '../data/insights'
import { INSIGHT_IMAGE, insightHref } from '../site/nav'
import { LOCAL, PHOTO } from '../site/media'

export default function Insights() {
  usePageMeta({
    title: 'Insights',
    description:
      'OPERAVA Insights — practical guides on automation, information technology, outsourcing, offshoring, global operations, business processes, workforce and growth.',
    crumbs: [{ name: 'Insights', path: '/insights' }],
  })

  const catName = (slug: string) => insightCategories.find((c) => c.slug === slug)?.name || ''
  const featured = ['what-is-business-process-outsourcing', 'what-is-business-process-automation', 'what-does-global-operations-mean']
    .map((s) => insightArticles.find((a) => a.slug === s))
    .filter(Boolean) as typeof insightArticles

  return (
    <Page>
      <Crumbs items={[{ label: 'Insights' }]} />
      <PageHero
        image={LOCAL.aiDashboard}
        alt="Operational insights"
        kicker="Insights"
        title={
          <>
            Ideas for
            <br />
            operating in advance
          </>
        }
        lead="Practical, plain-language guides for business owners and operators deciding what to automate, build, outsource or scale."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
        {featured.map((a) => (
          <ImageCard
            key={a.slug}
            image={INSIGHT_IMAGE[a.categorySlug]}
            kicker={catName(a.categorySlug)}
            title={a.title}
            desc={a.excerpt}
            to={insightHref(a.categorySlug, a.slug)}
            cta="Read guide →"
            imgHeight="h-[260px]"
          />
        ))}
      </div>

      <Section>
        <SectionHead
          kicker="Topics"
          title={
            <>
              Explore
              <br />
              <span className="text-neutral-600">by topic</span>
            </>
          }
          note={`${insightCategories.length} topics · ${insightArticles.length} guides`}
        />
        <div className="reveal">
          <NumberPanel
            cols="lg:grid-cols-4"
            size="md"
            items={insightCategories.map((c) => ({ n: c.name, d: c.cardDescription, to: insightHref(c.slug) }))}
          />
        </div>
      </Section>

      <Section className="!pt-0" id="all-guides">
        <SectionHead kicker="Library" title={<>All guides</>} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insightArticles.map((a) => (
            <ImageCard
              key={a.slug}
              image={INSIGHT_IMAGE[a.categorySlug]}
              kicker={`${catName(a.categorySlug)} · ${a.readingMinutes} min`}
              title={a.title}
              desc={a.excerpt}
              to={insightHref(a.categorySlug, a.slug)}
              cta="Read guide →"
              imgHeight="h-[180px]"
            />
          ))}
        </div>
      </Section>

      <CtaBanner
        image={PHOTO.analyst}
        kicker="Apply it"
        title="Turn the ideas into an operating plan"
        cta="Talk to us →"
        to="/contact"
        secondary={{ label: 'Browse services', to: '/services' }}
      />
    </Page>
  )
}
