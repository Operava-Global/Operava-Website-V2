"use client"

import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DisplayCardProps {
  className?: string
  icon?: ReactNode
  title?: string
  description?: string
  date?: string
  iconClassName?: string
  titleClassName?: string
  href?: string
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[]
  className?: string
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-5" />,
  title = 'Featured',
  description = 'Discover amazing content',
  date = 'Just now',
  iconClassName,
  titleClassName,
  href,
  active,
  onActivate,
}: DisplayCardProps & { active: boolean; onActivate: () => void }) {
  return (
    <article
      data-active={active}
      style={{ animation: active ? 'operava-card-pop 680ms cubic-bezier(.2,.85,.25,1) both' : undefined }}
      className={cn(
        'group relative flex min-h-[15.5rem] w-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 shadow-[0_16px_32px_-20px_rgba(0,0,0,.72),0_5px_14px_-8px_rgba(0,0,0,.45)] transition-[transform,box-shadow,border-color,filter] duration-500 ease-[cubic-bezier(.2,.75,.25,1)] [backface-visibility:hidden] [transform:perspective(1100px)_rotateX(2deg)_rotateY(-1deg)] hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_24px_40px_-22px_rgba(0,0,0,.8)] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/[.12] before:via-transparent before:to-black/[.18] before:content-[\'\'] after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:bg-[radial-gradient(circle_at_85%_15%,rgba(139,92,246,.16),transparent_42%)] after:opacity-70 after:transition-opacity after:duration-500',
        active && 'z-20 !-translate-y-2 !scale-[1.035] !border-accent/80 !shadow-[0_34px_55px_-24px_rgba(0,0,0,.82),0_0_0_1px_rgba(139,92,246,.28),0_0_36px_-14px_rgba(139,92,246,.55)] [transform:perspective(1100px)_translateZ(48px)_rotateX(0deg)_rotateY(0deg)] after:opacity-100',
        className,
      )}
    >
      <button
        type="button"
        onClick={onActivate}
        aria-pressed={active}
        aria-label={`${active ? 'Collapse' : 'Expand'} ${title} card`}
        className="relative z-10 flex min-h-[10rem] flex-1 cursor-pointer flex-col items-start justify-between gap-5 text-left outline-none focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--surface)]"
      >
        <div className="flex w-full items-center gap-4">
          <span className={cn('inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_8px_18px_-12px_rgba(139,92,246,.8)] transition-all duration-500 group-data-[active=true]:rotate-[-8deg] group-data-[active=true]:scale-110 group-data-[active=true]:bg-accent/20', iconClassName)}>
            {icon}
          </span>
          <p className={cn('max-w-[19rem] text-base font-semibold leading-snug tracking-tight text-[var(--text)] sm:text-lg', titleClassName)}>{title}</p>
          <span className="ml-auto hidden text-accent/70 transition-transform duration-500 group-data-[active=true]:translate-x-1 group-data-[active=true]:-translate-y-1 sm:inline-flex">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        <p className="max-w-[25rem] pr-5 text-sm leading-relaxed text-[var(--text)]/75">{description}</p>
        <div className="flex w-full items-end justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">{date}</p>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent/80 transition-all duration-300 group-data-[active=true]:tracking-[0.22em]">
            {active ? 'Selected' : 'Tap to explore'}
          </span>
        </div>
      </button>
      {href && (
        <Link
          to={href}
          aria-label={`Explore ${title}`}
          title={`Explore ${title}`}
          className="absolute bottom-5 right-5 z-20 inline-flex size-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:scale-105 hover:border-accent hover:bg-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      )}
    </article>
  )
}

export default function DisplayCards({ cards, className }: DisplayCardsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const defaultCards: DisplayCardProps[] = [
    {
      title: 'Information Technology',
      description: 'Build, modernize and connect digital operations.',
      date: '01 · IT services',
      href: '/services/it',
    },
    {
      title: 'Business Process Outsourcing',
      description: 'Run customer, technical and back-office operations.',
      date: '02 · Global BPO',
      href: '/services/bpo',
    },
    {
      title: 'Intelligent Automation',
      description: 'Connect workflows and reduce repetitive work.',
      date: '03 · Automation',
      href: '/services/automation',
    },
  ]

  const displayCards = cards ?? defaultCards

  return (
    <div
      className={cn('grid w-full grid-cols-1 gap-5 py-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7 [perspective:1400px] [transform-style:preserve-3d]', className)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setActiveIndex(null)
      }}
    >
      <style>{`
        @keyframes operava-card-pop {
          0% { filter: brightness(1); }
          35% { filter: brightness(1.12); }
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
          onActivate={() => setActiveIndex((current) => current === index ? null : index)}
        />
      ))}
    </div>
  )
}
