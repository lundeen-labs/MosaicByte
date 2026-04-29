import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeroB from '../HeroB'

const baseProps = {
  sectionMark: { number: '00', label: 'Folio' },
  titleLines: [
    { line: 'The instrumented', italic: true },
    { line: 'landing-page studio', underline: true },
    { line: 'for B2B SaaS.', indent: true },
  ],
  sub: 'Most landing-page studios ship the picture and email you a Loom.',
  definition: {
    term: 'in·stru·ment·ed',
    pron: 'adj.',
    defs: [
      'equipped with measurement apparatus capable of recording, displaying, and transmitting the magnitude of a quantity.',
    ],
  },
  primaryCta: { label: 'Get a free landing-page audit', href: '/audit' },
  secondaryCta: { label: 'or book a 15-min call', href: '/book' },
  microReassure: '48-hour SLA · No pitch · 5-page PDF',
  chart: {
    points: [3.1, 3.2, 3.1, 3.0, 3.2, 3.4, 3.7, 4.0, 4.2, 4.3, 4.3, 4.4, 4.3, 4.3],
    ciLow: [3.0, 3.0, 3.0, 2.9, 3.0, 3.1, 3.3, 3.5, 3.7, 3.8, 3.8, 3.9, 3.8, 3.8],
    ciHigh: [3.2, 3.4, 3.3, 3.2, 3.4, 3.7, 4.1, 4.5, 4.7, 4.8, 4.9, 4.9, 4.8, 4.9],
    annotation: 'EXPERIMENT 037 · STAXX · +38.2% LIFT',
  },
}

describe('HeroB', () => {
  it('renders the section mark with editorial No. lead-in', () => {
    const { container } = render(<HeroB {...baseProps} />)
    expect(container.textContent).toContain('00')
    expect(container.textContent).toContain('Folio')
    expect(container.textContent).toContain('No.')
  })

  it('renders all three headline lines including italic and underline accents', () => {
    render(<HeroB {...baseProps} />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(/The instrumented/i)
    expect(heading).toHaveTextContent(/landing-page studio/i)
    expect(heading).toHaveTextContent(/for B2B SaaS/i)
  })

  it('renders the definition block term, pronunciation, and definitions', () => {
    render(<HeroB {...baseProps} />)
    expect(screen.getByText('in·stru·ment·ed')).toBeInTheDocument()
    expect(screen.getByText('adj.')).toBeInTheDocument()
    expect(screen.getByText(baseProps.definition.defs[0])).toBeInTheDocument()
  })

  it('renders both CTA hrefs and the micro-reassure strip', () => {
    render(<HeroB {...baseProps} />)
    const primary = screen.getByRole('link', {
      name: /get a free landing-page audit/i,
    })
    const secondary = screen.getByRole('link', { name: /book a 15-min call/i })
    expect(primary).toHaveAttribute('href', '/audit')
    expect(secondary).toHaveAttribute('href', '/book')
    expect(screen.getByText(baseProps.microReassure)).toBeInTheDocument()
  })

  it('mounts the OscilloscopeChart with an accessible figure', () => {
    render(<HeroB {...baseProps} />)
    const fig = screen.getByRole('figure', {
      name: /conversion-rate lift chart for a recent client engagement/i,
    })
    expect(fig).toBeInTheDocument()
    // chart svg must carry role=img + a <title>
    const img = screen.getByRole('img', {
      name: /a\/b test signup cvr over time/i,
    })
    expect(img).toBeInTheDocument()
  })

  it('renders the sub paragraph', () => {
    render(<HeroB {...baseProps} />)
    expect(screen.getByText(baseProps.sub)).toBeInTheDocument()
  })
})
