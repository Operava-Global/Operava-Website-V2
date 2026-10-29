import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import EcosystemLogos from '../components/EcosystemLogos'
import PhilgepsApproved from '../components/PhilgepsApproved'

/** Adds `.visible` to every `.reveal` element as it scrolls into view — including ones rendered later. */
function useRevealObserver(pathname: string) {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    const scan = () => document.querySelectorAll('.reveal:not(.visible)').forEach((el) => io.observe(el))
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.getElementById('root') || document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])
}

/** Scroll to top on page change, or to the #hash target when present. */
function useScrollManager(pathname: string, hash: string) {
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      let tries = 0
      const tick = () => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else if (tries++ < 10) window.setTimeout(tick, 60)
      }
      tick()
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])
}

/** Pointer-follow highlight for `.spotlight` elements (one delegated listener). */
function useSpotlight() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.('.spotlight') as HTMLElement | null
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
}

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation()
  useRevealObserver(pathname)
  useScrollManager(pathname, hash)
  useSpotlight()
  const wasApplicantPortal = useRef(false)
  useEffect(() => {
    const inApplicantPortal = new RegExp('^/(?:ava-screening|applicant-portal)(?:/|$)').test(pathname)
    if (inApplicantPortal === wasApplicantPortal.current) return
    wasApplicantPortal.current = inApplicantPortal
    // Opt in to white on portal entry. Restore the stored marketing-site
    // preference on exit; do not persist this portal-specific default.
    let appearance: 'light' | 'dark' = 'light'
    if (!inApplicantPortal) {
      try { appearance = localStorage.getItem('operava-theme') === 'light' ? 'light' : 'dark' }
      catch { appearance = 'dark' }
    }
    document.documentElement.dataset.theme = appearance
    document.documentElement.style.colorScheme = appearance
    window.dispatchEvent(new Event('operava-theme-change'))
  }, [pathname])

  // Ava Screening is a focused assessment application, not a marketing page.
  // Retain the shared design tokens and accessible main landmark, while keeping
  // all website navigation, trusted brands and footer out of this private flow.
  if (/^\/(?:ava-screening|applicant-portal|recruitment-admin)(?:\/|$)/.test(pathname)) {
    return (
      <div
        id="site-shell"
        className={`app-shell ava-app-host ${pathname.startsWith('/recruitment-admin') ? 'ava-admin-host' : 'ava-screening-host'} min-h-screen flex flex-col`}
        style={{ paddingTop: 'var(--safe-area-inset-top)', boxSizing: 'border-box' }}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 text-xs"
        >
          Skip to screening
        </a>
        <main id="main" key={pathname} className="flex-1">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div
      id="site-shell"
      className="app-shell min-h-screen bg-black text-white overflow-x-clip flex flex-col"
      style={{ paddingTop: 'var(--safe-area-inset-top)', boxSizing: 'border-box' }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest"
      >
        Skip to content
      </a>
      <div className="operava-ambient" aria-hidden="true" />
      <div className="grain" aria-hidden />
      <SiteHeader />
      <main id="main" key={pathname} className="flex-1 page-enter">
        {children}
      </main>
      <EcosystemLogos />
      <PhilgepsApproved />
      <SiteFooter />
    </div>
  )
}
