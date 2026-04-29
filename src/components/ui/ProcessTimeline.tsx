import { cn } from '@/lib/utils'

export interface ProcessTimelineProps {
  steps: { day: string; label: string; detail: string }[]
  currentStep?: number
  className?: string
}

/**
 * 14-day process visualized as a 7-cell horizontal grid (mirrors the
 * case-study mockup). Each cell shows day label (mono micro), step name
 * (Fraunces 500), and detail (body-sm). Hairline borders between cells.
 * Optional `currentStep` highlights the active cell with rust-2 fill.
 */
export function ProcessTimeline({ steps, currentStep, className }: ProcessTimelineProps) {
  if (steps.length === 0) return null

  return (
    <div
      className={cn(
        'relative w-full border-t border-[var(--color-ink)]',
        className,
      )}
    >
      {/* Top tick row — 14-day rule */}
      <div
        aria-hidden="true"
        className="absolute -top-px left-0 right-0 h-2"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to right, var(--color-ink) 0, var(--color-ink) 1px, transparent 1px, transparent calc(100% / 14))',
          backgroundSize: '100% 8px',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <ol
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 border-b border-[var(--color-paper-3)]"
        aria-label="Process timeline"
      >
        {steps.map((step, idx) => {
          const isActive = currentStep === idx
          return (
            <li
              key={`${step.day}-${idx}`}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'flex flex-col gap-[6px] border-r border-[var(--color-paper-3)] last:border-r-0 px-4 pt-7 pb-5 min-h-[140px]',
                isActive && 'bg-[var(--color-rust-2)] text-[var(--color-paper)]',
              )}
            >
              <span
                className={cn(
                  'font-mono text-[11px] uppercase tracking-[0.08em] leading-none',
                  isActive ? 'text-[var(--color-paper)]' : 'text-[var(--color-rust)]',
                )}
              >
                {step.day}
              </span>
              <span
                className={cn(
                  'font-display text-[1.0625rem] leading-[1.2] tracking-[-0.01em] font-medium',
                  isActive ? 'text-[var(--color-paper)]' : 'text-[var(--color-ink)]',
                )}
              >
                {step.label}
              </span>
              <span
                className={cn(
                  'font-body text-[13px] leading-[1.45] mt-1',
                  isActive ? 'text-[var(--color-paper)]/90' : 'text-[var(--color-ink-2)]',
                )}
              >
                {step.detail}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
