import { useParams } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, ImageCard, Section, SectionHead, ListPanel, CtaBanner } from '../site/ui'
import { getCategory, getArticlesByCategory, insightCategories } from '../data/insights'
import { INSIGHT_IMAGE, insightHref } from '../site/nav'
import { PHOTO } from '../site/media'
import NotFound from './NotFound'

export default function InsightCategory() {
  const { categorySlug = '' } = useParams<{ categorySlug: string }>()
  const cat = getCategory(categorySlug)

  usePageMeta({
    title: cat ? `${cat.name} — Insights` : 'Insights',
    description: cat ? cat.introduction : 'OPERAVA Insights',
    crumbs: cat
      ? [
          { name: 'Insights', path: '/insights' },
          { name: cat.name, path: insightHref(cat.slug) },
        ]
      : [],
  })

  if (!cat) return <NotFound />
  const articles = getArticlesByCategory(cat.slug)
  const related = articles[0]?.relatedServiceHref

  return (
    <Page>
      <Crumbs items={[{ label: 'Insights', to: '/insights' }, { label: cat.name }]} />
      <PageHero image={INSIGHT_IMAGE[cat.slug]} alt={cat.name} kicker="Insights · Topic" title={cat.name} lead={cat.introduction} />

      <Section>
        <SectionHead kicker={`${articles.length} guides`} title={<>Read the guides</>} note={cat.cardDescription} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <ImageCard
              key={a.slug}
              image={INSIGHT_IMAGE[cat.slug]}
              kicker={`${a.readingMinutes} min read · ${a.published}`}
              title={a.title}
              desc={a.excerpt}
              to={insightHref(cat.slug, a.slug)}
              cta="Read guide →"
              imgHeight="h-[200px]"
            />
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <SectionHead kicker="Topics" title={<>Other topics</>} />
        <div className="reveal">
          <ListPanel items={insightCategories.filter((c) => c.slug !== cat.slug).map((c) => ({ label: c.name, to: insightHref(c.slug) }))} />
        </div>
      </Section>

      <CtaBanner
        image={PHOTO.analyst}
        kicker={cat.name}
        title="Need help applying this to your operation?"
        cta="Talk to us →"
        to="/contact"
        secondary={related ? { label: articles[0].relatedServiceLabel, to: related } : undefined}
      />
    </Page>
  )
}
