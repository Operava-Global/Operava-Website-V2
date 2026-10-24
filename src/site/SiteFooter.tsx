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
                  {l.external ? (
                    <a href={l.to} className="hover:text-white transition-colors">
                      {l.label}
                    </a>
                  ) : (
                    <Link to={l.to} className="hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col lg:flex-row justify-between gap-4 text-[11px] tracking-widest uppercase text-neutral-600">
        <span className="copyright-chip inline-flex items-center px-4 py-2 rounded-full border border-neutral-700 normal-case tracking-normal font-semibold">© 2024 OPERAVA Global Solutions. All Rights Reserved.</span>
      </div>
    </footer>
  )
}
