import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  children?: ReactNode
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap rounded-full font-medium transition-[background,border-color,color,transform] duration-[180ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)] disabled:cursor-not-allowed disabled:opacity-50'

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[var(--color-rust)] text-[var(--color-paper)] font-semibold hover:bg-[var(--color-rust-2)] hover:translate-y-[-1px]',
  ghost:
    'bg-transparent text-[var(--color-ink)] border border-[var(--color-paper-3)] hover:border-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)]',
  icon:
    'bg-[var(--color-paper-2)] text-[var(--color-ink)] border border-[var(--color-paper-3)] p-0 h-9 w-9 hover:border-[var(--color-rust)] hover:text-[var(--color-rust)]',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-[13px] px-4 py-2',
  md: 'text-[14px] px-5 py-2.5',
  lg: 'text-[15px] px-6 py-3.5',
}

const iconSizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-9 w-9 text-base',
  lg: 'h-11 w-11 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', asChild = false, type, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button'
  const isIcon = variant === 'icon'
  const sizing = isIcon ? iconSizeClasses[size] : sizeClasses[size]
  const composed = cn(baseClasses, variantClasses[variant], sizing, className)
  const buttonType = asChild ? undefined : (type ?? 'button')
  return (
    <Comp ref={ref} className={composed} type={buttonType} {...props}>
      {children}
    </Comp>
  )
})

Button.displayName = 'Button'
