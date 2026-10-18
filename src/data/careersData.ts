export const CAREER_POSITIONS = [
  'OPERAVA Technology Executive',
  'OPERAVA Business Operations Executive',
  'OPERAVA Customer Experience Executive',
] as const

export type CareerPosition = typeof CAREER_POSITIONS[number]

export const SKILLS_SPECIALIZATIONS: Record<CareerPosition, string[]> = {
  'OPERAVA Business Operations Executive': [
    'Human Resources (HR)',
    'Accounting & Finance',
    'Recruitment & Talent Acquisition',
    'Training & Development',
    'Payroll, Compensation & Benefits',
    'Bookkeeping, Invoicing & Billing',
    'FinTech Operations & KYC / AML Screening',
    'Procurement & Vendor Management',
    'Data Processing & Audited Data Entry',
    'Document Processing & Records Verification',
    'Virtual Assistance & Executive Admin Support',
    'Quality Assurance & Process Compliance',
    'Office Administration & Facilities Operations',
    'Operations Management & Workflow Coordination',
    'General Business Operations',
  ],
  'OPERAVA Technology Executive': [
    'Full-Stack Software Development',
    'Frontend Engineering (React, TypeScript, Next.js, UI/UX)',
    'Backend Engineering & API Systems (Node.js, Python, Go)',
    'Mobile Application Development (iOS, Android, React Native)',
    'Cloud Infrastructure & DevOps (AWS, GCP, Azure, Docker, Kubernetes)',
    'Database Architecture & Administration (SQL, PostgreSQL, NoSQL)',
    'QA Engineering, Manual & Automated Software Testing',
    'Cybersecurity, InfoSec & Network Systems Administration',
    'IT Technical Support & Systems Help Desk',
    'Data Engineering, Analytics & Business Intelligence',
    'AI / Machine Learning Implementation & Integrations',
    'General Software & Systems Engineering',
  ],
  'OPERAVA Customer Experience Executive': [
    'Inbound Customer Care & Service',
    'Technical Support & Help Desk Operations (Tier 1 & Tier 2)',
    'Omnichannel Support (Live Chat, Email & Ticket Intake)',
    'Client Account Management & Customer Retention',
    'Customer Success & Client Onboarding',
    'Escalation Resolution & Case Management',
    'Voice & Telephony Customer Communications',
    'Social Media Customer Support & Community Care',
    'E-Commerce & Order Processing Support',
    'Quality Monitoring, CSAT & Quality Assurance',
    'VIP & Enterprise Client Relationship Management',
    'General Customer Experience & Client Support',
  ],
}

export interface CareerOpening {
  id: string
  code: 'tech' | 'ops' | 'cx'
  title: CareerPosition
  shortTitle: string
  location: string
  level: string
  type: string
  desc: string
  assignments: string[]
  image: string
}

export const CAREER_OPENINGS: CareerOpening[] = [
  {
    id: 'career-tech-exec',
    code: 'tech',
    title: 'OPERAVA Technology Executive',
    shortTitle: 'Technology Executive',
    location: 'Remote / Hybrid (PH & Global)',
    level: 'All Experience Levels (Associate to Senior)',
    type: 'Full-time',
    desc: 'May be assigned to specific related tasks on available posts or based on your skills in software engineering, web/mobile development, cloud systems, or technical infrastructure.',
    assignments: [
      'Full-Stack Web & Mobile Software Development',
      'Cloud Infrastructure, DevOps & Architecture (AWS, GCP, Azure)',
      'Backend Microservices & API Engineering',
      'Database Architecture & SQL/NoSQL Administration',
      'QA Engineering, Testing & Systems Security',
    ],
    image: '/media/operava-software-engineering.webp',
  },
  {
    id: 'career-ops-exec',
    code: 'ops',
    title: 'OPERAVA Business Operations Executive',
    shortTitle: 'Business Operations Executive',
    location: 'Remote / Philippines & Global',
    level: 'All Experience Levels (Associate to Senior)',
    type: 'Full-time',
    desc: 'May be assigned to specific related tasks on available posts or based on your skills in HR, accounting and finance, recruitment, training and development, or business operations.',
    assignments: [
      'Human Resources (HR) Operations & People Care',
      'Accounting, Bookkeeping & Financial Reporting',
      'Talent Acquisition, Recruitment & Sourcing',
      'Training, Upskilling & Professional Development',
      'Audited Data Processing, Records & Workflow Administration',
    ],
    image: '/media/operava-business-analytics.webp',
  },
  {
    id: 'career-cx-exec',
    code: 'cx',
    title: 'OPERAVA Customer Experience Executive',
    shortTitle: 'Customer Experience Executive',
    location: 'Remote / Philippines & Global',
    level: 'All Experience Levels (Associate to Senior)',
    type: 'Full-time (24/7 Rotational Shifts)',
    desc: 'May be assigned to specific related tasks on available posts or based on your skills in customer care, technical help desk, omnichannel communication, or client account management.',
    assignments: [
      'Omnichannel Support (Live Chat, Email & Ticket Resolution)',
      'High-Touch Inbound & Outbound Voice Communications',
      'Technical Help Desk & Incident Triage (Tier 1 & Tier 2)',
      'Customer Success, Onboarding & Client Retention',
      'Escalation Management, CSAT Monitoring & Quality Assurance',
    ],
    image: '/media/operava-customer-support.webp',
  },
]
