import { useEffect, type ReactNode } from 'react'
import { SkipToContent } from './SkipToContent'
import { Navbar, type NavbarProps } from './Navbar'
import { Footer } from './Footer'
import { COPY } from '@/content/copy'

export interface LayoutProps {
  children: ReactNode
  theme?: 'light' | 'dark'
  currentNav?: NavbarProps['current']
}

/**
 * Layout — wraps every route. DOM order:
 *   1. <SkipToContent />  (first focusable; jumps to #main)
 *   2. <Navbar />         (sticky, with availability dot)
 *   3. <main id="main">{children}</main>
 *   4. <Footer />
 *
 * The retro CLI status strip was dropped during the agency-aesthetic redesign
 * — availability now lives as a single dot + label inside the Navbar.
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
        colophon={COPY.footer.colophon}
      />
    </div>
  )
}

export default Layout
