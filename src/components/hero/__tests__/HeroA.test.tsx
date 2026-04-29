import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeroA from '../HeroA'

const baseProps = {
  eyebrow: 'PRODUCTIZED LANDING PAGE · 14 DAYS · INSTRUMENTED',
  titleParts: {
    plain: 'Ship a landing page that',
    italic: 'actually converts',
    rest: 'in fourteen days.',
  },
  sub: 'I build SaaS landing pages the way you would build a feature.',
  primaryCta: { label: 'Get a free landing-page audit', href: '/audit' },
  secondaryCta: { label: 'or book a 15-min call', href: '/book' },
  reassureLines: [
    'No pitch deck. 5-page audit PDF in your inbox in 48 hours.',
    'Refund in full if the rebuilt page does not beat your control.',
    'Built in your stack — Webflow, Framer, Next.js. You own the code.',
  ],
  gauge: { lcp: '0.81s', cls: '0.01', inp: '92ms', jsKb: '87KB', a11y: '100/100' },
}

describe('HeroA', () => {
  it('renders eyebrow, title fragments, sub, reassure lines', () => {
    render(<HeroA {...baseProps} />)
    expect(screen.getByText(baseProps.eyebrow)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toHaveTextContent(/Ship a landing page that/i)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /actually converts/i,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /in fourteen days/i,
    )
    expect(screen.getByText(baseProps.sub)).toBeInTheDocument()
    for (const line of baseProps.reassureLines) {
      expect(screen.getByText(line)).toBeInTheDocument()
    }
  })

  it('renders both CTA hrefs', () => {
    render(<HeroA {...baseProps} />)
    const primary = screen.getByRole('link', {
      name: /get a free landing-page audit/i,
    })
    const secondary = screen.getByRole('link', { name: /book a 15-min call/i })
    expect(primary).toHaveAttribute('href', '/audit')
    expect(secondary).toHaveAttribute('href', '/book')
  })

  it('mounts the InstrumentGauge with all five gauge readouts', () => {
    render(<HeroA {...baseProps} />)
    const gauge = screen.getByRole('complementary', {
      name: /live performance gauge for this page/i,
    })
    expect(gauge).toBeInTheDocument()
    expect(gauge).toHaveTextContent(/LCP/)
    expect(gauge).toHaveTextContent(/CLS/)
    expect(gauge).toHaveTextContent(/INP/)
    expect(gauge).toHaveTextContent(/JS BUNDLE/)
    expect(gauge).toHaveTextContent(/A11Y SCORE/)
  })

  it('renders the marginalia section marker (decorative, hidden from AT)', () => {
    const { container } = render(<HeroA {...baseProps} />)
    expect(container.textContent).toContain('§ 01')
    expect(container.textContent).toContain('HERO')
  })
})
