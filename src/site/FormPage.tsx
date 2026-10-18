import type { ReactNode } from 'react'
import { Page, Crumbs, PageHero, Kicker, SmartLink, type Crumb } from './ui'

export interface SideBlock {
  title: string
  items: { label: string; value?: string; href?: string }[]
}

/** Shared layout for the intake-form pages (Contact, Quote, Apply) */
export default function FormPage({
  crumbs,
  image,
  kicker,
  title,
  lead,
  formTitle,
  steps,
  side,
  children,
}: {
  crumbs: Crumb[]
  image?: string
  kicker: string
  title: ReactNode
  lead: ReactNode
  formTitle: string
  steps: string[]
  side: SideBlock[]
  children: ReactNode
}) {
  return (
    <Page>
      <Crumbs items={crumbs} />
      <PageHero image={image} alt="" kicker={kicker} title={title} lead={lead} height="h-[420px]" titleClass="text-[40px] sm:text-[56px] lg:text-[76px]" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 py-12 lg:py-16">
        <section className="lg:col-span-7 bg-[#0a0a0a] border border-neutral-900 rounded-[12px] p-6 sm:p-8 lg:p-12" aria-labelledby="form-title">
          <Kicker className="mb-3">Secure form · email verified</Kicker>
          <h2 id="form-title" className="text-[26px] lg:text-[32px] font-black uppercase leading-[0.95] mb-8">
            {formTitle}
          </h2>
          {children}
        </section>
        <aside className="lg:col-span-5 space-y-6">
          <div className="border border-neutral-900 rounded-[12px] p-8">
            <p className="text-[11px] tracking-widest uppercase font-bold mb-6">What happens next</p>
            <ol className="space-y-5">
              {steps.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="text-[10px] tracking-widest text-accent font-bold pt-1">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-sm text-neutral-300 leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          {side.map((b) => (
            <div key={b.title} className="border border-neutral-900 rounded-[12px] p-8">
              <p className="text-[11px] tracking-widest uppercase font-bold mb-6">{b.title}</p>
              <ul className="space-y-4">
                {b.items.map((it) => (
                  <li key={it.label}>
                    <p className="text-[10px] tracking-widest uppercase text-neutral-500">{it.label}</p>
                    {it.href ? (
                      <SmartLink to={it.href} className="mt-1 inline-block text-sm text-white hover:text-accent transition-colors break-all">
                        {it.value || it.href}
                      </SmartLink>
                    ) : (
                      <p className="mt-1 text-sm text-neutral-300">{it.value}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
      </div>
    </Page>
  )
}
