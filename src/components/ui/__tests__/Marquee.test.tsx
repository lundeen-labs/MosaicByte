import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Marquee } from '../Marquee'

describe('Marquee', () => {
  it('renders children twice for seamless loop', () => {
    render(
      <Marquee>
        <span data-testid="logo">LOGO</span>
      </Marquee>,
    )
    // Children + a duplicated, aria-hidden copy.
    const logos = screen.getAllByTestId('logo')
    expect(logos.length).toBe(2)
  })

  it('renders with role="marquee" and aria-label', () => {
    render(
      <Marquee>
        <span>x</span>
      </Marquee>,
    )
    const root = screen.getByRole('marquee')
    expect(root).toHaveAttribute('aria-label', 'scrolling content')
  })

  it('default speed produces a 30s animation', () => {
    const { container } = render(
      <Marquee>
        <span>x</span>
      </Marquee>,
    )
    const inner = container.querySelector('div[style*="animation"]') as HTMLDivElement
    expect(inner).not.toBeNull()
    expect(inner.style.animation).toContain('30s')
  })

  it('custom speed propagates to animation duration', () => {
    const { container } = render(
      <Marquee speed={12}>
        <span>x</span>
      </Marquee>,
    )
    const inner = container.querySelector('div[style*="animation"]') as HTMLDivElement
    expect(inner.style.animation).toContain('12s')
  })

  it('pauseOnHover=true adds the group-hover paused class', () => {
    const { container } = render(
      <Marquee pauseOnHover>
        <span>x</span>
      </Marquee>,
    )
    const inner = container.querySelector('div[style*="animation"]') as HTMLDivElement
    expect(inner.className).toMatch(/group-hover:\[animation-play-state:paused\]/)
  })

  it('pauseOnHover=false omits the paused class', () => {
    const { container } = render(
      <Marquee pauseOnHover={false}>
        <span>x</span>
      </Marquee>,
    )
    const inner = container.querySelector('div[style*="animation"]') as HTMLDivElement
    expect(inner.className).not.toMatch(/animation-play-state:paused/)
  })

  it('respects prefers-reduced-motion via global CSS rule (animation duration override)', () => {
    // The global @media (prefers-reduced-motion: reduce) in src/index.css
    // overrides animation-duration to 0.01ms. We verify the marquee's animation
    // is declared via animation shorthand (so it's affected by that rule).
    const { container } = render(
      <Marquee>
        <span>x</span>
      </Marquee>,
    )
    const inner = container.querySelector('div[style*="animation"]') as HTMLDivElement
    expect(inner.style.animation).toMatch(/lundeen-marquee/)
  })
})
