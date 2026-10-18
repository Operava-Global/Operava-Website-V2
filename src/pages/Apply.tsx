import { useSearchParams } from 'react-router-dom'
import { usePageMeta } from '../site/seo'
import FormPage from '../site/FormPage'
import OperavaIntakeForm from '../components/forms/OperavaIntakeForm'
import { COMPANY } from '../site/content/company'
import { CAREER_PHOTO } from '../site/media'

export default function Apply() {
  const [params] = useSearchParams()
  const position = params.get('role') || params.get('position') || undefined

  usePageMeta({
    title: 'Apply',
    description: 'Apply to OPERAVA Global Solutions — Technology, Business Operations or Customer Experience Executive tracks. Email-verified application.',
    crumbs: [
      { name: 'Careers', path: '/careers' },
      { name: 'Apply', path: '/apply' },
    ],
  })

  return (
    <FormPage
      crumbs={[{ label: 'Careers', to: '/careers' }, { label: 'Apply' }]}
      image={CAREER_PHOTO.tech}
      kicker="Careers · Application"
      title={
        <>
          Apply to
          <br />
          OPERAVA
        </>
      }
      lead="Applicants only — client inquiries use Request a Quote. Your email is verified before Talent Acquisition receives the file."
      formTitle="Job application"
      steps={[
        'Choose your track and specialization; attach a resume to pre-fill details.',
        'Verify your email with the 6-digit code to submit.',
        'Talent Acquisition reviews your application and contacts you about next steps.',
      ]}
      side={[
        {
          title: 'Hiring help',
          items: [
            { label: 'Talent Acquisition', value: COMPANY.email.talents, href: `mailto:${COMPANY.email.talents}` },
            { label: 'Hiring process', value: 'Five steps to day one', href: '/careers/hiring-process' },
            { label: 'AI-assisted first evaluation', value: 'Recruitment AVA', href: '/ai-job-screening' },
          ],
        },
      ]}
    >
      <OperavaIntakeForm kind="CAREERS" defaultPosition={position} />
    </FormPage>
  )
}
