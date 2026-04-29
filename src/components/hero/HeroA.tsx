import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import HeroEyebrow from './HeroEyebrow'
import HeroTitle from './HeroTitle'
import HeroSub from './HeroSub'
import InstrumentGauge from './InstrumentGauge'
import Marginalia from './Marginalia'

interface HeroAProps {
  eyebrow: string
  titleParts: { plain: string; italic: string; rest: string }
  sub: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  reassureLines: string[]
  gauge: { lcp: string; cls: string; inp: string; jsKb: string; a11y: string }
}

/**
 * 40ms stagger per design-system §7. Steps used:
 *   01: marginalia
 *   02: eyebrow
 *   03: title
 *   04: sub
 *   05: cta group
 *   06: reassure list (entire block, single fade)
 *   07: instrument gauge (right rail, slightly later)
 */
const STEP = 0.04

export default function HeroA({
  eyebrow,
  titleParts,
  sub,
  primaryCta,
  secondaryCta,
  reassureLines,
  gauge,
}: HeroAProps) {
  const reduce = useReducedMotion()

  return (
    <main
      className="relative mx-auto"
      style={{
        maxWidth: '1440px',
        padding: '88px 32px 60px',
      }}
    >
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: 'repeat(12, 1fr)',
          columnGap: '32px',
          rowGap: '40px',
        }}
      >
        {/* Marginalia hangs in the gutter on desktop; hidden under 1100px via media query handled by component consumer if needed.
            For first delivery we keep it visible. Section number is decorative.  */}
        <div className="col-span-1 max-[1100px]:hidden">
          <Marginalia number="§ 01" label="HERO" />
        </div>

        <section
          className="col-span-8 max-[1100px]:col-span-12"
          style={{ gridColumnStart: 'auto' }}
        >
          <HeroEyebrow delay={STEP * 2}>{eyebrow}</HeroEyebrow>

          <HeroTitle
            plain={titleParts.plain}
            italic={titleParts.italic}
            rest={titleParts.rest}
            delay={STEP * 3}
          />

          <HeroSub delay={STEP * 4}>{sub}</HeroSub>

          {/* CTA group — primary uses the letterpress block-shadow signature move (§11). */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.72,
              ease: [0.22, 1, 0.36, 1],
              delay: reduce ? 0 : STEP * 5,
            }}
            className="flex items-center gap-[18px] mb-9 flex-wrap"
          >
            <a
              href={primaryCta.href}
              className="font-body font-semibold text-[1rem] inline-flex items-center gap-2.5 cursor-pointer transition-[transform,box-shadow,background] duration-[180ms]"
              style={{
                background: 'var(--color-rust)',
                color: 'var(--color-paper)',
                padding: '14px 22px',
                border: '1.5px solid var(--color-ink)',
                borderRadius: 'var(--radius-r2)',
                boxShadow:
                  '0 2px 0 var(--color-ink), 0 0 0 1.5px var(--color-ink)',
                transitionTimingFunction: 'var(--ease-press)',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)'
                e.currentTarget.style.boxShadow =
                  '0 0 0 var(--color-ink), 0 0 0 1.5px var(--color-ink)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow =
                  '0 2px 0 var(--color-ink), 0 0 0 1.5px var(--color-ink)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow =
                  '0 2px 0 var(--color-ink), 0 0 0 1.5px var(--color-ink)'
              }}
            >
              {primaryCta.label}
              <svg
                width={18}
                height={14}
                viewBox="0 0 18 14"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="square"
                aria-hidden="true"
              >
                <path d="M1 7H17M11 1L17 7L11 13" />
              </svg>
            </a>
            <a
              href={secondaryCta.href}
              className="font-body font-medium text-[1rem] inline-flex items-center gap-2 transition-colors duration-[180ms]"
              style={{
                color: 'var(--color-ink)',
                background: 'transparent',
                padding: '14px 4px',
                borderBottom: '1px solid var(--color-ink)',
              }}
            >
              {secondaryCta.label}
              <svg
                width={14}
                height={10}
                viewBox="0 0 14 10"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="square"
                aria-hidden="true"
              >
                <path d="M1 5H13M9 1L13 5L9 9" />
              </svg>
            </a>
          </motion.div>

          <motion.ul
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.72,
              ease: [0.22, 1, 0.36, 1],
              delay: reduce ? 0 : STEP * 6,
            }}
            className="font-mono text-[0.75rem] text-ink-3 tracking-[0.04em] flex flex-col gap-1.5"
            style={{ maxWidth: '48ch' }}
          >
            {reassureLines.map((line) => (
              <li key={line} className="flex items-baseline gap-2">
                <span className="text-rust font-bold text-[0.875rem]" aria-hidden="true">
                  ›
                </span>
                <span>{line}</span>
              </li>
            ))}
          </motion.ul>
        </section>

        <div
          className={cn(
            'col-start-10 col-span-3',
            'max-[1100px]:col-start-9 max-[1100px]:col-span-4',
            'max-[900px]:col-start-1 max-[900px]:col-span-12',
          )}
        >
          <InstrumentGauge
            lcp={gauge.lcp}
            cls={gauge.cls}
            inp={gauge.inp}
            jsKb={gauge.jsKb}
            a11y={gauge.a11y}
          />
        </div>
      </div>
    </main>
  )
}
