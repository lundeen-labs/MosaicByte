import { useState } from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MobileDrawer } from './MobileDrawer'

export interface NavbarProps {
  current?: 'work' | 'services' | 'process' | 'journal' | 'about'
}

interface NavItem {
  num: string
  label: string
  href: string
  key: NonNullable<NavbarProps['current']>
}

const NAV: NavItem[] = [
  { num: '01', label: 'Work', href: '/work', key: 'work' },
  { num: '02', label: 'Services', href: '/#services', key: 'services' },
  { num: '03', label: 'Process', href: '/#process', key: 'process' },
  { num: '04', label: 'About', href: '/about', key: 'about' },
]

/**
 * Navbar — sticky top, full-width with content max-width 1280px.
 *
 * Left: Fraunces wordmark `Lundeen & Co.` with mono micro `EST. 2025`.
 * Center: nav links with `01 / 02 / 03 / 04` numerals + label, magnetic
 *         hover (Framer Motion `whileHover={{ y: -1 }}`).
 * Right: primary `Free audit ↵` CTA with letterpress block-shadow.
 *
 * Below 768px: nav + CTA collapse into a hamburger that opens MobileDrawer.
 */
export function Navbar({ current }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const navForDrawer = NAV.map(({ label, href }) => ({ label, href }))

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        'bg-[var(--color-paper)]',
        'border-b border-[var(--color-paper-3)]',
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1280px] items-center justify-between',
          'px-[var(--spacing-s5)] py-[var(--spacing-s4)]',
          'md:px-[var(--spacing-s6)] md:pt-[28px] md:pb-[20px]',
        )}
      >
        {/* Wordmark */}
        <Link
          href="/"
          aria-label="Lundeen & Co. — home"
          className={cn(
            'inline-flex items-baseline gap-[var(--spacing-s2)]',
            'font-display text-[1.375rem] font-medium leading-none tracking-[-0.02em]',
            'text-[var(--color-ink)] transition-colors duration-[180ms]',
            'hover:text-[var(--color-ink-2)]',
          )}
          style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 50" }}
        >
          <span>
            Lundeen{' '}
            <span
              className="italic font-normal text-[var(--color-rust)]"
              style={{ fontVariationSettings: "'opsz' 48, 'SOFT' 100, 'WONK' 1" }}
            >
              &amp;
            </span>{' '}
            Co.
          </span>
          <span
            aria-hidden="true"
            className={cn(
              'font-mono text-[10px] uppercase tracking-[0.08em] font-medium',
              'text-[var(--color-ink-3)]',
            )}
          >
            EST. 2025
          </span>
        </Link>

        {/* Center nav (>=768px) */}
        <nav
          aria-label="Primary"
          className="hidden md:block"
        >
          <ul className="flex items-center gap-[var(--spacing-s6)]">
            {NAV.map((item) => {
              const isActive = current === item.key
              const isHash = item.href.includes('#')
              const linkClass = cn(
                'group relative inline-flex items-baseline gap-[6px] py-1',
                'font-mono text-[12px] uppercase tracking-[0.08em] font-medium',
                'transition-colors duration-[180ms]',
                isActive ? 'text-[var(--color-rust)]' : 'text-[var(--color-ink-2)] hover:text-[var(--color-rust)]',
              )
              const linkContent = (
                <>
                  <span
                    className={cn(
                      'transition-colors duration-[180ms]',
                      isActive ? 'text-[var(--color-rust)]' : 'text-[var(--color-ink-3)] group-hover:text-[var(--color-rust)]',
                    )}
                  >
                    {item.num}
                  </span>
                  <span>{item.label}</span>
                </>
              )
              return (
                <li key={item.href}>
                  <motion.span
                    className="inline-block"
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {isHash ? (
                      <a
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={linkClass}
                      >
                        {linkContent}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={linkClass}
                      >
                        {linkContent}
                      </Link>
                    )}
                  </motion.span>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Right CTA (>=768px) */}
        <a
          href="/contact"
          className={cn(
            'hidden md:inline-flex items-center gap-[6px]',
            'font-mono text-[12px] uppercase tracking-[0.06em] font-medium',
            'text-[var(--color-ink)] bg-[var(--color-paper)]',
            'border border-[var(--color-ink)] rounded-[var(--radius-r2)]',
            '[box-shadow:0_2px_0_var(--color-ink)]',
            'px-[12px] py-[7px] pl-[10px]',
            'transition-[transform,box-shadow] duration-[180ms]',
            'hover:translate-y-px hover:[box-shadow:0_1px_0_var(--color-ink)]',
            'active:translate-y-[2px] active:[box-shadow:0_0_0_var(--color-ink)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
          )}
        >
          Free audit
          <span
            aria-hidden="true"
            className={cn(
              'inline-block font-mono text-[10px] font-medium',
              'bg-[var(--color-paper-2)] text-[var(--color-ink-2)]',
              'border border-[var(--color-paper-3)] border-b-2',
              'rounded-[var(--radius-r1)] px-[5px] py-[1px] tracking-[0.04em]',
            )}
          >
            ↵
          </span>
        </a>

        {/* Mobile hamburger (<768px) */}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className={cn(
            'md:hidden inline-flex h-9 w-9 items-center justify-center',
            'rounded-[var(--radius-r2)] border border-[var(--color-ink)]',
            'text-[var(--color-ink)] bg-[var(--color-paper)]',
            'transition-colors duration-[180ms]',
            'hover:text-[var(--color-rust)] hover:border-[var(--color-rust)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
          )}
        >
          <Menu size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <MobileDrawer open={open} onOpenChange={setOpen} nav={navForDrawer} />
    </header>
  )
}

export default Navbar
