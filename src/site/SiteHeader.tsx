import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MEGA_TABS, type MegaTab } from './nav'
import { Img } from './ui'
import { Moon, Sun } from 'lucide-react'
import { searchSite } from './searchIndex'
import ThemeToggle from './ThemeToggle'

type TabId = MegaTab['id']

/** Which top-level tab a path belongs to (for the active underline) */
function tabForPath(path: string): TabId | null {
  if (path.startsWith('/insights') || path.startsWith('/learning')) return 'insights'
  if (path.startsWith('/services') || path.startsWith('/quote') || path.startsWith('/request-a-quote')) return 'services'
  if (path.startsWith('/industries')) return 'industries'
  if (/^\/(careers|apply|academy|ai-job-screening)/.test(path)) return 'careers'
  if (/^\/(about|contact|contacts|verification|payment|pay|faq)(\/|$)/.test(path)) return 'about'
  return null
}

export function Wordmark({ size = 'md', intro = true }: { size?: 'md' | 'lg'; intro?: boolean }) {
  return (
    <span className="flex items-center"><span className={`${size === 'lg' ? 'text-[22px]' : 'text-[20px]'} font-black tracking-tight uppercase leading-none`}>OPERAVA</span>
    </span>
  )
}

function MegaPanel({ tab, onNavigate }: { tab: MegaTab; onNavigate: () => void }) {
  const f = tab.feature
  return (
    <div className="site-mega-panel mx-auto w-full max-w-[1480px] p-8 xl:p-12 grid grid-cols-5 gap-6 xl:gap-10">
      <div className={`col-span-4 grid ${tab.cols === 4 ? 'grid-cols-4' : 'grid-cols-3'} gap-6 xl:gap-10`}>
        {tab.imageCards?.map((c) => (
          <Link key={c.to} to={c.to} onClick={onNavigate} className="space-y-6 group mega-col" style={{ ['--i' as string]: tab.imageCards!.indexOf(c) }}>
            <div className="h-32 overflow-hidden rounded bg-neutral-900">
              <Img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
            </div>
            <div>
              <p className="font-bold text-sm group-hover:text-accent transition-colors">{c.title}</p>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{c.sub}</p>
            </div>
          </Link>
        ))}
        {tab.columns.map((col, i) => (
          <div key={col.heading || i} className="mega-col" style={{ ['--i' as string]: i + (tab.imageCards?.length || 0) }}>
            {col.heading && (
              <h4 className={`text-[11px] tracking-widest mb-6 uppercase font-bold ${col.accent ? 'text-accent' : 'text-neutral-500'}`}>{col.heading}</h4>
            )}
            {col.links && (
              <ul className={`${tab.imageCards ? 'space-y-3' : 'space-y-4'} text-sm ${col.accent ? '' : 'text-neutral-300'}`}>
                {col.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to} onClick={onNavigate} className="hover:text-accent transition-colors text-left">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {col.text && <p className={`text-sm text-neutral-300 leading-relaxed ${col.links ? 'mt-6 text-neutral-500' : ''}`}>{col.text}</p>}
            {col.cta && (
              <Link
                to={col.cta.to}
                onClick={onNavigate}
                className={`inline-block text-sm border-b border-white pb-1 hover:text-accent hover:border-accent transition-colors ${col.links ? 'mt-6' : ''}`}
              >
                {col.cta.label}
              </Link>
            )}
          </div>
        ))}
      </div>
      {f.kind === 'image' ? (
        <Link to={f.to} onClick={onNavigate} className="photo-overlay relative h-[300px] overflow-hidden bg-neutral-900 rounded group mega-col" style={{ ['--i' as string]: 5 }}>
          <Img src={f.image} alt={f.title} className="w-full h-full object-cover brightness-75 group-hover:scale-[1.04] transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black via-black/70 to-transparent w-full">
            <p className="text-xs tracking-widest uppercase text-accent mb-2">{f.kicker}</p>
            <p className="font-bold leading-tight">{f.title}</p>
          </div>
        </Link>
      ) : (
        <div className="bg-neutral-900 p-8 rounded flex flex-col justify-center mega-col" style={{ ['--i' as string]: 5 }}>
          <p className="text-xs tracking-widest text-accent uppercase mb-4">{f.kicker}</p>
          <p className="text-2xl font-bold uppercase leading-none">{f.title}</p>
          <Link
            to={f.to}
            onClick={onNavigate}
            className="mt-6 inline-flex items-center text-xs tracking-widest uppercase border border-white px-5 h-10 w-fit hover:bg-white hover:text-black transition-colors"
          >
            {f.cta || 'Explore'}
          </Link>
        </div>
      )}
    </div>
  )
}

export default function SiteHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const [hover, setHover] = useState<TabId | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [accordion, setAccordion] = useState<TabId | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('operava-theme', next) } catch { /* storage is optional */ }
    setTheme(next)
  }
  const [query, setQuery] = useState('')
  const lastY = useRef(0)
  const progressRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)
  const active = tabForPath(location.pathname)
  const results = searchSite(query)

  // hide on scroll down, show on scroll up (index behaviour)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      progressRef.current?.style.setProperty('--p', String(max > 0 ? Math.min(1, y / max) : 0))
      setScrolled(y > 20)
      lastY.current = y
      setHover(null)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close everything on navigation
  useEffect(() => {
    setHover(null)
    setDrawer(false)
    setSearchOpen(false)
    setQuery('')
  }, [location.pathname])

  // Escape closes menus; lock scroll while the drawer is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHover(null)
        setDrawer(false)
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawer])

  const open = (id: TabId) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setHover(id)
  }
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setHover(null), 140)
  }

  const goTo = (to: string) => {
    if (to === location.pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setHover(null)
    setDrawer(false)
  }

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    if (results[0]) navigate(results[0].path)
  }

  const current = MEGA_TABS.find((t) => t.id === hover)

  return (
    <>
      <header
        className={`site-header sticky z-50 border-b border-neutral-900 h-16 flex items-center justify-between px-6 lg:px-8 transition-[background-color,border-color,box-shadow] duration-500 ${scrolled ? 'site-header--scrolled' : ''} ${
          'translate-y-0'
        }`}
        style={{ top: 'var(--safe-area-inset-top)' }}
      >
        <div ref={progressRef} aria-hidden className="scroll-progress absolute left-0 bottom-[-1px] h-px w-full bg-accent pointer-events-none" />
        <Link to="/" onClick={() => goTo('/')} className="flex items-center group relative z-10 shrink-0" aria-label="OPERAVA Global Solutions — Home">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden lg:flex items-center justify-center gap-1 h-full absolute left-1/2 -translate-x-1/2">
          {MEGA_TABS.map((t) => (
            <div key={t.id} className="h-full flex items-center relative" onMouseEnter={() => open(t.id)} onMouseLeave={scheduleClose}>
              <Link
                to={t.to}
                data-tab={t.id}
                onClick={() => goTo(t.to)}
                onFocus={() => open(t.id)}
                aria-expanded={hover === t.id}
                aria-haspopup="true"
                className={`site-nav-link h-full px-3 xl:px-4 flex items-center justify-center text-[11px] tracking-[0.14em] font-semibold uppercase hover:text-accent transition-colors ${
                  active === t.id ? 'text-white border-b border-white' : hover === t.id ? 'text-accent' : 'text-white/90'
                }`}
              >
                {t.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setSearchOpen((s) => !s)}
            aria-label={searchOpen ? 'Close search' : 'Search the site'}
            aria-expanded={searchOpen}
            className="w-9 h-9 rounded-full border border-neutral-800 flex items-center justify-center hover:border-white transition-colors"
          >
            <span className="text-sm" aria-hidden>
              {searchOpen ? '✕' : '⌕'}
            </span>
          </button>
          <Link
            to="/contact"
            className="hidden lg:flex h-9 px-4 xl:px-5 border border-white text-[11px] tracking-widest font-semibold uppercase items-center btn-sweep hover:text-black transition-colors duration-300"
          >
            Contact
          </Link>
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            className="lg:hidden w-9 h-9 flex flex-col justify-center gap-1.5"
          >
            <span className="h-[2px] w-6 bg-white block" />
            <span className="h-[2px] w-6 bg-white block" />
            <span className="h-[2px] w-4 bg-white block" />
          </button>
        </div>

        {searchOpen && (
          <div className="absolute top-16 left-0 w-full bg-[#0a0a0a] border-b border-neutral-900 p-6 lg:p-8 z-50">
            <form role="search" onSubmit={submitSearch} className="flex gap-4">
              <label htmlFor="site-search" className="sr-only">
                Search operavaglobal.com
              </label>
              <input
                id="site-search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH OPERAVAGLOBAL.COM"
                autoComplete="off"
                className="flex-1 min-w-0 bg-black border border-neutral-800 px-6 h-12 text-sm tracking-widest uppercase outline-none focus:border-accent placeholder:text-neutral-600"
              />
              <button type="submit" className="h-12 px-6 lg:px-8 bg-white text-black text-xs tracking-widest font-bold uppercase hover:bg-accent-solid hover:text-white transition-colors">
                Search
              </button>
            </form>
            {query.trim() && (
              <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-neutral-900 border border-neutral-900 max-h-[60vh] overflow-y-auto">
                {results.length === 0 && <li className="bg-black p-5 text-sm text-neutral-400">No pages match “{query}”.</li>}
                {results.map((r) => (
                  <li key={r.path}>
                    <Link to={r.path} className="block bg-black p-5 hover:bg-[#111] group h-full">
                      <p className="text-[10px] tracking-widest uppercase text-accent font-bold">{r.section}</p>
                      <p className="mt-1 font-bold group-hover:text-accent transition-colors">{r.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div
          className={`site-mega-menu hidden lg:block absolute left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-accent/50 shadow-2xl transition-all duration-300 ease-out ${
            current ? 'opacity-100 translate-y-0 pointer-events-auto visible' : 'opacity-0 -translate-y-2 pointer-events-none invisible'
          }`}
          style={{ top: '64px' }}
          onMouseEnter={() => hover && open(hover)}
          onMouseLeave={scheduleClose}
        >
          {current && <MegaPanel tab={current} onNavigate={() => setHover(null)} />}
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-[80] lg:hidden transition ${drawer ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!drawer}>
        <div
          onClick={() => setDrawer(false)}
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity ${drawer ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute right-0 top-0 h-full w-[85%] max-w-[360px] bg-black border-l border-neutral-900 p-8 flex flex-col gap-8 overflow-y-auto transition-transform duration-300 ${
            drawer ? 'translate-x-0' : 'translate-x-full invisible'
          }`}
        >
          <div className="flex justify-between items-center">
            <Wordmark intro={false} />
            <button
              type="button"
              onClick={() => setDrawer(false)}
              aria-label="Close menu"
              className="w-9 h-9 border border-neutral-800 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col">
            {MEGA_TABS.map((t) => {
              const expanded = accordion === t.id
              const links = [...(t.imageCards || []).map((c) => ({ label: c.title, to: c.to })), ...t.columns.flatMap((c) => c.links || [])]
              const unique = links.filter((l, i) => links.findIndex((x) => x.to === l.to) === i)
              return (
                <div key={t.id} className="border-b border-neutral-900">
                  <button
                    type="button"
                    onClick={() => setAccordion(expanded ? null : t.id)}
                    aria-expanded={expanded}
                    className="w-full flex justify-between items-center py-5 text-[13px] tracking-widest uppercase font-semibold"
                  >
                    {t.label} <span className="text-neutral-500">{expanded ? '−' : '+'}</span>
                  </button>
                  {expanded && (
                    <div className="pb-6 space-y-3 text-sm text-neutral-400">
                      <Link to={t.to} className="block text-white underline underline-offset-4">
                        Go to {t.label} page →
                      </Link>
                      <p>{t.blurb}</p>
                      <ul className="pt-2 space-y-3">
                        {unique.map((l) => (
                          <li key={l.to}>
                            <Link to={l.to} className="text-neutral-300 hover:text-accent">
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      {t.feature.image && (
                        <div className="h-40 rounded overflow-hidden mt-3">
                          <Img src={t.feature.image} alt={t.label} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <Link to="/contact" className="mt-auto shrink-0 h-12 bg-white text-black font-bold uppercase text-xs tracking-widest flex items-center justify-center">
            Contact Us
          </Link>
        </div>
      </div>
    </>
  )
}
