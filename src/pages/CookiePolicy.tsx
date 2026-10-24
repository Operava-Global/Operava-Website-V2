import { useState } from 'react'
import { usePageMeta } from '../site/seo'
import LegalPage from '../site/LegalPage'
import type { LegalDoc } from '../site/content/legal/types'
import { CONSENT_KEY, readConsent, clearConsent } from '../site/consent'

/** Cookie Policy — expands Privacy Policy §15 (Cookies) for this website. */
const COOKIE_POLICY: LegalDoc = {
  title: 'Cookie Policy',
  effective: '17 August 2026',
  jurisdiction: 'Republic of the Philippines (RA 10173)',
  contact: 'compliance@operavaglobal.com',
  source: 'Privacy Policy §15',
  sections: [
    {
      num: '1',
      title: 'About This Policy',
      blocks: [
        { t: 'p', text: 'This Cookie Policy explains how operavaglobal.com uses cookies and similar technologies such as browser storage. It supplements Section 15 (Cookies) of the OPERAVA Privacy Policy.' },
        { t: 'p', text: 'OPERAVA websites or services may use cookies or similar technologies for essential operation, security, preferences, analytics, performance and functionality. Applicable consent or controls are provided where required.' },
      ],
    },
    {
      num: '2',
      title: 'What This Website Uses Today',
      blocks: [
        { t: 'p', text: 'This website currently relies on strictly necessary storage only. It does not use advertising cookies.' },
        {
          t: 'defs',
          items: [
            { term: 'Consent preference', text: `Browser storage (${CONSENT_KEY}) that remembers whether you accepted all cookies or essential only.` },
            { term: 'Security & delivery', text: 'Our hosting and security provider may set strictly necessary cookies to protect the site against abuse and deliver it reliably.' },
            { term: 'Form verification', text: 'Inquiry and application forms use one-time email codes held server-side; no tracking cookie is set for this.' },
          ],
        },
      ],
    },
    {
      num: '3',
      title: 'Third-Party Content',
      blocks: [
        { t: 'p', text: 'Images, videos and fonts are delivered by third-party providers (such as Cloudinary and Google Fonts). When your browser loads them, those providers receive standard request information such as your IP address and browser details, under their own privacy practices.' },
        { t: 'p', text: 'Links to social networks and other external sites are governed by those sites’ own cookie and privacy policies.' },
      ],
    },
    {
      num: '4',
      title: 'Analytics and Changes',
      blocks: [
        { t: 'p', text: 'If OPERAVA introduces analytics or other non-essential cookies, they will only be activated in line with your consent choice where consent is required, and this policy will be updated.' },
      ],
    },
    {
      num: '5',
      title: 'Managing Cookies',
      blocks: [
        { t: 'p', text: 'You can change your consent choice at any time using the control at the top of this page, or restrict cookies in your browser settings — although some functionality may be affected.' },
        { t: 'p', text: 'Questions about cookies or privacy can be sent to compliance@operavaglobal.com.' },
      ],
    },
  ],
}

function ConsentControl() {
  const [choice, setChoice] = useState(readConsent())
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <span className="text-sm">
        Your current choice: <strong className="text-white">{choice === 'accepted' ? 'All cookies' : choice === 'essential' ? 'Essential only' : 'Not set'}</strong>
      </span>
      {choice && (
        <button
          type="button"
          onClick={() => {
            clearConsent()
            setChoice(null)
          }}
          className="h-9 px-5 border border-white text-[11px] tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-colors"
        >
          Reset choice
        </button>
      )}
    </div>
  )
}

export default function CookiePolicy() {
  usePageMeta({
    title: 'Cookie Policy',
    description: 'How operavaglobal.com uses cookies and browser storage, third-party content and how to manage your consent choice.',
    crumbs: [{ name: 'Cookie Policy', path: '/cookie-policy' }],
  })

  return (
    <LegalPage
      doc={COOKIE_POLICY}
      crumb="Cookie Policy"
      intro={
        <>
          <p>What this website stores in your browser, why, and how to change your choice.</p>
          <ConsentControl />
        </>
      }
      related={[
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms & Conditions', to: '/terms' },
        { label: 'Refund Policy', to: '/refund-policy' },
      ]}
    />
  )
}
