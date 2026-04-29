import { Link } from 'wouter'
import { cn } from '@/lib/utils'

export interface FooterColumn {
  heading: string
  items: { label: string; href: string }[]
}

export interface FooterProps {
  columns: FooterColumn[]
  legal: string
}

/**
 * Footer — sitemap-style 4-column layout.
 *
 * Top: 4 columns. Each column header in mono micro uppercase `--ink-3`.
 * Bottom strip: STATUS mirror + © + small wordmark.
 * Renders as <footer role="contentinfo">.
 */
export function Footer({ columns, legal }: FooterProps) {
  return (
    <footer
      role="contentinfo"
      className={cn(
        'mt-[var(--spacing-s8)] w-full',
        'bg-[var(--color-paper-2)] text-[var(--color-ink)]',
        'border-t border-[var(--color-paper-3)]',
      )}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-[1280px]',
          'px-[var(--spacing-s5)] pt-[var(--spacing-s7)] pb-[var(--spacing-s6)]',
          'md:px-[var(--spacing-s6)]',
        )}
      >
        {/* Sitemap columns */}
        <div className="grid grid-cols-2 gap-[var(--spacing-s6)] md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-[var(--spacing-s3)]">
              <h2
                className={cn(
                  'font-mono text-[11px] uppercase tracking-[0.08em] font-medium',
                  'text-[var(--color-ink-3)]',
                )}
              >
                {col.heading}
              </h2>
              <ul className="flex flex-col gap-[var(--spacing-s2)]">
                {col.items.map((item) => {
                  const isExternal = /^https?:\/\//.test(item.href) || item.href.startsWith('mailto:')
                  const isHash = item.href.includes('#')
                  const className = cn(
                    'inline-block font-body text-[14px] leading-[1.55]',
                    'text-[var(--color-ink-2)] transition-colors duration-[180ms]',
                    'hover:text-[var(--color-rust)]',
                  )
                  if (isExternal || isHash) {
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
        </div>

        {/* Bottom strip — status mirror + © + wordmark */}
        <div
          className={cn(
            'mt-[var(--spacing-s7)] pt-[var(--spacing-s4)]',
            'border-t border-[var(--color-paper-3)]',
            'flex flex-col gap-[var(--spacing-s3)]',
            'md:flex-row md:items-center md:justify-between md:gap-[var(--spacing-s5)]',
            'font-mono text-[11px] uppercase tracking-[0.06em]',
            'text-[var(--color-ink-3)]',
          )}
        >
          <span aria-label="Studio status mirror" className="inline-flex items-center gap-[var(--spacing-s2)]">
            <span
              aria-hidden="true"
              className="inline-block h-[6px] w-[6px] rounded-full bg-[var(--color-rust)]"
            />
            STATUS: AVAILABLE · WEEK OF MAY 5
          </span>
          <span>{legal}</span>
          <span
            className={cn(
              'font-display text-[14px] not-italic font-medium normal-case tracking-[-0.01em]',
              'text-[var(--color-ink-2)]',
            )}
            style={{ fontVariationSettings: "'opsz' 32" }}
          >
            Lundeen{' '}
            <span
              className="italic text-[var(--color-rust)]"
              style={{ fontVariationSettings: "'opsz' 32, 'SOFT' 100, 'WONK' 1" }}
            >
              &amp;
            </span>{' '}
            Co.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
