import { useMemo, useState, type ReactNode } from 'react'
import { Page, Crumbs, Kicker, SmartLink } from './ui'
import type { LegalBlock, LegalDoc } from './content/legal/types'

function Block({ b }: { b: LegalBlock }) {
  switch (b.t) {
    case 'p':
      return <p>{b.text}</p>
    case 'h':
      return <h3 className="pt-4 text-[15px] font-bold uppercase tracking-wide text-white">{b.text}</h3>
    case 'ul':
      return (
        <ul className="space-y-2">
          {b.items.map((it) => (
            <li key={it} className="flex gap-3">
              <span aria-hidden className="mt-[9px] w-1.5 h-1.5 shrink-0 bg-accent" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="space-y-2">
          {b.items.map((it, i) => (
            <li key={it} className="flex gap-3">
              <span className="text-[11px] font-bold text-accent pt-1 w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <span>{it}</span>
            </li>
          ))}
        </ol>
      )
    case 'defs':
      return (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-neutral-900 border border-neutral-900 rounded-[12px] overflow-hidden">
          {b.items.map((d) => (
            <div key={d.term} className="bg-black p-6">
              <dt className="font-black uppercase text-sm text-white">{d.term}</dt>
              <dd className="mt-2 text-sm text-neutral-400">{d.text}</dd>
            </div>
          ))}
        </dl>
      )
    case 'formula':
      return <p className="font-mono text-sm bg-[#0a0a0a] border border-neutral-900 px-5 py-4 text-white">{b.text}</p>
    case 'note':
      return <p className="border-l-2 border-accent pl-5 text-neutral-200">{b.text}</p>
    case 'contact':
      return (
        <div className="bg-[#0a0a0a] border border-neutral-900 rounded-[12px] p-6 space-y-2">
          {b.lines.map((l) => (
            <p key={l} className="font-bold uppercase text-white text-sm">
              {l}
            </p>
          ))}
          {b.email && (
            <a href={`mailto:${b.email}`} className="inline-block text-sm text-white underline underline-offset-4 hover:text-accent">
              {b.email}
            </a>
          )}
          {b.extra?.map((e) => (
            <p key={e.label} className="text-xs text-neutral-400">
              {e.label}:{' '}
              <SmartLink to={e.href} className="text-white underline underline-offset-4 hover:text-accent">
                {e.value}
              </SmartLink>
            </p>
          ))}
        </div>
      )
  }
}

/** Long-form legal document with a sticky, searchable table of contents. */
export default function LegalPage({ doc, intro, crumb, related }: { doc: LegalDoc; intro: ReactNode; crumb: string; related: { label: string; to: string }[] }) {
  const [q, setQ] = useState('')
  const sections = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return doc.sections
    return doc.sections.filter((sec) => (sec.num + ' ' + sec.title + ' ' + JSON.stringify(sec.blocks)).toLowerCase().includes(s))
  }, [q, doc.sections])

  return (
    <Page>
      <Crumbs items={[{ label: 'Legal' }, { label: crumb }]} />
      <header className="pt-10 pb-12 border-b border-neutral-900">
        <Kicker className="mb-6">Legal · {doc.sections.length} sections</Kicker>
        <h1 className="text-[44px] sm:text-[64px] lg:text-[96px] font-black uppercase leading-[0.85] tracking-[-0.04em] reveal">{doc.title}</h1>
        <div className="mt-8 max-w-[760px] text-neutral-400 leading-relaxed reveal">{intro}</div>
        <dl className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6 reveal">
          {[
            ['Entity', 'OPERAVA Global Solutions'],
            ['Effective date', doc.effective],
            ['Jurisdiction', doc.jurisdiction],
            ['Questions', doc.contact],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[10px] tracking-widest uppercase text-neutral-500">{k}</dt>
              <dd className="mt-2 text-sm font-semibold break-words">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 py-12">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <label htmlFor="legal-search" className="sr-only">
              Search this policy
            </label>
            <input
              id="legal-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="SEARCH THIS POLICY"
              className="w-full bg-black border border-neutral-800 px-5 h-12 text-xs tracking-widest uppercase outline-none focus:border-accent placeholder:text-neutral-600"
            />
            <nav aria-label="Sections" className="mt-6 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar hidden lg:block">
              <ol className="space-y-2 text-[13px] text-neutral-500">
                {sections.map((s) => (
                  <li key={s.num}>
                    <a href={`#sec-${s.num}`} className="hover:text-white transition-colors">
                      <span className="text-neutral-700 mr-2">{s.num.padStart(2, '0')}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="mt-8 pt-8 border-t border-neutral-900 space-y-3 hidden lg:block">
              {related.map((r) => (
                <SmartLink key={r.to} to={r.to} className="block text-[11px] tracking-widest uppercase text-neutral-400 hover:text-accent">
                  {r.label} →
                </SmartLink>
              ))}
            </div>
          </div>
        </aside>
        <div className="lg:col-span-8 max-w-[780px]">
          {sections.length === 0 && <p className="text-neutral-400">No sections match “{q}”.</p>}
          {sections.map((s) => (
            <section key={s.num} id={`sec-${s.num}`} className="scroll-mt-24 pb-10 mb-10 border-b border-neutral-900 last:border-0">
              <p className="text-[10px] tracking-widest uppercase text-accent font-bold">Section {s.num}</p>
              <h2 className="mt-3 text-[22px] lg:text-[28px] font-black uppercase leading-[0.95]">{s.title}</h2>
              <div className="mt-6 space-y-4 text-[15px] text-neutral-300 leading-[1.75]">
                {s.blocks.map((b, i) => (
                  <Block key={i} b={b} />
                ))}
              </div>
            </section>
          ))}
          <div className="lg:hidden pt-4 space-y-3">
            {related.map((r) => (
              <SmartLink key={r.to} to={r.to} className="block text-[11px] tracking-widest uppercase text-neutral-400 hover:text-accent">
                {r.label} →
              </SmartLink>
            ))}
          </div>
        </div>
      </div>
    </Page>
  )
}
