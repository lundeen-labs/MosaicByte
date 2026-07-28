import { Link } from 'wouter'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/lib/seo'
import { withBasePath } from '@/lib/utils'
import { COPY } from '@/content/copy'

/**
 * Work page — honest "in flight" notice until real engagements ship under the
 * Mosaic Byte brand. No fictional case studies. When real work exists, this
 * route will gain a project grid and per-project `/work/:slug` routes.
 */
export default function Work() {
  const { work } = COPY

  return (
    <Layout currentNav="work">
      <Seo
        title={`Work — ${COPY.brand.full}`}
        description="Mosaic Byte is taking on its first clients. Past and in-flight work will be added here as it ships under the studio."
        canonicalPath="/work"
      />
      <article
        aria-labelledby="work-heading"
        className="mx-auto w-full max-w-[860px] px-6 py-24 md:px-8 md:py-32"
      >
        <header className="mb-12 flex flex-col gap-4">
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-rust)]">
            {work.eyebrow}
          </span>
          <h1
            id="work-heading"
            className="font-display text-[3rem] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--color-ink)] md:text-[4rem]"
          >
            {work.heading}
          </h1>
        </header>

        <div className="flex flex-col gap-[var(--spacing-s5)]">
          {work.body.map((p, i) => (
            <p key={i} className="max-w-[60ch] text-[1.0625rem] leading-[1.6] text-[var(--color-ink-2)]">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-12 border-t border-[var(--color-paper-3)] pt-12">
          <Button asChild variant="primary" size="lg">
            {work.cta.href.includes('#') ? (
              <a href={withBasePath(work.cta.href)}>
                {work.cta.label} <span aria-hidden="true">→</span>
              </a>
            ) : (
              <Link href={work.cta.href}>
                {work.cta.label} <span aria-hidden="true">→</span>
              </Link>
            )}
          </Button>
        </div>
      </article>
    </Layout>
  )
}
