import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius-r3)] bg-[var(--color-paper-2)] p-6 [box-shadow:0_0_0_1px_var(--color-paper-3)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'
