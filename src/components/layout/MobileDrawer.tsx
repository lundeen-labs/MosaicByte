import * as Dialog from '@radix-ui/react-dialog'
import { Link } from 'wouter'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COPY } from '@/content/copy'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export interface MobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nav: { label: string; href: string }[]
}

/**
 * MobileDrawer — full-height drawer that slides from the right on viewports
 * below 768px. Built on Radix Dialog so focus trap, ESC dismiss, and overlay
 * dismiss come for free.
 *
 * Renders the same nav links as Navbar plus the primary "Free audit" CTA.
 * Hash links (containing `#`) use plain <a>; SPA links use Wouter `<Link>`.
 */
export function MobileDrawer({ open, onOpenChange, nav }: MobileDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50',
            'bg-[rgba(23,20,19,0.45)]',
            'data-[state=open]:animate-in data-[state=open]:fade-in',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out',
          )}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed right-0 top-0 z-50 h-full w-full max-w-[360px]',
            'bg-[var(--color-paper)] text-[var(--color-ink)]',
            'border-l border-[var(--color-paper-3)]',
            'flex flex-col',
            'shadow-[-8px_0_24px_-12px_rgba(23,20,19,0.25)]',
            'focus:outline-none',
          )}
        >
          <Dialog.Title className="sr-only">Mobile navigation</Dialog.Title>
          <div className="flex items-center justify-between border-b border-[var(--color-paper-3)] px-[var(--spacing-s5)] py-[var(--spacing-s4)]">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]" aria-hidden="true">
              Menu
            </span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Dialog.Close
                aria-label="Close menu"
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center',
                  'rounded-[var(--radius-r2)] border border-[var(--color-ink)]',
                  'text-[var(--color-ink)] transition-colors duration-[180ms]',
                  'hover:text-[var(--color-rust)] hover:border-[var(--color-rust)]',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
                )}
              >
                <X size={18} strokeWidth={1.5} aria-hidden="true" />
              </Dialog.Close>
            </div>
          </div>

          <nav
            aria-label="Mobile primary"
            className="flex flex-1 flex-col gap-[var(--spacing-s3)] px-[var(--spacing-s5)] py-[var(--spacing-s6)]"
          >
            {nav.map((item, idx) => {
              const num = String(idx + 1).padStart(2, '0')
              const isHash = item.href.includes('#')
              const className = cn(
                'group flex items-baseline gap-[var(--spacing-s3)]',
                'border-b border-[var(--color-paper-3)] py-[var(--spacing-s3)]',
                'font-display text-[1.75rem] leading-none tracking-[-0.02em] text-[var(--color-ink)]',
                'transition-colors duration-[180ms] hover:text-[var(--color-rust)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
              )
              const content = (
                <>
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)] group-hover:text-[var(--color-rust)]">
                    {num}
                  </span>
                  <span>{item.label}</span>
                </>
              )
              if (isHash) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={className}
                    onClick={() => onOpenChange(false)}
                  >
                    {content}
                  </a>
                )
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={className}
                  onClick={() => onOpenChange(false)}
                >
                  {content}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-[var(--color-paper-3)] px-[var(--spacing-s5)] py-[var(--spacing-s5)]">
            <a
              href={COPY.nav.primaryCta.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2',
                'bg-[var(--color-rust)] text-[var(--color-paper)]',
                'border-[1.5px] border-[var(--color-ink)]',
                'rounded-[var(--radius-r2)]',
                '[box-shadow:0_2px_0_var(--color-ink),0_0_0_1.5px_var(--color-ink)]',
                'px-[22px] py-[14px] font-body font-semibold text-base',
                'transition-[transform,background] duration-[180ms]',
                'hover:bg-[var(--color-rust-2)] hover:translate-y-px',
                'active:translate-y-[2px]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]',
              )}
            >
              {COPY.nav.primaryCta.label}
              <span
                aria-hidden="true"
                className="inline-block rounded-[var(--radius-r1)] border border-[var(--color-paper)]/40 px-[5px] py-[1px] font-mono text-[10px] tracking-[0.04em]"
              >
                ↵
              </span>
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default MobileDrawer
