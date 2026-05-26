import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PricingTierProps {
  eyebrow: string
  name: string
  price: string
  cadence?: string
  scope: string[]
  cta: { label: string; href: string }
  featured?: boolean
  className?: string
}

/**
 * Modern dark-agency pricing card.
 *
 * Featured variant gets a brighter border + a small "Most picked" ribbon.
 * Scope list uses Lucide Check icons in the accent color.
 */
export function PricingTier({
  eyebrow,
  name,
  price,
  cadence,
  scope,
  cta,
  featured = false,
  className,
}: PricingTierProps) {
  return (
    <article
      data-featured={featured}
      className={cn(
        'relative flex h-full flex-col gap-6 rounded-2xl p-7',
        'bg-[var(--color-paper-2)]',
        featured
          ? 'border border-[var(--color-rust)]/40 ring-1 ring-[var(--color-rust)]/20'
          : 'border border-[var(--color-paper-3)]',
        className,
      )}
    >
      {featured ? (
        <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-[var(--color-rust)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-paper)]">
          Most picked
        </span>
      ) : null}

      <header className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
          {eyebrow}
        </span>
        <h3 className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          {name}
        </h3>
      </header>

      <div className="flex items-baseline gap-2">
        <span className="font-display text-[2.5rem] font-semibold tracking-[-0.025em] text-[var(--color-ink)] md:text-[3rem]">
          {price}
        </span>
        {cadence ? (
          <span className="text-[13px] text-[var(--color-ink-3)]">{cadence}</span>
        ) : null}
      </div>

      <ul role="list" className="flex flex-col gap-3 text-[14px] text-[var(--color-ink-2)]">
        {scope.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <Check
              size={16}
              strokeWidth={2}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[var(--color-rust)]"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <a
        href={cta.href}
        className={cn(
          'mt-auto inline-flex items-center justify-center gap-2 rounded-full',
          'px-5 py-3 text-[14px] font-semibold transition-[background,color,transform] duration-[180ms]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
          featured
            ? 'bg-[var(--color-rust)] text-[var(--color-paper)] hover:bg-[var(--color-rust-2)] hover:translate-y-[-1px]'
            : 'border border-[var(--color-paper-3)] text-[var(--color-ink)] hover:border-[var(--color-ink-2)] hover:bg-[var(--color-paper)]/40',
        )}
      >
        {cta.label}
        <span aria-hidden="true">→</span>
      </a>
    </article>
  )
}

export default PricingTier
