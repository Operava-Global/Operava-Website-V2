"use client"

import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DisplayCardProps {
  className?: string
  image?: string
  imageAlt?: string
  title?: string
  description?: string
  date?: string
  titleClassName?: string
  href?: string
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[]
  className?: string
}

function DisplayCard({
  className,
  image,
  imageAlt,
  title = 'Featured',
  description = 'Discover amazing content',
  date = 'Just now',
  titleClassName,
  href,
  active,
  style,
  onActivate,
}: DisplayCardProps & {
  active: boolean
  style: CSSProperties
  onActivate: () => void
}) {
  return (
    <article
      data-active={active}
      style={style}
      className={cn(
        'group absolute top-2 flex min-h-[17rem] w-[66%] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:min-h-[18rem] sm:p-7 shadow-[0_18px_38px_-20px_rgba(0,0,0,.75),0_7px_18px_-10px_rgba(0,0,0,.5)] transition-[left,transform,box-shadow,border-color,filter] duration-700 ease-[cubic-bezier(.2,.85,.25,1)] [backface-visibility:hidden] [transform:perspective(1200px)_rotateY(-5deg)_rotateX(2deg)] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/[.13] before:via-transparent before:to-black/[.2] before:content-[\'\'] after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:bg-[radial-gradient(circle_at_85%_12%,rgba(139,92,246,.2),transparent_44%)] after:opacity-80',
        active && '!z-50 !-translate-y-5 !scale-[1.045] !border-accent/80 !shadow-[0_38px_65px_-24px_rgba(0,0,0,.85),0_0_0_1px_rgba(139,92,246,.32),0_0_42px_-12px_rgba(139,92,246,.6)] [transform:perspective(1200px)_translateZ(90px)_rotateY(0deg)_rotateX(0deg)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={onActivate}
        aria-pressed={active}
        aria-label={`${active ? 'Collapse' : 'Bring forward'} ${title} card`}
        className="relative z-10 flex min-h-[13rem] flex-1 cursor-pointer flex-col items-start justify-between gap-5 text-left outline-none focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--surface)]"
      >
        {image && (
          <div className="relative -mx-1 flex h-24 w-full items-center justify-center overflow-visible sm:h-32">
            <img
              src={image}
              alt={imageAlt ?? ''}
              aria-hidden={imageAlt ? undefined : true}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain object-center drop-shadow-[0_14px_22px_rgba(0,0,0,.32)] transition-transform duration-700 ease-out group-data-[active=true]:scale-110"
            />
          </div>
        )}
        <div className="flex w-full items-center">
          <p className={cn('max-w-[19rem] text-xs font-semibold leading-snug tracking-tight text-[var(--text)] sm:text-lg', titleClassName)}>{title}</p>
        </div>
        <p className="max-w-[25rem] pr-8 text-xs leading-relaxed text-[var(--text)]/75 sm:text-sm">{description}</p>
        <div className="flex w-full items-end justify-between gap-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-neutral-500 sm:text-[10px]">{date}</p>
          <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-accent/90 sm:text-[10px]">
            {active ? 'In focus' : 'Tap to bring forward'}
          </span>
        </div>
      </button>
      {href && (
        <Link
          to={href}
          aria-label={`Explore ${title}`}
          title={`Explore ${title}`}
          className="absolute bottom-4 right-4 z-20 inline-flex size-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:scale-105 hover:border-accent hover:bg-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:bottom-5 sm:right-5 sm:size-10"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      )}
    </article>
  )
}

export default function DisplayCards({ cards, className }: DisplayCardsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0)
  const defaultCards: DisplayCardProps[] = [
    { title: 'Information Technology', description: 'Build, modernize and connect digital operations.', date: '01 · IT services', href: '/services/it' },
    { title: 'Business Process Outsourcing', description: 'Run customer, technical and back-office operations.', date: '02 · Global BPO', href: '/services/bpo' },
    { title: 'Intelligent Automation', description: 'Connect workflows and reduce repetitive work.', date: '03 · Automation', href: '/services/automation' },
  ]
  const displayCards = cards ?? defaultCards
  const positions = displayCards.map((_, index) => index)

  return (
    <div
      className={cn('relative mx-auto my-5 h-[19rem] w-full max-w-5xl [perspective:1400px] [transform-style:preserve-3d] sm:h-[20rem]', className)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setActiveIndex(null)
      }}
    >
      <style>{`
        @keyframes operava-card-pop {
          0% { filter: brightness(1); }
          32% { filter: brightness(1.16); }
          100% { filter: brightness(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-active="true"] { animation: none !important; }
        }
      `}</style>
      {displayCards.map((cardProps, index) => (
        <DisplayCard
          key={cardProps.title ?? index}
          {...cardProps}
          active={activeIndex === index}
          style={{
            left: `calc(${index} * 33% - 16%)`,
            width: '66%',
            zIndex: activeIndex === index ? 50 : displayCards.length - index,
            animation: activeIndex === index ? 'operava-card-pop 680ms cubic-bezier(.2,.85,.25,1) both' : undefined,
          }}
          onActivate={() => setActiveIndex((current) => current === index ? null : index)}
        />
      ))}
    </div>
  )
}
