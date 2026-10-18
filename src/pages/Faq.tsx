import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, Faq as FaqList, Kicker, CtaBanner } from '../site/ui'
import { FAQ_GROUPS } from '../site/content/company'
import { LOCAL, PHOTO } from '../site/media'

export default function Faq() {
  usePageMeta({
    title: 'FAQ',
    description: 'Frequently asked questions about OPERAVA Global Solutions — services, engagements, registration, careers and contact.',
    crumbs: [{ name: 'FAQ', path: '/faq' }],
    faqs: FAQ_GROUPS.flatMap((g) => g.items),
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'About', to: '/about' }, { label: 'FAQ' }]} />
      <PageHero
        image={LOCAL.aiDashboard}
        alt="Frequently asked questions"
        kicker="FAQ"
        title={
          <>
            Questions,
            <br />
            answered
          </>
        }
        lead="Plain answers about what OPERAVA does, how engagements work, our registration and careers."
        height="h-[440px]"
      />

      <div className="py-12 lg:py-16 space-y-16">
        {FAQ_GROUPS.map((g, i) => (
          <section key={g.group} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 reveal" aria-labelledby={`faq-${i}`}>
            <div className="lg:col-span-4">
              <Kicker>{String(i + 1).padStart(2, '0')}</Kicker>
              <h2 id={`faq-${i}`} className="mt-4 text-[28px] lg:text-[36px] font-black uppercase leading-[0.9]">
                {g.group}
              </h2>
            </div>
            <div className="lg:col-span-8">
              <FaqList items={g.items} />
            </div>
          </section>
        ))}
      </div>

      <CtaBanner
        image={PHOTO.customerSupport}
        kicker="Still have a question?"
        title="Ask us directly — we’ll point you to the right team"
        cta="Contact us →"
        to="/contact"
        secondary={{ label: 'Contact directory', to: '/contacts' }}
      />
    </Page>
  )
}
