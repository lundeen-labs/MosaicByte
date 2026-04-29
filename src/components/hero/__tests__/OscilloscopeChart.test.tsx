import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import OscilloscopeChart from '../OscilloscopeChart'

const points = [3.1, 3.2, 3.1, 3.0, 3.2, 3.4, 3.7, 4.0, 4.2, 4.3, 4.3, 4.4, 4.3, 4.3]
const ciLow = [3.0, 3.0, 3.0, 2.9, 3.0, 3.1, 3.3, 3.5, 3.7, 3.8, 3.8, 3.9, 3.8, 3.8]
const ciHigh = [3.2, 3.4, 3.3, 3.2, 3.4, 3.7, 4.1, 4.5, 4.7, 4.8, 4.9, 4.9, 4.8, 4.9]

describe('OscilloscopeChart', () => {
  it('exposes role=img with an accessible name from <title>', () => {
    render(
      <OscilloscopeChart
        points={points}
        ciLow={ciLow}
        ciHigh={ciHigh}
        annotation="VARIANT +38%"
      />,
    )
    const img = screen.getByRole('img', { name: /a\/b test signup cvr over time/i })
    expect(img.tagName.toLowerCase()).toBe('svg')
  })

  it('renders <title> and <desc> children for assistive tech', () => {
    const { container } = render(
      <OscilloscopeChart
        points={points}
        ciLow={ciLow}
        ciHigh={ciHigh}
        annotation="VARIANT +38%"
      />,
    )
    const titles = container.querySelectorAll('svg > title')
    const descs = container.querySelectorAll('svg > desc')
    expect(titles.length).toBeGreaterThanOrEqual(1)
    expect(descs.length).toBeGreaterThanOrEqual(1)
    expect(titles[0]?.textContent).toMatch(/A\/B test signup CVR over time/i)
  })

  it('renders the variant trace as a path and the confidence ribbon under it', () => {
    const { container } = render(
      <OscilloscopeChart
        points={points}
        ciLow={ciLow}
        ciHigh={ciHigh}
        annotation="VARIANT +38%"
      />,
    )
    const paths = container.querySelectorAll('svg path')
    // expect at least 2 paths: the band + the line
    expect(paths.length).toBeGreaterThanOrEqual(2)
  })

  it('renders the annotation string somewhere in the SVG', () => {
    const { container } = render(
      <OscilloscopeChart
        points={points}
        ciLow={ciLow}
        ciHigh={ciHigh}
        annotation="VARIANT +38%"
      />,
    )
    const texts = Array.from(container.querySelectorAll('svg text')).map(
      (n) => n.textContent ?? '',
    )
    expect(texts.some((t) => /VARIANT \+38%/.test(t))).toBe(true)
  })

  it('handles a single-point input without throwing (degenerate domain)', () => {
    expect(() =>
      render(
        <OscilloscopeChart
          points={[3.5]}
          ciLow={[3.3]}
          ciHigh={[3.7]}
          annotation="N=1"
        />,
      ),
    ).not.toThrow()
  })
})
