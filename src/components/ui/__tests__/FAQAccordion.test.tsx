import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FAQAccordion } from '../FAQAccordion'

const items = [
  { id: 'q1', q: 'What do you ship?', a: 'A page, an analytics rig, and a CI budget.' },
  { id: 'q2', q: 'How long does it take?', a: 'Two weeks, fixed-fee.' },
  { id: 'q3', q: 'Do you do retainers?', a: 'Yes, monthly experiment retainer.' },
]

describe('FAQAccordion', () => {
  it('renders all questions as triggers', () => {
    render(<FAQAccordion items={items} />)
    items.forEach((it) => {
      expect(screen.getByRole('button', { name: it.q })).toBeInTheDocument()
    })
  })

  it('toggles open state on click and exposes aria-expanded', () => {
    render(<FAQAccordion items={items} />)
    const trigger = screen.getByRole('button', { name: items[0].q })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('allows multiple items to be open simultaneously (type="multiple")', () => {
    render(<FAQAccordion items={items} />)
    const t1 = screen.getByRole('button', { name: items[0].q })
    const t2 = screen.getByRole('button', { name: items[1].q })
    fireEvent.click(t1)
    fireEvent.click(t2)
    expect(t1).toHaveAttribute('aria-expanded', 'true')
    expect(t2).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders semantic h3 around each trigger', () => {
    render(<FAQAccordion items={items} />)
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings.length).toBe(items.length)
  })

  it('renders empty list cleanly when items=[]', () => {
    const { container } = render(<FAQAccordion items={[]} />)
    expect(container.querySelectorAll('[role="button"]').length).toBe(0)
  })
})
