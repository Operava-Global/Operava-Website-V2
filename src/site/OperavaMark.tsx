import { useId } from 'react'

/**
 * OPERAVA mark — white circle cut by three diagonal gaps (34°).
 * Inline SVG so the gaps can animate: on load they "cut" across the circle in sequence,
 * and the mark turns a quarter when its parent link is hovered (see .op-mark in index.css).
 * Geometry matches /brand/operava-mark.svg and the master PNG.
 */
const GAPS = [34.511, 47.963, 60.913]
const GAP_H = 4.497

export default function OperavaMark({ size = 17, className = '', intro = true }: { size?: number; className?: string; intro?: boolean }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`op-mark ${intro ? 'op-mark--intro' : ''} ${className}`}
    >
      <defs>
        <mask id={`opm-${id}`}>
          <circle cx="50" cy="50" r="50" fill="#fff" />
          <g transform="rotate(-34 50 50)" fill="#000">
            {GAPS.map((y, i) => (
              <rect key={y} className="op-mark__gap" style={{ animationDelay: `${0.25 + i * 0.12}s` }} x="-20" y={y} width="140" height={GAP_H} />
            ))}
          </g>
        </mask>
      </defs>
      <circle className="op-mark__disc" cx="50" cy="50" r="50" fill="currentColor" mask={`url(#opm-${id})`} />
    </svg>
  )
}
