import { Link } from 'wouter'
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
 * WorkPreview — three featured case studies as link cards on the home page.
 *
 * Pulls visitors deeper than the hero before they hit pricing. Each card is
 * a Wouter `<Link>` element wrapping a styled article — semantically a
 * link-to-article, not just a clickable div. Outcome chips use the moss/rust/
 * plum palette tokens for tonal variety per design-system §3.
 */
export function WorkPreview({
  sectionMark,
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
      className={cn(
        'mx-auto w-full max-w-[1280px] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]',
        className,
      )}
    >
      <header className="mb-[var(--spacing-s7)] flex flex-col gap-[var(--spacing-s3)] md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-[var(--spacing-s3)]">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
            § {sectionMark.number} / {sectionMark.label}
          </span>
          <h2
            id="work-preview-heading"
            className="font-display text-[2.25rem] leading-[1.1] tracking-[-0.025em] text-[var(--color-ink)] md:text-[3rem]"
          >
            {heading}
          </h2>
          <p className="max-w-[48ch] text-[var(--color-ink-2)]">{intro}</p>
        </div>
        <Link
          href={allLink.href}
          className={cn(
            'self-start font-mono text-[12px] uppercase tracking-[0.08em] font-medium',
            'text-[var(--color-ink-2)] underline underline-offset-4 decoration-[var(--color-paper-line)]',
            'transition-colors duration-[180ms]',
            'hover:text-[var(--color-rust)] hover:decoration-[var(--color-rust)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
          )}
        >
          {allLink.label} →
        </Link>
      </header>

      <ul role="list" className="grid grid-cols-1 gap-[var(--spacing-s5)] md:grid-cols-3">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/work/${item.slug}`}
              aria-label={`${item.client} case study — ${item.outcome}`}
              className={cn(
                'group block h-full',
                'rounded-[var(--radius-r3)] bg-[var(--color-paper-2)]',
                '[box-shadow:0_0_0_1px_var(--color-paper-3)]',
                'transition-[transform,box-shadow] duration-[180ms]',
                'hover:translate-y-[-2px] hover:[box-shadow:0_2px_0_var(--color-ink),0_0_0_1px_var(--color-ink)]',
                'focus-visible:translate-y-[-2px] focus-visible:[box-shadow:0_2px_0_var(--color-ink),0_0_0_1px_var(--color-ink)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
              )}
            >
              <article className="flex h-full flex-col gap-[var(--spacing-s4)] p-[var(--spacing-s5)]">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
                  {item.sector}
                </span>
                <h3 className="font-display text-[1.5rem] leading-[1.15] tracking-[-0.02em] text-[var(--color-ink)] group-hover:text-[var(--color-rust)] transition-colors duration-[180ms]">
                  {item.client}
                </h3>
                <span
                  className={cn(
                    'mt-auto inline-flex w-fit items-center gap-[6px]',
                    'rounded-[var(--radius-r1)] border bg-[var(--color-paper)]',
                    'px-[8px] py-[3px]',
                    'font-mono text-[11px] uppercase tracking-[0.06em] font-medium',
                  )}
                  style={{
                    color: toneToColor[item.outcomeTone ?? 'moss'],
                    borderColor: toneToColor[item.outcomeTone ?? 'moss'],
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
