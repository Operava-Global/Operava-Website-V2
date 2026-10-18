import { usePageMeta } from '../site/seo'
import LegalPage from '../site/LegalPage'
import { PRIVACY_POLICY } from '../site/content/legal/privacy'

export default function Privacy() {
  usePageMeta({
    title: 'Privacy Policy',
    description:
      'OPERAVA Global Solutions Privacy Policy — how personal information is collected, used, protected and retained under the Philippine Data Privacy Act (RA 10173).',
    crumbs: [{ name: 'Privacy Policy', path: '/privacy' }],
  })

  return (
    <LegalPage
      doc={PRIVACY_POLICY}
      crumb="Privacy Policy"
      intro={
        <p>
          How OPERAVA collects, uses, discloses, protects and retains personal information — including website visitors, job applicants, professionals,
          clients and business contacts. Privacy requests can be sent to{' '}
          <a href="mailto:compliance@operavaglobal.com" className="text-white underline underline-offset-4">
            compliance@operavaglobal.com
          </a>
          .
        </p>
      }
      related={[
        { label: 'Cookie Policy', to: '/cookie-policy' },
        { label: 'Terms & Conditions', to: '/terms' },
        { label: 'Refund Policy', to: '/refund-policy' },
        { label: 'Contact compliance', to: 'mailto:compliance@operavaglobal.com' },
      ]}
    />
  )
}
