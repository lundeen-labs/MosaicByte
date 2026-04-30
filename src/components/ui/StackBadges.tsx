import { cn } from '@/lib/utils'

export interface StackBadgesProps {
  label: string
  items: { name: string; detail?: string }[]
  className?: string
}

/**
 * StackBadges — clean horizontal logo strip beneath the hero.
 *
 * Modern dark-agency interpretation: small uppercase label on the left,
 * row of stack-name pills on the right with hairline borders. No
 * letterpress, no editorial ornament.
 */
export function StackBadges({ label, items, className }: StackBadgesProps) {
  return (
    <section
      aria-labelledby="stack-badges-heading"
      className={cn(
        'mx-auto w-full max-w-[1280px] px-6 py-10 md:px-8',
        'border-y border-[var(--color-paper-3)]',
        className,
      )}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
        <h2
          id="stack-badges-heading"
          className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]"
        >
          {label}
        </h2>
        <ul role="list" className="flex flex-wrap items-center gap-2">
          {items.map((item) => (
            <li key={item.name}>
              <span
                className={cn(
                  'inline-flex items-baseline gap-1.5 rounded-full',
                  'border border-[var(--color-paper-3)] bg-[var(--color-paper-2)] px-3 py-1.5',
                  'text-[13px] font-medium text-[var(--color-ink)]',
                )}
              >
                <span>{item.name}</span>
                {item.detail ? (
                  <span aria-hidden="true" className="text-[11px] text-[var(--color-ink-3)]">
                    {item.detail}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default StackBadges
