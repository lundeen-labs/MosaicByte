import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import HeroSub from './HeroSub'
import DefinitionBlock from './DefinitionBlock'
import OscilloscopeChart from './OscilloscopeChart'

interface HeroBProps {
  sectionMark: { number: string; label: string }
  titleLines: { line: string; italic?: boolean; underline?: boolean; indent?: boolean }[]
  sub: string
  definition: { term: string; pron: string; defs: string[] }
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  microReassure: string
  chart: { points: number[]; ciLow: number[]; ciHigh: number[]; annotation: string }
}

const STEP = 0.04

/**
 * HeroB — category-claim archetype. Editorial section marker, multi-line
 * Fraunces display headline with selective italic + underline accents,
 * left-rail dictionary block, oscilloscope chart anchoring the bottom.
 */
export default function HeroB({
  sectionMark,
  titleLines,
  sub,
  definition,
  primaryCta,
  secondaryCta,
  microReassure,
  chart,
}: HeroBProps) {
  const reduce = useReducedMotion()

  return (
    <main
      className="relative mx-auto"
      style={{
        maxWidth: '1440px',
        padding: '60px 32px 40px',
      }}
    >
      {/* Section marker */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.72,
          ease: [0.22, 1, 0.36, 1],
          delay: reduce ? 0 : STEP,
        }}
        className="flex items-baseline gap-4 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-3 flex-wrap"
        style={{
          paddingBottom: '28px',
          borderBottom: '1px solid var(--color-paper-3)',
          marginBottom: '64px',
        }}
      >
        <span>
          <span
            className="font-display font-medium not-italic text-rust mr-1.5 tracking-[-0.01em]"
            style={{
              fontStyle: 'italic',
              fontVariationSettings: '"opsz" 32, "SOFT" 100, "WONK" 1',
              fontSize: '1rem',
              textTransform: 'none',
            }}
          >
            No.
          </span>
          {sectionMark.number} / {sectionMark.label}
        </span>
      </motion.div>

      {/* Display headline — each line gets its own stagger step. */}
      <h1
        className={cn(
          'font-display font-medium text-ink m-0',
          'leading-[0.92] tracking-[-0.045em]',
          'text-[clamp(4.5rem,9.5vw,9.5rem)]',
        )}
        style={{
          marginBottom: '56px',
          fontVariationSettings: '"opsz" 144, "SOFT" 30',
        }}
      >
        {titleLines.map((tl, idx) => {
          const inner = tl.italic ? (
            <em
              className="not-italic font-normal text-rust"
              style={{
                fontStyle: 'italic',
                fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
              }}
            >
              {tl.line}
            </em>
          ) : tl.underline ? (
            <span
              className="relative inline-block"
              style={{ display: 'inline-block' }}
            >
              {tl.line}
              <motion.span
                aria-hidden="true"
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: reduce ? 0 : 1,
                  ease: [0.22, 1, 0.36, 1],
                  delay: reduce ? 0 : 0.7,
                }}
                style={{
                  position: 'absolute',
                  left: '2%',
                  right: '2%',
                  bottom: '0.06em',
                  height: '0.08em',
                  background: 'var(--color-rust)',
                  transformOrigin: 'left',
                  display: 'block',
                }}
              />
            </span>
          ) : (
            tl.line
          )

          return (
            <motion.span
              key={`${idx}-${tl.line}`}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.72,
                ease: [0.22, 1, 0.36, 1],
                delay: reduce ? 0 : STEP * (2 + idx),
              }}
              className="block"
              style={{ marginLeft: tl.indent ? '8.5%' : undefined }}
            >
              {inner}
            </motion.span>
          )
        })}
      </h1>

      {/* Sub + definition row */}
      <div
        className="grid items-end max-[1100px]:grid-cols-1"
        style={{
          gridTemplateColumns: '1.4fr 1fr',
          gap: '80px',
          paddingTop: '36px',
          marginTop: '12px',
          borderTop: '1px solid var(--color-paper-3)',
        }}
      >
        <HeroSub delay={STEP * 5} maxCh={50}>
          {sub}
        </HeroSub>
        <DefinitionBlock
          term={definition.term}
          pron={definition.pron}
          defs={definition.defs}
          delay={STEP * 5}
        />
      </div>

      {/* CTA row — letterpress block-shadow on primary */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.72,
          ease: [0.22, 1, 0.36, 1],
          delay: reduce ? 0 : STEP * 6,
        }}
        className="flex items-center gap-6 flex-wrap"
        style={{ marginTop: '40px' }}
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
            boxShadow: '0 2px 0 var(--color-ink), 0 0 0 1.5px var(--color-ink)',
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
        <span className="font-mono text-[0.6875rem] text-ink-3 tracking-[0.06em] uppercase ml-3">
          {microReassure}
        </span>
      </motion.div>

      {/* Oscilloscope chart */}
      <motion.figure
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.72,
          ease: [0.22, 1, 0.36, 1],
          delay: reduce ? 0 : STEP * 7,
        }}
        className="overflow-hidden bg-paper relative"
        style={{
          marginTop: '80px',
          border: '1px solid var(--color-ink)',
          borderRadius: 'var(--radius-r3)',
          boxShadow:
            '0 8px 24px -12px rgba(23, 20, 19, 0.25), 0 0 0 1px var(--color-paper-3)',
        }}
        aria-label="Conversion-rate lift chart for a recent client engagement"
      >
        <header
          className="flex justify-between items-center font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
          style={{
            background: 'var(--color-ink)',
            color: 'var(--color-paper)',
            padding: '10px 18px',
            gap: '24px',
          }}
        >
          <span>{chart.annotation}</span>
          <span>14 DAYS · A/B</span>
        </header>
        <OscilloscopeChart
          points={chart.points}
          ciLow={chart.ciLow}
          ciHigh={chart.ciHigh}
          annotation={chart.annotation}
        />
      </motion.figure>
    </main>
  )
}
