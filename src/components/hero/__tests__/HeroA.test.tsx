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
    'Built in whatever stack your team uses. You own the source on day one.',
  ],
  gauge: { lcp: '0.81s', cls: '0.01', inp: '92ms', jsKb: '87KB', a11y: '100/100' },
}

describe('HeroA', () => {
  it('renders eyebrow, title fragments, sub, reassure lines', () => {
    render(<HeroA {...baseProps} />)
    expect(screen.getByText(baseProps.eyebrow)).toBeInTheDocument()
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveAccessibleName(/Ship a landing page that actually converts in fourteen days/i)
    expect(screen.getByText(baseProps.sub)).toBeInTheDocument()
    for (const line of baseProps.reassureLines) {
      expect(screen.getByText(line)).toBeInTheDocument()
    }
  })

  it('renders both CTA hrefs', () => {
    render(<HeroA {...baseProps} />)
    const primary = screen.getByRole('link', { name: /get a free landing-page audit/i })
    const secondary = screen.getByRole('link', { name: /book a 15-min call/i })
    expect(primary).toHaveAttribute('href', '/audit')
    expect(secondary).toHaveAttribute('href', '/book')
  })

  it('exposes the section as a labelled landmark', () => {
    render(<HeroA {...baseProps} />)
    const section = screen.getByRole('region', { name: /Ship a landing page/i })
    expect(section).toBeInTheDocument()
  })

  it('does not render legacy retro decoration (instrument gauge or marginalia)', () => {
    const { container } = render(<HeroA {...baseProps} />)
    expect(screen.queryByRole('complementary', { name: /live performance gauge/i })).toBeNull()
    expect(container.textContent ?? '').not.toContain('§ 01')
  })
})
