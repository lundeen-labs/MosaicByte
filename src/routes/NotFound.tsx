import { Link } from 'wouter'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/lib/seo'
import { withBasePath } from '@/lib/utils'
import { COPY } from '@/content/copy'

export default function NotFound() {
  return (
    <Layout>
      <Seo title={`404 — ${COPY.brand.full}`} description="Route not found." canonicalPath="/404" />
      <section
        aria-labelledby="notfound-heading"
        className="mx-auto flex w-full max-w-[800px] flex-col gap-[var(--spacing-s5)] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-rust)]">
          STATUS: ROUTE NOT FOUND · 404
        </span>
        <h1
          id="notfound-heading"
          className="font-display text-[6rem] leading-[0.9] tracking-[-0.04em] text-[var(--color-rust)] md:text-[10rem]"
          style={{ fontVariationSettings: '"opsz" 144, "wght" 700' }}
        >
          {COPY.notFound.code}
        </h1>
        <h2 className="font-display text-[2rem] leading-[1.1] tracking-[-0.025em] text-[var(--color-ink)] md:text-[3rem]">
          {COPY.notFound.heading}
        </h2>
        <p className="max-w-[60ch] text-[var(--color-ink-2)]">{COPY.notFound.body}</p>
        <div className="mt-[var(--spacing-s4)]">
          <Button asChild variant="primary" size="lg">
            {COPY.notFound.cta.href.includes('#') ? (
              <a href={withBasePath(COPY.notFound.cta.href)}>{COPY.notFound.cta.label} →</a>
            ) : (
              <Link href={COPY.notFound.cta.href}>{COPY.notFound.cta.label} →</Link>
            )}
          </Button>
        </div>
      </section>
    </Layout>
  )
}
