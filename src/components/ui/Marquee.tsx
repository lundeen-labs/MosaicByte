import { Children, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  speed?: number // seconds for one full cycle (default 30)
  pauseOnHover?: boolean
  children_gap?: number
}

const marqueeKeyframes = `
@keyframes lundeen-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
`

/**
 * Horizontal infinite marquee. Renders children twice for seamless loop.
 * Pauses on hover. Respects prefers-reduced-motion (full stop) via the
 * inline `data-rm` attribute hooked to the global reduced-motion media query
 * already declared in src/index.css (animation-duration: 0.01ms).
 */
export function Marquee({
  children,
  speed = 30,
  pauseOnHover = true,
  className,
  ...props
}: MarqueeProps) {
  // Wrap each child in a flex container so two copies sit side-by-side
  const items = Children.toArray(children)

  return (
    <div
      className={cn(
        'group relative overflow-hidden w-full',
        className,
      )}
      role="marquee"
      aria-label="scrolling content"
      {...props}
    >
      <style>{marqueeKeyframes}</style>
      <div
        className={cn(
          'flex w-max items-center gap-10 will-change-transform',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{
          animation: `lundeen-marquee ${speed}s linear infinite`,
        }}
      >
        <div className="flex items-center gap-10 shrink-0" aria-hidden={false}>
          {items}
        </div>
        <div className="flex items-center gap-10 shrink-0" aria-hidden={true}>
          {items}
        </div>
      </div>
    </div>
  )
}
