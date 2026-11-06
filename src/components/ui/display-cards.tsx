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
  icon = <Sparkles className="size-4" />,
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
      className={cn(
        'group relative flex h-40 w-[min(22rem,calc(100vw-3rem))] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-[0_18px_30px_-18px_rgba(0,0,0,.7),0_5px_12px_-7px_rgba(0,0,0,.5)] transition-[transform,box-shadow,border-color,filter] duration-500 ease-out [backface-visibility:hidden] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/[.11] before:via-transparent before:to-black/[.16] before:content-[\'\'] after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-2/3 after:bg-gradient-to-l after:from-[var(--surface)]/60 after:to-transparent after:content-[\'\']',
        '[transform:rotateX(5deg)_rotateY(-7deg)_translateZ(0)] hover:border-accent/50',
        active
          ? 'z-30 scale-[1.045] !border-accent/70 !shadow-[0_35px_55px_-22px_rgba(0,0,0,.8),0_0_0_1px_rgba(139,92,246,.22)] [transform:translateZ(70px)_rotateX(0deg)_rotateY(0deg)]'
          : 'z-10 hover:[transform:translateZ(22px)_rotateX(1deg)_rotateY(-2deg)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={onActivate}
        aria-pressed={active}
        aria-label={`${active ? 'Collapse' : 'Pop out'} ${title} card`}
        className="relative z-10 flex min-h-0 flex-1 cursor-pointer flex-col items-start justify-between text-left outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
      >
        <div className="flex items-center gap-3">
          <span className={cn('inline-flex size-9 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent shadow-inner', iconClassName)}>
            {icon}
          </span>
          <p className={cn('text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg', titleClassName)}>{title}</p>
        </div>
        <p className="max-w-[19rem] text-sm leading-relaxed text-[var(--text)]/75">{description}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">{date}</p>
      </button>
      {href && (
        <Link
          to={href}
          aria-label={`Explore ${title}`}
          title={`Explore ${title}`}
          className="absolute bottom-3 right-3 z-20 inline-flex size-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:translate-x-0.5 hover:border-accent hover:bg-accent hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
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
      className: '[grid-area:stack]',
    },
    {
      title: 'Business Process Outsourcing',
      description: 'Run customer, technical and back-office operations.',
      date: '02 · Global BPO',
      href: '/services/bpo',
      className: '[grid-area:stack] translate-x-8 translate-y-8',
    },
    {
      title: 'Intelligent Automation',
      description: 'Connect workflows and reduce repetitive work.',
      date: '03 · Automation',
      href: '/services/automation',
      className: '[grid-area:stack] translate-x-16 translate-y-16',
    },
  ]

  const displayCards = cards ?? defaultCards

  return (
    <div
      className={cn('grid min-h-[19rem] w-full [grid-template-areas:"stack"] place-items-center [perspective:1200px] [transform-style:preserve-3d] py-5 sm:min-h-[20rem]', className)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setActiveIndex(null)
      }}
    >
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
