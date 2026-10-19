import { LOCAL } from '../media'

/**
 * Industries — source: create/Business References
 *  - OPERAVA_Global_Solutions_Profile_Background.txt §6 (industries we can support)
 *  - OPERAVA_AI_Assistant_Knowledge_Base_Company_and_Services.txt §28 (industry-based examples)
 */

export interface IndustryServiceRef {
  /** services route segment: it | bpo | automation */
  cat: 'it' | 'bpo' | 'automation'
  slug: string
  /** how the service is applied in this industry */
  use: string
}

export interface Industry {
  slug: string
  name: string
  tag: string
  short: string
  intro: string
  focus: string[]
  services: IndustryServiceRef[]
  note?: string
  image: string
}

const REGULATED =
  'Specific regulated activities may require additional licenses, permits, registrations, professional qualifications, privacy controls, security requirements, or other applicable authorizations. OPERAVA complies with the applicable requirements before providing a regulated activity.'

export const industries: Industry[] = [
  {
    slug: 'e-commerce-retail',
    name: 'E-commerce & Retail',
    tag: 'Retail',
    short: 'Customer care, catalog and order operations that scale with demand.',
    intro:
      'Online stores and retail brands run on fast, accurate customer and order handling. OPERAVA combines customer-facing teams, data operations and e-commerce technology so stores can keep up with volume without building every function in-house.',
    focus: [
      'Order support, returns and refund support',
      'Catalog data entry and product information updates',
      'E-commerce platforms, customer portals and booking systems',
      'Payment, marketplace and SaaS integrations',
      'Virtual assistants for store and marketplace operations',
    ],
    services: [
      { cat: 'bpo', slug: 'customer-service', use: 'Order, returns and customer account support across email, chat and voice.' },
      { cat: 'bpo', slug: 'data-entry', use: 'Catalog data entry, product updates and records maintenance.' },
      { cat: 'bpo', slug: 'document-processing', use: 'Invoices, receipts and supplier document handling.' },
      { cat: 'bpo', slug: 'virtual-assistance', use: 'E-commerce assistants for listings, orders and coordination.' },
      { cat: 'it', slug: 'web-mobile-development', use: 'E-commerce platforms, storefronts and mobile experiences.' },
      { cat: 'it', slug: 'systems-integration', use: 'Payment, marketplace, CRM and ERP integrations.' },
    ],
    image: '/media/operava-customer-support.webp',
  },
  {
    slug: 'saas-digital-platforms',
    name: 'SaaS & Digital Platforms',
    tag: 'Technology',
    short: 'Product engineering and user support for subscription platforms.',
    intro:
      'SaaS companies need both a platform that scales and support that keeps users successful. OPERAVA can build and extend the product while also running technical support, help desk and customer success functions around it.',
    focus: [
      'SaaS product and multi-user platform development',
      'Tier-based technical support and help desk',
      'Customer success and onboarding support',
      'Database services and cloud-related environments',
      'Integrations with the tools your customers already use',
    ],
    services: [
      { cat: 'it', slug: 'saas-platform-development', use: 'Subscription products, multi-user platforms and workflow platforms.' },
      { cat: 'it', slug: 'software-development', use: 'New features, modernization and maintenance.' },
      { cat: 'bpo', slug: 'technical-support', use: 'Product and application support, ticket handling and escalation.' },
      { cat: 'bpo', slug: 'help-desk', use: 'Ticket intake, categorization, routing and status updates.' },
      { cat: 'it', slug: 'database-services', use: 'Database design, administration and optimization.' },
      { cat: 'it', slug: 'systems-integration', use: 'API, SaaS and cloud integrations.' },
    ],
    image: '/media/operava-software-engineering.webp',
  },
  {
    slug: 'financial-services',
    name: 'Financial Services',
    tag: 'Finance',
    short: 'Accurate back-office, data and document operations with secure systems.',
    intro:
      'Financial organizations depend on precise processing, well-kept records and reliable systems. OPERAVA supports back-office, data and document workflows alongside software, database and integration work — structured around the client’s regulatory and security requirements.',
    focus: [
      'Back-office processing and account administration',
      'Data processing, validation and reconciliation',
      'Document intake, verification and records organization',
      'Customer service for account and transaction questions',
      'Software systems, databases and integrations',
    ],
    services: [
      { cat: 'bpo', slug: 'back-office-operations', use: 'Account administration, billing support and reporting.' },
      { cat: 'bpo', slug: 'data-processing', use: 'Data validation, reconciliation and quality support.' },
      { cat: 'bpo', slug: 'document-processing', use: 'Document classification, indexing and verification.' },
      { cat: 'bpo', slug: 'customer-service', use: 'Customer account and escalation support.' },
      { cat: 'it', slug: 'database-services', use: 'Database administration, optimization and migration support.' },
      { cat: 'it', slug: 'systems-integration', use: 'Payment, CRM and ERP integrations.' },
    ],
    note: REGULATED,
    image: '/media/operava-business-analytics.webp',
  },
  {
    slug: 'insurance',
    name: 'Insurance',
    tag: 'Insurance',
    short: 'Claims-related processing, documents and policyholder support.',
    intro:
      'Insurance operations involve high volumes of documents, data and customer conversations. OPERAVA can support claims-related processing, document handling and policyholder support, together with the software and systems behind them.',
    focus: [
      'Claims-related processing and records maintenance',
      'Document intake, extraction and verification',
      'Policyholder customer support',
      'Data processing and data quality support',
      'Software and systems support',
    ],
    services: [
      { cat: 'bpo', slug: 'back-office-operations', use: 'Claims-related processing and administrative operations.' },
      { cat: 'bpo', slug: 'document-processing', use: 'Document intake, data extraction and verification.' },
      { cat: 'bpo', slug: 'data-processing', use: 'Data validation, updating and reconciliation.' },
      { cat: 'bpo', slug: 'customer-service', use: 'Policyholder support across defined channels.' },
      { cat: 'it', slug: 'it-systems-development', use: 'Workflow, approval and reporting systems.' },
    ],
    note: REGULATED,
    image: '/media/operava-scene-operava-team-collaboration-in-purple-glow.webp',
  },
  {
    slug: 'healthcare-administration',
    name: 'Healthcare Administration',
    tag: 'Health',
    short: 'Administrative, document and data operations for healthcare organizations.',
    intro:
      'Healthcare administration carries heavy paperwork and scheduling load. OPERAVA supports administrative processing, document and data operations and patient-facing customer support, with privacy, security and healthcare requirements defined for each engagement.',
    focus: [
      'Administrative processing and scheduling',
      'Document processing and records organization',
      'Data operations and data quality support',
      'Customer support for patients and members',
      'Software and systems support',
    ],
    services: [
      { cat: 'bpo', slug: 'back-office-operations', use: 'Administrative operations, scheduling and records maintenance.' },
      { cat: 'bpo', slug: 'document-processing', use: 'Document classification, indexing and records organization.' },
      { cat: 'bpo', slug: 'data-processing', use: 'Data organization, validation and updating.' },
      { cat: 'bpo', slug: 'customer-service', use: 'Patient and member support through defined channels.' },
      { cat: 'it', slug: 'it-systems-development', use: 'Internal administration and workflow systems.' },
    ],
    note:
      'Healthcare engagements are subject to applicable privacy, security and healthcare requirements, which are defined contractually and technically for each engagement.',
    image: '/media/operava-team-collaboration.webp',
  },
  {
    slug: 'logistics-transportation',
    name: 'Logistics & Transportation',
    tag: 'Logistics',
    short: 'Order, documentation and help-desk support with connected systems.',
    intro:
      'Logistics runs on shipment updates, documents and systems that need to talk to each other. OPERAVA supports customer service, help desk, data entry and document processing, and builds the systems and integrations that keep operations visible.',
    focus: [
      'Customer service and shipment status support',
      'Help desk for internal users and partners',
      'Data entry and document processing',
      'Order and operations support',
      'Systems development, integration and database services',
    ],
    services: [
      { cat: 'bpo', slug: 'customer-service', use: 'Order and shipment support, escalation handling.' },
      { cat: 'bpo', slug: 'help-desk', use: 'Ticket intake, routing and status updates.' },
      { cat: 'bpo', slug: 'data-entry', use: 'ERP and database entry, records updating.' },
      { cat: 'bpo', slug: 'document-processing', use: 'Shipping and supplier document handling.' },
      { cat: 'it', slug: 'it-systems-development', use: 'Operations management and reporting systems.' },
      { cat: 'it', slug: 'systems-integration', use: 'Application-to-application and ERP integrations.' },
    ],
    image: '/media/operava-scene-operava-data-center-operations.webp',
  },
  {
    slug: 'real-estate',
    name: 'Real Estate',
    tag: 'Property',
    short: 'Virtual assistants, CRM support and property portals.',
    intro:
      'Real estate teams juggle leads, listings, documents and appointments. OPERAVA provides virtual assistance, administrative and CRM support, and builds the websites, portals and workflow systems agents and property managers rely on.',
    focus: [
      'Virtual assistants and administrative support',
      'CRM administration and lead follow-up support',
      'Data entry and document processing',
      'Customer service for buyers, tenants and owners',
      'Websites, portals and workflow systems',
    ],
    services: [
      { cat: 'bpo', slug: 'virtual-assistance', use: 'Scheduling, email management, CRM administration and coordination.' },
      { cat: 'bpo', slug: 'data-entry', use: 'Listing, CRM and records updates.' },
      { cat: 'bpo', slug: 'document-processing', use: 'Document intake, verification and records organization.' },
      { cat: 'bpo', slug: 'customer-service', use: 'Buyer, tenant and owner inquiries.' },
      { cat: 'it', slug: 'web-mobile-development', use: 'Property websites, portals and booking platforms.' },
    ],
    image: '/media/operava-remote-work.webp',
  },
  {
    slug: 'education-edtech',
    name: 'Education & EdTech',
    tag: 'Education',
    short: 'Student support, administration and learning platforms.',
    intro:
      'Schools, training providers and EdTech companies need dependable student-facing support and digital platforms. OPERAVA supports administration, student and customer support and data processing, and builds websites, platforms and SaaS products for learning.',
    focus: [
      'Student and customer support',
      'Administrative support and virtual assistance',
      'Data processing and records management',
      'Learning websites and platforms',
      'SaaS products and digital systems',
    ],
    services: [
      { cat: 'bpo', slug: 'customer-service', use: 'Student and customer support across channels.' },
      { cat: 'bpo', slug: 'virtual-assistance', use: 'Administrative support and coordination.' },
      { cat: 'bpo', slug: 'data-processing', use: 'Records organization, validation and updating.' },
      { cat: 'it', slug: 'web-mobile-development', use: 'Websites, web applications and mobile learning experiences.' },
      { cat: 'it', slug: 'saas-platform-development', use: 'Learning platforms and subscription systems.' },
    ],
    image: '/media/operava-task-learning-workshop.webp',
  },
  {
    slug: 'professional-services',
    name: 'Professional Services',
    tag: 'Services',
    short: 'Back-office, research and client support for firms and consultancies.',
    intro:
      'Consultancies, agencies and professional firms want their experts focused on client work. OPERAVA takes on virtual assistance, back-office operations, research and client support, and builds the websites and systems that run the practice.',
    focus: [
      'Virtual and executive assistance',
      'Back-office operations and reporting',
      'Research and customer support',
      'CRM-related support and data processing',
      'Software development and websites',
    ],
    services: [
      { cat: 'bpo', slug: 'virtual-assistance', use: 'Executive assistance, scheduling, research and coordination.' },
      { cat: 'bpo', slug: 'back-office-operations', use: 'Administrative operations, billing support and reporting.' },
      { cat: 'bpo', slug: 'data-processing', use: 'Data organization and preparation.' },
      { cat: 'it', slug: 'software-development', use: 'Internal tools and client portals.' },
      { cat: 'it', slug: 'it-consulting', use: 'Technology assessments and roadmaps.' },
    ],
    image: '/media/operava-digital-strategy.webp',
  },
  {
    slug: 'startups-smes',
    name: 'Startups & SMEs',
    tag: 'Growth',
    short: 'Start with one professional, add a team when the business needs it.',
    intro:
      'Startups and growing businesses rarely need a full department on day one. OPERAVA can provide MVP and SaaS development, websites, virtual assistance, customer and technical support and data operations — starting with one professional and scaling to teams as the business grows.',
    focus: [
      'MVP software and SaaS development',
      'Websites and web applications',
      'Virtual assistance and customer service',
      'Technical support and data operations',
      'Flexible staffing from one professional to multiple teams',
    ],
    services: [
      { cat: 'it', slug: 'software-development', use: 'MVPs and custom business applications.' },
      { cat: 'it', slug: 'saas-platform-development', use: 'SaaS products and subscription platforms.' },
      { cat: 'it', slug: 'web-mobile-development', use: 'Websites, web apps and mobile apps.' },
      { cat: 'bpo', slug: 'virtual-assistance', use: 'Generalist and specialist remote assistants.' },
      { cat: 'bpo', slug: 'customer-service', use: 'Customer care while the team focuses on product.' },
      { cat: 'bpo', slug: 'technical-support', use: 'User assistance and technical ticket handling.' },
    ],
    image: '/media/operava-scene-bright-virtual-team-connection.webp',
  },
]

/** Additional industries OPERAVA can support (profile §6) */
export const otherIndustries = [
  'Information Technology & Software',
  'Telecommunications',
  'Hospitality & Travel',
  'Consulting',
  'Manufacturing',
  'Digital Agencies',
  'Business Services',
  'Enterprise Organizations',
]

export const industriesHero = LOCAL.network

export function getIndustry(slug: string) {
  return industries.find((i) => i.slug === slug)
}
