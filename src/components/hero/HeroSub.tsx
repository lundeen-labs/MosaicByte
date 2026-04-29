import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeroSubProps {
  children: React.ReactNode
  delay?: number
  maxCh?: number
  className?: string
}

export default function HeroSub({
  children,
  delay = 0,
  maxCh = 52,
  className,
}: HeroSubProps) {
  const reduce = useReducedMotion()
  return (
    <motion.p
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : delay }}
      className={cn(
        'font-body text-[1.25rem] leading-[1.55] text-ink-2 mb-10 font-normal',
        className,
      )}
      style={{ maxWidth: `${maxCh}ch` }}
    >
      {children}
    </motion.p>
  )
}
