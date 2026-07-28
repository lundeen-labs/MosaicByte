import { lazy, Suspense, useState } from 'react'
import { Link } from 'wouter'
import { Menu } from 'lucide-react'
import { cn, withBasePath } from '@/lib/utils'
import { COPY } from '@/content/copy'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// Lazy-mount the drawer so its dependency tree (Radix Dialog + react-remove-
// scroll + dismissable-layer + focus-scope + aria-hidden, ~70 KB src) stays
// out of the eager `/` chunk. Desktop never opens the drawer — the chunk is
// only fetched on the first hamburger tap.
const MobileDrawer = lazy(() => import('./MobileDrawer'))

export interface NavbarProps {
  current?: 'services' | 'process' | 'work' | 'about'
}

/**
 * Navbar — sticky paper-toned glass header with a thin ink border.
 *
 * Left: Mosaic Byte wordmark + availability dot.
 * Center: text nav consumed from COPY.nav.primary (single source of truth —
 *   we deliberately do NOT duplicate the list locally; that was the
 *   architecture-audit DIP violation).
 * Right: primary CTA from COPY.nav.primaryCta.
 *
 * Below 768px: nav + CTA collapse into a hamburger that opens MobileDrawer.
 */
export function Navbar({ current }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const nav = COPY.nav.primary
  const navForDrawer = nav.map(({ label, href }) => ({ label, href }))
  const primaryCta = COPY.nav.primaryCta

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        'bg-[var(--color-paper)]/80 backdrop-blur-md',
        'border-b border-[var(--color-paper-3)]',
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-4 md:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          aria-label={`${COPY.brand.full} — home`}
          className="group inline-flex items-center gap-3 text-[var(--color-ink)]"
        >
          <span className="font-display text-[1.0625rem] font-semibold tracking-[-0.02em]">
            {COPY.brand.wordmark}
          </span>
          <span
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-paper-3)] bg-[var(--color-paper-2)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-ink-2)]"
            aria-label={COPY.status.available ? `Available ${COPY.status.slots} slots` : 'Booked'}
          >
            <span
              aria-hidden="true"
              className={cn(
                'inline-block h-1.5 w-1.5 rounded-full',
                COPY.status.available ? 'bg-[var(--color-rust)]' : 'bg-[var(--color-ink-3)]',
              )}
              style={{
                boxShadow: COPY.status.available ? '0 0 8px var(--color-rust)' : 'none',
              }}
            />
            {COPY.status.available ? `${COPY.status.slots} slots open` : 'Booked'}
          </span>
        </Link>

        {/* Center nav (>=768px) */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {nav.map((item) => {
              const isActive = current === item.key
              const isHash = item.href.includes('#')
              const linkClass = cn(
                'text-[14px] font-medium transition-colors duration-[180ms]',
                isActive
                  ? 'text-[var(--color-ink)]'
                  : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]',
              )
              return (
                <li key={item.href}>
                  {isHash ? (
                    <a href={withBasePath(item.href)} aria-current={isActive ? 'page' : undefined} className={linkClass}>
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} aria-current={isActive ? 'page' : undefined} className={linkClass}>
                      {item.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Right cluster: theme toggle + primary CTA (>=768px) */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {primaryCta.href.includes('#') ? (
            <a
              href={withBasePath(primaryCta.href)}
              className={cn(
                'inline-flex items-center gap-2',
                'rounded-full bg-[var(--color-rust)] text-[var(--color-paper)]',
                'px-5 py-2.5 text-[14px] font-semibold',
                'transition-[background,transform] duration-[180ms]',
                'hover:bg-[var(--color-rust-2)] hover:translate-y-[-1px]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
              )}
            >
              {primaryCta.label}
              <span aria-hidden="true">→</span>
            </a>
          ) : (
            <Link
              href={primaryCta.href}
              className={cn(
                'inline-flex items-center gap-2',
                'rounded-full bg-[var(--color-rust)] text-[var(--color-paper)]',
                'px-5 py-2.5 text-[14px] font-semibold',
                'transition-[background,transform] duration-[180ms]',
                'hover:bg-[var(--color-rust-2)] hover:translate-y-[-1px]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
              )}
            >
              {primaryCta.label}
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>

        {/* Mobile hamburger (<768px) */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className={cn(
            'md:hidden inline-flex h-9 w-9 items-center justify-center',
            'rounded-full border border-[var(--color-paper-3)]',
            'text-[var(--color-ink)] bg-[var(--color-paper-2)]',
            'transition-colors duration-[180ms]',
            'hover:border-[var(--color-rust)] hover:text-[var(--color-rust)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
          )}
        >
          <Menu size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      {open && (
        <Suspense fallback={null}>
          <MobileDrawer open={open} onOpenChange={setOpen} nav={navForDrawer} />
        </Suspense>
      )}
    </header>
  )
}

export default Navbar
