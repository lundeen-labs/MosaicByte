import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('renders neutral tone by default', () => {
    render(<Badge>label</Badge>)
    const badge = screen.getByText('label')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('data-tone', 'neutral')
  })

  it('renders all tone variants and sets the data-tone attribute', () => {
    const tones = ['neutral', 'rust', 'moss', 'ochre', 'plum'] as const
    tones.forEach((t) => {
      const { unmount } = render(<Badge tone={t}>{t}</Badge>)
      const badge = screen.getByText(t)
      expect(badge).toHaveAttribute('data-tone', t)
      unmount()
    })
  })

  it('renders mono micro typography', () => {
    render(<Badge>tag</Badge>)
    const el = screen.getByText('tag')
    expect(el.className).toMatch(/font-mono/)
    expect(el.className).toMatch(/uppercase/)
  })

  it('uses --r-1 (2px) radius', () => {
    render(<Badge>r</Badge>)
    const el = screen.getByText('r')
    expect(el.className).toMatch(/rounded-\[var\(--radius-r1\)\]/)
  })

  it('passes through arbitrary class names via cn merge', () => {
    render(<Badge className="custom-class">x</Badge>)
    const el = screen.getByText('x')
    expect(el.className).toMatch(/custom-class/)
  })
})
