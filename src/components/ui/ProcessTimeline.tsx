import { cn } from '@/lib/utils'

export interface ProcessTimelineProps {
  steps: { day: string; label: string; detail: string }[]
  currentStep?: number
  className?: string
}

/**
 * Modern dark-agency process timeline.
 *
 * Numbered steps stacked vertically on mobile, horizontal connecting line
 * on desktop. Each step is a card with the day-range tag, step name, and
 * detail. The accent green is reserved for the active/current step.
 */
export function ProcessTimeline({ steps, currentStep, className }: ProcessTimelineProps) {
  if (steps.length === 0) return null

  return (
    <ol
      aria-label="Process timeline"
      className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4', className)}
    >
      {steps.map((step, idx) => {
        const isActive = currentStep === idx
        const stepNum = String(idx + 1).padStart(2, '0')
        return (
          <li
            key={`${step.day}-${idx}`}
            aria-current={isActive ? 'step' : undefined}
            className={cn(
              'relative flex flex-col gap-3 rounded-2xl border p-6',
              isActive
                ? 'border-[var(--color-rust)]/50 bg-[var(--color-rust)]/5'
                : 'border-[var(--color-paper-3)] bg-[var(--color-paper-2)]',
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'text-[28px] font-semibold tracking-[-0.02em]',
                  isActive ? 'text-[var(--color-rust)]' : 'text-[var(--color-ink-3)]',
                )}
              >
                {stepNum}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-ink-3)]">
                {step.day}
              </span>
            </div>
            <h3 className="font-display text-[1.125rem] font-semibold tracking-[-0.015em] text-[var(--color-ink)]">
              {step.label}
            </h3>
            <p className="text-[14px] leading-[1.55] text-[var(--color-ink-2)]">{step.detail}</p>
          </li>
        )
      })}
    </ol>
  )
}

export default ProcessTimeline
