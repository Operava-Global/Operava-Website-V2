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
  'software-development': original('task-software-collaboration'),
  'web-mobile-development': original('scene-collaborative-coding-at-operava'),
  'saas-platform-development': original('scene-operava-digital-transformation-collaboration'),
  'it-systems-development': original('task-infrastructure-technicians'),
  'computer-programming': original('scene-purple-lit-operava-coding-collaboration'),
  'it-consulting': original('task-strategy-consultation'),
  'systems-integration': original('scene-operava-cloud-operations-command-center'),
  'database-services': original('scene-operava-analytics-in-blue-light'),
  'customer-service': original('task-smiling-call-center'),
  'technical-support': original('scene-operava-engineer-in-a-purple-lit-data-center'),
  'help-desk': original('scene-friendly-operava-support-team-workspace'),
  'back-office-operations': original('scene-collaborative-analysis-at-operava'),
  'data-processing': original('task-data-analytics-team'),
  'data-entry': original('scene-operava-support-team-in-purple-lights'),
  'document-processing': original('scene-collaborative-operava-office-team-meeting'),
  'virtual-assistance': original('task-remote-assistant-workspace'),
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
