/**
 * Original OPERAVA website photography.
 * Generated creative scenes depict fictional Filipino-looking professionals;
 * they are brand illustrations, not photographs of actual OPERAVA employees.
 * Optimized local WebP files are served from /public/media so the site
 * does not depend on embedded third-party Cloudinary or stock-photo URLs.
 */
const original = (scene: string) => `/media/operava-${scene}.webp`

export const LOGO = {
  mark: '/brand/operava-mark.svg',
  markPng: '/brand/operava-mark-1024.png',
  tile: '/favicon-512.png',
}

export const LOCAL = {
  aiDashboard: original('digital-strategy'),
  network: original('team-collaboration'),
  dataCenter: original('technical-operations'),
}

export const SERVICE_PHOTO: Record<string, string> = {
  'software-development': original('software-engineering'),
  'web-mobile-development': original('software-engineering'),
  'saas-platform-development': original('digital-strategy'),
  'it-systems-development': original('technical-operations'),
  'computer-programming': original('software-engineering'),
  'it-consulting': original('digital-strategy'),
  'systems-integration': original('technical-operations'),
  'database-services': original('business-analytics'),
  'customer-service': original('customer-support'),
  'technical-support': original('technical-operations'),
  'help-desk': original('customer-support'),
  'back-office-operations': original('team-collaboration'),
  'data-processing': original('business-analytics'),
  'data-entry': original('business-analytics'),
  'document-processing': original('business-analytics'),
  'virtual-assistance': original('remote-work'),
}

export const PHOTO = {
  handshake: original('team-collaboration'),
  developer: original('software-engineering'),
  analyst: original('business-analytics'),
  cloudEngineer: original('technical-operations'),
  backOffice: original('team-collaboration'),
  helpdesk: original('customer-support'),
  customerSupport: original('customer-support'),
  cover: original('team-collaboration'),
}

export const CAREER_PHOTO: Record<string, string> = {
  tech: original('software-engineering'),
  ops: original('team-collaboration'),
  cx: original('customer-support'),
}

export const AUTOMATION_PHOTO = {
  ai: original('digital-strategy'),
  custom: original('business-analytics'),
}

/** Existing owned video footage remains unchanged. */
export const VIDEO = {
  technology: 'https://res.cloudinary.com/mgyosgsm/video/upload/Video_otwv5l.mp4',
  workforce: 'https://res.cloudinary.com/mgyosgsm/video/upload/Video_nmdtfe.mp4',
  processes: 'https://res.cloudinary.com/mgyosgsm/video/upload/Video_pmorrn.mp4',
}

export function servicePhoto(slug: string, fallback?: string) {
  return SERVICE_PHOTO[slug] || fallback || LOCAL.aiDashboard
}
