import { cn } from '@/lib/utils'

/**
 * SkipToContent — first focusable element on every page.
 *
 * Visually-hidden by default (clipped + 1px). When focused via keyboard, jumps
 * to the top-left as a rust banner so a keyboard / screen-reader user can
 * bypass the Navbar and StatusStrip and land on `<main id="main">`.
 *
 * Must be the first child of <Layout> in DOM order so Tab from page load
 * lands here.
 */
export function SkipToContent() {
  return (
    <a
      href="#main"
      className={cn(
        // Visually hidden when not focused
        'absolute left-[-9999px] top-auto h-px w-px overflow-hidden',
        // When focused, become a fixed rust banner top-left
        'focus:fixed focus:left-0 focus:top-0 focus:z-[100] focus:h-auto focus:w-auto focus:overflow-visible',
        'focus:bg-[var(--color-rust)] focus:text-[var(--color-paper)]',
        'focus:px-[var(--spacing-s4)] focus:py-[var(--spacing-s3)]',
        'focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.08em] focus:font-medium',
        'focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-ink)]',
        'focus:no-underline',
      )}
    >
      Skip to content
    </a>
  )
}

export default SkipToContent
