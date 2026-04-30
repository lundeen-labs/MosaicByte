import { Link } from 'wouter'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WorkPreviewItem {
  slug: string
  client: string
  sector: string
  outcome: string
  outcomeTone?: 'moss' | 'rust' | 'plum'
}

export interface WorkPreviewProps {
  sectionMark: { number: string; label: string }
  heading: string
  intro: string
  items: WorkPreviewItem[]
  allLink: { label: string; href: string }
  className?: string
}

const toneToColor: Record<NonNullable<WorkPreviewItem['outcomeTone']>, string> = {
  moss: 'var(--color-moss)',
  rust: 'var(--color-rust)',
  plum: 'var(--color-plum)',
}

/**
 * WorkPreview — three featured case-study cards.
 *
 * Modern dark-agency cards with an arrow-out icon, sector eyebrow, large
 * client name, and outcome chip. Hover lifts the card and brightens the
 * arrow.
 */
export function WorkPreview({
  heading,
  intro,
  items,
  allLink,
  className,
}: WorkPreviewProps) {
  return (
    <section
      id="work-preview"
      aria-labelledby="work-preview-heading"
      className={cn('mx-auto w-full max-w-[1280px] px-6 py-24 md:px-8 md:py-32', className)}
    >
      <header className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-[48ch] flex-col gap-3">
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-rust)]">
            Selected work
          </span>
          <h2
            id="work-preview-heading"
            className="font-display text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--color-ink)] md:text-[3rem]"
          >
            {heading}
          </h2>
          <p className="text-[var(--color-ink-2)]">{intro}</p>
        </div>
        <Link
          href={allLink.href}
          className={cn(
            'inline-flex items-center gap-1.5 self-start text-[14px] font-medium',
            'text-[var(--color-ink-2)] transition-colors duration-[180ms]',
            'hover:text-[var(--color-ink)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
          )}
        >
          {allLink.label} <span aria-hidden="true">→</span>
        </Link>
      </header>

      <ul role="list" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/work/${item.slug}`}
              aria-label={`${item.client} case study — ${item.outcome}`}
              className={cn(
                'group block h-full overflow-hidden rounded-2xl',
                'border border-[var(--color-paper-3)] bg-[var(--color-paper-2)]',
                'transition-[transform,border-color] duration-[200ms]',
                'hover:translate-y-[-2px] hover:border-[var(--color-ink-3)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
              )}
            >
              <article className="flex h-full flex-col gap-5 p-7">
                <div className="flex items-start justify-between">
                  <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--color-ink-3)]">
                    {item.sector}
                  </span>
                  <ArrowUpRight
                    size={18}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className="text-[var(--color-ink-3)] transition-colors duration-[180ms] group-hover:text-[var(--color-rust)]"
                  />
                </div>
                <h3 className="font-display text-[1.625rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)]">
                  {item.client}
                </h3>
                <span
                  className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
                  style={{
                    color: toneToColor[item.outcomeTone ?? 'moss'],
                    background: 'rgba(0,217,126,0.08)',
                    border: `1px solid ${toneToColor[item.outcomeTone ?? 'moss']}33`,
                  }}
                >
                  {item.outcome}
                </span>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default WorkPreview
