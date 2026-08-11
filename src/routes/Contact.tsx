import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/lib/seo'
import { COPY } from '@/content/copy'

export default function Contact() {
  return (
    <Layout>
      <Seo
        title={`Contact — ${COPY.brand.full}`}
        description="Tell me about your project. Two-business-day response on weekdays."
        canonicalPath="/contact"
      />
      <article
        aria-labelledby="contact-heading"
        className="mx-auto w-full max-w-[1024px] px-6 py-24 md:px-8 md:py-32"
      >
        <header className="mb-12 flex flex-col gap-4">
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-rust)]">
            Contact
          </span>
          <h1
            id="contact-heading"
            className="font-display text-[3rem] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--color-ink)] md:text-[4rem]"
          >
            {COPY.contact.heading}
          </h1>
          <p className="max-w-[60ch] text-[1.125rem] leading-[1.55] text-[var(--color-ink-2)] md:text-[1.25rem]">
            {COPY.contact.lede}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-[var(--spacing-s7)] md:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-[var(--spacing-s6)]">
            <p className="text-[var(--color-ink)] text-lg">
              To get started, please send an email with a brief overview of your project, including:
            </p>
            <ul className="list-disc list-inside text-[var(--color-ink-2)] flex flex-col gap-2 mb-4">
              <li>A little about yourself and your company</li>
              <li>Your budget range</li>
              <li>What you're working on (current URLs, what's broken, and what success looks like)</li>
            </ul>
            <div>
              <Button
                asChild
                variant="primary"
                size="lg"
              >
                <a href="mailto:hello@mosaicbyte.design">
                  Email hello@mosaicbyte.design
                </a>
              </Button>
            </div>
          </div>

          <aside
            aria-label="What happens next"
            className="border-l border-[var(--color-paper-3)] pl-[var(--spacing-s5)]"
          >
            <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
              What happens next
            </h2>
            <ol className="mt-[var(--spacing-s4)] flex flex-col gap-[var(--spacing-s4)] text-[var(--color-ink)]">
              <li className="flex gap-[var(--spacing-s3)]">
                <span aria-hidden="true" className="font-mono text-[11px] tracking-[0.08em] text-[var(--color-plum)]">01</span>
                <span>I read every inquiry myself within two business days.</span>
              </li>
              <li className="flex gap-[var(--spacing-s3)]">
                <span aria-hidden="true" className="font-mono text-[11px] tracking-[0.08em] text-[var(--color-plum)]">02</span>
                <span>If we&rsquo;re a fit, I send a 5-page audit of your current page.</span>
              </li>
              <li className="flex gap-[var(--spacing-s3)]">
                <span aria-hidden="true" className="font-mono text-[11px] tracking-[0.08em] text-[var(--color-plum)]">03</span>
                <span>You decide: keep the audit, or roll the cost into a project.</span>
              </li>
            </ol>
          </aside>
        </div>
      </article>
    </Layout>
  )
}
