import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Router } from 'wouter'
import { memoryLocation } from 'wouter/memory-location'
import { Navbar } from '../Navbar'

function renderNavbar(props: Parameters<typeof Navbar>[0] = {}) {
  const { hook } = memoryLocation({ path: '/' })
  return render(
    <Router hook={hook}>
      <Navbar {...props} />
    </Router>,
  )
}

describe('Navbar', () => {
  it('renders a banner header with primary navigation', () => {
    renderNavbar()
    const banner = screen.getByRole('banner')
    expect(banner).toBeInTheDocument()
    const nav = within(banner).getByRole('navigation', { name: /primary/i })
    expect(nav).toBeInTheDocument()
  })

  it('renders all four numbered nav links', () => {
    renderNavbar()
    const nav = screen.getByRole('navigation', { name: /primary/i })
    expect(within(nav).getByRole('link', { name: /01\s*work/i })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /02\s*services/i })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /03\s*process/i })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /04\s*about/i })).toBeInTheDocument()
  })

  it('renders the wordmark link to home with EST. 2025 micro', () => {
    renderNavbar()
    const banner = screen.getByRole('banner')
    const home = within(banner).getByRole('link', { name: /lundeen.*home/i })
    expect(home).toBeInTheDocument()
    expect(home.getAttribute('href')).toBe('/')
    expect(within(home).getByText(/est\. 2025/i)).toBeInTheDocument()
  })

  it('renders the Free audit CTA pointing at /contact', () => {
    renderNavbar()
    const banner = screen.getByRole('banner')
    const cta = within(banner).getByRole('link', { name: /free audit/i })
    expect(cta.getAttribute('href')).toBe('/contact')
  })

  it('marks the current section with aria-current=page', () => {
    renderNavbar({ current: 'work' })
    const work = screen.getByRole('link', { name: /01\s*work/i })
    expect(work).toHaveAttribute('aria-current', 'page')
  })

  it('exposes a hamburger button labeled "Open menu" for mobile', () => {
    renderNavbar()
    const button = screen.getByRole('button', { name: /open menu/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('all primary nav items are reachable in keyboard tab order', async () => {
    const user = userEvent.setup()
    renderNavbar()
    const expected = [
      /lundeen.*home/i, // wordmark
      /01\s*work/i,
      /02\s*services/i,
      /03\s*process/i,
      /04\s*about/i,
      /free audit/i,
    ]
    for (const matcher of expected) {
      await user.tab()
      const focused = document.activeElement
      expect(focused).not.toBeNull()
      // The focused element should match the next expected accessible name
      const link = screen.getByRole('link', { name: matcher })
      expect(focused === link).toBe(true)
    }
  })
})
