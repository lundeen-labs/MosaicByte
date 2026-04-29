import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricsBlock } from '../MetricsBlock'

describe('MetricsBlock', () => {
  it('renders all metric labels and values', () => {
    render(
      <MetricsBlock
        metrics={[
          { label: 'Trial signups', value: '+34%', tone: 'moss', ci: '95% CI [23%, 45%]' },
          { label: 'LCP', value: '0.8s', tone: 'rust' },
          { label: 'JS bundle', value: '87KB' },
          { label: 'Time on page', value: '+72%', tone: 'moss' },
        ]}
      />,
    )
    expect(screen.getByText('Trial signups')).toBeInTheDocument()
    expect(screen.getByText('+34%')).toBeInTheDocument()
    expect(screen.getByText('95% CI [23%, 45%]')).toBeInTheDocument()
    expect(screen.getByText('LCP')).toBeInTheDocument()
    expect(screen.getByText('0.8s')).toBeInTheDocument()
    expect(screen.getByText('87KB')).toBeInTheDocument()
  })

  it('applies moss tone class to value', () => {
    render(<MetricsBlock metrics={[{ label: 'Lift', value: '+38%', tone: 'moss' }]} />)
    const v = screen.getByText('+38%')
    expect(v.className).toMatch(/var\(--color-moss\)/)
  })

  it('applies rust tone class to value', () => {
    render(<MetricsBlock metrics={[{ label: 'Drop', value: '-2.4s', tone: 'rust' }]} />)
    const v = screen.getByText('-2.4s')
    expect(v.className).toMatch(/var\(--color-rust\)/)
  })

  it('omits CI annotation when not provided', () => {
    render(<MetricsBlock metrics={[{ label: 'Bare', value: '12' }]} />)
    expect(screen.queryByText(/CI/)).toBeNull()
  })

  it('renders an empty fragment when metrics list is empty', () => {
    const { container } = render(<MetricsBlock metrics={[]} />)
    expect(container.querySelector('dl')).toBeNull()
  })

  it('uses semantic dl/dt/dd', () => {
    const { container } = render(
      <MetricsBlock metrics={[{ label: 'L', value: 'V' }]} />,
    )
    expect(container.querySelector('dl')).not.toBeNull()
    expect(container.querySelector('dt')).not.toBeNull()
    expect(container.querySelector('dd')).not.toBeNull()
  })

  it('value uses Fraunces display class with -0.025em tracking', () => {
    render(<MetricsBlock metrics={[{ label: 'L', value: '99' }]} />)
    const v = screen.getByText('99')
    expect(v.className).toMatch(/font-display/)
    expect(v.className).toMatch(/tracking-\[-0.025em\]/)
  })
})
