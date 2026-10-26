import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { readConsent, writeConsent } from './consent'

/** Slim bottom bar in the index.html style; remembers the choice in browser storage. */
export default function CookieNotice() {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(readConsent() === null), 1200)
    const onChange = () => setVisible(readConsent() === null)
    window.addEventListener('operava:consent', onChange)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('operava:consent', onChange)
    }
  }, [])

  // Recruitment consent is collected within Ava; prevent a marketing-site
  // cookie banner from obscuring timed assessment inputs on any screen size.
  if (!visible || /^\/(?:ava-screening|recruitment-admin)(?:\/|$)/.test(pathname)) return null

  const choose = (c: 'accepted' | 'essential') => {
    writeConsent(c)
    setVisible(false)
  }

  return (
    <div role="region" aria-label="Cookie notice" className="fixed bottom-4 left-4 right-4 z-[70] lg:right-auto lg:max-w-[480px]">
      <div className="bg-[#0a0a0a] border border-neutral-800 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <p className="text-[10px] tracking-[0.3em] uppercase text-accent font-bold">Cookies</p>
        <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
          We use essential storage to run and secure this site. No advertising cookies.{' '}
          <Link to="/cookie-policy" className="text-white underline underline-offset-4 hover:text-accent">
            Cookie Policy
          </Link>
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => choose('accepted')}
            className="h-9 px-5 bg-white text-black text-[11px] tracking-widest uppercase font-bold hover:bg-accent-solid hover:text-white transition-colors"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => choose('essential')}
            className="h-9 px-5 border border-white text-[11px] tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-colors"
          >
            Essential only
          </button>
        </div>
      </div>
    </div>
  )
}
