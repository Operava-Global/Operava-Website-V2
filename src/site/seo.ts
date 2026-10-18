import { useEffect } from 'react'
import { BASE_URL, SITE_NAME, updatePageSEO, type FAQItem } from '../utils/seo'

export interface PageMeta {
  title: string
  description: string
  /** breadcrumb trail without Home, e.g. [{ name: 'Services', path: '/services' }] */
  crumbs?: { name: string; path: string }[]
  faqs?: FAQItem[]
  image?: string
  keywords?: string
}

/** Sets document title, meta/OG tags, canonical URL and JSON-LD for the current page. */
export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/'
    const title = meta.title === SITE_NAME ? SITE_NAME : `${meta.title} | ${SITE_NAME}`
    updatePageSEO({
      title,
      description: meta.description,
      keywords: meta.keywords,
      canonicalUrl: `${BASE_URL}${path === '/' ? '/' : path}`,
      ogImage: meta.image,
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: `${BASE_URL}/` },
        ...(meta.crumbs || []).map((c) => ({ name: c.name, item: `${BASE_URL}${c.path}` })),
      ],
      faqs: meta.faqs,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.title, meta.description])
}
