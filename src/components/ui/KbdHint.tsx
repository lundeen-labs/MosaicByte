import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface KbdHintProps {
  children: ReactNode
  className?: string
}

/**
 * Letterpress kbd chip. Semantic `<kbd>` element. 1px ink border + 1px
 * ink box-shadow, JetBrains Mono 13px, 4x6 padding, --r-1 radius.
 */
export function KbdHint({ children, className }: KbdHintProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center font-mono text-[13px] leading-none font-medium text-[var(--color-ink-2)] bg-[var(--color-paper-2)]',
        'px-[6px] py-1 rounded-[var(--radius-r1)] border border-[var(--color-ink)]',
        '[box-shadow:0_1px_0_var(--color-ink)]',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
