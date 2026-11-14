"use client"

import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface DisplayCardProps {
  className?: string
  image?: string
  video?: string
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
  video,
  imageAlt,
  title = 'OPERAVA service',
  href,
  active,
  style,
}: DisplayCardProps & {
  active: boolean
  style: CSSProperties
}) {
  const cardContent = (
    <>
      {video ? (
        <video
          src={video}
          aria-label={imageAlt ?? title}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          onLoadedMetadata={(event) => { event.currentTarget.playbackRate = 0.5 }}
          tabIndex={-1}
          draggable={false}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-cover object-center"
        />
      ) : image ? (
        <img
          src={image}
          alt={imageAlt ?? ''}
          aria-hidden={imageAlt ? undefined : true}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-cover object-center"
        />
      ) : null}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[rgba(20,12,40,.24)] via-transparent to-transparent"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-3 right-3 z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/35 bg-[var(--accent)] text-white shadow-lg transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-110 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-white sm:bottom-4 sm:right-4 sm:size-11"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
      </span>
    </>
  )

  const cardClassName = cn(
    'group relative isolate block aspect-video w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_38px_-20px_rgba(0,0,0,.75),0_7px_18px_-10px_rgba(0,0,0,.5)] transition-[left,transform,box-shadow,border-color,filter] duration-700 ease-[cubic-bezier(.2,.85,.25,1)] [backface-visibility:hidden] md:absolute md:top-2 md:w-[66%] md:[transform:perspective(1200px)_rotateY(-5deg)_rotateX(2deg)]',
    active && 'md:!z-50 md:!-translate-y-5 md:!scale-[1.045] md:!border-accent/80 md:!shadow-[0_38px_65px_-24px_rgba(0,0,0,.85),0_0_0_1px_rgba(139,92,246,.32),0_0_42px_-12px_rgba(139,92,246,.6)] md:[transform:perspective(1200px)_translateZ(90px)_rotateY(0deg)_rotateX(0deg)]',
    'hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_26px_48px_-20px_rgba(0,0,0,.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4',
    className,
  )

  if (!href) {
    return <article data-active={active} style={style} className={cardClassName}>{cardContent}</article>
  }

  return (
    <Link
      to={href}
      aria-label={`Explore ${title} services`}
      title={`Explore ${title} services`}
      data-active={active}
      style={style}
      className={cardClassName}
    >
      {cardContent}
    </Link>
  )
}

export default function DisplayCards({ cards, className }: DisplayCardsProps) {
  const defaultCards: DisplayCardProps[] = [
    { title: 'Information Technology', description: 'Build, modernize and connect digital operations.', date: '01 · IT services', href: '/services/it' },
    { title: 'Business Process Outsourcing', description: 'Run customer, technical and back-office operations.', date: '02 · Global BPO', href: '/services/bpo' },
    { title: 'Intelligent Automation', description: 'Connect workflows and reduce repetitive work.', date: '03 · Automation', href: '/services/automation' },
  ]
  const displayCards = cards ?? defaultCards

  return (
    <div className={cn('relative mx-auto my-5 grid w-full max-w-5xl grid-cols-1 items-stretch gap-4 md:block md:h-[28rem] md:[perspective:1400px] md:[transform-style:preserve-3d]', className)}>
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
          active={index === 0}
          style={{
            '--card-left': `calc(${index} * 33% - 16%)`,
            zIndex: displayCards.length - index,
            animation: index === 0 ? 'operava-card-pop 680ms cubic-bezier(.2,.85,.25,1) both' : undefined,
          } as CSSProperties}
        />
      ))}
    </div>
  )
}
