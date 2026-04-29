import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface InstrumentGaugeProps {
  lcp: string
  cls: string
  inp: string
  jsKb: string
  a11y: string
  className?: string
}

interface Row {
  label: string
  target: string
  value: string
  unit: string
  /** 0..1 fill ratio for the bar */
  fill: number
  tone: 'up' | 'warn' | 'bad'
  divideAfter?: boolean
}

/**
 * Right-rail "engineer's gauge" panel from HeroA. Five rows of monospace
 * metric readouts with letterpress hairline borders and a hard 1.5px ink
 * shadow — no soft/diffuse glow.
 *
 * The fill ratio is computed against the WCV/Lighthouse budget for each
 * metric so the bar is honest:
 *   LCP   target ≤ 2.5s    ratio = lcpSeconds / 2.5
 *   CLS   target ≤ 0.10    ratio = cls       / 0.10
 *   INP   target ≤ 200ms   ratio = inpMs     / 200
 *   JS    budget 200KB     ratio = kb        / 200   (warn tone)
 *   A11Y  out of 100       ratio = score     / 100
 */
function parseLeadingNumber(s: string): number {
  const m = s.match(/-?\d+(?:\.\d+)?/)
  return m ? parseFloat(m[0]) : 0
}

export default function InstrumentGauge({
  lcp,
  cls,
  inp,
  jsKb,
  a11y,
  className,
}: InstrumentGaugeProps) {
  const reduce = useReducedMotion()

  const rows: Row[] = [
    {
      label: 'LCP',
      target: 'target ≤ 2.5s',
      value: parseLeadingNumber(lcp).toFixed(2).replace(/\.?0+$/, ''),
      unit: 's',
      fill: Math.min(1, parseLeadingNumber(lcp) / 2.5),
      tone: 'up',
    },
    {
      label: 'CLS',
      target: 'target ≤ 0.10',
      value: cls,
      unit: '',
      fill: Math.min(1, parseLeadingNumber(cls) / 0.1),
      tone: 'up',
    },
    {
      label: 'INP',
      target: 'target ≤ 200ms',
      value: parseLeadingNumber(inp).toString(),
      unit: 'ms',
      fill: Math.min(1, parseLeadingNumber(inp) / 200),
      tone: 'up',
      divideAfter: true,
    },
    {
      label: 'JS BUNDLE',
      target: 'budget 200KB',
      value: parseLeadingNumber(jsKb).toString(),
      unit: 'KB',
      fill: Math.min(1, parseLeadingNumber(jsKb) / 200),
      tone: 'warn',
    },
    {
      label: 'A11Y SCORE',
      target: 'Lighthouse',
      value: parseLeadingNumber(a11y).toString(),
      unit: '/100',
      fill: Math.min(1, parseLeadingNumber(a11y) / 100),
      tone: 'up',
    },
  ]

  return (
    <motion.aside
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.24 }}
      className={cn(
        'self-start bg-paper overflow-hidden relative',
        className,
      )}
      style={{
        border: '1px solid var(--color-ink)',
        borderRadius: 'var(--radius-r3)',
        boxShadow:
          '0 8px 24px -12px rgba(23, 20, 19, 0.25), 0 0 0 1px var(--color-paper-3)',
      }}
      aria-label="Live performance gauge for this page"
    >
      <div
        className="flex items-center justify-between font-mono uppercase tracking-[0.08em] text-[0.6875rem]"
        style={{
          background: 'var(--color-ink)',
          color: 'var(--color-paper)',
          padding: '8px 14px',
        }}
      >
        <span>PAGE METRICS · LIVE</span>
        <span className="inline-flex gap-1" aria-hidden="true">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--color-paper-3)', opacity: 0.4 }}
          />
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--color-ochre)', opacity: 0.7 }}
          />
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--color-moss)', opacity: 0.9 }}
          />
        </span>
      </div>

      <div style={{ padding: '18px 16px 14px' }}>
        <div className="flex flex-col gap-3.5">
          {rows.map((row, idx) => (
            <div key={row.label} className="flex flex-col gap-1">
              <div className="flex justify-between items-baseline font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-3">
                <span>{row.label}</span>
                <span>{row.target}</span>
              </div>
              <div
                className={cn(
                  'font-display font-medium leading-none tracking-[-0.02em]',
                  row.tone === 'up' && 'text-moss',
                  row.tone === 'warn' && 'text-ochre',
                  row.tone === 'bad' && 'text-rust',
                )}
                style={{
                  fontVariationSettings: '"opsz" 48',
                  fontSize: '2rem',
                }}
              >
                {row.value}
                {row.unit ? (
                  <span className="font-mono font-medium text-ink-3 text-[0.75rem] ml-1 tracking-[0.04em]">
                    {row.unit}
                  </span>
                ) : null}
              </div>
              <div
                className="relative h-1 overflow-hidden"
                style={{
                  background: 'var(--color-paper-2)',
                  borderRadius: '2px',
                }}
                role="presentation"
              >
                <motion.div
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: row.fill }}
                  transition={{
                    duration: reduce ? 0 : 1.4,
                    ease: [0.22, 1, 0.36, 1],
                    delay: reduce ? 0 : 0.3 + idx * 0.08,
                  }}
                  className="absolute inset-0"
                  style={{
                    background:
                      row.tone === 'up'
                        ? 'var(--color-moss)'
                        : row.tone === 'warn'
                          ? 'var(--color-ochre)'
                          : 'var(--color-rust)',
                    borderRadius: '2px',
                    transformOrigin: 'left',
                  }}
                />
              </div>
              {row.divideAfter ? (
                <div
                  className="my-1 h-px"
                  style={{ background: 'var(--color-paper-3)' }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  )
}
