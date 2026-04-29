import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary — catches render errors below it. Wraps the entire app
 * in `main.tsx` so a single component crash never blanks the page.
 *
 * Logs to console.error in dev. In production we pass through to whatever
 * error tracker is wired (Sentry/PostHog etc) — currently none, by design.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback) return this.props.fallback
    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-start justify-center gap-[var(--spacing-s5)] bg-[var(--color-paper)] px-[var(--spacing-s7)] py-[var(--spacing-s8)] text-[var(--color-ink)]"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-rust)]">
          STATUS: ERROR · COMPONENT TREE FAULTED
        </span>
        <h1 className="font-display text-[3rem] leading-[1.04] tracking-[-0.025em] text-[var(--color-ink)]">
          Something rendered wrong.
        </h1>
        <p className="max-w-[60ch] text-[var(--color-ink-2)]">
          A component on this page threw before the studio could mount. Refreshing usually clears it. If it does not, email tyler.lundeen1995@gmail.com — include the URL.
        </p>
        <pre className="max-w-full overflow-x-auto border border-[var(--color-paper-3)] bg-[var(--color-paper-2)] p-[var(--spacing-s4)] font-mono text-[12px] text-[var(--color-ink-2)]">
          {String(this.state.error)}
        </pre>
        <a
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-rust)] hover:text-[var(--color-rust-2)]"
        >
          ← Back to home
        </a>
      </div>
    )
  }
}

export default ErrorBoundary
