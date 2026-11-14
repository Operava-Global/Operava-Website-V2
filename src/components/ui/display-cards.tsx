"use client"

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

function DisplayCard({ className, image, video, imageAlt, title = 'OPERAVA service' }: DisplayCardProps) {
  return (
    <article
      className={cn(
        'group relative isolate aspect-video w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_38px_-20px_rgba(0,0,0,.75),0_7px_18px_-10px_rgba(0,0,0,.5)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.2,.85,.25,1)] hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_26px_48px_-20px_rgba(0,0,0,.8)]',
        className,
      )}
    >
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
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
        />
      ) : image ? (
        <img
          src={image}
          alt={imageAlt ?? ''}
          aria-hidden={imageAlt ? undefined : true}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(20,12,40,.28)] via-transparent to-transparent"
      />
    </article>
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
    <div className={cn('mx-auto my-5 grid w-full max-w-5xl grid-cols-1 items-stretch gap-4 md:grid-cols-3 md:gap-5', className)}>
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={cardProps.title ?? index} {...cardProps} />
      ))}
    </div>
  )
}
