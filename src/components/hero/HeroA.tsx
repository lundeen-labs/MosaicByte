import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { cn, withBasePath } from '@/lib/utils'
import { COPY } from '@/content/copy'
import { usePrefersReducedMotion } from '@/lib/reduced-motion'

interface HeroAProps {
  eyebrow: string
  titleParts: { plain: string; italic: string; rest: string }
  sub: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  reassureLines: string[]
  /**
   * Optional, unused — kept only so existing tests/callers passing `gauge`
   * compile. Will be removed in a future cleanup once tests are updated.
   */
  gauge?: { lcp: string; cls: string; inp: string; jsKb: string; a11y: string }
}

/* Mosaic tile grid — 8 cols × 6 rows. Each tile is one of the brand accents,
   randomly "lit" (opacity 1), "mid" (0.55), or dormant (0.15). The active set
   re-rolls every 2.2s on a setInterval; on prefers-reduced-motion the initial
   roll renders once and stops. */
const TILE_COLS = 8
const TILE_ROWS = 6
const TILE_COUNT = TILE_COLS * TILE_ROWS
const TILE_PALETTE = [
  'var(--color-tile-amber)',
  'var(--color-tile-teal)',
  'var(--color-tile-coral)',
  'var(--color-tile-violet)',
  'var(--color-tile-plum)',
]
const LIT_COUNT = Math.floor(TILE_COUNT * 0.38)
const MID_COUNT = Math.floor(LIT_COUNT * 0.4)
const TILE_INTERVAL_MS = 2200

function rollTileSets(): { lit: Set<number>; mid: Set<number> } {
  const lit = new Set<number>()
  while (lit.size < LIT_COUNT) lit.add(Math.floor(Math.random() * TILE_COUNT))
  const mid = new Set<number>()
  while (mid.size < MID_COUNT) {
    const idx = Math.floor(Math.random() * TILE_COUNT)
    if (!lit.has(idx)) mid.add(idx)
  }
  return { lit, mid }
}

function MosaicTileGrid() {
  const reduce = usePrefersReducedMotion()
  const [{ lit, mid }, setSets] = useState(() => rollTileSets())

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setSets(rollTileSets()), TILE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <div
      aria-hidden="true"
      className="grid h-full w-full gap-[3px] p-[3px]"
      style={{
        gridTemplateColumns: `repeat(${TILE_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${TILE_ROWS}, 1fr)`,
      }}
    >
      {Array.from({ length: TILE_COUNT }, (_, i) => {
        const opacity = lit.has(i) ? 1 : mid.has(i) ? 0.55 : 0.15
        return (
          <div
            key={i}
            className="rounded-[1px] transition-opacity duration-[600ms] ease-out"
            style={{ background: TILE_PALETTE[i % TILE_PALETTE.length], opacity }}
          />
        )
      })}
    </div>
  )
}

/**
 * HeroA — Mosaic Byte split-layout hero.
 *
 * Left column: editorial eyebrow (amber bar + caps), DM-Serif headline with
 * teal italic accent on the studio's tagline phrase, body copy, primary
 * coral CTA + ghost link, reassure bullets, footnote anchoring location.
 *
 * Right column: dark ink panel with the animated 8×6 mosaic tile grid and
 * a bottom-right paper badge showing live availability from COPY.status.
 *
 * Below 768px the panel stacks below the copy. The LCP element (`<h1>`)
 * deliberately does NOT carry a fade-up class — animating the LCP element
 * pushes the metric by the full fade duration on first paint.
 */
export default function HeroA({
  eyebrow,
  titleParts,
  sub,
  primaryCta,
  secondaryCta,
  reassureLines,
}: HeroAProps) {
  const fullTitle = `${titleParts.plain} ${titleParts.italic} ${titleParts.rest}`.trim()
  const { available, slots } = COPY.status

  return (
    <section
      aria-labelledby="hero-heading"
      className="border-b border-[var(--color-ink)]"
    >
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 md:min-h-[560px] md:grid-cols-2">
        {/* Left — editorial copy column */}
        <div className="flex flex-col justify-between border-b border-[var(--color-ink)] px-6 py-16 md:border-b-0 md:border-r md:px-10 md:py-20">
          <div className="flex flex-col gap-7">
            <p className="fade-up fade-up-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-ochre)]">
              <span aria-hidden="true" className="inline-block h-[1.5px] w-6 bg-[var(--color-ochre)]" />
              {eyebrow}
            </p>

            {/* LCP element — intentionally NOT animated. */}
            <h1
              id="hero-heading"
              className={cn(
                'max-w-[18ch]',
                'font-display',
                'text-[clamp(2.625rem,5vw,4rem)] leading-[1.05] tracking-[-0.04em]',
                'text-[var(--color-ink)]',
              )}
            >
              <span className="sr-only">{fullTitle}</span>
              <span aria-hidden="true">
                {titleParts.plain}{' '}
                <em className="italic text-[var(--color-moss)]">{titleParts.italic}</em>{' '}
                {titleParts.rest}
              </span>
            </h1>

            <p className="fade-up fade-up-2 max-w-[44ch] text-[13px] leading-[1.85] text-[var(--color-ink-3)]">
              {sub}
            </p>

            <div className="fade-up fade-up-3 flex flex-wrap items-center gap-5">
              {primaryCta.href.includes('#') ? (
                <a
                  href={withBasePath(primaryCta.href)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-[2px]',
                    'bg-[var(--color-rust)] px-6 py-3',
                    'text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-paper)]',
                    'transition-opacity duration-[150ms] hover:opacity-90',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
                  )}
                >
                  {primaryCta.label}
                </a>
              ) : (
                <Link
                  href={primaryCta.href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-[2px]',
                    'bg-[var(--color-rust)] px-6 py-3',
                    'text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-paper)]',
                    'transition-opacity duration-[150ms] hover:opacity-90',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
                  )}
                >
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta.href.includes('#') ? (
                <a
                  href={withBasePath(secondaryCta.href)}
                  className={cn(
                    'inline-flex items-center gap-1.5',
                    'text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]',
                    'transition-colors duration-[150ms] hover:text-[var(--color-ink)]',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
                  )}
                >
                  {secondaryCta.label} <span aria-hidden="true">→</span>
                </a>
              ) : (
                <Link
                  href={secondaryCta.href}
                  className={cn(
                    'inline-flex items-center gap-1.5',
                    'text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]',
                    'transition-colors duration-[150ms] hover:text-[var(--color-ink)]',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
                  )}
                >
                  {secondaryCta.label} <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>

            <ul className="fade-up fade-up-4 mt-1 flex flex-col gap-1.5 text-[11px] uppercase tracking-[0.06em] text-[var(--color-ink-3)]">
              {reassureLines.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-[6px] inline-block h-1 w-1 rounded-full bg-[var(--color-ink-3)]"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-12 text-[11px] uppercase tracking-[0.06em] text-[var(--color-ink-3)]">
            {COPY.brand.location}
          </p>
        </div>

        {/* Right — ink panel with animated mosaic + availability badge */}
        <div className="relative min-h-[320px] overflow-hidden bg-[var(--color-ink)]">
          <MosaicTileGrid />
          <div
            className={cn(
              'absolute right-6 bottom-6',
              'rounded-[2px] border border-[var(--color-ink)] bg-[var(--color-paper)]',
              'px-4 py-3 text-[11px] leading-[1.5]',
            )}
            role="status"
            aria-label={available ? `${slots} project slots open` : 'Currently booked'}
          >
            <span className="font-display text-[28px] leading-none tracking-[-1px] text-[var(--color-ink)]">
              {available ? slots : 0}
            </span>
            <span className="ml-2 text-[var(--color-ink-3)]">
              {available ? 'slots open' : 'booked'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
