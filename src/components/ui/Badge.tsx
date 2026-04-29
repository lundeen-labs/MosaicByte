import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'rust' | 'moss' | 'ochre' | 'plum'
  children: ReactNode
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral:
    'bg-[var(--color-paper-2)] text-[var(--color-ink-2)] border-[var(--color-paper-3)]',
  rust:
    'bg-[var(--color-rust)] text-[var(--color-paper)] border-[var(--color-rust-2)]',
  moss:
    'bg-[var(--color-moss)] text-[var(--color-paper)] border-[var(--color-moss)]',
  ochre:
    'bg-[var(--color-ochre)] text-[var(--color-paper)] border-[var(--color-ochre)]',
  plum:
    'bg-[var(--color-plum)] text-[var(--color-paper)] border-[var(--color-plum)]',
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, tone = 'neutral', children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-tone={tone}
      className={cn(
        'inline-flex items-center gap-1 rounded-[var(--radius-r1)] border px-2 py-[3px] font-mono text-[11px] uppercase tracking-[0.08em] leading-none',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'
