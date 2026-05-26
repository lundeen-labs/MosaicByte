import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Router } from 'wouter'
import { memoryLocation } from 'wouter/memory-location'
import { MobileDrawer } from '../MobileDrawer'

const NAV = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/#services' },
  { label: 'Process', href: '/#process' },
  { label: 'About', href: '/about' },
]

function renderDrawer(open: boolean, onOpenChange: (open: boolean) => void) {
  const { hook } = memoryLocation({ path: '/' })
  return render(
    <Router hook={hook}>
      <MobileDrawer open={open} onOpenChange={onOpenChange} nav={NAV} />
    </Router>,
  )
}

describe('MobileDrawer', () => {
  it('does not render content when closed', () => {
    const onOpenChange = vi.fn()
    renderDrawer(false, onOpenChange)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a dialog with all nav items when open', () => {
    const onOpenChange = vi.fn()
    renderDrawer(true, onOpenChange)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    for (const item of NAV) {
      expect(screen.getByRole('link', { name: new RegExp(item.label, 'i') })).toBeInTheDocument()
    }
  })

  it('renders the Start a project CTA inside the drawer', () => {
    const onOpenChange = vi.fn()
    renderDrawer(true, onOpenChange)
    expect(screen.getByRole('link', { name: /start a project/i })).toBeInTheDocument()
  })

  it('calls onOpenChange(false) when ESC is pressed', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderDrawer(true, onOpenChange)
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onOpenChange(false) when the close button is clicked', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderDrawer(true, onOpenChange)
    const closeBtn = screen.getByRole('button', { name: /close menu/i })
    await user.click(closeBtn)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes when a nav link is clicked (single-page nav)', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderDrawer(true, onOpenChange)
    const work = screen.getByRole('link', { name: /work/i })
    await user.click(work)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
