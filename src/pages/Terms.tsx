import { usePageMeta } from '../site/seo'
import LegalPage from '../site/LegalPage'
import { TERMS_AND_CONDITIONS } from '../site/content/legal/terms'

export default function Terms() {
  usePageMeta({
    title: 'Terms & Conditions',
    description:
      'OPERAVA Global Solutions Terms & Conditions — services, workforce positions, hiring, acceptable use, intellectual property, payments, liability and Philippine governing law.',
    crumbs: [{ name: 'Terms & Conditions', path: '/terms' }],
  })

  return (
    <LegalPage
      doc={TERMS_AND_CONDITIONS}
      crumb="Terms & Conditions"
      intro={
        <p>
          The general framework that governs use of OPERAVA websites and digital platforms and OPERAVA services. Signed client agreements, statements of work
          and employment documents take precedence for their specific engagements.
        </p>
      }
      related={[
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Refund Policy', to: '/refund-policy' },
        { label: 'Cookie Policy', to: '/cookie-policy' },
        { label: 'Contact us', to: '/contact' },
      ]}
    />
  )
}
