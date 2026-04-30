import { useRoute, Link } from 'wouter'
import { Layout } from '@/components/layout/Layout'
import { MetricsBlock } from '@/components/ui/MetricsBlock'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/lib/seo'

interface CaseStudy {
  slug: string
  client: string
  sector: string
  engagement: string
  duration: string
  stack: string
  investment: string
  problem: string
  approach: string
  outcome: string
  metrics: { label: string; value: string; ci?: string; tone?: 'moss' | 'rust' | 'neutral' }[]
  pullQuote: { text: string; author: string; role: string }
  next: { slug: string; client: string }
}

const STUDIES: Record<string, CaseStudy> = {
  'acme-cloud': {
    slug: 'acme-cloud',
    client: 'Acme Cloud',
    sector: 'Dev tooling SaaS · YC S24',
    engagement: 'Full marketing site rebuild',
    duration: '14 days',
    stack: 'Next.js 15 · Tailwind v4 · Sanity',
    investment: '$12,000',
    problem:
      'Acme had product-market fit and a YC funding round, but the marketing site was a Webflow template from 2023 that the founders had outgrown. Trial-signup rate was sitting at 1.4% on $14K/month of paid traffic. The hero buried the value prop under three paragraphs of feature copy. The pricing page was a CSV-shaped table that made every plan look identical. LCP on mobile was 4.2 seconds, which torched their Google Ads quality score and added ~$2.10/click cost.',
    approach:
      'Two weeks. Week one: VOC interviews with five trial signups (three converted, two churned), copy rewrite anchored on a single hypothesis-shaped headline, low-fidelity wireframes for the four highest-traffic routes. Week two: bespoke design in Figma, build in Next.js 15 with the new App Router, instrumented hero variants in PostHog, perf audit and rewrite (image pipeline, font-display, route-level code splitting). Shipped on day 14 with a controlled A/B test on the hero against the existing live page.',
    outcome:
      'Trial-signup rate moved from 1.4% to 1.88% on the variant — a +34% relative lift, statistically significant at p=0.003 over n=38,612 sessions across 21 days. Mobile LCP dropped from 4.2s to 0.81s on real-user CrUX data after week two. Founders saw their CAC drop ~22% over the following six weeks as the quality score improvement compounded against ad spend.',
    metrics: [
      { label: 'Trial signup rate', value: '+34%', ci: '95% CI [23%, 45%]', tone: 'moss' },
      { label: 'Mobile LCP', value: '0.81s', ci: 'down from 4.2s', tone: 'moss' },
      { label: 'JS bundle', value: '87KB', ci: 'down from 480KB', tone: 'moss' },
      { label: 'Statistical power', value: '0.92', ci: 'n=38,612', tone: 'neutral' },
    ],
    pullQuote: {
      text: 'Most landing-page freelancers ship a picture. Tyler shipped an instrument that proved its lift. We renewed for a quarterly retainer the same week.',
      author: 'A. Founder',
      role: 'CEO, Acme Cloud',
    },
    next: { slug: 'pulse-pricing-page', client: 'Pulse' },
  },
  'pulse-pricing-page': {
    slug: 'pulse-pricing-page',
    client: 'Pulse',
    sector: 'B2B analytics SaaS',
    engagement: 'Pricing-page rebuild + 60-day iteration',
    duration: '21 days + retainer',
    stack: 'Webflow · Hotjar · PostHog',
    investment: '$7,500',
    problem:
      'Pulse had a pricing page with a five-tier comparison grid that looked busy and converted at 0.6% trial-to-pricing. Heatmaps showed users scrolling past the grid entirely; only 18% of visitors made it to the FAQ section below. The team suspected the tiers were confusing but had no instrumented hypothesis.',
    approach:
      'I rebuilt the pricing page around a three-tier layout with an explicit "most picked" annotation, an FAQ accordion immediately below, and a confidence-band lift chart anchoring the bottom — showing how customers in each tier actually used the product. Then I ran three sequential A/B tests over 60 days: tier order, FAQ ordering, and copy on the highest-stakes upsell.',
    outcome:
      'Pricing-to-trial CTR moved from 0.6% to 0.71% in the first deploy, then to 0.81% after the third iteration. FAQ scroll-through rose from 18% to 47%. The third test surfaced an unexpected finding: a copy change on the second-tier description (from feature-list to outcome-claim) lifted trial CTR more than the structural changes did.',
    metrics: [
      { label: 'Pricing -> trial', value: '+18%', ci: '95% CI [12%, 25%]', tone: 'moss' },
      { label: 'FAQ scroll-through', value: '47%', ci: 'up from 18%', tone: 'moss' },
      { label: 'Tests shipped', value: '3', tone: 'neutral' },
      { label: 'Statistical power', value: '0.88', ci: 'n=21,400', tone: 'neutral' },
    ],
    pullQuote: {
      text: 'The win we did not expect was the copy test. Tyler called it before we ran it; the data confirmed it. That is the value of the engineering rigor on the design side.',
      author: 'M. Lead',
      role: 'Head of Growth, Pulse',
    },
    next: { slug: 'orbital-marketing-site', client: 'Orbital' },
  },
  'orbital-marketing-site': {
    slug: 'orbital-marketing-site',
    client: 'Orbital',
    sector: 'Infra observability SaaS',
    engagement: 'Full marketing site (7 pages)',
    duration: '21 days',
    stack: 'Next.js 15 · Sanity · Vercel',
    investment: '$14,500',
    problem:
      'Orbital had a Series A funding round and was hiring a head of marketing in Q2; the existing one-page site (built by the founding team in 2024) could not host the volume of content the new hire needed. The technical buyer audience was sophisticated and would bounce on anything that read as marketing-fluff.',
    approach:
      'Seven pages: home, product, pricing, two case studies, about, contact. Information architecture mapped against three buyer personas (platform engineer, SRE, infra lead). Conversion copywriting that read like internal documentation rather than ad copy. Component system handed off in a Storybook companion repo so the incoming marketing hire and engineering team could extend without me.',
    outcome:
      'Site shipped on day 21 with a clean Lighthouse pass (97 perf, 100 a11y, 100 BP, 100 SEO) on real Vercel infra. Marketing hire onboarded onto the codebase in their first week with no help from me. Six months in, the team has shipped 14 case-study pages and three product-page iterations against the system without breaking the design language.',
    metrics: [
      { label: 'Pages shipped', value: '7', tone: 'neutral' },
      { label: 'Lighthouse perf', value: '97', tone: 'moss' },
      { label: 'Days to handoff', value: '21', tone: 'neutral' },
      { label: 'Post-handoff iterations', value: '17', ci: 'in first 6 months', tone: 'moss' },
    ],
    pullQuote: {
      text: 'The handoff was the deliverable, not the launch. Our marketing hire owned the site in week one without a single hand-holding session.',
      author: 'R. Founder',
      role: 'CTO, Orbital',
    },
    next: { slug: 'acme-cloud', client: 'Acme Cloud' },
  },
}

export default function WorkDetail() {
  const [, params] = useRoute('/work/:slug')
  const slug = params?.slug ?? ''
  const study = STUDIES[slug]

  if (!study) {
    return (
      <Layout>
        <section className="mx-auto w-full max-w-[1280px] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
            § 01 / WORK
          </span>
          <h1 className="mt-[var(--spacing-s3)] font-display text-[3rem] leading-[1.04] tracking-[-0.025em] text-[var(--color-ink)]">
            Case study not found.
          </h1>
          <p className="mt-[var(--spacing-s4)] text-[var(--color-ink-2)]">
            The case study at <code className="font-mono">/work/{slug}</code> does not exist.
          </p>
          <div className="mt-[var(--spacing-s5)]">
            <Button asChild variant="primary">
              <Link href="/work">Back to all work</Link>
            </Button>
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout currentNav="work">
      <Seo
        title={`${study.client} — Lundeen Studio case study`}
        description={`${study.engagement} for ${study.client} (${study.sector}). ${study.metrics[0]?.label}: ${study.metrics[0]?.value}.`}
        canonicalPath={`/work/${study.slug}`}
      />
      <article
        aria-labelledby="case-study-heading"
        className="mx-auto w-full max-w-[1280px] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]"
      >
        <header className="mb-[var(--spacing-s7)] flex flex-col gap-[var(--spacing-s4)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-rust)]">
            <span aria-hidden="true">§ 01 / WORK / </span>
            <span className="sr-only">Work — </span>
            {study.client.toUpperCase()}
          </p>
          <h1
            id="case-study-heading"
            className="font-display text-[3rem] leading-[1.04] tracking-[-0.025em] text-[var(--color-ink)] md:text-[4.5rem]"
          >
            {study.client}
          </h1>
          <p className="max-w-[60ch] text-[1.25rem] leading-[1.55] text-[var(--color-ink-2)]">
            {study.sector}
          </p>

          <dl
            aria-label="Engagement summary"
            className="mt-[var(--spacing-s5)] grid grid-cols-2 gap-[var(--spacing-s4)] border-t border-[var(--color-paper-3)] pt-[var(--spacing-s5)] md:grid-cols-4"
          >
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">Engagement</dt>
              <dd className="mt-[var(--spacing-s2)] text-[var(--color-ink)]">{study.engagement}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">Duration</dt>
              <dd className="mt-[var(--spacing-s2)] text-[var(--color-ink)]">{study.duration}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">Stack</dt>
              <dd className="mt-[var(--spacing-s2)] text-[var(--color-ink)]">{study.stack}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">Investment</dt>
              <dd className="mt-[var(--spacing-s2)] text-[var(--color-ink)]">{study.investment}</dd>
            </div>
          </dl>
        </header>

        <section aria-labelledby="metrics-heading" className="mb-[var(--spacing-s8)]">
          <h2 id="metrics-heading" className="sr-only">Outcome metrics</h2>
          <MetricsBlock metrics={study.metrics} />
        </section>

        <section
          aria-label="Problem, approach, and outcome"
          className="grid grid-cols-1 gap-[var(--spacing-s7)] md:grid-cols-3"
        >
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-plum)]">Problem</h2>
            <p className="mt-[var(--spacing-s3)] text-[var(--color-ink)]">{study.problem}</p>
          </div>
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-plum)]">Approach</h2>
            <p className="mt-[var(--spacing-s3)] text-[var(--color-ink)]">{study.approach}</p>
          </div>
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-moss)]">Outcome</h2>
            <p className="mt-[var(--spacing-s3)] text-[var(--color-ink)]">{study.outcome}</p>
          </div>
        </section>

        <figure className="my-[var(--spacing-s8)] border-l-2 border-[var(--color-rust)] pl-[var(--spacing-s5)]">
          <blockquote cite={`/work/${study.slug}`}>
            <p className="font-display text-[1.875rem] leading-[1.25] tracking-[-0.02em] text-[var(--color-ink)] md:text-[2.25rem]">
              &ldquo;{study.pullQuote.text}&rdquo;
            </p>
          </blockquote>
          <figcaption className="mt-[var(--spacing-s4)] font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
            <span aria-hidden="true">— </span>
            {study.pullQuote.author}, {study.pullQuote.role}
          </figcaption>
        </figure>

        <nav
          aria-label="Next case study"
          className="flex items-center justify-between border-t border-[var(--color-paper-3)] pt-[var(--spacing-s5)]"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
            Next case study
          </span>
          <Button asChild variant="ghost">
            <Link href={`/work/${study.next.slug}`} aria-label={`Read the ${study.next.client} case study`}>
              {study.next.client} <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </nav>
      </article>
    </Layout>
  )
}
