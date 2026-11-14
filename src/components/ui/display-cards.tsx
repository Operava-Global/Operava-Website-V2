"use client"

import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
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
  title = 'Featured',
  description = 'Discover amazing content',
  date = 'Just now',
  titleClassName,
  href,
  active,
  style,
}: DisplayCardProps & {
  active: boolean
  style: CSSProperties
}) {
  return (
    <article
      data-active={active}
      style={style}
      className={cn(
        'group absolute top-2 flex aspect-video w-[66%] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_38px_-20px_rgba(0,0,0,.75),0_7px_18px_-10px_rgba(0,0,0,.5)] transition-[left,transform,box-shadow,border-color,filter] duration-700 ease-[cubic-bezier(.2,.85,.25,1)] [backface-visibility:hidden] [transform:perspective(1200px)_rotateY(-5deg)_rotateX(2deg)] before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:rounded-2xl before:bg-gradient-to-t before:from-[rgba(20,12,40,.88)] before:via-[rgba(20,12,40,.32)] before:via-50% before:to-transparent before:content-[\'\'] after:pointer-events-none after:absolute after:inset-0 after:z-[1] after:rounded-2xl after:bg-[radial-gradient(circle_at_85%_12%,rgba(139,92,246,.2),transparent_44%)] after:opacity-80',
        active && '!z-50 !-translate-y-5 !scale-[1.045] !border-accent/80 !shadow-[0_38px_65px_-24px_rgba(0,0,0,.85),0_0_0_1px_rgba(139,92,246,.32),0_0_42px_-12px_rgba(139,92,246,.6)] [transform:perspective(1200px)_translateZ(90px)_rotateY(0deg)_rotateX(0deg)]',
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

      <div className="relative z-10 mt-auto flex w-full flex-col items-start gap-3 p-5 text-left sm:gap-4 sm:p-7">
        <p className={cn('max-w-[19rem] text-xs font-semibold leading-snug tracking-tight text-white sm:text-lg', titleClassName)}>{title}</p>
        <p className="max-w-[25rem] pr-8 text-xs leading-relaxed text-white/85 sm:text-sm">{description}</p>
        <div className="flex w-full items-end justify-between gap-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-white/75 sm:text-[10px]">{date}</p>
          {href && (
            <Link
              to={href}
              aria-label={`Explore ${title}`}
              title={`Explore ${title}`}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:scale-105 hover:border-accent hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:size-10"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          )}
        </div>
      </div>
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
    <div className={cn('relative mx-auto my-5 h-[25rem] w-full max-w-5xl [perspective:1400px] [transform-style:preserve-3d] sm:h-[28rem]', className)}>
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
            left: `calc(${index} * 33% - 16%)`,
            width: '66%',
            zIndex: displayCards.length - index,
            animation: index === 0 ? 'operava-card-pop 680ms cubic-bezier(.2,.85,.25,1) both' : undefined,
          }}
        />
      ))}
    </div>
  )
}
