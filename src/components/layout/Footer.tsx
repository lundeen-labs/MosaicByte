import { Link } from 'wouter'
import { cn } from '@/lib/utils'
import { COPY } from '@/content/copy'

export interface FooterColumn {
  heading: string
  items: { label: string; href: string }[]
}

export interface FooterProps {
  columns: FooterColumn[]
  legal: string
  /** Engineering credit row ("Site engineering by Tyler Lundeen"). */
  colophon?: string
}

/**
 * Footer — sitemap columns + banner CTA + bottom legal/colophon row.
 *
 * Banner copy and primary CTA come from COPY.cta so the message stays in
 * sync with the site's call-to-action everywhere else. The colophon credits
 * the engineering work on a separate line below the legal copyright.
 */
export function Footer({ columns, legal, colophon }: FooterProps) {
  return (
    <footer
      role="contentinfo"
      className={cn(
        'mt-[var(--spacing-s8)] w-full',
        'bg-[var(--color-paper)] text-[var(--color-ink)]',
        'border-t border-[var(--color-paper-3)]',
      )}
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 pt-20 pb-8 md:px-8">
        {/* Banner */}
        <div className="flex flex-col gap-6 border-b border-[var(--color-paper-3)] pb-12 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-[40ch] flex-col gap-3">
            <h2 className="font-display text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--color-ink)] md:text-[3rem]">
              {COPY.cta.heading}
            </h2>
            <p className="text-[var(--color-ink-2)]">{COPY.cta.lede}</p>
          </div>
          <a
            href={COPY.cta.primary.href}
            className={cn(
              'inline-flex items-center gap-2 self-start',
              'rounded-full bg-[var(--color-rust)] text-[var(--color-paper)]',
              'px-6 py-3 text-[15px] font-semibold',
              'transition-[background,transform] duration-[180ms]',
              'hover:bg-[var(--color-rust-2)] hover:translate-y-[-1px]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
            )}
          >
            {COPY.cta.primary.label} <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Sitemap columns */}
        <nav aria-label="Footer" className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <h3 className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--color-ink-3)]">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.items.map((item) => {
                  const isExternal = /^https?:\/\//.test(item.href) || item.href.startsWith('mailto:')
                  const isHash = item.href.includes('#')
                  const isStatic = item.href.endsWith('.xml')
                  const className = cn(
                    'inline-block text-[14px] text-[var(--color-ink-2)] transition-colors duration-[180ms]',
                    'hover:text-[var(--color-ink)]',
                  )
                  if (isExternal || isHash || isStatic) {
                    return (
                      <li key={item.href + item.label}>
                        <a
                          href={item.href}
                          className={className}
                          {...(isExternal ? { rel: 'noopener noreferrer' } : {})}
                        >
                          {item.label}
                        </a>
                      </li>
                    )
                  }
                  return (
                    <li key={item.href + item.label}>
                      <Link href={item.href} className={className}>
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom row: legal + colophon */}
        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--color-paper-3)] pt-6 md:flex-row md:items-center md:justify-between">
          <span className="text-[12px] text-[var(--color-ink-3)]">{legal}</span>
          {colophon ? (
            <span className="text-[12px] text-[var(--color-ink-3)]">{colophon}</span>
          ) : null}
        </div>
      </div>
    </footer>
  )
}

export default Footer
