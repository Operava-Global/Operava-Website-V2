import { usePageMeta } from '../site/seo'
import LegalPage from '../site/LegalPage'
import { CONFIDENTIALITY_POLICY } from '../site/content/legal/confidentiality'

export default function Confidentiality() {
  usePageMeta({
    title: 'Confidentiality Policy',
    description: 'OPERAVA Global Solutions Confidentiality Policy — handling of client, workforce, business, technical and personal information.',
    crumbs: [{ name: 'Confidentiality Policy', path: '/confidentiality' }],
  })

  return (
    <LegalPage
      doc={CONFIDENTIALITY_POLICY}
      crumb="Confidentiality Policy"
      intro={
        <p>
          How OPERAVA protects non-public client, customer, workforce, technical and business information across IT,
          BPO, automation, outsourcing and remote operations. Specific signed agreements may impose stricter duties.
        </p>
      }
      related={[
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms & Conditions', to: '/terms' },
        { label: 'Refund Policy', to: '/refund-policy' },
        { label: 'Contact compliance', to: 'mailto:compliance@operavaglobal.com' },
      ]}
    />
  )
}
