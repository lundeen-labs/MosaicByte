import { Link } from 'wouter'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/lib/seo'
import { personJsonLd } from '@/lib/seo-data'
import { COPY } from '@/content/copy'

export default function About() {
  return (
    <Layout currentNav="about">
      <Seo
        title={`About — ${COPY.brand.full}`}
        description={COPY.about.lede}
        canonicalPath="/about"
        jsonLd={personJsonLd}
      />
      <article
        aria-labelledby="about-heading"
        className="mx-auto w-full max-w-[1280px] px-6 py-24 md:px-8 md:py-32"
      >
        <header className="mb-12 flex flex-col gap-4">
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-rust)]">
            About
          </span>
          <h1
            id="about-heading"
            className="max-w-[20ch] font-display text-[3rem] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--color-ink)] md:text-[4.5rem]"
          >
            {COPY.about.heading}
          </h1>
          <p className="max-w-[60ch] text-[1.25rem] leading-[1.55] text-[var(--color-ink-2)]">
            {COPY.about.lede}
          </p>
        </header>

        <section className="mb-[var(--spacing-s8)] grid grid-cols-1 gap-[var(--spacing-s7)] md:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-[var(--spacing-s5)]">
            {COPY.about.body.map((p, i) => (
              <p key={i} className="text-[var(--color-ink)]">
                {p}
              </p>
            ))}
          </div>

          <aside className="border-l border-[var(--color-paper-3)] pl-[var(--spacing-s5)]">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
              Credentials
            </h2>
            <dl className="mt-[var(--spacing-s4)] flex flex-col gap-[var(--spacing-s4)]">
              {COPY.about.credentials.map((c) => (
                <div key={c.label}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-2)]">
                    {c.label}
                  </dt>
                  <dd className="mt-[var(--spacing-s1)] text-[var(--color-ink)]">{c.detail}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </section>

        <div className="border-t-2 border-[var(--color-ink)] pt-[var(--spacing-s7)]">
          <Button asChild variant="primary" size="lg">
            <Link href="/contact">Start a conversation →</Link>
          </Button>
        </div>
      </article>
    </Layout>
  )
}
