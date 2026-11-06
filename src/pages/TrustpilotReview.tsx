import { usePageMeta } from '../site/seo'
import { Page, Crumbs, SolidButton, OutlineButton } from '../site/ui'

const TRUSTPILOT_URL = 'https://www.trustpilot.com/review/operavaglobal.com'

export default function TrustpilotReview() {
  usePageMeta({
    title: 'Trustpilot Reviews',
    description: 'Visit OPERAVA Global Solutions on Trustpilot to read customer feedback or share your experience.',
    crumbs: [{ name: 'Trustpilot Reviews', path: '/trustpilot-review' }],
  })

  return (
    <Page className="py-12 lg:py-20">
      <Crumbs items={[{ label: 'Trustpilot Reviews' }]} />
      <section className="mt-8 max-w-4xl mx-auto text-center reveal">
        <p className="text-[11px] tracking-[0.3em] uppercase text-accent font-bold">Customer feedback</p>
        <h1 className="mt-5 text-4xl sm:text-6xl font-black uppercase leading-[0.95] tracking-[-0.04em]">
          Your experience
          <br />
          <span className="text-neutral-500">matters to us.</span>
        </h1>
        <p className="mt-7 mx-auto max-w-2xl text-sm sm:text-base text-neutral-400 leading-relaxed">
          Visit our Trustpilot profile to read feedback shared by customers and, if you have worked with OPERAVA,
          leave an honest review about your experience.
        </p>
        <a
          href={TRUSTPILOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open the OPERAVA Trustpilot profile in a new tab"
          className="mt-9 inline-flex items-center justify-center gap-3 rounded-full border border-neutral-700 bg-white px-7 py-4 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <img src="/media/trustpilot_transparent.webp" alt="Trustpilot" width="142" height="36" className="w-[142px] h-auto object-contain" />
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-900">Visit our profile ↗</span>
        </a>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <SolidButton to="/contact">Contact OPERAVA</SolidButton>
          <OutlineButton to="/" className="h-12 px-8">Back to home</OutlineButton>
        </div>
        <p className="mt-8 text-xs text-neutral-500">
          Trustpilot is an independent third-party review platform. Reviews and ratings are hosted and managed by Trustpilot.
        </p>
      </section>
    </Page>
  )
}
