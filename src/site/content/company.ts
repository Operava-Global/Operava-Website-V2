/**
 * Company, careers and engagement content.
 * Sources: create/Business References/OPERAVA_Global_Solutions_Profile_Background.txt,
 * OPERAVA_AI_Assistant_Knowledge_Base_Company_and_Services.txt, BUSINESSINFO.md, AVA-INSTRUCTIONS/.
 * Wording follows the references' guidance: no unverified certifications, prices or guarantees.
 */

export const REGISTRATION_STATEMENT = 'Duly incorporated and registered under the laws of the Republic of the Philippines with the Securities and Exchange Commission, under Registration No. 2026080262213-03.'

export const COMPANY = {
  name: 'OPERAVA Global Solutions',
  brand: 'OPERAVA',
  motto: 'Operating in Advance.',
  mission: 'Make work and services accessible — anytime, anywhere.',
  sec: '2026080262213-03',
  registrationStatement: REGISTRATION_STATEMENT,
  entity: 'Corporation',
  address: 'Pagudpud, Ilocos Norte 2919, Philippines',
  site: 'https://www.operavaglobal.com',
  pay: 'https://pay.operavaglobal.com',
  academy: 'https://academy.operavaglobal.com',
  email: {
    hello: 'hello@operavaglobal.com',
    cs: 'cs@operavaglobal.com',
    hr: 'hr@operavaglobal.com',
    talents: 'talents@operavaglobal.com',
    compliance: 'compliance@operavaglobal.com',
    billing: 'billing@operavaglobal.com',
    verification: 'verification@operavaglobal.com',
    partners: 'partners@operavaglobal.com',
  },
  social: [
    { label: 'LinkedIn', short: 'in', href: 'https://www.linkedin.com/company/operavaglobal/' },
    { label: 'Facebook', short: 'f', href: 'https://www.facebook.com/operavaglobal' },
    { label: 'Instagram', short: '◎', href: 'https://www.instagram.com/operavaglobal/' },
    { label: 'X', short: '𝕏', href: 'https://x.com/operavaglobal' },
    { label: 'TikTok', short: '♪', href: 'https://www.tiktok.com/@operavaglobal' },
  ],
}

export const STATEMENT =
  'Rooted in the Philippines and designed for a global environment, OPERAVA connects technology, skilled professionals and business processes to help organizations operate more efficiently — remotely and across borders.'

export const OVERVIEW = [
  'OPERAVA Global Solutions is a Philippine-based technology, workforce and business process solutions company focused on helping organizations operate more efficiently through technology, skilled professionals and digitally enabled services.',
  'OPERAVA combines Information Technology services with Business Process Outsourcing (BPO), remote workforce solutions and operational support to help businesses build, modernize, connect and operate their digital and business processes.',
  'Our objective is to make high-quality technology, professional services and skilled remote talent more accessible to startups, small businesses, growing companies, established organizations and enterprises.',
]

/** Technology + People + Process (profile §14) */
export const PILLARS = [
  { n: 'Technology', d: 'Digital products, systems, applications, cloud environments, integrations and technology services.' },
  { n: 'People', d: 'Skilled professionals capable of operating, supporting, developing and managing business functions.' },
  { n: 'Process', d: 'Structured workflows designed to produce consistent, measurable and reliable outcomes.' },
]

/** Technology should make operations… (profile §14) */
export const TRANSFORMATION_OUTCOMES = ['Accessible', 'Connected', 'Efficient', 'Measurable', 'Scalable', 'Responsive', 'Manageable']

/** Quality-first standards (profile §15) */
export const QUALITY_STANDARDS = [
  'Professionalism',
  'Technical capability',
  'Communication',
  'Reliability',
  'Accountability',
  'Client requirements',
  'Process adherence',
  'Quality assurance',
  'Confidentiality',
  'Data protection',
  'Continuous improvement',
]

/** Operating principles (AVA-INSTRUCTIONS/ABOUT-OPERAVA/culture-and-operating-principles.md) */
export const PRINCIPLES = [
  { n: 'Operate in Advance', d: 'Proactive problem solving instead of reactive troubleshooting — anticipating bottlenecks before they affect operations.' },
  { n: 'Craftsmanship & Quality', d: 'High standards, peer review and quality assurance across client deliverables.' },
  { n: 'Radical Transparency', d: 'Clear reporting, open communication channels and visibility for every client engagement.' },
  { n: 'People-First Growth', d: 'Continuous learning, modern tooling and empathetic leadership for a distributed workforce.' },
]

export const WORKING_PHILOSOPHY = [
  { n: 'Remote-first', d: 'Teams collaborate across time zones using asynchronous, well-documented ways of working.' },
  { n: 'Dedicated squads', d: 'Professionals are embedded into client workflows and culture rather than treated as transactional vendors.' },
  { n: 'Security by default', d: 'Access, confidentiality and data-protection measures are defined for each engagement and its environment.' },
]

/** Client size model (profile §16 / KB §24) */
export const CLIENT_SIZES = [
  { n: 'Small Business', d: 'One professional can support a defined business function without building an entire department.' },
  { n: 'Growing Business', d: 'A dedicated team supports increasing customer volume, administrative workload or technology requirements.' },
  { n: 'Established Organization', d: 'Multiple specialized teams support different functions, products, departments, regions or customer groups.' },
  { n: 'Enterprise', d: 'Larger distributed operations structured around service requirements, workforce needs, processes and governance.' },
]

/** BPO structures (profile §5) */
export const DELIVERY_MODELS = [
  { n: 'One Professional', d: 'Engage one dedicated professional for a specific function or workload.' },
  { n: 'One Team', d: 'Engage a dedicated team responsible for a defined operational process.' },
  { n: 'Multiple Teams', d: 'Engage multiple teams supporting different functions, regions, products, customer groups or processes.' },
]

/** Engagement models (AVA-INSTRUCTIONS/SERVICES/engagement-models-and-sla.md) */
export const ENGAGEMENT_MODELS = [
  {
    n: 'Dedicated Teams',
    tag: 'Ongoing operations',
    d: 'Full-time professionals assigned to your account. You direct the day-to-day work; OPERAVA handles payroll, equipment, HR and the operating infrastructure behind the team.',
    points: ['Engineers, support specialists or operations analysts', 'Direct day-to-day task management by the client', 'Predictable monthly billing'],
  },
  {
    n: 'Project-Based Delivery',
    tag: 'Defined scope',
    d: 'Defined-scope delivery with milestones and sprint deliverables — suited to web and mobile builds, migrations, systems work and assessments.',
    points: ['Agreed scope, milestones and acceptance', 'Milestone-based invoicing tied to client sign-off', 'Documentation and handover included in scope'],
  },
  {
    n: 'Staff Augmentation',
    tag: 'Skill gaps',
    d: 'Individual specialists embedded directly into your existing team to close an immediate skill or capacity gap.',
    points: ['Specialists matched to your stack and processes', 'Works inside your tools and rituals', 'Scale up or down as needs change'],
  },
]

export const ENGAGEMENT_STEPS = [
  { n: 'Discuss', d: 'Share the functions, volumes, tools and outcomes you need through the inquiry form or AVA.' },
  { n: 'Scope', d: 'OPERAVA clarifies requirements, recommends the right service mix and delivery model, and prepares a proposal.' },
  { n: 'Select', d: 'For dedicated roles, you take part in candidate interviews and approve every professional placed on your account.' },
  { n: 'Onboard', d: 'Access, knowledge transfer, documentation and reporting are set up around your environment.' },
  { n: 'Operate', d: 'Work is delivered, measured and continuously improved — and the engagement scales as the business does.' },
]

/** Corporate registration (profile §2, §7, §21) */
export const REGISTRATION = {
  sec: [
    REGISTRATION_STATEMENT,
    'The SEC is the Philippine government agency responsible for the registration and regulation of corporations and other entities within its jurisdiction. OPERAVA’s corporate registration establishes the company as a Philippine corporation and provides the legal corporate framework under which it conducts its authorized business activities.',
  ],
  positioning: [
    'SEC registration is not a blanket government license for every possible technology, staffing, outsourcing, financial, regulated or professional activity, and it does not mean the government endorses the company’s commercial services.',
    'Where a specific service or activity requires an additional government permit, accreditation, registration, license, clearance or industry-specific authorization, OPERAVA will comply with the applicable requirements before providing that regulated activity.',
  ],
  bir: [
    'OPERAVA is positioned as a Philippine business registered with the Bureau of Internal Revenue (BIR) and maintains its applicable taxpayer registration and tax compliance responsibilities.',
    'For corporate businesses, these may include taxpayer registration, books of accounts, invoicing requirements, tax returns, withholding obligations and other responsibilities depending on the company’s activities. Tax compliance is an ongoing responsibility rather than a permanent certification.',
  ],
  privacy: [
    'Personal information is handled in accordance with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) and OPERAVA’s Privacy Policy. Privacy and compliance requests can be sent to compliance@operavaglobal.com.',
    'For sensitive or regulated workloads, OPERAVA uses contractual, technical, administrative, access-control, confidentiality and data-protection measures appropriate to the engagement and its requirements.',
  ],
  links: [
    { label: 'Securities and Exchange Commission', href: 'https://www.sec.gov.ph/' },
    { label: 'SEC eSPARC registration', href: 'https://esparc.sec.gov.ph/' },
    { label: 'Bureau of Internal Revenue', href: 'https://www.bir.gov.ph/' },
    { label: 'BIR eTINQuery', href: 'https://etinquery.bir.gov.ph/init.do?app=tinquery' },
  ],
}

/** Remote-first model and global vision (profile §8, §9, §12, §13, §18) */
export const REMOTE = {
  model: [
    'OPERAVA is built around remote operations, allowing services and employment opportunities to extend beyond a single physical office.',
    'OPERAVA supports clients through remote technology services, remote business process outsourcing, remote professional staffing and digitally coordinated operations — so businesses can access skilled professionals without requiring every function to operate from a traditional office.',
  ],
  talent: [
    'OPERAVA’s talent pool is primarily built from the Philippines, and the company recruits globally when a client’s required skills, language capability, technical specialization or operational requirements call for a broader talent pool.',
    'Hiring is not simply filling vacancies: the objective is to identify professionals whose skills, work quality, reliability, communication and ability to follow client requirements fit the role — because the quality of the assigned professional directly affects the quality of the client’s operation.',
  ],
  forBusinesses: [
    'Access to a broader talent pool',
    'Greater staffing flexibility',
    'Scalable operational capacity',
    'Reduced dependence on a single location',
    'Access to specialized skills',
    'Extended service coverage',
    'Faster access to operational support',
    'Ability to build distributed teams',
  ],
  forProfessionals: [
    'Greater location flexibility',
    'Opportunities beyond your immediate area',
    'Reduced commuting requirements',
    'Work with organizations in different markets',
    'More flexible work environments where appropriate',
    'Greater access to digitally enabled careers',
  ],
  quality:
    'Remote work does not automatically guarantee better productivity or quality. OPERAVA therefore focuses on the quality of people, processes, technology, management, communication, accountability and service standards supporting each engagement.',
  expansion: [
    'OPERAVA Global Solutions’ initial office location is in Pagudpud, Ilocos Norte 2919, Philippines. The operating model, however, is not limited to one physical location.',
    'OPERAVA is developing a distributed, remote-first model with multiple operational hubs and continued expansion into additional markets. As the organization grows, it may establish physical, hybrid or work-from-office facilities where commercially appropriate and legally permitted — subject to the corporate, employment, tax, licensing, labor and data-protection requirements of each jurisdiction.',
  ],
  vision:
    'OPERAVA’s long-term vision is to build a globally connected technology and workforce organization that makes digital services, employment and business operations more accessible — growing from its Philippine foundation into an international network of professionals, clients, technology capabilities and operational hubs.',
}

/** Careers: why join (previous Careers page) */
export const CAREER_PERKS = [
  { n: 'Flexible Work Setup', d: 'Roles designed for distributed teams serving international clients, with remote-first arrangements.' },
  { n: 'International Work', d: 'Work with organizations in different markets without relocating.' },
  { n: 'Continuous Upskilling', d: 'Mentorship, certifications and learning opportunities through OPERAVA Academy.' },
  { n: 'Career Growth Path', d: 'Performance-based growth with clear specialization tracks across technology, operations and customer experience.' },
]

/** Hiring process (Terms §, BUSINESSINFO §9, previous Careers page) */
export const HIRING_STEPS = [
  { n: 'Initial Application Review', d: 'Your application is reviewed for relevant background, professional skills, communication and role suitability after submission through the online form.' },
  { n: 'Skills & Specialization Assessment', d: 'Practical tests tailored to the track: software tasks, customer-support scenarios or operational accuracy exercises.' },
  { n: 'Talent Acquisition Interview', d: 'A conversation with OPERAVA talent specialists to align your goals, availability and specialization track.' },
  { n: 'Client Alignment Interview', d: 'For dedicated client engagements, a match and interview with the client team you would join.' },
  { n: 'Engagement Documentation', d: 'Final selection, onboarding documentation, equipment provisioning and project start.' },
]

/** Employment accessibility (profile §10) */
export const ACCESSIBILITY_GROUPS = [
  'Skilled professionals',
  'Early-career professionals',
  'Students seeking appropriate work opportunities',
  'Mothers and caregivers seeking flexible work',
  'Experienced specialists',
  'Remote professionals',
  'Technology professionals',
  'Operations professionals',
  'Professionals seeking international opportunities',
]

/** Scholarship & talent development (profile §11) */
export const DEVELOPMENT_INITIATIVES = [
  'Scholarship merits',
  'Skills development opportunities',
  'Training support',
  'Career development',
  'Technology learning opportunities',
  'Mentorship',
  'Internship or early-career opportunities where appropriate',
  'Recognition of high-performing talent',
]

/** General FAQ (KB §26 + AVA-INSTRUCTIONS/FAQ) */
export const FAQ_GROUPS: { group: string; items: { q: string; a: string }[] }[] = [
  {
    group: 'About OPERAVA',
    items: [
      { q: 'What does OPERAVA do?', a: 'OPERAVA provides Information Technology, digital technology, cloud-related, systems, software and Business Process Outsourcing services through a remote-first and globally oriented operating model.' },
      { q: 'Where is OPERAVA located?', a: 'OPERAVA’s initial office is in Pagudpud, Ilocos Norte 2919, Philippines. The current service and employment model is primarily remote, supporting clients across markets.' },
      { q: 'Is OPERAVA SEC registered?', a: REGISTRATION_STATEMENT + ' Corporate registration does not mean the government endorses the company’s commercial services.' },
      { q: 'Is OPERAVA licensed for every service it offers?', a: 'Corporate registration is different from service-specific authorization. Where a specific regulated service requires an additional permit, license or accreditation, OPERAVA obtains the applicable authorization before providing it.' },
      { q: 'Does remote work mean lower quality?', a: 'Not inherently. Quality depends on the people, processes, technology, management, communication and standards used to operate remotely — which is where OPERAVA focuses.' },
    ],
  },
  {
    group: 'Services & engagements',
    items: [
      { q: 'Who can use OPERAVA?', a: 'Startups, small businesses, SMEs, growing organizations, established companies and enterprises.' },
      { q: 'Can we start with just one professional?', a: 'Yes. A service can begin with one professional supporting one defined function, then grow into a dedicated team or multiple teams.' },
      { q: 'Can multiple teams serve one organization?', a: 'Yes. Teams can be organized around different functions, products, customer groups, regions or operational processes.' },
      { q: 'Does OPERAVA only provide BPO or only IT?', a: 'Neither. OPERAVA combines Information Technology services with BPO, automation and remote workforce solutions.' },
      { q: 'Can we interview candidates before they join our account?', a: 'Yes. For dedicated roles you take part in candidate interviews and have final approval on every professional placed on your account.' },
      { q: 'How does billing work?', a: 'Dedicated team members are invoiced monthly. Project-based work is invoiced against agreed milestones. Pricing is proposal-based and depends on scope.' },
      { q: 'Can OPERAVA work with international clients?', a: 'Yes — subject to the applicable commercial, contractual, technical, tax, employment, privacy and regulatory requirements of each engagement.' },
    ],
  },
  {
    group: 'Careers & contact',
    items: [
      { q: 'How do I apply for a job?', a: 'Apply through the Careers page using the online application form with email verification. Please do not send resumes by email only unless instructed.' },
      { q: 'Where does OPERAVA recruit talent?', a: 'The Philippines is the primary talent source, and OPERAVA recruits internationally when specialized skills are required.' },
      { q: 'How do I request a quote?', a: 'Submit the inquiry form on the Contact or Request a Quote page. Submissions are verified by email and receive a reference ID.' },
      { q: 'How can I verify an OPERAVA document?', a: 'Use the Document Verification portal with the reference ID printed on the document, or email verification@operavaglobal.com.' },
    ],
  },
]
