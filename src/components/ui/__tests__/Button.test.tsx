import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders default primary variant on the rust accent', () => {
    render(<Button>Press me</Button>)
    const btn = screen.getByRole('button', { name: 'Press me' })
    expect(btn).toBeInTheDocument()
    expect(btn.className).toMatch(/var\(--color-rust\)/)
    expect(btn.className).toMatch(/rounded-full/)
  })

  it('renders ghost variant with transparent background and a hairline border', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByRole('button', { name: 'Ghost' })
    expect(btn.className).toMatch(/bg-transparent/)
    expect(btn.className).toMatch(/border-\[var\(--color-paper-3\)\]/)
  })

  it('renders icon variant as a square 36x36', () => {
    render(<Button variant="icon" aria-label="Close">x</Button>)
    const btn = screen.getByRole('button', { name: 'Close' })
    expect(btn.className).toMatch(/h-9/)
    expect(btn.className).toMatch(/w-9/)
  })

  it('applies size classes', () => {
    const { rerender } = render(<Button size="sm">small</Button>)
    expect(screen.getByRole('button').className).toMatch(/text-\[13px\]/)
    rerender(<Button size="lg">large</Button>)
    expect(screen.getByRole('button').className).toMatch(/text-\[15px\]/)
  })

  it('passes onClick through', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('defaults type="button" to avoid implicit submit inside forms', () => {
    render(<Button>safe</Button>)
    const btn = screen.getByRole('button') as HTMLButtonElement
    expect(btn.type).toBe('button')
  })

  it('respects explicit type="submit"', () => {
    render(<Button type="submit">go</Button>)
    const btn = screen.getByRole('button') as HTMLButtonElement
    expect(btn.type).toBe('submit')
  })

  it('forwards ref to button element', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={ref}>r</Button>)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('BUTTON')
  })

  it('renders as an <a> when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/audit">Audit</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Audit' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/audit')
  })

  it('focus-visible outline applied via class', () => {
    render(<Button>fv</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toMatch(/focus-visible:outline-2/)
  })

  it('accepts arbitrary aria-* and data-* attributes', () => {
    render(
      <Button aria-label="proceed" data-testid="b1">
        next
      </Button>,
    )
    const btn = screen.getByTestId('b1')
    expect(btn).toHaveAttribute('aria-label', 'proceed')
  })
})
