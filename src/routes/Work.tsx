import { Link } from 'wouter'
import { Layout } from '@/components/layout/Layout'
import { Card } from '@/components/ui/Card'
import { Seo } from '@/lib/seo'

interface WorkEntry {
  slug: string
  client: string
  sector: string
  outcome: string
  year: string
  blurb: string
}

const ENTRIES: WorkEntry[] = [
  {
    slug: 'acme-cloud',
    client: 'Acme Cloud',
    sector: 'Dev tooling SaaS · YC S24',
    outcome: '+34% trial signups',
    year: '2026',
    blurb:
      'Rebuilt the marketing surface for a YC dev-tooling company. Hero rewrite, instrumented A/B test on pricing page, full perf rewrite. LCP 4.2s -> 0.81s.',
  },
  {
    slug: 'pulse-pricing-page',
    client: 'Pulse',
    sector: 'B2B analytics SaaS',
    outcome: '+18% pricing -> trial CTR',
    year: '2026',
    blurb:
      'Pricing-page-only engagement. Restructured tier comparison, added FAQ accordion, added a confidence-band lift chart at the bottom. Three rounds of A/B tests across two months.',
  },
  {
    slug: 'orbital-marketing-site',
    client: 'Orbital',
    sector: 'Infra observability SaaS',
    outcome: '7-page site, 21-day build',
    year: '2025',
    blurb:
      'Full marketing site replacement: home, product, pricing, two case studies, about, contact. Built in Next.js 15. Owner team handed off the codebase post-launch.',
  },
]

export default function Work() {
  return (
    <Layout currentNav="work">
      <Seo
        title="Work — Lundeen Studio"
        description="Selected case studies of high-conversion SaaS landing pages and marketing sites."
        canonicalPath="/work"
      />
      <section
        aria-labelledby="work-heading"
        className="mx-auto w-full max-w-[1280px] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]"
      >
        <header className="mb-[var(--spacing-s7)] flex flex-col gap-[var(--spacing-s3)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-rust)]">
            § 01 / WORK
          </p>
          <h1
            id="work-heading"
            className="font-display text-[3rem] leading-[1.04] tracking-[-0.025em] text-[var(--color-ink)] md:text-[4rem]"
          >
            Selected work.
          </h1>
          <p className="max-w-[60ch] text-[var(--color-ink-2)]">
            Three engagements representative of the studio. Names changed where contracts require it; metrics verified against client analytics.
          </p>
        </header>

        <ul role="list" className="grid grid-cols-1 gap-[var(--spacing-s5)] md:grid-cols-2">
          {ENTRIES.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/work/${e.slug}`}
                aria-label={`${e.client} — ${e.outcome}`}
                className={
                  'group block rounded-[var(--radius-r3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]'
                }
              >
                <Card className="block transition-transform duration-[180ms] group-hover:translate-y-[-2px] group-focus-visible:translate-y-[-2px]">
                  <article className="flex flex-col gap-[var(--spacing-s4)]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
                        {e.sector}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
                        {e.year}
                      </span>
                    </div>
                    <h2 className="font-display text-[1.875rem] leading-[1.1] tracking-[-0.025em] text-[var(--color-ink)] group-hover:text-[var(--color-rust)] transition-colors duration-[180ms]">
                      {e.client}
                    </h2>
                    <p className="text-[var(--color-ink-2)]">{e.blurb}</p>
                    <span className="mt-[var(--spacing-s3)] inline-block w-fit border border-[var(--color-moss)] bg-[var(--color-paper)] px-[var(--spacing-s3)] py-[var(--spacing-s1)] font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-moss)]">
                      {e.outcome}
                    </span>
                  </article>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}
