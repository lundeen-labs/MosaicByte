import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DefinitionBlockProps {
  term: string
  pron: string
  defs: string[]
  delay?: number
  className?: string
}

/**
 * Dictionary-style block from HeroB. The term goes in monospace small-caps,
 * the pronunciation in serif italic, and the definition in mono — fronted
 * by a 2px rust rule on the left, mimicking a printed footnote or marginal
 * gloss.
 */
export default function DefinitionBlock({
  term,
  pron,
  defs,
  delay = 0,
  className,
}: DefinitionBlockProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : delay }}
      className={cn(
        'font-mono text-[0.75rem] text-ink-3 leading-relaxed tracking-[0.02em]',
        className,
      )}
      style={{
        borderLeft: '2px solid var(--color-rust)',
        padding: '4px 0 4px 16px',
      }}
    >
      <span className="block mb-1 text-ink font-bold uppercase tracking-[0.08em] text-[0.6875rem]">
        {term}
      </span>
      <em
        className="not-italic font-display font-normal text-rust text-[0.875rem]"
        style={{
          fontStyle: 'italic',
          fontVariationSettings: '"opsz" 32, "SOFT" 100, "WONK" 1',
          letterSpacing: '-0.005em',
        }}
      >
        {pron}
      </em>{' '}
      {defs.map((d, i) => (
        <span key={i}>
          {i > 0 ? ' ' : ''}
          {d}
        </span>
      ))}
    </motion.div>
  )
}
