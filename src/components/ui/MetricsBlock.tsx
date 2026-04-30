import { cn } from '@/lib/utils'

export interface MetricsBlockProps {
  metrics: { label: string; value: string; ci?: string; tone?: 'moss' | 'rust' | 'neutral' }[]
  columns?: number
  className?: string
}

const toneTextClasses: Record<NonNullable<MetricsBlockProps['metrics'][number]['tone']>, string> = {
  moss: 'text-[var(--color-moss)]',
  rust: 'text-[var(--color-rust)]',
  neutral: 'text-[var(--color-ink)]',
}

/**
 * N-cell grid of metrics. Default 4-col. Each metric:
 *   - label: mono micro uppercase
 *   - value: Fraunces 48px / line-height 1.04 / -0.025em tracking
 *   - ci (optional): mono micro `(95% CI [...])`
 * Tone tokens map to moss / rust / neutral (ink) for the value color.
 * Hairline borders top/bottom in ink, between cells in paper-3.
 */
export function MetricsBlock({ metrics, columns = 4, className }: MetricsBlockProps) {
  if (metrics.length === 0) return null

  const colClass = (() => {
    switch (columns) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-1 sm:grid-cols-2'
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      case 5:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      case 6:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
    }
  })()

  return (
    <dl
      role="list"
      aria-label="Metrics"
      className={cn(
        'grid w-full overflow-hidden rounded-2xl border border-[var(--color-paper-3)] bg-[var(--color-paper-2)]',
        colClass,
        className,
      )}
    >
      {metrics.map((m, i) => {
        const tone = m.tone ?? 'neutral'
        return (
          <div
            key={`${m.label}-${i}`}
            role="listitem"
            className="flex flex-col gap-2 border-r border-b border-[var(--color-paper-3)] last:border-r-0 px-7 py-6"
          >
            <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
              {m.label}
            </dt>
            <dd
              className={cn(
                'font-display text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.025em] md:text-[3rem]',
                toneTextClasses[tone],
              )}
            >
              {m.value}
            </dd>
            {m.ci ? (
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-ink-3)]">
                {m.ci}
              </p>
            ) : null}
          </div>
        )
      })}
    </dl>
  )
}
