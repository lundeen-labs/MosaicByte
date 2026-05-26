import { Layout } from '@/components/layout/Layout'
import { Seo } from '@/lib/seo'
import { COPY } from '@/content/copy'

export default function Privacy() {
  const { privacy } = COPY.legal

  return (
    <Layout>
      <Seo
        title={`Privacy Policy — ${COPY.brand.full}`}
        description="What the Mosaic Byte site collects, why, who processes it, and how to have it deleted."
        canonicalPath="/privacy"
      />
      <article
        aria-labelledby="privacy-heading"
        className="mx-auto w-full max-w-[760px] px-6 py-24 md:px-8 md:py-32"
      >
        <header className="mb-12 flex flex-col gap-4">
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-rust)]">
            {privacy.eyebrow}
          </span>
          <h1
            id="privacy-heading"
            className="font-display text-[3rem] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--color-ink)] md:text-[4rem]"
          >
            {privacy.heading}
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
            {privacy.updated}
          </p>
          <p className="max-w-[60ch] text-[1.125rem] leading-[1.55] text-[var(--color-ink-2)]">
            {privacy.intro}
          </p>
        </header>

        <div className="flex flex-col gap-[var(--spacing-s7)]">
          {privacy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
                {section.heading}
              </h2>
              <div className="mt-[var(--spacing-s4)] flex flex-col gap-[var(--spacing-s4)]">
                {section.body.map((p, i) => (
                  <p key={i} className="text-[var(--color-ink-2)]">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </Layout>
  )
}
