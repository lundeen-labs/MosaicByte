import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeroTitleProps {
  plain: string
  italic: string
  rest: string
  delay?: number
  className?: string
}

/**
 * HeroA-style title: three text fragments separated by spaces, with the middle
 * fragment rendered in Fraunces italic + rust accent. Fraunces variable axes
 * (opsz 144, SOFT 100, WONK 1) are applied via inline `font-variation-settings`.
 */
export default function HeroTitle({
  plain,
  italic,
  rest,
  delay = 0,
  className,
}: HeroTitleProps) {
  const reduce = useReducedMotion()
  return (
    <motion.h1
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : delay }}
      className={cn(
        'font-display font-medium text-ink mb-8 max-w-[16ch]',
        'text-[clamp(3.5rem,6vw,5.25rem)] leading-[0.94] tracking-[-0.035em]',
        className,
      )}
      style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
    >
      {plain}{' '}
      <em
        className="not-italic font-normal text-rust"
        style={{
          fontStyle: 'italic',
          fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
        }}
      >
        {italic}
      </em>{' '}
      {rest}
    </motion.h1>
  )
}
