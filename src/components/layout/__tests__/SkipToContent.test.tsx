import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkipToContent } from '../SkipToContent'

describe('SkipToContent', () => {
  it('renders an anchor pointing at #main', () => {
    render(<SkipToContent />)
    const link = screen.getByRole('link', { name: /skip to content/i })
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('href')).toBe('#main')
  })

  it('is the only focusable target with the skip text', () => {
    render(<SkipToContent />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
  })
})
