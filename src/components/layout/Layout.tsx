import type { ReactNode } from 'react'
import { SkipToContent } from './SkipToContent'
import { Navbar, type NavbarProps } from './Navbar'
import { Footer } from './Footer'
import { COPY } from '@/content/copy'

export interface LayoutProps {
  children: ReactNode
  currentNav?: NavbarProps['current']
}

/**
 * Layout — wraps every route. DOM order:
 *   1. <SkipToContent />  (first focusable; jumps to #main)
 *   2. <Navbar />         (sticky, with availability dot + theme toggle)
 *   3. <main id="main">{children}</main>
 *   4. <Footer />
 *
 * Theme is driven globally by the user's ThemeToggle (in Navbar +
 * MobileDrawer) via `<html data-theme>` — there's no per-route override.
 * The previous `theme` prop has been removed; the pre-paint script in
 * index.html re-applies the saved choice before React mounts.
 */
export function Layout({ children, currentNav }: LayoutProps) {
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
