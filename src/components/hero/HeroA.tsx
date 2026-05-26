import { cn } from '@/lib/utils'

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

/**
 * HeroA — modern dark-agency hero.
 *
 * Single-column composition: small eyebrow, massive Geist headline, sub,
 * two-CTA row (primary green pill + ghost link), reassure line. No
 * editorial decoration, no PAGE METRICS panel, no marginalia.
 *
 * Background uses a subtle radial accent glow behind the headline to add
 * depth without dragging in glassmorphism.
 *
 * Entrance is a pure-CSS fade-up keyed off `.fade-up` (see index.css). This
 * deliberately keeps framer-motion out of the eager `/` route chunk
 * (~−40 KB gz on Home). The headline does NOT animate — animating the LCP
 * element delays the metric by the full fade duration. The global
 * `prefers-reduced-motion: reduce` block in index.css neutralizes the
 * animation to ~0ms for users who request it.
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

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden"
    >
      {/* Accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(0,217,126,0.12) 0%, rgba(10,10,10,0) 60%)',
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6 pt-24 pb-20 md:px-8 md:pt-32 md:pb-28">
        <p
          className="fade-up fade-up-1 inline-flex items-center gap-2 rounded-full border border-[var(--color-paper-3)] bg-[var(--color-paper-2)] px-3 py-1 text-[12px] font-medium text-[var(--color-ink-2)]"
        >
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-rust)]"
            style={{ boxShadow: '0 0 8px var(--color-rust)' }}
          />
          {eyebrow}
        </p>

        {/* LCP element — intentionally NOT animated. */}
        <h1
          id="hero-heading"
          className={cn(
            'mt-8 max-w-[20ch]',
            'font-display font-semibold',
            'text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.035em]',
            'text-[var(--color-ink)]',
          )}
        >
          <span className="sr-only">{fullTitle}</span>
          <span aria-hidden="true">
            {titleParts.plain}{' '}
            <span className="text-[var(--color-rust)]">{titleParts.italic}</span>{' '}
            {titleParts.rest}
          </span>
        </h1>

        <p
          className="fade-up fade-up-2 mt-8 max-w-[60ch] text-[1.125rem] leading-[1.55] text-[var(--color-ink-2)] md:text-[1.25rem]"
        >
          {sub}
        </p>

        <div className="fade-up fade-up-3 mt-10 flex flex-wrap items-center gap-3">
          <a
            href={primaryCta.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-full',
              'bg-[var(--color-rust)] text-[#0A0A0A]',
              'px-6 py-3.5 text-[15px] font-semibold',
              'transition-[background,transform] duration-[180ms]',
              'hover:bg-[var(--color-rust-2)] hover:translate-y-[-1px]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
            )}
          >
            {primaryCta.label}
            <span aria-hidden="true">→</span>
          </a>
          <a
            href={secondaryCta.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-full',
              'border border-[var(--color-paper-3)] bg-transparent text-[var(--color-ink)]',
              'px-6 py-3.5 text-[15px] font-medium',
              'transition-[border-color,color,background] duration-[180ms]',
              'hover:border-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
            )}
          >
            {secondaryCta.label}
          </a>
        </div>

        <ul className="fade-up fade-up-4 mt-12 grid grid-cols-1 gap-3 text-[14px] text-[var(--color-ink-2)] md:grid-cols-3 md:gap-6">
          {reassureLines.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="mt-1 shrink-0 text-[var(--color-rust)]"
              >
                <path d="M11.5 3.5L5.5 9.5L2.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
