import { usePageMeta } from '../site/seo'
import FormPage from '../site/FormPage'
import OperavaIntakeForm from '../components/forms/OperavaIntakeForm'
import { COMPANY } from '../site/content/company'
import { PHOTO } from '../site/media'

export default function Partnership() {
  usePageMeta({
    title: 'Partnerships',
    description: 'Partner with OPERAVA Global Solutions. Propose a strategic, technology, channel, referral, delivery or education collaboration through our secure email-verified form.',
    crumbs: [{ name: 'Partnerships', path: '/partnerships' }],
  })

  return (
    <FormPage
      crumbs={[{ label: 'Home', to: '/' }, { label: 'Partnerships' }]}
      image={PHOTO.handshake}
      kicker="Partnerships"
      title={<>Build what's<br />next together</>}
      lead="Explore strategic alliances, technology integrations, channel opportunities and delivery partnerships with OPERAVA. Tell us how we can create value together."
      formTitle="Propose a partnership"
      steps={[
        'Share your organization details, partnership type and collaboration proposal.',
        'Verify your email using the 6-digit code we send you.',
        'Receive a confirmation and OPERAVA reference ID.',
        'Our partnerships team reviews your proposal and contacts you about potential next steps.',
      ]}
      side={[
        {
          title: 'Partnership contact',
          items: [
            { label: 'Business Partnerships', value: COMPANY.email.partners, href: `mailto:${COMPANY.email.partners}` },
            { label: 'Explore our services', value: 'Technology, BPO and Automation', href: '/services' },
            { label: 'How we engage', value: 'Engagement models', href: '/services/engagement-models' },
          ],
        },
        {
          title: 'Our approach',
          items: [
            { label: 'Focus', value: 'Practical, mutually beneficial collaborations with clear goals and responsibilities.' },
            { label: 'Operations', value: 'Philippines-based · remote-first and globally connected.' },
          ],
        },
      ]}
    >
      <OperavaIntakeForm kind="PARTNERSHIP" />
    </FormPage>
  )
}
