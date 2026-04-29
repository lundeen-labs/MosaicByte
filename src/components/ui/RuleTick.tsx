import { cn } from '@/lib/utils'

export interface RuleTickProps {
  className?: string
}

/**
 * Horizontal divider with measurement marks every 8 columns. Implements
 * design-system §9 ruler: a 1px hairline along the bottom plus a vertical
 * tick every 1/8 of the width. Decorative — aria-hidden by default.
 */
export function RuleTick({ className }: RuleTickProps) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={cn('h-3 w-full', className)}
      style={{
        backgroundImage: [
          'linear-gradient(to right, var(--color-paper-3) 1px, transparent 1px)',
          'linear-gradient(to right, transparent calc(100% / 8 - 1px), var(--color-paper-3) calc(100% / 8))',
        ].join(', '),
        backgroundSize: '100% 1px, calc(100% / 8) 8px',
        backgroundPosition: '0 50%, 0 0',
        backgroundRepeat: 'no-repeat, repeat-x',
      }}
    />
  )
}
