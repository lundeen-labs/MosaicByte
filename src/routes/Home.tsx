import { Layout } from '@/components/layout/Layout'
import HeroA from '@/components/hero/HeroA'
import { PricingTier } from '@/components/ui/PricingTier'
import { ProcessTimeline } from '@/components/ui/ProcessTimeline'
import { FAQAccordion } from '@/components/ui/FAQAccordion'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/lib/seo'
import { personJsonLd, orgJsonLd, faqJsonLd } from '@/lib/seo-data'
import { COPY } from '@/content/copy'

export default function Home() {
  return (
    <Layout>
      <Seo
        title={`${COPY.brand.full} — SaaS Landing Pages That Convert`}
        description={COPY.brand.description}
        canonicalPath="/"
        jsonLd={[personJsonLd, orgJsonLd, faqJsonLd]}
      />
      <HeroA
        eyebrow={COPY.hero.eyebrow}
        titleParts={{ ...COPY.hero.titleParts }}
        sub={COPY.hero.sub}
        primaryCta={{ ...COPY.hero.primaryCta }}
        secondaryCta={{ ...COPY.hero.secondaryCta }}
        reassureLines={[...COPY.hero.reassureLines]}
        gauge={{ ...COPY.hero.gauge }}
      />

      <section
        id="services"
        aria-labelledby="services-heading"
        className="mx-auto w-full max-w-[1280px] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]"
      >
        <header className="mb-[var(--spacing-s7)] flex flex-col gap-[var(--spacing-s3)]">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
            § {COPY.services.sectionMark.number} / {COPY.services.sectionMark.label}
          </span>
          <h2 id="services-heading" className="font-display text-[2.25rem] leading-[1.1] tracking-[-0.025em] text-[var(--color-ink)] md:text-[3rem]">
            {COPY.services.heading}
          </h2>
          <p className="max-w-[48ch] text-[var(--color-ink-2)]">{COPY.services.intro}</p>
        </header>

        <div className="grid grid-cols-1 gap-[var(--spacing-s5)] md:grid-cols-3">
          {COPY.services.tiers.map((tier) => (
            <PricingTier
              key={tier.name}
              eyebrow={tier.eyebrow}
              name={tier.name}
              price={tier.price}
              cadence={tier.cadence}
              scope={[...tier.scope]}
              cta={{ ...tier.cta }}
              featured={'featured' in tier ? tier.featured : false}
            />
          ))}
        </div>

        <div className="mt-[var(--spacing-s6)] border-t border-[var(--color-paper-3)] pt-[var(--spacing-s5)]">
          <PricingTier
            eyebrow={COPY.services.retainer.eyebrow}
            name={COPY.services.retainer.name}
            price={COPY.services.retainer.price}
            cadence={COPY.services.retainer.cadence}
            scope={[...COPY.services.retainer.scope]}
            cta={{ ...COPY.services.retainer.cta }}
          />
        </div>
      </section>

      <section
        id="process"
        aria-labelledby="process-heading"
        className="mx-auto w-full max-w-[1280px] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]"
      >
        <header className="mb-[var(--spacing-s7)] flex flex-col gap-[var(--spacing-s3)]">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
            § {COPY.process.sectionMark.number} / {COPY.process.sectionMark.label}
          </span>
          <h2 id="process-heading" className="font-display text-[2.25rem] leading-[1.1] tracking-[-0.025em] text-[var(--color-ink)] md:text-[3rem]">
            {COPY.process.heading}
          </h2>
          <p className="max-w-[48ch] text-[var(--color-ink-2)]">{COPY.process.intro}</p>
        </header>

        <ProcessTimeline steps={COPY.process.steps.map((s) => ({ ...s }))} />
      </section>

      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="mx-auto w-full max-w-[1280px] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]"
      >
        <header className="mb-[var(--spacing-s7)] flex flex-col gap-[var(--spacing-s3)]">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
            § {COPY.faq.sectionMark.number} / {COPY.faq.sectionMark.label}
          </span>
          <h2 id="faq-heading" className="font-display text-[2.25rem] leading-[1.1] tracking-[-0.025em] text-[var(--color-ink)] md:text-[3rem]">
            {COPY.faq.heading}
          </h2>
        </header>

        <FAQAccordion items={COPY.faq.items.map((i) => ({ ...i }))} />
      </section>

      <section
        id="next"
        aria-labelledby="next-heading"
        className="mx-auto w-full max-w-[1280px] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]"
      >
        <div className="flex flex-col items-start gap-[var(--spacing-s5)] border-t-2 border-[var(--color-ink)] pt-[var(--spacing-s7)] md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-[60ch] flex-col gap-[var(--spacing-s3)]">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
              § {COPY.cta.sectionMark.number} / {COPY.cta.sectionMark.label}
            </span>
            <h2 id="next-heading" className="font-display text-[2rem] leading-[1.04] tracking-[-0.025em] text-[var(--color-ink)] md:text-[2.75rem]">
              {COPY.cta.heading}
            </h2>
            <p className="text-[var(--color-ink-2)]">{COPY.cta.lede}</p>
          </div>
          <div className="flex flex-col gap-[var(--spacing-s3)] md:flex-row md:items-center">
            <Button asChild variant="primary" size="lg">
              <a href={COPY.cta.primary.href}>{COPY.cta.primary.label}</a>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href={COPY.cta.secondary.href}>{COPY.cta.secondary.label} →</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  )
}
