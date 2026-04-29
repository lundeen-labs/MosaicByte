import { cn } from '@/lib/utils'

export interface StatusStripProps {
  available: boolean
  slots: number
  week: string
  rev: string
  metrics: { lcp: string; cls: string; inp: string; jsKb: string }
  clock?: string
  className?: string
}

const blinkKeyframes = `
@keyframes lundeen-status-pulse {
  0%, 60%, 100% { opacity: 1; }
  30% { opacity: 0.25; }
}
`

/**
 * 24px-tall full-width band. Ink background, paper foreground, JetBrains
 * Mono 11px uppercase tracking 0.06em. Bottom border in paper-3 (rendered
 * via the parent layout, the strip itself is dark).
 *
 * Left: STATUS dot (rust = available, ink-3 = booked, blinks 1.5s if available),
 * slot count, week.
 * Right: 4 metric pills (LCP/CLS/INP/JS) + optional clock.
 */
export function StatusStrip({
  available,
  slots,
  week,
  rev,
  metrics,
  clock,
  className,
}: StatusStripProps) {
  const dotColor = available ? 'var(--color-rust)' : 'var(--color-ink-3)'
  const statusLabel = available ? 'AVAILABLE' : 'BOOKED'
  const dotAnimation = available
    ? 'lundeen-status-pulse 1.6s cubic-bezier(0.22,1,0.36,1) infinite'
    : 'none'

  return (
    <div
      role="status"
      aria-label="Studio status"
      className={cn(
        'relative z-10 flex items-center justify-between gap-6 overflow-hidden whitespace-nowrap bg-[var(--color-ink)] px-8 py-[7px] font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-paper)] border-b border-[var(--color-paper-3)]',
        className,
      )}
    >
      <style>{blinkKeyframes}</style>
      <div className="flex items-center gap-5">
        <span className="inline-flex items-center gap-[6px] opacity-90">
          <span
            aria-hidden="true"
            className="inline-block h-[6px] w-[6px] rounded-full align-middle"
            style={{ background: dotColor, animation: dotAnimation }}
          />
          <span>STATUS: {statusLabel}</span>
          <span aria-hidden="true" className="text-[var(--color-paper-line)]">·</span>
          <span>{slots} {slots === 1 ? 'SLOT' : 'SLOTS'}</span>
          <span aria-hidden="true" className="text-[var(--color-paper-line)]">·</span>
          <span>{week}</span>
        </span>
        <span className="opacity-90">REV {rev}</span>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-[#B7E0BB]">{metrics.lcp}</span>
        <span className="text-[#B7E0BB]">{metrics.cls}</span>
        <span className="text-[#B7E0BB]">{metrics.inp}</span>
        <span className="text-[#E8C579]">{metrics.jsKb}</span>
        {clock ? <span className="opacity-85">{clock}</span> : null}
      </div>
    </div>
  )
}
