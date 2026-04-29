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
  'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap font-body font-medium transition-[transform,box-shadow,background,color,border-color] duration-[180ms] [transition-timing-function:var(--ease-press)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)] disabled:cursor-not-allowed disabled:opacity-50'

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[var(--color-rust)] text-[var(--color-paper)] border-[1.5px] border-[var(--color-ink)] rounded-[var(--radius-r2)] font-semibold hover:bg-[var(--color-rust-2)] hover:translate-y-px active:translate-y-[2px]',
  ghost:
    'bg-transparent text-[var(--color-ink)] border border-[var(--color-ink)] rounded-[var(--radius-r2)] hover:text-[var(--color-rust)] hover:border-[var(--color-rust)]',
  icon:
    'bg-transparent text-[var(--color-ink)] border border-[var(--color-ink)] rounded-[var(--radius-r2)] p-0 h-9 w-9 hover:text-[var(--color-rust)] hover:border-[var(--color-rust)]',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-sm px-3 py-2',
  md: 'text-base px-[22px] py-[14px]',
  lg: 'text-lg px-[26px] py-[18px]',
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

  const isPrimary = variant === 'primary'
  const isIcon = variant === 'icon'

  // Letterpress block-shadow snapping for primary
  const primaryShadow = isPrimary
    ? '[box-shadow:0_2px_0_var(--color-ink),0_0_0_1.5px_var(--color-ink)] hover:[box-shadow:0_1px_0_var(--color-ink),0_0_0_1.5px_var(--color-ink)] active:[box-shadow:0_0_0_var(--color-ink),0_0_0_1.5px_var(--color-ink)]'
    : ''

  const sizing = isIcon ? iconSizeClasses[size] : sizeClasses[size]

  const composed = cn(baseClasses, variantClasses[variant], sizing, primaryShadow, className)

  // When asChild is true, do not pass `type` (the child element controls its own)
  const buttonType = asChild ? undefined : (type ?? 'button')

  return (
    <Comp ref={ref} className={composed} type={buttonType} {...props}>
      {children}
    </Comp>
  )
})

Button.displayName = 'Button'
