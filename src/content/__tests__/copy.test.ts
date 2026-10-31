import { describe, expect, it } from 'vitest'
import { COPY } from '../copy'

/** Every string the site shows, flattened, so one assertion covers all of it. */
function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach((v) => allStrings(v, out))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => allStrings(v, out))
  return out
}

const everything = allStrings(COPY)

describe('copy: pricing, timeline and FAQ agree with the tiers', () => {
  const [starter, growth, signature] = COPY.services.tiers

  it('quotes only prices that exist on a tier, or the stated $15K ceiling and $50/mo client size', () => {
    const money = /\$\d{1,3}(?:,\d{3})*K?(?:\/mo)?/g
    const allowed = new Set(
      [...COPY.services.tiers.map((t) => t.price), COPY.services.retainer.price, '$15K', '$50/mo'].flatMap(
        (p) => p.match(money) ?? [],
      ),
    )
    for (const price of everything.join(' ').match(money) ?? []) {
      expect(allowed.has(price), `unexpected price ${price}`).toBe(true)
    }
  })

  it('has no stale $4,500 price', () => {
    expect(everything.join(' ')).not.toContain('4,500')
  })

  it('states each tier duration in the FAQ answer about timeline and the tier cadence', () => {
    const durations = [starter, growth, signature].map((t) => t.cadence.match(/(\d+) days/)![1])
    expect(durations).toEqual(['10', '14', '20'])
    const duration = COPY.faq.items.find((i) => i.id === 'duration')!
    for (const d of durations) expect(duration.a).toContain(`${d} days`)
  })

  it('describes the package contents using each tier price', () => {
    const scope = COPY.faq.items.find((i) => i.id === 'scope')!
    for (const tier of COPY.services.tiers) expect(scope.a).toContain(tier.price)
  })

  it('does not call every engagement a two-week project', () => {
    expect(everything.join(' ')).not.toMatch(/two[- ]weeks?\b/i)
  })
})

describe('copy: typos', () => {
  it('spells brochure correctly and uses a singular revision round for Starter', () => {
    const scope = COPY.services.tiers.flatMap((t) => t.scope)
    expect(scope.join(' ')).not.toContain('brouchure')
    expect(scope).not.toContain('One revision rounds')
  })

  it('starts every tier scope line with a capital letter', () => {
    for (const tier of COPY.services.tiers) {
      for (const line of tier.scope) expect(line[0], line).toBe(line[0].toUpperCase())
    }
  })
})

describe('copy: availability', () => {
  it('derives the closing heading from status.slots', () => {
    const { available, slots } = COPY.status
    expect(available).toBe(true)
    const words = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
    expect(COPY.cta.heading).toBe(`${words[slots]} ${slots === 1 ? 'slot' : 'slots'} open this month.`)
  })
})

describe('copy: privacy policy', () => {
  it('carries a last-updated date no older than the current policy rewrite', () => {
    const match = COPY.legal.privacy.updated.match(/Last updated: ([A-Za-z]+ \d{1,2}, \d{4})/)
    expect(match).not.toBeNull()
    expect(new Date(match![1]).getTime()).toBeGreaterThanOrEqual(new Date('October 30, 2026').getTime())
  })
})
