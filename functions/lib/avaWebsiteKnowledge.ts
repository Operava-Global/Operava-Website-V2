/**
 * Runtime knowledge assembled from the same structured content used by the public website.
 * Keep AVA aligned with the site's current services, industries, engagement, careers and FAQs.
 * This is informational content only; AVA must not invent pricing, guarantees or client results.
 */
import { COMPANY, OVERVIEW, PILLARS, PRINCIPLES, WORKING_PHILOSOPHY, DELIVERY_MODELS, ENGAGEMENT_MODELS, ENGAGEMENT_STEPS, REGISTRATION, REMOTE, HIRING_STEPS, CAREER_PERKS, FAQ_GROUPS } from '../../src/site/content/company'
import { industries } from '../../src/site/content/industries'
import { SERVICE_REFERENCES } from '../../src/site/content/serviceReferences'
import { itServices, bpoServices } from '../../src/data/services'
import { SEARCH_INDEX } from '../../src/site/searchIndex'
import { automationServices } from '../../src/data/automationServices'
import { CAREER_POSITIONS, SKILLS_SPECIALIZATIONS } from '../../src/data/careersData'

const clean = (value: unknown): string =>
  String(value ?? '').replace(/\s+/g, ' ').trim()

const list = (items: unknown[] | undefined): string =>
  (items ?? []).map((item) => clean(item)).filter(Boolean).join('; ')

const serviceKnowledge = (service: (typeof itServices)[number] | (typeof bpoServices)[number] | (typeof automationServices)[number], category: string) => {
  const reference = SERVICE_REFERENCES[service.slug]
  const lines = [
    `[${category}] ${service.name} — ${clean(service.shortDescription)}`,
    clean(service.description),
    service.serviceMessage ? `Positioning: ${clean(service.serviceMessage)}` : '',
    service.capabilities?.length ? `Capabilities: ${list(service.capabilities)}` : '',
    service.benefits?.length ? `Potential benefits: ${list(service.benefits)}` : '',
    service.industries?.length ? `Relevant industries: ${list(service.industries)}` : '',
    service.relatedPositions?.length ? `Related roles: ${list(service.relatedPositions)}` : '',
    reference?.faqs?.length ? `Service Q&A: ${reference.faqs.map((faq) => `${clean(faq.q)} ${clean(faq.a)}`).join(' | ')}` : '',
  ]
  return lines.filter(Boolean).join('\n')
}

const servicesKnowledge = [
  ...itServices.map((service) => serviceKnowledge(service, 'IT')),
  ...bpoServices.map((service) => serviceKnowledge(service, 'BPO')),
  ...automationServices.map((service) => serviceKnowledge(service, 'Automation')),
]

const industryKnowledge = industries.map((industry) => [
  `[INDUSTRY] ${industry.name}: ${clean(industry.short)}`,
  clean(industry.intro),
  industry.focus?.length ? `Typical needs: ${list(industry.focus)}` : '',
  industry.services?.length ? `Relevant services: ${industry.services.map((service) => `${service.cat}/${service.slug}: ${clean(service.use)}`).join('; ')}` : '',
  industry.note ? `Important note: ${clean(industry.note)}` : '',
].filter(Boolean).join('\n'))

const careerKnowledge = CAREER_POSITIONS.map((position) =>
  `[CAREER TRACK] ${position}: ${list(SKILLS_SPECIALIZATIONS[position] ?? [])}`,
)

const faqKnowledge = FAQ_GROUPS.map((group) =>
  `[FAQ — ${group.group}]\n${group.items.map((item) => `Q: ${clean(item.q)} A: ${clean(item.a)}`).join('\n')}`,
)

const engagementKnowledge = [
  ...ENGAGEMENT_MODELS.map((model) => `[ENGAGEMENT MODEL] ${model.n} — ${clean(model.d)}. ${list(model.points)}`),
  ...ENGAGEMENT_STEPS.map((step, index) => `[ENGAGEMENT PROCESS ${index + 1}] ${step.n}: ${clean(step.d)}`),
]

const generalKnowledge = [
  `[COMPANY] ${COMPANY.name}. ${COMPANY.registrationStatement} Motto: ${COMPANY.motto} Mission: ${COMPANY.mission} Location: ${COMPANY.address} Website: ${COMPANY.site}`,
  ...OVERVIEW.map((item) => `[OVERVIEW] ${clean(item)}`),
  `[PILLARS] ${PILLARS.map((item) => `${item.n}: ${clean(item.d)}`).join('; ')}`,
  `[OPERATING PRINCIPLES] ${PRINCIPLES.map((item) => `${item.n}: ${clean(item.d)}`).join('; ')}`,
  `[WORKING PHILOSOPHY] ${WORKING_PHILOSOPHY.map((item) => `${item.n}: ${clean(item.d)}`).join('; ')}`,
  `[DELIVERY OPTIONS] ${DELIVERY_MODELS.map((item) => `${item.n}: ${clean(item.d)}`).join('; ')}`,
  `[REGISTRATION] ${list(REGISTRATION.sec)} ${list(REGISTRATION.positioning)}`,
  `[TAX AND PRIVACY] ${list(REGISTRATION.bir)} ${list(REGISTRATION.privacy)}`,
  `[REMOTE MODEL] ${list(REMOTE.model)} Talent: ${list(REMOTE.talent)}`,
  `[HIRING PROCESS] ${HIRING_STEPS.map((step, index) => `${index + 1}. ${step.n}: ${clean(step.d)}`).join(' ')}`,
  `[CAREER EXPERIENCE] ${CAREER_PERKS.map((perk) => `${perk.n}: ${clean(perk.d)}`).join('; ')}`,
]

const siteDirectoryKnowledge = [
  '[PUBLIC WEBSITE DIRECTORY] The following pages are published on operavaglobal.com. Recommend the most relevant page when useful; do not claim a page contains details beyond its indexed description.',
  ...SEARCH_INDEX.map((entry) => `[${entry.section} PAGE] ${entry.title} — ${clean(entry.text)} URL: https://www.operavaglobal.com${entry.path}`),
]

export const AVA_WEBSITE_KNOWLEDGE = [
  ...siteDirectoryKnowledge,
  ...generalKnowledge,
  ...engagementKnowledge,
  ...servicesKnowledge,
  ...industryKnowledge,
  ...careerKnowledge,
  ...faqKnowledge,
].join('\n\n')
