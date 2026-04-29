import { useEffect, useRef, useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export interface TestimonialCarouselProps {
  items: { quote: string; author: string; role: string; company: string }[]
  autoAdvanceMs?: number
  className?: string
}

const padIndex = (i: number, total: number) => {
  const idx = String(i + 1).padStart(2, '0')
  const t = String(total).padStart(2, '0')
  return `${idx} / ${t}`
}

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Numeric-pill tabbed carousel. Tab triggers as `01 / 04` numerals,
 * content as serif pull-quote + name/role/company. Auto-advances every
 * 8s by default; pauses on hover/focus, stops entirely if reduced-motion.
 */
export function TestimonialCarousel({
  items,
  autoAdvanceMs = 8000,
  className,
}: TestimonialCarouselProps) {
  const [active, setActive] = useState<string>('0')
  const [paused, setPaused] = useState(false)
  const reducedRef = useRef<boolean>(false)
  const total = items.length

  useEffect(() => {
    reducedRef.current = prefersReducedMotion()
  }, [])

  useEffect(() => {
    if (paused || total <= 1 || reducedRef.current) return undefined
    const t = window.setInterval(() => {
      setActive((prev) => {
        const next = (Number.parseInt(prev, 10) + 1) % total
        return String(next)
      })
    }, autoAdvanceMs)
    return () => window.clearInterval(t)
  }, [paused, total, autoAdvanceMs])

  if (total === 0) return null

  return (
    <Tabs.Root
      value={active}
      onValueChange={setActive}
      className={cn('w-full', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <Tabs.List
        aria-label="Testimonials"
        className="mb-8 flex flex-wrap items-center gap-3"
      >
        {items.map((_, i) => (
          <Tabs.Trigger
            key={i}
            value={String(i)}
            className={cn(
              'inline-flex items-center justify-center rounded-[var(--radius-r1)] border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] leading-none transition-colors duration-[180ms]',
              'border-[var(--color-paper-3)] bg-[var(--color-paper-2)] text-[var(--color-ink-3)]',
              'hover:text-[var(--color-rust)] hover:border-[var(--color-rust)]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
              'data-[state=active]:bg-[var(--color-ink)] data-[state=active]:text-[var(--color-paper)] data-[state=active]:border-[var(--color-ink)]',
            )}
          >
            {padIndex(i, total)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {items.map((item, i) => (
        <Tabs.Content
          key={i}
          value={String(i)}
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]"
        >
          <figure className="flex flex-col gap-6">
            <blockquote className="font-display text-[1.5rem] sm:text-[1.75rem] leading-[1.3] tracking-[-0.015em] text-[var(--color-ink)] max-w-[36ch]">
              <span className="text-[var(--color-rust)]" aria-hidden="true">&ldquo;</span>
              {item.quote}
              <span className="text-[var(--color-rust)]" aria-hidden="true">&rdquo;</span>
            </blockquote>
            <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] uppercase tracking-[0.04em] text-[var(--color-ink-3)]">
              <span className="text-[var(--color-ink)] font-medium">{item.author}</span>
              <span className="text-[var(--color-paper-line)]" aria-hidden="true">·</span>
              <span>{item.role}</span>
              <span className="text-[var(--color-paper-line)]" aria-hidden="true">·</span>
              <span className="text-[var(--color-rust)]">{item.company}</span>
            </figcaption>
          </figure>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
