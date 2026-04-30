import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PricingTier } from '../PricingTier'

describe('PricingTier', () => {
  const baseProps = {
    eyebrow: '02 · BUILD',
    name: 'The Instrumented Landing Page',
    price: '$4,500',
    cadence: 'fixed-fee · 14 days',
    scope: [
      'Discovery + 5 user interviews',
      'Copy + responsive build',
      'Analytics rig + A/B scaffold',
    ],
    cta: { label: 'Get a free audit', href: '/audit' },
  }

  it('renders eyebrow / name / price / cadence', () => {
    render(<PricingTier {...baseProps} />)
    expect(screen.getByText('02 · BUILD')).toBeInTheDocument()
    expect(screen.getByText(baseProps.name)).toBeInTheDocument()
    expect(screen.getByText('$4,500')).toBeInTheDocument()
    expect(screen.getByText('fixed-fee · 14 days')).toBeInTheDocument()
  })

  it('renders all scope items as a list', () => {
    render(<PricingTier {...baseProps} />)
    baseProps.scope.forEach((s) => {
      expect(screen.getByText(s)).toBeInTheDocument()
    })
    expect(screen.getAllByRole('listitem').length).toBe(baseProps.scope.length)
  })

  it('CTA renders as an anchor with the right href', () => {
    render(<PricingTier {...baseProps} />)
    const link = screen.getByRole('link', { name: 'Get a free audit' })
    expect(link).toHaveAttribute('href', '/audit')
  })

  it('featured tier sets data-featured="true" and adds an accent border', () => {
    render(<PricingTier {...baseProps} featured />)
    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('data-featured', 'true')
    // Modern card: rust-tinted border + ring accent
    expect(article.className).toMatch(/border-\[var\(--color-rust\)\]\/40/)
  })

  it('featured tier renders the "Most picked" ribbon', () => {
    render(<PricingTier {...baseProps} featured />)
    expect(screen.getByText(/most picked/i)).toBeInTheDocument()
  })

  it('non-featured does not get the rust border', () => {
    render(<PricingTier {...baseProps} />)
    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('data-featured', 'false')
  })

  it('omits cadence when not provided', () => {
    render(<PricingTier {...baseProps} cadence={undefined} />)
    expect(screen.queryByText('fixed-fee · 14 days')).toBeNull()
  })
})
