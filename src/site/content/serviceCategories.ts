import type { Service } from '../../data/itServices'
import { itServices, bpoServices } from '../../data/services'
import { automationServices } from '../../data/automationServices'
import { LOCAL, SERVICE_PHOTO, PHOTO } from '../media'

export type ServiceCat = 'it' | 'bpo' | 'automation'

export interface ServiceCategory {
  id: ServiceCat
  name: string
  short: string
  title: string[]
  lead: string
  intro: string[]
  image: string
  services: Service[]
  /** form category used when quoting this service */
  formCategory: string
  extras?: { heading: string; text: string; items: string[] }
}

/** Source: OPERAVA_Global_Solutions_Profile_Background.txt §3–§5 and data/automationServices.ts */
export const SERVICE_CATEGORIES: Record<ServiceCat, ServiceCategory> = {
  it: {
    id: 'it',
    name: 'Information Technology',
    short: 'Technology',
    title: ['Information', 'Technology'],
    lead: 'Technology solutions that help organizations build digital products, modernize infrastructure, connect systems, automate workflows and operate securely at scale.',
    intro: [
      'OPERAVA’s Information Technology business focuses on technology solutions that help organizations build digital products, modernize infrastructure, connect systems, automate workflows and operate securely at scale.',
      'The approach is designed to help organizations move from disconnected technology and manual workflows toward coordinated, scalable digital operations.',
    ],
    image: SERVICE_PHOTO['software-development'],
    services: itServices,
    formCategory: 'Information Technology',
    extras: {
      heading: 'Cloud & digital infrastructure',
      text: 'OPERAVA also supports the technology environments that let organizations operate digitally and remotely — provided according to the technical scope, client requirements, available platforms, security requirements and applicable laws.',
      items: [
        'Cloud solutions and application environments',
        'Cloud migration support and infrastructure planning',
        'Hosting solutions and database infrastructure',
        'Systems administration and application deployment',
        'Infrastructure integration',
        'Backup and continuity support',
        'Cloud-based business systems',
        'Remote technology operations',
      ],
    },
  },
  bpo: {
    id: 'bpo',
    name: 'Business Process Outsourcing',
    short: 'Outsourcing',
    title: ['Business Process', 'Outsourcing'],
    lead: 'Remote operational support that lets organizations delegate defined business processes to skilled professionals — structured around your actual requirements.',
    intro: [
      'OPERAVA provides Business Process Outsourcing and remote operational support designed to help organizations delegate defined business processes to skilled professionals.',
      'BPO can be structured around the client’s actual requirements — one professional, one team or multiple teams — which makes the model suitable for startups, small businesses, SMEs, growing companies, established organizations and enterprises.',
    ],
    image: SERVICE_PHOTO['customer-service'],
    services: bpoServices,
    formCategory: 'Business Process Outsourcing',
  },
  automation: {
    id: 'automation',
    name: 'Automation',
    short: 'Automation',
    title: ['Business', 'Automation'],
    lead: 'Automation designed around how people, systems, data and decisions interact — so repetitive work moves without manual chasing.',
    intro: [
      'Automation uses technology to perform tasks or workflows with reduced manual intervention — from scheduled tasks and notifications to integrated workflows involving applications, databases, APIs, AI and human approval.',
      'OPERAVA maps the current process first, removes repetitive steps, connects the systems involved, tests normal and exception cases, and deploys automation that can be monitored and improved.',
    ],
    image: LOCAL.aiDashboard,
    services: automationServices,
    formCategory: 'Information Technology',
  },
}

export const CATEGORY_ORDER: ServiceCat[] = ['it', 'bpo', 'automation']

export function findService(cat: string, slug: string): { cat: ServiceCat; service: Service } | undefined {
  const c = SERVICE_CATEGORIES[cat as ServiceCat]
  if (!c) return undefined
  const service = c.services.find((s) => s.slug === slug || s.id === slug)
  return service ? { cat: c.id, service } : undefined
}

export const CATEGORY_PHOTO_FALLBACK: Record<ServiceCat, string> = {
  it: PHOTO.cloudEngineer,
  bpo: PHOTO.customerSupport,
  automation: LOCAL.aiDashboard,
}
