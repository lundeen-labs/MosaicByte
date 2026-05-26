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

  it('renders all four primary nav links', () => {
    renderNavbar()
    const nav = screen.getByRole('navigation', { name: /primary/i })
    expect(within(nav).getByRole('link', { name: /^work$/i })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /^services$/i })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /^process$/i })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /^about$/i })).toBeInTheDocument()
  })

  it('renders the wordmark link to home', () => {
    renderNavbar()
    const banner = screen.getByRole('banner')
    const home = within(banner).getByRole('link', { name: /mosaic byte.*home/i })
    expect(home).toBeInTheDocument()
    expect(home.getAttribute('href')).toBe('/')
    expect(within(home).getByText(/mosaic byte/i)).toBeInTheDocument()
  })

  it('renders the availability indicator inside the wordmark link', () => {
    renderNavbar()
    const home = screen.getByRole('link', { name: /mosaic byte.*home/i })
    expect(within(home).getByText(/slots? open|booked/i)).toBeInTheDocument()
  })

  it('renders the Start a project CTA pointing at /contact', () => {
    renderNavbar()
    const banner = screen.getByRole('banner')
    const cta = within(banner).getByRole('link', { name: /start a project/i })
    expect(cta.getAttribute('href')).toBe('/contact')
  })

  it('marks the current section with aria-current=page', () => {
    renderNavbar({ current: 'work' })
    const work = screen.getByRole('link', { name: /^work$/i })
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
    // Tab order: wordmark link → 4 nav links → ThemeToggle button → CTA link.
    // jest-dom's toHaveAccessibleName handles both link textContent and the
    // button's aria-label uniformly. The toggle's aria-label depends on the
    // current theme state (which defaults to 'system' in jsdom) — match any
    // of the three valid action labels.
    const expected = [
      /mosaic byte.*home/i,
      /^services$/i,
      /^process$/i,
      /^work$/i,
      /^about$/i,
      /switch to (light|dark) theme|use system theme/i,
      /start a project/i,
    ]
    for (const matcher of expected) {
      await user.tab()
      expect(document.activeElement).toHaveAccessibleName(matcher)
    }
  })
})
