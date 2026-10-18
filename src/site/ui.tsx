/**
 * Shared building blocks that reproduce the index.html design vocabulary:
 * kickers, black uppercase display type, 12px bordered cards, gap-[1px] panels,
 * image heroes with gradients, underline arrow links and square outline buttons.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

/* ---------- links & buttons ---------- */

export function SmartLink({
  to,
  className,
  children,
  onClick,
  ariaLabel,
  style,
}: {
  to: string
  className?: string
  children: ReactNode
  onClick?: () => void
  ariaLabel?: string
  style?: CSSProperties
}) {
  const external = /^(https?:|mailto:|tel:)/.test(to)
  if (external) {
    const newTab = to.startsWith('http')
    return (
      <a
        href={to}
        className={className}
        style={style}
        onClick={onClick}
        aria-label={ariaLabel}
        {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={className} style={style} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </Link>
  )
}

/** Underlined uppercase link — "Read more →" */
export function ArrowLink({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  return (
    <SmartLink
      to={to}
      className={`inline-block text-[11px] tracking-widest uppercase border-b border-white w-fit pb-2 hover:border-accent hover:text-accent transition-colors ${className}`}
    >
      {children}
    </SmartLink>
  )
}

/** Square outline button — "See Careers", "Apply →" */
export function OutlineButton({
  to,
  children,
  size = 'md',
  className = '',
}: {
  to: string
  children: ReactNode
  size?: 'sm' | 'md'
  className?: string
}) {
  const s = size === 'sm' ? 'h-9 px-5 text-[11px]' : 'h-10 px-6 text-xs'
  return (
    <SmartLink
      to={to}
      className={`inline-flex items-center ${s} border border-white tracking-widest font-semibold uppercase btn-sweep hover:text-black transition-colors duration-300 ${className}`}
    >
      {children}
    </SmartLink>
  )
}

/** Solid white button — "Join Us →" */
export function SolidButton({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  return (
    <SmartLink
      to={to}
      className={`inline-flex items-center h-12 px-8 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-accent-solid hover:text-white transition-colors ${className}`}
    >
      {children}
    </SmartLink>
  )
}

/* ---------- type ---------- */

export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] tracking-[0.3em] uppercase text-accent font-bold ${className}`}>{children}</p>
}

export function Muted({ children }: { children: ReactNode }) {
  return <span className="text-neutral-600">{children}</span>
}

/* ---------- media ---------- */

export function Img({
  src,
  alt,
  className = '',
  eager = false,
}: {
  src?: string
  alt: string
  className?: string
  eager?: boolean
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.35),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(61,75,255,0.25),transparent_50%)] bg-neutral-900`}
      />
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}

/* ---------- layout ---------- */

export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 lg:px-12 ${className}`}>{children}</div>
}

export interface Crumb {
  label: string
  to?: string
}

export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="pt-8">
      <ol className="flex flex-wrap items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-neutral-500">
        <li>
          <Link to="/" className="hover:text-white transition-colors">
            Home
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            <span aria-hidden className="text-neutral-700">
              /
            </span>
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} className="hover:text-white transition-colors">
                {c.label}
              </Link>
            ) : (
              <span className="text-neutral-300" aria-current={i === items.length - 1 ? 'page' : undefined}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Rounded image hero used by every inner page (index: Insights / Services / Careers / About) */
export function PageHero({
  image,
  alt,
  kicker,
  pill,
  title,
  lead,
  children,
  align = 'end',
  gradient = 'up',
  height = 'h-[500px]',
  brightness = 'brightness-[0.6]',
  titleClass = 'text-[40px] sm:text-[56px] lg:text-[84px]',
}: {
  image?: string
  alt?: string
  kicker?: string
  pill?: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
  align?: 'end' | 'center'
  gradient?: 'up' | 'right'
  height?: string
  brightness?: string
  titleClass?: string
}) {
  return (
    <section className={`photo-overlay relative ${height} max-lg:h-auto min-h-[460px] rounded-[12px] overflow-hidden border border-neutral-900 mt-6`}>
      <Img src={image} alt={alt || ''} eager className={`absolute inset-0 w-full h-full object-cover hero-zoom ${brightness}`} />
      <div
        className={`absolute inset-0 ${
          gradient === 'up'
            ? 'bg-gradient-to-t from-black via-black/40 to-transparent'
            : 'bg-gradient-to-r from-black via-black/50 to-transparent'
        }`}
      />
      <div
        className={`relative z-10 h-full min-h-[460px] flex flex-col ${align === 'end' ? 'justify-end' : 'justify-center'} p-7 sm:p-10 lg:p-16 ${
          gradient === 'right' ? 'max-w-[820px]' : ''
        }`}
      >
        {pill && (
          <p className="text-[11px] tracking-[0.3em] uppercase text-white bg-accent-solid w-fit px-3 py-1 rounded-full font-bold mb-6 hero-in" style={{ ['--d' as string]: '0.1s' }}>
            {pill}
          </p>
        )}
        {kicker && (
          <div className="hero-in" style={{ ['--d' as string]: '0.1s' }}>
            <Kicker className="mb-4">{kicker}</Kicker>
          </div>
        )}
        <h1 style={{ ['--d' as string]: '0.2s' }} className={`hero-in ${titleClass} font-black uppercase leading-[0.85] tracking-[-0.02em] max-w-[960px] [overflow-wrap:anywhere]`}>
          {title}
        </h1>
        {lead && (
          <div className="mt-6 max-w-[620px] text-neutral-200 leading-relaxed hero-in" style={{ ['--d' as string]: '0.35s' }}>
            {lead}
          </div>
        )}
        {children && (
          <div className="hero-in" style={{ ['--d' as string]: '0.5s' }}>
            {children}
          </div>
        )}
      </div>
    </section>
  )
}

/** Big display H2 with a small right-aligned note (index: "Reinvented with…") */
export function SectionHead({
  title,
  note,
  kicker,
  className = '',
}: {
  title: ReactNode
  note?: ReactNode
  kicker?: string
  className?: string
}) {
  return (
    <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 reveal ${className}`}>
      <div>
        {kicker && <Kicker className="mb-4">{kicker}</Kicker>}
        <h2 className="text-[34px] sm:text-[44px] lg:text-[64px] font-black uppercase leading-[0.85] tracking-[-0.03em]">{title}</h2>
      </div>
      {note && (
        <p className="text-xs tracking-widest uppercase text-neutral-500 max-w-[300px] leading-relaxed lg:text-right">{note}</p>
      )}
    </div>
  )
}

export function Section({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-16 lg:py-20 scroll-mt-24 ${className}`}>
      {children}
    </section>
  )
}

/* ---------- panels & cards ---------- */

export interface PanelItem {
  n: string
  d: string
  to?: string
  label?: string
}

/** gap-[1px] numbered panel (index: Services page "01 Strategy …") */
export function NumberPanel({
  items,
  cols = 'lg:grid-cols-5',
  start = 1,
  size = 'lg',
}: {
  items: PanelItem[]
  cols?: string
  start?: number
  size?: 'lg' | 'md'
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-[1px] bg-neutral-900 border border-neutral-900 rounded-[12px] overflow-hidden`}>
      {items.map((it, i) => {
        const inner = (
          <>
            <p className="text-[10px] tracking-widest uppercase text-neutral-600 group-hover:text-accent transition-colors">
              {String(i + start).padStart(2, '0')}
              {it.label ? ` · ${it.label}` : ''}
            </p>
            <h3
              className={`mt-6 font-black uppercase leading-[0.95] ${
                size === 'lg' ? 'text-[24px] lg:text-[26px]' : 'text-[19px] lg:text-[20px]'
              } [overflow-wrap:anywhere]`}
            >
              {it.n}
            </h3>
            <p className="mt-4 text-sm text-neutral-400 leading-relaxed">{it.d}</p>
            {it.to && (
              <div className="mt-auto pt-10">
                <span className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                  <span className="arrow-nudge">→</span>
                </span>
              </div>
            )}
          </>
        )
        const cls = 'bg-black p-8 lg:p-10 hover:bg-[#0a0a0a] transition-colors group flex flex-col reveal-child spotlight'
        const style = { ['--i' as string]: i }
        return it.to ? (
          <SmartLink key={it.n} to={it.to} className={cls} style={style}>
            {inner}
          </SmartLink>
        ) : (
          <div key={it.n} className={cls} style={style}>
            {inner}
          </div>
        )
      })}
    </div>
  )
}

/** Simple list panel (index: Industries "Consumer Goods →" row) */
export function ListPanel({ items, cols = 'lg:grid-cols-4' }: { items: { label: string; to?: string }[]; cols?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-[1px] bg-neutral-900 border border-neutral-900 rounded-[12px] overflow-hidden`}>
      {items.map((it, i) =>
        it.to ? (
          <SmartLink
            key={it.label}
            to={it.to}
            style={{ ['--i' as string]: i }}
            className="bg-black p-8 flex justify-between items-center gap-4 hover:bg-[#0a0a0a] group reveal-child spotlight"
          >
            <span className="font-bold uppercase text-sm">{it.label}</span>
            <span className="arrow-nudge group-hover:text-accent transition-colors">→</span>
          </SmartLink>
        ) : (
          <div key={it.label} style={{ ['--i' as string]: i }} className="bg-black p-8 flex justify-between items-center gap-4 reveal-child">
            <span className="font-bold uppercase text-sm text-neutral-300">{it.label}</span>
            <span className="text-neutral-700">•</span>
          </div>
        ),
      )}
    </div>
  )
}

/** Image card (index: Insights "Read report →" cards) */
export function ImageCard({
  image,
  kicker,
  title,
  desc,
  to,
  cta = 'Read more →',
  imgHeight = 'h-[240px]',
}: {
  image?: string
  kicker?: string
  title: string
  desc?: string
  to: string
  cta?: string
  imgHeight?: string
}) {
  return (
    <SmartLink
      to={to}
      className="bg-[#0a0a0a] border border-neutral-900 rounded-[12px] overflow-hidden group hover:border-accent/40 transition-colors flex flex-col reveal spotlight"
    >
      <div className={`${imgHeight} overflow-hidden`}>
        <Img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700" />
      </div>
      <div className="p-8 flex flex-col flex-1">
        {kicker && <p className="text-[10px] tracking-widest uppercase text-accent font-bold mb-3">{kicker}</p>}
        <h3 className="text-[20px] lg:text-[22px] font-bold uppercase leading-tight">{title}</h3>
        {desc && <p className="mt-3 text-sm text-neutral-400 leading-relaxed">{desc}</p>}
        <div className="mt-auto pt-6">
          <span className="text-[11px] tracking-widest uppercase border-b border-white pb-1 w-fit group-hover:border-accent group-hover:text-accent transition-colors">
            {cta}
          </span>
        </div>
      </div>
    </SmartLink>
  )
}

/** Tall story card (index: horizontal "client stories") */
export function StoryCard({
  image,
  tag,
  title,
  sub,
  to,
  delay = 0,
  className = 'min-w-[300px] sm:min-w-[340px] lg:min-w-[400px] h-[500px]',
}: {
  image?: string
  tag: string
  title: string
  sub: string
  to: string
  delay?: number
  className?: string
}) {
  return (
    <div
      className={`${className} photo-overlay relative overflow-hidden rounded-[12px] border border-neutral-900 group snap-start reveal`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.08] brightness-[0.7]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute top-6 left-6 text-[10px] tracking-[0.25em] uppercase font-bold bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
        {tag}
      </div>
      <div className="absolute bottom-0 left-0 w-full p-8">
        <h3 className="text-[26px] lg:text-[28px] font-black uppercase leading-[0.9]">{title}</h3>
        <p className="mt-3 text-sm text-neutral-300 leading-relaxed max-w-[320px]">{sub}</p>
        <Link
          to={to}
          className="mt-6 inline-flex items-center text-[11px] tracking-widest uppercase border border-white/40 px-5 h-9 rounded-full hover:bg-white hover:text-black transition-colors after:absolute after:inset-0"
        >
          Explore <span className="arrow-nudge ml-1">→</span>
        </Link>
      </div>
    </div>
  )
}

/** Full-bleed CTA banner (index: careers banner at the end of Home) */
export function CtaBanner({
  image,
  kicker,
  title,
  cta,
  to,
  secondary,
}: {
  image?: string
  kicker: string
  title: ReactNode
  cta: string
  to: string
  secondary?: { label: string; to: string }
}) {
  return (
    <section className="photo-overlay relative h-[520px] lg:h-[600px] overflow-hidden rounded-[12px] border border-neutral-900 my-12 reveal">
      <Img src={image} alt="" className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      <div className="relative z-10 h-full flex items-center px-8 lg:px-16">
        <div className="max-w-[760px]">
          <Kicker className="mb-6">{kicker}</Kicker>
          <h2 className="text-[34px] sm:text-[44px] lg:text-[64px] font-black uppercase leading-[0.85] tracking-[-0.03em]">{title}</h2>
          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <SolidButton to={to}>{cta}</SolidButton>
            {secondary && (
              <OutlineButton to={secondary.to} className="h-12 px-8">
                {secondary.label}
              </OutlineButton>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Dark bordered card (index: About "Leadership / Sustainability" cards) */
export function Card({
  children,
  accent = false,
  className = '',
}: {
  children: ReactNode
  accent?: boolean
  className?: string
}) {
  return (
    <div
      className={`${
        accent ? 'bg-accent-solid text-white' : 'bg-[#0a0a0a] border border-neutral-900 spotlight'
      } p-8 lg:p-10 rounded-[12px] reveal ${className}`}
    >
      {children}
    </div>
  )
}

/** Counts integers up from zero the first time they scroll into view. */
function useCountUp(value: string) {
  const ref = useRef<HTMLParagraphElement>(null)
  const isInt = /^\d{1,4}$/.test(value)
  const [shown, setShown] = useState(isInt ? '0' : value)
  useEffect(() => {
    if (!isInt) {
      setShown(value)
      return
    }
    const el = ref.current
    const target = parseInt(value, 10)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!el || reduce || typeof IntersectionObserver === 'undefined') {
      setShown(value)
      return
    }
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / 1200)
        setShown(String(Math.round(target * (1 - Math.pow(1 - k, 3)))))
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, isInt])
  return { ref, shown }
}

export function Stat({ value, label }: { value: string; label: string }) {
  const { ref, shown } = useCountUp(value)
  return (
    <div>
      <p ref={ref} aria-label={value} className="text-[28px] lg:text-[36px] font-black leading-none tabular-nums [overflow-wrap:anywhere]">
        {shown}
      </p>
      <p className="mt-2 text-[10px] uppercase tracking-widest text-neutral-400">{label}</p>
    </div>
  )
}

export function Bullets({ items, className = '', twoCol = false }: { items: string[]; className?: string; twoCol?: boolean }) {
  return (
    <ul className={`${twoCol ? 'sm:columns-2 sm:gap-10' : 'space-y-3'} ${className}`}>
      {items.map((t) => (
        <li key={t} className={`flex gap-3 text-sm text-neutral-300 leading-relaxed ${twoCol ? 'mb-3 break-inside-avoid' : ''}`}>
          <span aria-hidden className="mt-[7px] w-1.5 h-1.5 shrink-0 bg-accent" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

export function Tags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <span key={t} className="text-[10px] tracking-[0.2em] uppercase font-semibold px-3 py-1.5 rounded-full border border-neutral-800 text-neutral-300">
          {t}
        </span>
      ))}
    </div>
  )
}

/** Accordion FAQ built on <details> (keyboard and no-JS friendly) */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-neutral-900">
      {items.map((f) => (
        <details key={f.q} className="group border-b border-neutral-900">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
            <span className="text-base lg:text-lg font-bold uppercase leading-snug">{f.q}</span>
            <span aria-hidden className="text-neutral-500 text-xl leading-none group-open:rotate-45 transition-transform">
              +
            </span>
          </summary>
          <p className="pb-6 -mt-1 max-w-[760px] text-sm text-neutral-400 leading-relaxed">{f.a}</p>
        </details>
      ))}
    </div>
  )
}

/** Two-column text block: sticky label left, copy right */
export function SplitText({ label, title, children }: { label: string; title?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-12 border-t border-neutral-900 reveal">
      <div className="lg:col-span-4">
        <Kicker>{label}</Kicker>
        {title && <h2 className="mt-4 text-[28px] lg:text-[36px] font-black uppercase leading-[0.9] tracking-[-0.02em]">{title}</h2>}
      </div>
      <div className="lg:col-span-8 space-y-4 text-[15px] lg:text-base text-neutral-300 leading-relaxed max-w-[760px]">{children}</div>
    </div>
  )
}
