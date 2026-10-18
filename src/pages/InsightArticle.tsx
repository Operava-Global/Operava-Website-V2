import { useParams } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, ImageCard, Section, SectionHead, CtaBanner, Kicker, ArrowLink } from '../site/ui'
import { getArticle, getCategory, getRelatedArticles } from '../data/insights'
import { INSIGHT_IMAGE, insightHref } from '../site/nav'
import { PHOTO } from '../site/media'
import NotFound from './NotFound'

export default function InsightArticle() {
  const { categorySlug = '', articleSlug = '' } = useParams<{ categorySlug: string; articleSlug: string }>()
  const article = getArticle(categorySlug, articleSlug)
  const cat = getCategory(categorySlug)

  usePageMeta({
    title: article ? article.title : 'Insights',
    description: article ? article.excerpt : 'OPERAVA Insights',
    crumbs:
      article && cat
        ? [
            { name: 'Insights', path: '/insights' },
            { name: cat.name, path: insightHref(cat.slug) },
            { name: article.title, path: insightHref(cat.slug, article.slug) },
          ]
        : [],
  })

  if (!article || !cat) return <NotFound />
  const related = getRelatedArticles(cat.slug, article.slug, 3)

  return (
    <Page>
      <Crumbs items={[{ label: 'Insights', to: '/insights' }, { label: cat.name, to: insightHref(cat.slug) }, { label: article.title }]} />
      <PageHero
        image={INSIGHT_IMAGE[cat.slug]}
        alt={cat.name}
        kicker={`${cat.name} · ${article.readingMinutes} min read`}
        title={article.title}
        titleClass="text-[34px] sm:text-[48px] lg:text-[68px]"
        lead={article.excerpt}
        height="h-[540px]"
      />

      <article className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 py-16">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-8 bg-[#0a0a0a] border border-neutral-900 rounded-[12px] p-8">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-500">Topic</p>
              <p className="mt-2 font-bold uppercase">{cat.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] tracking-widest uppercase text-neutral-500">Published</p>
                <p className="mt-2 text-sm">{article.published}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-neutral-500">Reviewed</p>
                <p className="mt-2 text-sm">{article.lastReviewed}</p>
              </div>
            </div>
            <nav aria-label="In this guide">
              <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-3">In this guide</p>
              <ol className="space-y-2 text-sm text-neutral-400">
                {article.sections.map((s, i) => (
                  <li key={s.heading}>
                    <a href={`#s-${i}`} className="hover:text-accent transition-colors">
                      {String(i + 1).padStart(2, '0')} — {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="pt-2">
              <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-3">Related service</p>
              <ArrowLink to={article.relatedServiceHref}>{article.relatedServiceLabel} →</ArrowLink>
            </div>
          </div>
        </aside>
        <div className="lg:col-span-8 max-w-[760px]">
          {article.sections.map((s, i) => (
            <section key={s.heading} id={`s-${i}`} className="scroll-mt-24 pb-10 mb-10 border-b border-neutral-900 last:border-0">
              <Kicker className="mb-3">{String(i + 1).padStart(2, '0')}</Kicker>
              <h2 className="text-[26px] lg:text-[32px] font-black uppercase leading-[0.95] tracking-[-0.01em]">{s.heading}</h2>
              <div className="mt-6 space-y-4 text-[15px] lg:text-base text-neutral-300 leading-[1.75]">
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </section>
          ))}
          <p className="text-xs text-neutral-500 leading-relaxed">
            This guide is general information, not professional, legal or financial advice. Outcomes depend on each organization’s processes, data,
            systems and requirements.
          </p>
        </div>
      </article>

      {related.length > 0 && (
        <Section className="!pt-0">
          <SectionHead kicker={cat.name} title={<>Keep reading</>} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((a) => (
              <ImageCard
                key={a.slug}
                image={INSIGHT_IMAGE[cat.slug]}
                kicker={`${a.readingMinutes} min read`}
                title={a.title}
                desc={a.excerpt}
                to={insightHref(cat.slug, a.slug)}
                cta="Read guide →"
                imgHeight="h-[180px]"
              />
            ))}
          </div>
        </Section>
      )}

      <CtaBanner
        image={PHOTO.analyst}
        kicker="Next step"
        title="Discuss how this applies to your business"
        cta="Talk to us →"
        to="/contact"
        secondary={{ label: article.relatedServiceLabel, to: article.relatedServiceHref }}
      />
    </Page>
  )
}
