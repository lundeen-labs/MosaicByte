import { cn } from '@/lib/utils'

export interface StackBadgesProps {
  label: string
  items: { name: string; detail?: string }[]
  className?: string
}

/**
 * StackBadges — horizontal strip used as a "trust strip" beneath the hero.
 *
 * Reads as a row of kbd-style monospace pills, each labeled with a stack name
 * and an optional micro-detail (e.g. "Webflow · CMS"). Listed inside an
 * unordered list with a screen-reader-only label so AT users get "List of 5
 * items: I build in your stack — Webflow, Framer, Next.js, Astro, Sanity."
 *
 * Visual register matches the engineer-designer aesthetic: no logos, no
 * brand colors, just typography. Logos would compete with the editorial
 * Fraunces hero and trip licensing edge cases.
 */
export function StackBadges({ label, items, className }: StackBadgesProps) {
  return (
    <section
      aria-labelledby="stack-badges-heading"
      className={cn(
        'mx-auto w-full max-w-[1280px] border-y border-[var(--color-paper-3)]',
        'px-[var(--spacing-s5)] py-[var(--spacing-s5)] md:px-[var(--spacing-s7)] md:py-[var(--spacing-s6)]',
        'bg-[var(--color-paper-2)]',
        className,
      )}
    >
      <div className="flex flex-col gap-[var(--spacing-s4)] md:flex-row md:items-center md:justify-between md:gap-[var(--spacing-s6)]">
        <h2
          id="stack-badges-heading"
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-2)] md:text-[12px]"
        >
          {label}
        </h2>
        <ul className="flex flex-wrap items-center gap-[var(--spacing-s3)]" role="list">
          {items.map((item) => (
            <li key={item.name}>
              <span
                className={cn(
                  'inline-flex items-baseline gap-[6px]',
                  'rounded-[var(--radius-r1)] border border-[var(--color-ink)]',
                  'bg-[var(--color-paper)] px-[10px] py-[5px]',
                  '[box-shadow:0_1px_0_var(--color-ink)]',
                  'font-mono text-[12px] font-medium text-[var(--color-ink)]',
                )}
              >
                <span>{item.name}</span>
                {item.detail ? (
                  <span
                    aria-hidden="true"
                    className="text-[10px] uppercase tracking-[0.06em] text-[var(--color-ink-3)]"
                  >
                    · {item.detail}
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
