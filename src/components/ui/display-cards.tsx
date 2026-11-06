"use client"

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
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
  icon = <Sparkles className="size-4 text-accent" />,
  title = 'Featured',
  description = 'Discover amazing content',
  date = 'Just now',
  iconClassName = 'text-accent',
  titleClassName = 'text-accent',
  href,
}: DisplayCardProps) {
  const content = (
    <>
      <div className="relative z-10 flex items-center gap-2">
        <span className={cn('relative inline-flex rounded-full bg-accent/15 p-2', iconClassName)}>
          {icon}
        </span>
        <p className={cn('text-lg font-semibold tracking-tight', titleClassName)}>{title}</p>
      </div>
      <p className="relative z-10 whitespace-normal text-base leading-snug text-[var(--text)]">{description}</p>
      <p className="relative z-10 text-xs uppercase tracking-[0.16em] text-neutral-500">{date}</p>
    </>
  )

  const cardClass = cn(
    'relative flex h-36 w-[min(22rem,calc(100vw-3rem))] select-none flex-col justify-between overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 shadow-xl backdrop-blur-sm transition-all duration-500 after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-2/3 after:bg-gradient-to-l after:from-[var(--surface)]/70 after:to-transparent after:content-[\'\'] hover:border-accent/50 hover:bg-[var(--surface-2)] hover:shadow-[0_18px_45px_-24px_rgba(124,58,237,.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
    className,
  )

  return href ? (
    <Link to={href} aria-label={`${title}: ${description}`} className={cardClass}>
      {content}
    </Link>
  ) : (
    <article className={cardClass}>{content}</article>
  )
}

export default function DisplayCards({ cards, className }: DisplayCardsProps) {
  const defaultCards: DisplayCardProps[] = [
    {
      title: 'Information Technology',
      description: 'Build, modernize and connect digital operations.',
      date: '01 · IT services',
      href: '/services/it',
      className: '[grid-area:stack] hover:-translate-y-8',
    },
    {
      title: 'Business Process Outsourcing',
      description: 'Run customer, technical and back-office operations.',
      date: '02 · Global BPO',
      href: '/services/bpo',
      className: '[grid-area:stack] translate-y-8 sm:translate-x-10 sm:translate-y-8 hover:-translate-y-1',
    },
    {
      title: 'Intelligent Automation',
      description: 'Connect workflows and reduce repetitive work.',
      date: '03 · Automation',
      href: '/services/automation',
      className: '[grid-area:stack] translate-y-16 sm:translate-x-20 sm:translate-y-16 hover:translate-y-10',
    },
  ]

  const displayCards = cards ?? defaultCards

  return (
    <div className={cn('grid min-h-[17rem] w-full [grid-template-areas:"stack"] place-items-center py-5', className)}>
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={cardProps.title ?? index} {...cardProps} />
      ))}
    </div>
  )
}
