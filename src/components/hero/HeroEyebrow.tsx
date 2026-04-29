import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeroEyebrowProps {
  children: string
  delay?: number
  withRule?: boolean
  className?: string
}

export default function HeroEyebrow({
  children,
  delay = 0,
  withRule = true,
  className,
}: HeroEyebrowProps) {
  const reduce = useReducedMotion()
  return (
    <motion.p
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : delay }}
      className={cn(
        'font-mono text-[0.75rem] font-medium text-rust tracking-[0.08em] uppercase mb-7 inline-flex items-center gap-2.5',
        className,
      )}
    >
      {withRule ? (
        <span aria-hidden="true" className="inline-block w-9 h-px bg-rust" />
      ) : null}
      {children}
    </motion.p>
  )
}
