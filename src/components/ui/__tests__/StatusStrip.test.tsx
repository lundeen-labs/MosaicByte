import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusStrip } from '../StatusStrip'

const metrics = { lcp: 'LCP 0.81s', cls: 'CLS 0.01', inp: 'INP 92ms', jsKb: 'JS 87KB' }

describe('StatusStrip', () => {
  it('renders STATUS: AVAILABLE when available=true', () => {
    render(
      <StatusStrip
        available
        slots={2}
        week="WEEK OF MAY 5"
        rev="a3f9c1"
        metrics={metrics}
      />,
    )
    expect(screen.getByText(/STATUS: AVAILABLE/)).toBeInTheDocument()
  })

  it('renders STATUS: BOOKED when available=false', () => {
    render(
      <StatusStrip
        available={false}
        slots={0}
        week="WEEK OF MAY 5"
        rev="a3f9c1"
        metrics={metrics}
      />,
    )
    expect(screen.getByText(/STATUS: BOOKED/)).toBeInTheDocument()
  })

  it('renders slot count and pluralizes correctly', () => {
    const { rerender } = render(
      <StatusStrip available slots={1} week="W" rev="r" metrics={metrics} />,
    )
    expect(screen.getByText(/1 SLOT/)).toBeInTheDocument()
    rerender(<StatusStrip available slots={3} week="W" rev="r" metrics={metrics} />)
    expect(screen.getByText(/3 SLOTS/)).toBeInTheDocument()
  })

  it('renders week, rev, and all 4 metric pills', () => {
    render(
      <StatusStrip available slots={2} week="WEEK OF MAY 5" rev="a3f9c1" metrics={metrics} />,
    )
    expect(screen.getByText(/WEEK OF MAY 5/)).toBeInTheDocument()
    expect(screen.getByText(/REV a3f9c1/)).toBeInTheDocument()
    expect(screen.getByText('LCP 0.81s')).toBeInTheDocument()
    expect(screen.getByText('CLS 0.01')).toBeInTheDocument()
    expect(screen.getByText('INP 92ms')).toBeInTheDocument()
    expect(screen.getByText('JS 87KB')).toBeInTheDocument()
  })

  it('renders the optional clock when provided', () => {
    render(
      <StatusStrip
        available
        slots={2}
        week="WEEK OF MAY 5"
        rev="a3f9c1"
        metrics={metrics}
        clock="03:42 EDT"
      />,
    )
    expect(screen.getByText('03:42 EDT')).toBeInTheDocument()
  })

  it('uses role="status" with a descriptive aria-label summarizing studio + metrics', () => {
    render(
      <StatusStrip available slots={2} week="W" rev="r" metrics={metrics} />,
    )
    const strip = screen.getByRole('status')
    const label = strip.getAttribute('aria-label') ?? ''
    expect(label).toMatch(/^Studio status/i)
    expect(label).toMatch(/available/i)
    expect(label).toMatch(/2 slots/i)
    expect(label).toMatch(/LCP 0\.81s/i)
    expect(label).toMatch(/JS 87KB/i)
  })
})
