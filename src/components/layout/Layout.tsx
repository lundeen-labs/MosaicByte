import { useEffect, type ReactNode } from 'react'
import { SkipToContent } from './SkipToContent'
import { Navbar, type NavbarProps } from './Navbar'
import { Footer } from './Footer'
import { StatusStrip } from '@/components/ui/StatusStrip'
import { COPY } from '@/content/copy'

export interface LayoutProps {
  children: ReactNode
  theme?: 'light' | 'dark'
  currentNav?: NavbarProps['current']
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
export function Layout({ children, theme, currentNav }: LayoutProps) {
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
      <StatusStrip
        available={COPY.status.available}
        slots={COPY.status.slots}
        week={COPY.status.week}
        rev={COPY.status.rev}
        metrics={COPY.status.metrics}
      />
      <Navbar current={currentNav} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer
        columns={COPY.footer.columns.map((c) => ({
          heading: c.heading,
          items: c.items.map((i) => ({ label: i.label, href: i.href })),
        }))}
        legal={COPY.footer.legal}
      />
    </div>
  )
}

export default Layout
