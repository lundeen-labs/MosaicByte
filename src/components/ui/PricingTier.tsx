import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

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
 * Pricing card with eyebrow / serif name / serif price / cadence / scope
 * list (Check icons) / primary CTA. `featured` adds a rust left border
 * and slight scale-up.
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
        'relative flex flex-col gap-5 rounded-[var(--radius-r3)] bg-[var(--color-paper)] p-[26px]',
        '[box-shadow:0_1px_0_var(--color-paper-3),0_0_0_1px_var(--color-paper-3)]',
        featured &&
          'border-l-[3px] border-l-[var(--color-rust)] [box-shadow:0_2px_0_var(--color-paper-3),0_0_0_1px_var(--color-ink)] scale-[1.015]',
        className,
      )}
    >
      <header className="flex flex-col gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-rust)]">
          {eyebrow}
        </span>
        <h3 className="font-display text-[1.5rem] leading-[1.2] tracking-[-0.015em] font-medium text-[var(--color-ink)] m-0">
          {name}
        </h3>
      </header>

      <div className="flex items-baseline gap-2 border-y border-[var(--color-paper-3)] py-4">
        <span className="font-display text-[3rem] leading-[1.04] tracking-[-0.025em] font-medium text-[var(--color-ink)]">
          {price}
        </span>
        {cadence ? (
          <span className="font-body text-sm text-[var(--color-ink-3)]">{cadence}</span>
        ) : null}
      </div>

      <ul className="flex flex-col gap-3 m-0 p-0 list-none flex-1">
        {scope.map((item, i) => (
          <li key={i} className="flex items-start gap-3 font-body text-base leading-[1.55] text-[var(--color-ink-2)]">
            <Check
              size={16}
              strokeWidth={1.5}
              aria-hidden="true"
              className="mt-1 shrink-0 text-[var(--color-rust)]"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Button asChild variant="primary" size="md" className="w-full">
        <a href={cta.href}>{cta.label}</a>
      </Button>
    </article>
  )
}
