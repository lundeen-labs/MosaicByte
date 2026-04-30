import { cn } from '@/lib/utils'

export interface InstrumentationMetric {
  label: string
  value: string
  unit?: string
  target?: string
  tone?: 'moss' | 'ochre' | 'rust' | 'neutral'
}

export interface InstrumentationBlockProps {
  sectionMark: { number: string; label: string }
  heading: string
  body: string
  metrics: InstrumentationMetric[]
  className?: string
}

const toneToColor: Record<NonNullable<InstrumentationMetric['tone']>, string> = {
  moss: 'var(--color-moss)',
  ochre: 'var(--color-ochre)',
  rust: 'var(--color-rust)',
  neutral: 'var(--color-ink)',
}

/**
 * InstrumentationBlock — "the site is its own demo" section.
 *
 * A claim plus a 5-cell live-metrics grid. Pure presentational: real values
 * come from `COPY.status.metrics` (which Tyler must update post-deploy with
 * actual Lighthouse output, otherwise the positioning collapses — see
 * docs/competitive-edge.md).
 *
 * Designed to slot between Process and FAQ on the home page. Section is
 * labelled by its h2 so screen readers announce the landmark correctly.
 */
export function InstrumentationBlock({
  sectionMark,
  heading,
  body,
  metrics,
  className,
}: InstrumentationBlockProps) {
  return (
    <section
      id="instrumentation"
      aria-labelledby="instrumentation-heading"
      className={cn(
        'mx-auto w-full max-w-[1280px] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]',
        className,
      )}
    >
      <header className="mb-[var(--spacing-s7)] grid grid-cols-1 gap-[var(--spacing-s5)] md:grid-cols-[2fr_3fr] md:gap-[var(--spacing-s7)]">
        <div className="flex flex-col gap-[var(--spacing-s3)]">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-plum)]">
            § {sectionMark.number} / {sectionMark.label}
          </span>
          <h2
            id="instrumentation-heading"
            className="font-display text-[2.25rem] leading-[1.1] tracking-[-0.025em] text-[var(--color-ink)] md:text-[3rem]"
          >
            {heading}
          </h2>
        </div>
        <p className="max-w-[60ch] self-end text-[1.125rem] leading-[1.55] text-[var(--color-ink-2)]">
          {body}
        </p>
      </header>

      <ul
        role="list"
        aria-label="Live page-performance metrics"
        className="grid grid-cols-2 border-t border-l border-[var(--color-ink)] md:grid-cols-5"
      >
        {metrics.map((m) => (
          <li
            key={m.label}
            className="flex flex-col gap-[var(--spacing-s2)] border-b border-r border-[var(--color-ink)] bg-[var(--color-paper-2)] p-[var(--spacing-s5)]"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
              {m.label}
            </span>
            <span
              className="font-display text-[2.5rem] leading-[0.95] tracking-[-0.025em]"
              style={{ color: toneToColor[m.tone ?? 'neutral'] }}
            >
              {m.value}
              {m.unit ? (
                <span className="ml-1 text-[1rem] font-normal tracking-[0]">{m.unit}</span>
              ) : null}
            </span>
            {m.target ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-ink-3)]">
                {m.target}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default InstrumentationBlock
