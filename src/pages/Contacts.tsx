import { usePageMeta } from '../site/seo'
import { Page, Crumbs, PageHero, SectionHead, Section, CtaBanner, SmartLink } from '../site/ui'
import { contactChannels, type ContactChannel } from '../data/contacts'
import { PHOTO } from '../site/media'

function primaryAction(c: ContactChannel): { label: string; to: string } | null {
  if (c.email) return { label: c.email, to: `mailto:${c.email}` }
  if (c.phone) return { label: `${c.phone} · WhatsApp`, to: `https://wa.me/${c.phone.replace(/[^\d]/g, '')}` }
  if (c.url) {
    const path = c.url.replace(/^https?:\/\/(www\.)?operavaglobal\.com/, '') || '/'
    return { label: c.url.replace(/^https?:\/\//, ''), to: path.startsWith('/') ? path : c.url }
  }
  return null
}

export default function Contacts() {
  usePageMeta({
    title: 'Contact Directory',
    description:
      'OPERAVA contact directory: client inquiries, partnerships, customer service, HR, talent acquisition, compliance, document verification, billing and WhatsApp.',
    crumbs: [{ name: 'Contact Directory', path: '/contacts' }],
  })

  return (
    <Page>
      <Crumbs items={[{ label: 'About', to: '/about' }, { label: 'Contact Directory' }]} />
      <PageHero
        image={PHOTO.customerSupport}
        alt="OPERAVA contact directory"
        kicker="Contact directory"
        title={
          <>
            The right
            <br />
            inbox, first time
          </>
        }
        lead="Every OPERAVA channel, what it is for and when to use it. For new service inquiries, the verified contact form gives you a tracked reference ID."
        height="h-[460px]"
      />

      <Section>
        <SectionHead kicker={`${contactChannels.length} channels`} title={<>Departments</>} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-neutral-900 border border-neutral-900 rounded-[12px] overflow-hidden reveal">
          {contactChannels.map((c, i) => {
            const action = primaryAction(c)
            return (
              <div key={c.id} style={{ ['--i' as string]: i }} className="bg-black p-8 lg:p-10 flex flex-col reveal-child spotlight">
                <p className="text-[10px] tracking-widest uppercase text-neutral-600">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-5 text-[20px] font-black uppercase leading-[0.95]">{c.title}</h3>
                <p className="mt-4 text-sm text-neutral-300 leading-relaxed">{c.description}</p>
                <p className="mt-3 text-xs text-neutral-500 leading-relaxed">{c.whenToContact}</p>
                {action && (
                  <div className="mt-auto pt-8">
                    <SmartLink
                      to={action.to}
                      className="inline-block text-[12px] tracking-wider border-b border-white pb-1 hover:text-accent hover:border-accent transition-colors break-all"
                    >
                      {action.label} →
                    </SmartLink>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      <CtaBanner
        image={PHOTO.handshake}
        kicker="New inquiry"
        title="Use the verified form for a tracked reference ID"
        cta="Contact form →"
        to="/contact"
        secondary={{ label: 'Request a quote', to: '/quote' }}
      />
    </Page>
  )
}
