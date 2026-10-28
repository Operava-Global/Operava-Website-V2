/**
 * Navigation map — the five index.html tabs (Insights, Services, Industries,
 * Careers, About) with every subtab pointing at a real page, plus footer quick links.
 */
import { itServices, bpoServices } from '../data/services'
import { automationServices } from '../data/automationServices'
import { insightCategories, insightArticles } from '../data/insights'
import { CAREER_OPENINGS, type CareerOpening } from '../data/careersData'
import { industries } from './content/industries'
import { PHOTO, LOCAL, CAREER_PHOTO, SERVICE_PHOTO } from './media'

export interface NavLink {
  label: string
  to: string
  external?: boolean
}

export interface MegaColumn {
  heading: string
  accent?: boolean
  links?: NavLink[]
  text?: string
  cta?: NavLink
}

export interface MegaImageCard {
  title: string
  sub: string
  to: string
  image: string
}

export interface MegaFeature {
  kind: 'image' | 'panel'
  kicker: string
  title: string
  to: string
  image?: string
  cta?: string
}

export interface MegaTab {
  id: 'insights' | 'services' | 'industries' | 'careers' | 'about'
  label: string
  to: string
  /** grid columns inside the col-span-4 area */
  cols: 3 | 4
  columns: MegaColumn[]
  imageCards?: MegaImageCard[]
  feature: MegaFeature
  /** one-line description used in the mobile drawer */
  blurb: string
}

/* ---------- path helpers ---------- */

export const serviceHref = (cat: 'it' | 'bpo' | 'automation', slug: string) => `/services/${cat}/${slug}`

export const ROLE_SLUG: Record<CareerOpening['code'], string> = {
  tech: 'technology-executive',
  ops: 'business-operations-executive',
  cx: 'customer-experience-executive',
}
export const roleHref = (o: CareerOpening) => `/careers/roles/${ROLE_SLUG[o.code]}`
export const roleBySlug = (slug: string) => CAREER_OPENINGS.find((o) => ROLE_SLUG[o.code] === slug)

export const insightHref = (cat: string, article?: string) => (article ? `/insights/${cat}/${article}` : `/insights/${cat}`)

export const INSIGHT_IMAGE: Record<string, string> = {
  automation: '/media/operava-scene-operava-digital-transformation-collaboration.webp',
  'information-technology': '/media/operava-scene-operava-cloud-operations-command-center.webp',
  outsourcing: '/media/operava-scene-friendly-operava-support-team.webp',
  offshoring: '/media/operava-scene-warm-remote-work-welcome.webp',
  'global-operations': '/media/operava-scene-bright-virtual-team-connection.webp',
  'business-processes': '/media/operava-scene-collaborative-operava-roadmap-meeting.webp',
  workforce: '/media/operava-scene-operava-career-growth-workshop.webp',
  'business-growth': '/media/operava-scene-operava-team-analyzing-performance-dashboards.webp',
}

const shortName = (name: string) =>
  name
    .replace('Web & Mobile Application Development', 'Web & Mobile Apps')
    .replace('SaaS & Platform Development', 'SaaS & Platforms')
    .replace('IT Systems Development', 'IT Systems')

const cat = (slug: string) => insightCategories.find((c) => c.slug === slug)!
const article = (slug: string) => insightArticles.find((a) => a.slug === slug)!

/* ---------- mega menu ---------- */

export const MEGA_TABS: MegaTab[] = [
  {
    id: 'insights',
    label: 'Insights',
    to: '/insights',
    cols: 4,
    blurb: 'Practical guides on automation, technology, outsourcing and global operations.',
    columns: [
      {
        heading: 'Featured',
        accent: true,
        links: ['automation', 'information-technology', 'outsourcing', 'offshoring', 'global-operations'].map((s) => ({
          label: cat(s).name,
          to: insightHref(s),
        })).concat([{ label: 'Free Learning Hub', to: '/learning' }]),
      },
      {
        heading: 'Trending',
        links: ['what-is-business-process-outsourcing', 'what-is-business-process-automation', 'dedicated-teams-versus-individual-hiring'].map((s) => {
          const a = article(s)
          return { label: a.title, to: insightHref(a.categorySlug, a.slug) }
        }),
      },
      {
        heading: 'Operations Lens',
        links: ['business-processes', 'workforce', 'business-growth'].map((s) => ({ label: cat(s).name, to: insightHref(s) })),
      },
      { heading: 'Explore', links: [{ label: 'Public YouTube Lessons', to: '/learning' }], cta: { label: 'View all Insights →', to: '/insights' } },
    ],
    feature: {
      kind: 'image',
      kicker: 'Guide',
      title: 'When outsourcing makes operational sense',
      to: insightHref('business-growth', 'when-outsourcing-makes-operational-sense'),
      image: PHOTO.analyst,
    },
  },
  {
    id: 'services',
    label: 'Services',
    to: '/services',
    cols: 4,
    blurb: 'Information Technology, Business Process Outsourcing and Automation — one professional to multiple teams.',
    columns: [
      {
        heading: 'Core',
        accent: true,
        links: [
          { label: 'Information Technology', to: '/services/it' },
          { label: 'Business Process Outsourcing', to: '/services/bpo' },
          { label: 'Automation', to: '/services/automation' },
          { label: 'Engagement Models', to: '/services/engagement-models' },
          { label: 'Business Risks & Controls', to: '/insights/outsourcing-risks' },
          { label: 'Request a Quote', to: '/quote' },
        ],
        cta: { label: 'View all Services →', to: '/services' },
      },
      { heading: 'Technology', links: itServices.map((s) => ({ label: shortName(s.name), to: serviceHref('it', s.slug) })) },
      { heading: 'Outsourcing', links: bpoServices.map((s) => ({ label: s.name, to: serviceHref('bpo', s.slug) })) },
      {
        heading: 'Automation',
        links: automationServices.slice(0, 7).map((s) => ({ label: s.name, to: serviceHref('automation', s.slug) })),
        cta: { label: 'All Automation →', to: '/services/automation' },
      },
    ],
    feature: {
      kind: 'image',
      kicker: 'Featured',
      title: 'One professional, one team or multiple teams — built around your operation',
      to: '/services/engagement-models',
      image: PHOTO.handshake,
    },
  },
  {
    id: 'industries',
    label: 'Industries',
    to: '/industries',
    cols: 4,
    blurb: 'Technology and BPO capabilities adapted to the way each industry operates.',
    imageCards: industries.slice(0, 3).map((i) => ({ title: i.name, sub: i.short, to: `/industries/${i.slug}`, image: i.image })),
    columns: [
      {
        heading: '',
        links: industries.slice(3).map((i) => ({ label: i.name, to: `/industries/${i.slug}` })),
        cta: { label: 'All Industries →', to: '/industries' },
      },
    ],
    feature: {
      kind: 'panel',
      kicker: 'Industry Coverage',
      title: 'Capabilities adapted across 19 industries',
      to: '/industries',
      cta: 'Explore',
    },
  },
  {
    id: 'careers',
    label: 'Careers',
    to: '/careers',
    cols: 3,
    blurb: 'Remote-first careers in technology, business operations and customer experience.',
    columns: [
      {
        heading: 'Life at OPERAVA',
        accent: true,
        links: [
          { label: 'Life at OPERAVA', to: '/careers/life-at-operava' },
          { label: 'Talent Development', to: '/careers/talent-development' },
          { label: 'OPERAVA Academy', to: '/academy' },
          { label: 'Business Risks & Controls', to: '/insights/outsourcing-risks' },
      { label: 'Free Learning Hub', to: '/learning' },
        ],
      },
      {
        heading: 'Jobs',
        links: [
          ...CAREER_OPENINGS.map((o) => ({ label: o.shortTitle, to: roleHref(o) })),
          { label: 'All Open Roles', to: '/careers#open-roles' },
        ],
      },
      {
        heading: 'Hiring',
        links: [
          { label: 'Hiring Process', to: '/careers/hiring-process' },
          { label: 'Apply Now', to: '/apply' },
        ],
        text: 'Build a career on your skills — not your location.',
      },
    ],
    feature: {
      kind: 'image',
      kicker: 'We’re hiring',
      title: 'Grow here. Work from anywhere.',
      to: '/careers',
      image: CAREER_PHOTO.tech,
    },
  },
  {
    id: 'about',
    label: 'About',
    to: '/about',
    cols: 3,
    blurb: 'A Philippine-based technology, workforce and BPO company — operating remotely and globally.',
    columns: [
      {
        heading: 'Who we are',
        accent: true,
        links: [
          { label: 'About OPERAVA', to: '/about' },
          { label: 'Operating Philosophy', to: '/about/operating-philosophy' },
          { label: 'Remote-First Model', to: '/about/remote-first-model' },
          { label: 'Corporate Registration', to: '/about/corporate-registration' },
        ],
      },
      {
        heading: 'Connect',
        links: [
          { label: 'Contact Us', to: '/contact' },
          { label: 'Contact Directory', to: '/contacts' },
          { label: 'Document Verification', to: '/verification' },
          { label: 'Payment Portal', to: '/payment-portal' },
          { label: 'FAQ', to: '/faq' },
        ],
      },
      {
        heading: '',
        text: 'OPERAVA connects technology, skilled professionals and business processes to help organizations operate more efficiently — remotely and across borders.',
      },
    ],
    feature: {
      kind: 'image',
      kicker: 'Operating in Advance',
      title: 'Make work and services accessible — anytime, anywhere',
      to: '/about',
      image: SERVICE_PHOTO['it-consulting'],
    },
  },
]

/* ---------- footer quick links ---------- */

export const FOOTER_COLUMNS: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Insights',
    links: [
      { label: 'Automation', to: insightHref('automation') },
      { label: 'Technology', to: insightHref('information-technology') },
      { label: 'Outsourcing', to: insightHref('outsourcing') },
      { label: 'Global Operations', to: insightHref('global-operations') },
      { label: 'All Insights', to: '/insights' },
      { label: 'Free Learning Hub', to: '/learning' },
      { label: 'Free Tools', to: '/utilities/', external: true },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Information Technology', to: '/services/it' },
      { label: 'Outsourcing (BPO)', to: '/services/bpo' },
      { label: 'Automation', to: '/services/automation' },
      { label: 'Engagement Models', to: '/services/engagement-models' },
      { label: 'Request a Quote', to: '/quote' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Industries', to: '/industries' },
      { label: 'Careers', to: '/careers' },
      { label: 'Partnerships', to: '/partnerships' },
      { label: 'Contact Directory', to: '/contacts' }
      { label: 'Verification', to: '/verification' },
      { label: 'Payment Portal', to: '/payment-portal' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Refund Policy', to: '/refund-policy' },
      { label: 'Cookie Policy', to: '/cookie-policy' },
    ],
  },
]
