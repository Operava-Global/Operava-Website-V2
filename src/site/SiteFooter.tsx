import { Link } from 'react-router-dom'
import { FOOTER_COLUMNS } from './nav'
import { COMPANY } from './content/company'
import { Wordmark } from './SiteHeader'

export default function SiteFooter() {
  return (
    <footer className="border-t border-neutral-900 px-6 lg:px-12 py-16 text-sm">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="col-span-2 lg:col-span-1">
          <Link to="/" aria-label="OPERAVA Global Solutions — Home" className="inline-block mb-6 group">
            <Wordmark intro={false} />
          </Link>
          <p className="text-neutral-500 text-xs leading-relaxed max-w-[240px]">
            Technology, workforce and business process outsourcing — connected remotely and globally. {COMPANY.motto}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {COMPANY.social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`OPERAVA on ${s.label} (@operavaglobal)`}
                title={`${s.label} · @operavaglobal`}
                className="w-10 h-10 rounded-full border border-white bg-white flex items-center justify-center hover:border-accent hover:bg-[#f2e6ff] hover:-translate-y-0.5 transition-[border-color,background-color,transform] duration-300"
              >
                <img src={`/social/brand-${s.label.toLowerCase()}.svg`} alt="" width="20" height="20" loading="lazy" className="w-5 h-5 object-contain" />
              </a>
            ))}
          </div>
          <a href={`mailto:${COMPANY.email.hello}`} className="mt-6 inline-block text-xs text-neutral-400 hover:text-white transition-colors">
            {COMPANY.email.hello}
          </a>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4 className="text-[11px] tracking-widest uppercase font-bold mb-6">{col.heading}</h4>
            <ul className="space-y-3 text-neutral-500 text-[13px]">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Standalone tools are discoverable in the footer only — not the main navigation. */}
      <section aria-label="OPERAVA free utilities" className="mt-12 pt-8 border-t border-neutral-900">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
          <h4 className="text-[11px] tracking-widest uppercase font-bold text-white">Free OPERAVA Utilities</h4>
          <p className="text-xs text-neutral-500">Separate tools, connected by OPERAVA</p>
        </div>
        <nav className="flex flex-wrap gap-2 sm:gap-3" aria-label="Footer utility quick links">
          {[
            { label: 'Currency Converter', href: '/utilities/currency-converter/' },
            { label: 'Calendar', href: '/utilities/calendar/' },
            { label: 'Scientific Calculator', href: '/utilities/scientific-calculator/' },
            { label: 'PDF Viewer & Converter', href: '/utilities/pdf-viewer/' },
            { label: 'Word to PDF Converter', href: '/utilities/word-to-pdf/' },
            { label: 'HTML Viewer & Editor', href: '/utilities/html-editor/' },
            { label: 'News, Politics & Research References', href: '/utilities/references/' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex items-center rounded-full border border-violet-300/25 bg-violet-500/10 px-4 py-2 text-xs sm:text-sm font-medium text-neutral-200 hover:text-white hover:border-violet-400/60 hover:bg-violet-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </section>
      <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col lg:flex-row justify-between gap-4 text-[11px] tracking-widest uppercase text-neutral-600">
        <span className="copyright-chip inline-flex items-center px-4 py-2 rounded-full border border-neutral-700 normal-case tracking-normal font-semibold">© 2024 OPERAVA Global Solutions. All Rights Reserved.</span>
      </div>
    </footer>
  )
}
