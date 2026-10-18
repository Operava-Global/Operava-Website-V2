import { useSearchParams } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import FormPage from '../site/FormPage'
import OperavaIntakeForm from '../components/forms/OperavaIntakeForm'
import { COMPANY } from '../site/content/company'
import { PHOTO } from '../site/media'

export default function Quote() {
  const [params] = useSearchParams()
  const service = params.get('service') || undefined
  const category = params.get('category') || undefined

  usePageMeta({
    title: 'Request a Quote',
    description: 'Request a proposal for OPERAVA Information Technology, Business Process Outsourcing or Automation services.',
    crumbs: [{ name: 'Request a Quote', path: '/quote' }],
  })

  return (
    <FormPage
      crumbs={[{ label: 'Services', to: '/services' }, { label: 'Request a Quote' }]}
      image={PHOTO.handshake}
      kicker={service ? `Quote · ${service}` : 'Request a quote'}
      title={
        <>
          Request
          <br />a quote
        </>
      }
      lead="Describe the functions, volumes and tools involved. Pricing is proposal-based — we scope the right delivery model for the work."
      formTitle={service ? `Quote for ${service}` : 'Project & service details'}
      steps={[
        'Submit the details and verify your email with the 6-digit code.',
        'You receive a confirmation with an OPERAVA reference ID.',
        'We clarify requirements and recommend the service mix and delivery model.',
        'You receive a proposal; for dedicated roles you interview and approve candidates.',
      ]}
      side={[
        {
          title: 'Prefer email?',
          items: [
            { label: 'Proposals & quotations', value: COMPANY.email.hello, href: `mailto:${COMPANY.email.hello}` },
            { label: 'How engagements work', value: 'Engagement models', href: '/services/engagement-models' },
          ],
        },
      ]}
    >
      <OperavaIntakeForm kind="SERVICES" defaultService={service} defaultCategory={category} />
    </FormPage>
  )
}
