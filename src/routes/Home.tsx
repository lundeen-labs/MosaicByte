import { Layout } from '@/components/layout/Layout'
import HeroA from '@/components/hero/HeroA'
import { PricingTier } from '@/components/ui/PricingTier'
import { ProcessTimeline } from '@/components/ui/ProcessTimeline'
import { FAQAccordion } from '@/components/ui/FAQAccordion'
import { Button } from '@/components/ui/Button'
import { StackBadges } from '@/components/ui/StackBadges'
import { Seo } from '@/lib/seo'
import { personJsonLd, orgJsonLd, faqJsonLd } from '@/lib/seo-data'
import { COPY } from '@/content/copy'

interface SectionHeaderProps {
  eyebrow: string
  heading: string
  intro?: string
  align?: 'left' | 'center'
}

function SectionHeader({ eyebrow, heading, intro, align = 'left' }: SectionHeaderProps) {
  return (
    <header
      className={
        align === 'center'
          ? 'mx-auto mb-12 flex max-w-[60ch] flex-col items-center gap-4 text-center'
          : 'mb-12 flex max-w-[60ch] flex-col gap-4'
      }
    >
      <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-rust)]">
        {eyebrow}
      </span>
      <h2 className="font-display text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--color-ink)] md:text-[3rem]">
        {heading}
      </h2>
      {intro ? <p className="text-[var(--color-ink-2)]">{intro}</p> : null}
    </header>
  )
}

export default function Home() {
  return (
    <Layout>
      <Seo
        title={`${COPY.brand.full} — ${COPY.brand.tagline}`}
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
      />

      <StackBadges
        label={COPY.stack.label}
        items={COPY.stack.items.map((i) => ({ name: i.name, detail: i.detail }))}
      />

      <section
        id="services"
        aria-labelledby="services-heading"
        className="mx-auto w-full max-w-[1280px] px-6 py-24 md:px-8 md:py-32"
      >
        <SectionHeader
          eyebrow="Services"
          heading={COPY.services.heading}
          intro={COPY.services.intro}
        />
        <h2 id="services-heading" className="sr-only">
          {COPY.services.heading}
        </h2>

        <ul role="list" className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {COPY.services.tiers.map((tier) => (
            <li key={tier.name} className="flex">
              <PricingTier
                eyebrow={tier.eyebrow}
                name={tier.name}
                price={tier.price}
                cadence={tier.cadence}
                scope={[...tier.scope]}
                cta={{ ...tier.cta }}
                featured={'featured' in tier ? tier.featured : false}
              />
            </li>
          ))}
        </ul>

        <aside aria-label="Optional retainer" className="mt-8">
          <PricingTier
            eyebrow={COPY.services.retainer.eyebrow}
            name={COPY.services.retainer.name}
            price={COPY.services.retainer.price}
            cadence={COPY.services.retainer.cadence}
            scope={[...COPY.services.retainer.scope]}
            cta={{ ...COPY.services.retainer.cta }}
          />
        </aside>
      </section>

      <section
        id="process"
        aria-labelledby="process-heading"
        className="border-t border-[var(--color-paper-3)] bg-[var(--color-paper-2)]/30"
      >
        <div className="mx-auto w-full max-w-[1280px] px-6 py-24 md:px-8 md:py-32">
          <SectionHeader eyebrow="Process" heading={COPY.process.heading} intro={COPY.process.intro} />
          <h2 id="process-heading" className="sr-only">
            {COPY.process.heading}
          </h2>
          <ProcessTimeline steps={COPY.process.steps.map((s) => ({ ...s }))} />
        </div>
      </section>

      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="mx-auto w-full max-w-[1280px] px-6 py-24 md:px-8 md:py-32"
      >
        <SectionHeader eyebrow="FAQ" heading={COPY.faq.heading} />
        <h2 id="faq-heading" className="sr-only">
          {COPY.faq.heading}
        </h2>
        <FAQAccordion items={COPY.faq.items.map((i) => ({ ...i }))} />
      </section>

      <section
        id="next"
        aria-labelledby="next-heading"
        className="mx-auto w-full max-w-[1280px] px-6 py-24 md:px-8 md:py-32"
      >
        <div className="rounded-3xl border border-[var(--color-paper-3)] bg-[var(--color-paper-2)] p-10 md:p-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex max-w-[40ch] flex-col gap-3">
              <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-rust)]">
                Now booking
              </span>
              <h2
                id="next-heading"
                className="font-display text-[2rem] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--color-ink)] md:text-[2.5rem]"
              >
                {COPY.cta.heading}
              </h2>
              <p className="text-[var(--color-ink-2)]">{COPY.cta.lede}</p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Button asChild variant="primary" size="lg">
                <a href={COPY.cta.primary.href}>
                  {COPY.cta.primary.label} <span aria-hidden="true">→</span>
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a href={COPY.cta.secondary.href}>{COPY.cta.secondary.label}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
