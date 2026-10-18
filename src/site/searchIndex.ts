import { itServices, bpoServices } from '../data/services'
import { automationServices } from '../data/automationServices'
import { insightCategories, insightArticles } from '../data/insights'
import { CAREER_OPENINGS } from '../data/careersData'
import { industries } from './content/industries'
import { serviceHref, roleHref, insightHref } from './nav'

export interface SearchEntry {
  title: string
  path: string
  section: string
  text: string
}

const pages: SearchEntry[] = [
  { title: 'Home', path: '/', section: 'OPERAVA', text: 'operating in advance technology workforce outsourcing' },
  { title: 'All Services', path: '/services', section: 'Services', text: 'it bpo automation catalog' },
  { title: 'Information Technology', path: '/services/it', section: 'Services', text: 'software web mobile saas systems programming consulting integration database cloud' },
  { title: 'Business Process Outsourcing', path: '/services/bpo', section: 'Services', text: 'bpo customer service support help desk back office data entry document virtual assistant' },
  { title: 'Automation', path: '/services/automation', section: 'Services', text: 'workflow ai automation email lead reporting document hr finance' },
  { title: 'Engagement Models', path: '/services/engagement-models', section: 'Services', text: 'dedicated team project staff augmentation one professional multiple teams pricing billing' },
  { title: 'Industries', path: '/industries', section: 'Industries', text: 'verticals sectors' },
  { title: 'Insights', path: '/insights', section: 'Insights', text: 'articles guides research' },
  { title: 'Free Learning Hub', path: '/learning', section: 'Learning', text: 'free public youtube videos artificial intelligence AI automation power automate n8n python javascript programming data analytics sql machine learning courses lessons' },
  { title: 'Careers', path: '/careers', section: 'Careers', text: 'jobs hiring remote work open roles' },
  { title: 'Life at OPERAVA', path: '/careers/life-at-operava', section: 'Careers', text: 'benefits remote flexible culture' },
  { title: 'Hiring Process', path: '/careers/hiring-process', section: 'Careers', text: 'interview assessment recruitment steps' },
  { title: 'Talent Development', path: '/careers/talent-development', section: 'Careers', text: 'scholarship training mentorship accessibility students mothers' },
  { title: 'Apply Now', path: '/apply', section: 'Careers', text: 'application form resume' },
  { title: 'OPERAVA Academy', path: '/academy', section: 'Careers', text: 'learning courses certifications training' },
  { title: 'About OPERAVA', path: '/about', section: 'About', text: 'company profile mission philippines' },
  { title: 'Operating Philosophy', path: '/about/operating-philosophy', section: 'About', text: 'culture principles quality technology people process' },
  { title: 'Remote-First Model', path: '/about/remote-first-model', section: 'About', text: 'remote global talent expansion vision pagudpud' },
  { title: 'Corporate Registration', path: '/about/corporate-registration', section: 'About', text: 'sec bir registration compliance opc data privacy' },
  { title: 'Contact Us', path: '/contact', section: 'Contact', text: 'inquiry talk to us email' },
  { title: 'Request a Quote', path: '/quote', section: 'Contact', text: 'quotation proposal pricing' },
  { title: 'Contact Directory', path: '/contacts', section: 'Contact', text: 'email hr billing compliance whatsapp departments' },
  { title: 'Document Verification', path: '/verification', section: 'Contact', text: 'verify certificate reference id' },
  { title: 'Payment Portal', path: '/payment-portal', section: 'Contact', text: 'pay invoice billing' },
  { title: 'FAQ', path: '/faq', section: 'Contact', text: 'questions answers help' },
  { title: 'Privacy Policy', path: '/privacy', section: 'Legal', text: 'data privacy personal information ra 10173' },
  { title: 'Terms & Conditions', path: '/terms', section: 'Legal', text: 'terms of service agreement' },
  { title: 'Refund Policy', path: '/refund-policy', section: 'Legal', text: 'refund cancellation credits' },
  { title: 'Cookie Policy', path: '/cookie-policy', section: 'Legal', text: 'cookies tracking preferences' },
]

export const SEARCH_INDEX: SearchEntry[] = [
  ...pages,
  ...itServices.map((s) => ({ title: s.name, path: serviceHref('it', s.slug), section: 'Technology', text: s.shortDescription })),
  ...bpoServices.map((s) => ({ title: s.name, path: serviceHref('bpo', s.slug), section: 'Outsourcing', text: s.shortDescription })),
  ...automationServices.map((s) => ({ title: s.name, path: serviceHref('automation', s.slug), section: 'Automation', text: s.shortDescription })),
  ...industries.map((i) => ({ title: i.name, path: `/industries/${i.slug}`, section: 'Industries', text: i.short })),
  ...insightCategories.map((c) => ({ title: c.name, path: insightHref(c.slug), section: 'Insights', text: c.cardDescription })),
  ...insightArticles.map((a) => ({ title: a.title, path: insightHref(a.categorySlug, a.slug), section: 'Insights', text: a.excerpt })),
  ...CAREER_OPENINGS.map((o) => ({ title: o.shortTitle, path: roleHref(o), section: 'Careers', text: `${o.desc} ${o.assignments.join(' ')}` })),
]

export function searchSite(query: string, limit = 8): SearchEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  return SEARCH_INDEX.map((e) => {
    const title = e.title.toLowerCase()
    const body = `${e.section} ${e.text}`.toLowerCase()
    let score = 0
    for (const t of terms) {
      if (title.startsWith(t)) score += 6
      else if (title.includes(t)) score += 4
      else if (body.includes(t)) score += 1
      else return { e, score: -1 }
    }
    return { e, score }
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.e)
}
