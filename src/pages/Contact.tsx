import { usePageMeta } from '../site/seo'
import FormPage from '../site/FormPage'
import OperavaIntakeForm from '../components/forms/OperavaIntakeForm'
import { COMPANY } from '../site/content/company'
import { PHOTO } from '../site/media'

export default function Contact() {
  usePageMeta({
    title: 'Contact Us',
    description: 'Contact OPERAVA Global Solutions — send a verified inquiry or reach hello@operavaglobal.com for services, proposals and general questions.',
    crumbs: [{ name: 'Contact', path: '/contact' }],
  })

  return (
    <FormPage
      crumbs={[{ label: 'Contact' }]}
      image={PHOTO.customerSupport}
      kicker="Contact"
      title={
        <>
          Talk to
          <br />
          OPERAVA
        </>
      }
      lead="Tell us what you need to operate. Client and general inquiries only — job applications go through Careers."
      formTitle="Send an inquiry"
      steps={[
        'Submit the form — we send a 6-digit code to verify your email.',
        'Once verified, you receive a confirmation with your reference ID.',
        'Our team reviews the inquiry and replies from hello@operavaglobal.com.',
      ]}
      side={[
        {
          title: 'Direct contacts',
          items: [
            { label: 'Clients & general', value: COMPANY.email.hello, href: `mailto:${COMPANY.email.hello}` },
            { label: 'Existing client support', value: COMPANY.email.cs, href: `mailto:${COMPANY.email.cs}` },
            { label: 'Partnerships', value: COMPANY.email.partners, href: `mailto:${COMPANY.email.partners}` },
            { label: 'Full directory', value: 'operavaglobal.com/contacts', href: '/contacts' },
          ],
        },
        {
          title: 'Office',
          items: [
            { label: 'Initial office', value: COMPANY.address },
            { label: 'Operations', value: 'Remote-first · Philippines & global' },
          ],
        },
      ]}
    >
      <OperavaIntakeForm kind="CONTACT" />
    </FormPage>
  )
}
