import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OscilloscopeChartProps {
  /** Variant CVR samples (e.g. 14 daily readings, units = percent). */
  points: number[]
  /** Lower confidence bound, paired index-for-index with `points`. */
  ciLow: number[]
  /** Upper confidence bound, paired index-for-index with `points`. */
  ciHigh: number[]
  /** A short text annotation rendered top-right of the trace ("Variant +38.2%"). */
  annotation: string
  /** SVG height in CSS pixels. Width is fluid. */
  height?: number
  className?: string
}

const VIEW_W = 700
const PAD_L = 40
const PAD_R = 20
const PAD_T = 20
const PAD_B = 40

/**
 * SVG line+confidence-band chart styled as a lab oscilloscope readout.
 * Pure presentational — all data comes through props. Uses design-token
 * colors via CSS vars on stroke/fill so dark-mode swaps work for free.
 *
 * Accessibility: rendered with role=img + aria-label, with explicit
 * <title> and <desc> children for AT consumers.
 */
export default function OscilloscopeChart({
  points,
  ciLow,
  ciHigh,
  annotation,
  height = 280,
  className,
}: OscilloscopeChartProps) {
  const reduce = useReducedMotion()
  const titleId = useId()
  const descId = useId()

  // Build a domain that covers both the bounds and the points themselves with
  // a small margin so the trace never clips the frame.
  const allValues = [...points, ...ciLow, ...ciHigh]
  const rawMin = allValues.length ? Math.min(...allValues) : 0
  const rawMax = allValues.length ? Math.max(...allValues) : 1
  const span = Math.max(0.0001, rawMax - rawMin)
  const yMin = rawMin - span * 0.15
  const yMax = rawMax + span * 0.15

  const VIEW_H = height
  const innerW = VIEW_W - PAD_L - PAD_R
  const innerH = VIEW_H - PAD_T - PAD_B

  const xFor = (i: number) => {
    if (points.length <= 1) return PAD_L + innerW / 2
    return PAD_L + (i / (points.length - 1)) * innerW
  }
  const yFor = (v: number) => {
    const t = (v - yMin) / Math.max(0.0001, yMax - yMin)
    return PAD_T + (1 - t) * innerH
  }

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(2)},${yFor(p).toFixed(2)}`)
    .join(' ')

  // Confidence band: walk forward along ciHigh, then backward along ciLow,
  // close the path. Produces a filled ribbon.
  const bandTop = ciHigh
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(2)},${yFor(v).toFixed(2)}`)
    .join(' ')
  const bandBottom = ciLow
    .slice()
    .reverse()
    .map((v, ri) => {
      const i = ciLow.length - 1 - ri
      return `L${xFor(i).toFixed(2)},${yFor(v).toFixed(2)}`
    })
    .join(' ')
  const bandPath = `${bandTop} ${bandBottom} Z`

  // Y-axis ticks at min, midpoints, max — 4 lines total.
  const yTicks = [yMin, yMin + span * 0.5, yMin + span, rawMax].filter(
    (v, i, arr) => arr.indexOf(v) === i,
  )

  // X-axis ticks at first/middle/last index, deduped (degenerate when n<3).
  const xTicks = Array.from(
    new Set(
      [0, Math.floor((points.length - 1) / 2), points.length - 1].filter(
        (v) => Number.isFinite(v) && v >= 0,
      ),
    ),
  )

  const formatPct = (v: number) =>
    `${v >= 10 ? v.toFixed(1) : v.toFixed(2)}%`

  return (
    <div
      className={cn('relative w-full', className)}
      style={{ paddingTop: 12 }}
    >
      <svg
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        className="block w-full"
        style={{ height }}
      >
        <title id={titleId}>A/B test signup CVR over time</title>
        <desc id={descId}>
          Variant trace versus control with shaded confidence band; final
          variant reading {points.length > 0 ? formatPct(points[points.length - 1]) : 'unavailable'}.
          {' '}
          {annotation}
        </desc>

        {/* horizontal grid */}
        {yTicks.map((tickValue, i) => {
          const y = yFor(tickValue)
          const isAxis = i === yTicks.length - 1
          return (
            <line
              key={`grid-${i}`}
              x1={PAD_L}
              x2={VIEW_W - PAD_R}
              y1={y}
              y2={y}
              stroke="var(--color-paper-3)"
              strokeWidth={1}
              strokeDasharray={isAxis ? undefined : '2 4'}
            />
          )
        })}

        {/* y axis labels */}
        {yTicks.map((tickValue, i) => (
          <text
            key={`ylabel-${i}`}
            x={PAD_L - 6}
            y={yFor(tickValue) + 4}
            textAnchor="end"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fill: 'var(--color-ink-3)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {formatPct(tickValue)}
          </text>
        ))}

        {/* x axis labels */}
        {xTicks.map((idx) => {
          const x = xFor(idx)
          const label =
            idx === 0
              ? 'D0'
              : idx === points.length - 1
                ? `D${points.length - 1}`
                : `D${idx}`
          return (
            <text
              key={`xlabel-${idx}`}
              x={x}
              y={VIEW_H - PAD_B / 2 + 4}
              textAnchor={idx === points.length - 1 ? 'end' : idx === 0 ? 'start' : 'middle'}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                fill: 'var(--color-ink-3)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </text>
          )
        })}

        {/* confidence band */}
        <motion.path
          d={bandPath}
          fill="var(--color-rust)"
          fillOpacity={0.1}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.72, delay: reduce ? 0 : 0.4 }}
          aria-hidden="true"
        />

        {/* variant trace */}
        <motion.path
          d={linePath}
          stroke="var(--color-rust)"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: reduce ? 0 : 1.0,
            ease: [0.22, 1, 0.36, 1],
            delay: reduce ? 0 : 0.3,
          }}
          aria-hidden="true"
        />

        {/* end marker */}
        {points.length > 0 ? (
          <motion.circle
            cx={xFor(points.length - 1)}
            cy={yFor(points[points.length - 1])}
            r={4}
            fill="var(--color-rust)"
            initial={reduce ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduce ? 0 : 0.36, delay: reduce ? 0 : 1.2 }}
          />
        ) : null}

        {/* top-right annotation text */}
        <text
          x={VIEW_W - PAD_R}
          y={PAD_T + 4}
          textAnchor="end"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fill: 'var(--color-rust)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {annotation}
        </text>
      </svg>
    </div>
  )
}
