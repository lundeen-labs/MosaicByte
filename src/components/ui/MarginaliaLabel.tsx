import { cn } from '@/lib/utils'

export interface MarginaliaLabelProps {
  number: string
  label: string
  align?: 'left' | 'right'
  className?: string
}

/**
 * Editorial gutter marker (e.g. `§ 02 / SERVICES`). Default position is
 * absolute left -120px and only visible at lg breakpoint and above. The
 * `align="right"` variant pins to right -120px instead.
 *
 * Renders as a hidden semantic aside (aria-hidden) — pure decoration.
 */
export function MarginaliaLabel({
  number,
  label,
  align = 'left',
  className,
}: MarginaliaLabelProps) {
  const positionClass =
    align === 'left'
      ? 'lg:absolute lg:left-[-120px] lg:top-[12px]'
      : 'lg:absolute lg:right-[-120px] lg:top-[12px]'

  return (
    <aside
      aria-hidden="true"
      data-align={align}
      className={cn(
        'hidden lg:block font-mono text-[11px] uppercase tracking-[0.08em] leading-[1.6] text-[var(--color-ink-3)]',
        positionClass,
        className,
      )}
    >
      <span>§ {number}</span>
      <span className="block text-[var(--color-rust)] mt-[2px]">{label}</span>
    </aside>
  )
}
