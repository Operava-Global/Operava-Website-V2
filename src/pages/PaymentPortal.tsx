import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, SplitText, Bullets, Card, Kicker, ArrowLink, SmartLink } from '../site/ui'
import { COMPANY } from '../site/content/company'
import { LOCAL } from '../site/media'

/**
 * Client payments are handled on the dedicated portal (pay.operavaglobal.com).
 * This page only routes clients there — it never collects card or bank details itself.
 */
export default function PaymentPortal() {
  usePageMeta({
    title: 'Payment Portal',
    description: 'Pay OPERAVA invoices through the official client payment portal at pay.operavaglobal.com. Billing questions: billing@operavaglobal.com.',
    crumbs: [{ name: 'Payment Portal', path: '/payment-portal' }],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'About', to: '/about' }, { label: 'Payment Portal' }]} />
      <PageHero
        image={LOCAL.dataCenter}
        alt="OPERAVA payment portal"
        kicker="Client payments"
        title={
          <>
            Payment
            <br />
            portal
          </>
        }
        lead="Pay OPERAVA invoices securely through the official client payment portal."
        height="h-[440px]"
      >
        <div className="mt-8 flex flex-wrap gap-4">
          <SmartLink
            to={COMPANY.pay}
            className="inline-flex items-center h-12 px-8 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-accent-solid hover:text-white transition-colors"
          >
            Open pay.operavaglobal.com ↗
          </SmartLink>
        </div>
      </PageHero>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-12">
        <Card accent>
          <Kicker className="!text-white/80">Pay an invoice</Kicker>
          <h3 className="mt-4 font-black uppercase text-2xl leading-none">pay.operavaglobal.com</h3>
          <p className="mt-4 text-sm text-white/90 leading-relaxed">Have your invoice number ready. The portal opens in a new tab.</p>
          <a
            href={COMPANY.pay}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center h-9 px-5 bg-black text-white text-[11px] tracking-widest uppercase font-bold"
          >
            Go to portal ↗
          </a>
        </Card>
        <Card>
          <Kicker>Billing desk</Kicker>
          <h3 className="mt-4 font-black uppercase text-2xl leading-none">Invoices &amp; receipts</h3>
          <p className="mt-4 text-sm text-neutral-400 leading-relaxed">Invoice copies, payment confirmations and billing questions.</p>
          <ArrowLink to={`mailto:${COMPANY.email.billing}`} className="mt-8">
            {COMPANY.email.billing}
          </ArrowLink>
        </Card>
        <Card>
          <Kicker>Refunds &amp; credits</Kicker>
          <h3 className="mt-4 font-black uppercase text-2xl leading-none">Refund Policy</h3>
          <p className="mt-4 text-sm text-neutral-400 leading-relaxed">How refunds, cancellations, service credits and billing errors are handled.</p>
          <ArrowLink to="/refund-policy" className="mt-8">
            Read the policy →
          </ArrowLink>
        </Card>
      </div>

      <SplitText label="Payment safety" title={<>Protect your payment</>}>
        <Bullets
          items={[
            'Only pay through pay.operavaglobal.com or the bank details printed on your official OPERAVA invoice.',
            'OPERAVA will never ask you to send card numbers, CVV codes or passwords by email, chat or phone.',
            'If you receive changed bank details or an unexpected payment request, confirm with billing@operavaglobal.com before paying.',
            'Payment terms for each engagement are set out in your agreement and the Terms & Conditions.',
          ]}
        />
      </SplitText>
    </Page>
  )
}
