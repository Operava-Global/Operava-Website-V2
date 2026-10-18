import { usePageMeta } from '../site/seo'
import LegalPage from '../site/LegalPage'
import { REFUND_POLICY } from '../site/content/legal/refund'

export default function RefundPolicy() {
  usePageMeta({
    title: 'Refund Policy',
    description:
      'OPERAVA Global Solutions Refund Policy — refunds, cancellations, service credits, billing errors and dispute resolution for IT, BPO, staffing and digital services.',
    crumbs: [{ name: 'Refund Policy', path: '/refund-policy' }],
  })

  return (
    <LegalPage
      doc={REFUND_POLICY}
      crumb="Refund Policy"
      intro={
        <p>
          How refund requests, cancellations, service credits, service-quality concerns, billing errors and payment disputes are handled — without removing
          rights that the law does not allow to be waived. Use the search box to find a topic quickly.
        </p>
      }
      related={[
        { label: 'Terms & Conditions', to: '/terms' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Payment Portal', to: '/payment-portal' },
        { label: 'Customer service', to: 'mailto:cs@operavaglobal.com' },
      ]}
    />
  )
}
