/**
 * Image library for the site. Cloudinary assets are OPERAVA's own (see
 * References/services/cloudinary links.html and insights.txt); local files in
 * /public/media are the brand-free images carried over from the original index.html.
 */

const cl = (cloud: string, path: string, width = 1600) =>
  `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_${width}/${path}`

/** OPERAVA mark — white striped circle (vector; master PNG at /brand/operava-mark-1024.png) */
export const LOGO = {
  mark: '/brand/operava-mark.svg',
  markPng: '/brand/operava-mark-1024.png',
  /** mark on a black tile — for light backgrounds, favicons and structured data */
  tile: '/favicon-512.png',
}

export const LOCAL = {
  aiDashboard: '/media/ai-operations-dashboard.webp',
  network: '/media/global-network.webp',
  dataCenter: '/media/data-center.webp',
}

/** Service photography — one per IT / BPO service */
export const SERVICE_PHOTO: Record<string, string> = {
  'software-development': cl('sdaxzncs', 'v1787278539/software.webp'),
  'web-mobile-development': cl('sdaxzncs', 'v1787278424/web_mobile.webp'),
  'saas-platform-development': cl('sdaxzncs', 'v1787278192/saas.webp'),
  'it-systems-development': cl('sdaxzncs', 'v1787278269/it_systems.webp'),
  'computer-programming': cl('sdaxzncs', 'v1787257859/programming.webp'),
  'it-consulting': cl('sdaxzncs', 'v1787258413/IT_consulting.webp'),
  'systems-integration': cl('sdaxzncs', 'v1787257920/system_integration.webp'),
  'database-services': cl('sdaxzncs', 'v1787258361/database_services.webp'),
  'customer-service': cl('sdaxzncs', 'v1787256801/customer_service.webp'),
  'technical-support': cl('sdaxzncs', 'v1787258318/technical_support.webp'),
  'help-desk': cl('sdaxzncs', 'v1787258262/helpdesk.webp'),
  'back-office-operations': cl('sdaxzncs', 'v1787258203/backoffice.webp'),
  'data-processing': cl('sdaxzncs', 'v1787258161/dataprocessing.webp'),
  'data-entry': cl('sdaxzncs', 'v1787258010/dataentry.webp'),
  'document-processing': cl('sdaxzncs', 'v1787258086/document_processing.webp'),
  'virtual-assistance': cl('sdaxzncs', 'v1787257770/virtual_assistance.webp'),
}

/** Editorial photography (Operational Insights & Innovations set) */
export const PHOTO = {
  handshake: cl('sdaxzncs', 'v1787283729/filipino_business_handshake_zpu4sb.webp'),
  developer: cl('sdaxzncs', 'v1787283770/filipino_developer_coding_daztmy.webp'),
  analyst: cl('sdaxzncs', 'v1787283803/data_analyst_operava_ekwjft.webp'),
  cloudEngineer: cl('sdaxzncs', 'v1787283870/cloud_engineer_aws_dashboard_zn63vw.webp'),
  backOffice: cl('sdaxzncs', 'v1787283911/back_office_support_professional_on938n.webp'),
  helpdesk: cl('sdaxzncs', 'v1787283964/it_helpdesk_professional_zyp15e.webp'),
  customerSupport: cl('sdaxzncs', 'v1787284005/customer_support_banner_hbpnus.webp'),
  cover: 'https://res.cloudinary.com/sdaxzncs/image/upload/v1786240859/Cover%20Photo.png',
}

/** Career track covers (from the previous Careers page) */
export const CAREER_PHOTO: Record<string, string> = {
  tech: cl('b5i5bwwa', 'v1788660949/792090637_1483292190495964_5576048200188804631_n.webp'),
  ops: cl('b5i5bwwa', 'v1788660938/Business%20Operations%20Executive%20Cover.jpg'),
  cx: cl('b5i5bwwa', 'v1788660940/797841464_3350629321810587_364897228139176087_n.jpg'),
}

/** Automation visuals */
export const AUTOMATION_PHOTO = {
  ai: cl('b5i5bwwa', 'v1789883998/795188595_1550334969738376_2629002611050598156_n.jpg'),
  custom: cl('b5i5bwwa', 'v1789883997/818443341_1800198281153233_3417928797306308459_n.jpg'),
}

/** Videos hosted on OPERAVA's Cloudinary */
export const VIDEO = {
  technology: 'https://res.cloudinary.com/mgyosgsm/video/upload/Video_otwv5l.mp4',
  workforce: 'https://res.cloudinary.com/mgyosgsm/video/upload/Video_nmdtfe.mp4',
  processes: 'https://res.cloudinary.com/mgyosgsm/video/upload/Video_pmorrn.mp4',
}

export function servicePhoto(slug: string, fallback?: string) {
  return SERVICE_PHOTO[slug] || fallback || LOCAL.aiDashboard
}
