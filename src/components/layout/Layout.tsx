import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SkipToContent } from './SkipToContent'
import { Navbar } from './Navbar'
import { Footer, type FooterColumn } from './Footer'

export interface LayoutProps {
  children: ReactNode
  theme?: 'light' | 'dark'
}

const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Studio',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Journal', href: '/journal' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Work',
    items: [
      { label: 'Case studies', href: '/work' },
      { label: 'Work index', href: '/work' },
    ],
  },
  {
    heading: 'Process',
    items: [
      { label: 'Free audit', href: '/contact' },
      { label: 'Productized landing', href: '/#services' },
      { label: 'Full site', href: '/#services' },
    ],
  },
  {
    heading: 'Legal',
    items: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]

const DEFAULT_LEGAL = '© 2026 Lundeen & Co.'

/**
 * StatusStripStub — inline 24px mono band rendered as a placeholder until
 * D2's `<StatusStrip />` component (in `src/components/ui/StatusStrip.tsx`)
 * lands. D5 will refactor this to import D2's component.
 *
 * Renders the same DOM structure as the design-system mockup so visual parity
 * is preserved post-refactor.
 */
function StatusStripStub() {
  return (
    <div
      role="status"
      aria-label="Studio status"
      data-testid="status-strip"
      className={cn(
        'relative z-10 w-full',
        'bg-[var(--color-ink)] text-[var(--color-paper)]',
        'font-mono text-[11px] uppercase tracking-[0.06em] font-medium',
        'flex items-center justify-between gap-[var(--spacing-s5)]',
        'h-[24px] px-[var(--spacing-s4)] md:px-[var(--spacing-s6)]',
        'overflow-hidden whitespace-nowrap',
      )}
    >
      <span className="inline-flex items-center gap-[var(--spacing-s4)]">
        <span className="inline-flex items-center gap-[6px]">
          <span
            aria-hidden="true"
            className="inline-block h-[6px] w-[6px] rounded-full bg-[var(--color-rust)]"
          />
          <span>STATUS: AVAILABLE · 2 SLOTS · WEEK OF MAY 5</span>
        </span>
        <span className="hidden md:inline opacity-70">REV a3f9c1</span>
      </span>
      <span className="hidden md:inline-flex items-center gap-[var(--spacing-s4)]">
        <span style={{ color: '#B7E0BB' }}>LCP 0.81s</span>
        <span style={{ color: '#B7E0BB' }}>CLS 0.01</span>
        <span style={{ color: '#B7E0BB' }}>INP 92ms</span>
        <span style={{ color: '#E8C579' }}>JS 87KB</span>
      </span>
    </div>
  )
}

/**
 * Layout — wraps every route. DOM order is intentional for accessibility:
 *
 *   1. <SkipToContent />  (first focusable; jumps to #main)
 *   2. <StatusStrip />    (24px mono band, top-of-page)
 *   3. <Navbar />
 *   4. <main id="main">{children}</main>
 *   5. <Footer />
 *
 * The optional `theme` prop is mirrored to `document.documentElement.dataset.theme`
 * on mount + change so the dark-mode token block in `src/index.css` activates.
 */
export function Layout({ children, theme }: LayoutProps) {
  useEffect(() => {
    if (!theme) return
    const root = document.documentElement
    const previous = root.dataset.theme
    root.dataset.theme = theme
    return () => {
      if (previous === undefined) {
        delete root.dataset.theme
      } else {
        root.dataset.theme = previous
      }
    }
  }, [theme])

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper)] text-[var(--color-ink)]">
      <SkipToContent />
      <StatusStripStub />
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer columns={DEFAULT_FOOTER_COLUMNS} legal={DEFAULT_LEGAL} />
    </div>
  )
}

export default Layout
