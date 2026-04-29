import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MarginaliaProps {
  number: string
  label: string
  className?: string
}

export default function Marginalia({ number, label, className }: MarginaliaProps) {
  const reduce = useReducedMotion()
  return (
    <motion.aside
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.04 }}
      className={cn(
        'font-mono uppercase pt-3 leading-relaxed tracking-[0.08em] text-[0.6875rem] text-ink-3',
        className,
      )}
      aria-hidden="true"
    >
      <span>{number}</span>
      <span className="block mt-0.5 text-rust">{label}</span>
    </motion.aside>
  )
}
