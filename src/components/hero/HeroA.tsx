import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeroAProps {
  eyebrow: string
  titleParts: { plain: string; italic: string; rest: string }
  sub: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  reassureLines: string[]
  /** kept for back-compat; no longer rendered in the modern hero */
  gauge: { lcp: string; cls: string; inp: string; jsKb: string; a11y: string }
}

const STEP = 0.04
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * HeroA — modern dark-agency hero.
 *
 * Single-column composition: small eyebrow, massive Geist headline, sub,
 * two-CTA row (primary green pill + ghost link), reassure line. No
 * editorial decoration, no PAGE METRICS panel, no marginalia.
 *
 * Background uses a subtle radial accent glow behind the headline to add
 * depth without dragging in glassmorphism. Respects prefers-reduced-motion.
 */
export default function HeroA({
  eyebrow,
  titleParts,
  sub,
  primaryCta,
  secondaryCta,
  reassureLines,
}: HeroAProps) {
  const reduce = useReducedMotion()
  const animateProps = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay: reduce ? 0 : delay },
  })

  // Compose the title from parts. The "italic" segment becomes a bright accent
  // colored span (no italic styling — we are off Fraunces and on Geist).
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
        <motion.p
          {...animateProps(STEP * 1)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-paper-3)] bg-[var(--color-paper-2)] px-3 py-1 text-[12px] font-medium text-[var(--color-ink-2)]"
        >
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-rust)]"
            style={{ boxShadow: '0 0 8px var(--color-rust)' }}
          />
          {eyebrow}
        </motion.p>

        <motion.h1
          {...animateProps(STEP * 2)}
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
        </motion.h1>

        <motion.p
          {...animateProps(STEP * 3)}
          className="mt-8 max-w-[60ch] text-[1.125rem] leading-[1.55] text-[var(--color-ink-2)] md:text-[1.25rem]"
        >
          {sub}
        </motion.p>

        <motion.div
          {...animateProps(STEP * 4)}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
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
        </motion.div>

        <motion.ul
          {...animateProps(STEP * 5)}
          className="mt-12 grid grid-cols-1 gap-3 text-[14px] text-[var(--color-ink-2)] md:grid-cols-3 md:gap-6"
        >
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
        </motion.ul>
      </div>
    </section>
  )
}
