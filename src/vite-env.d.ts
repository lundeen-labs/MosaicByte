/// <reference types="vite/client" />

/**
 * Cloudflare Turnstile explicit-render API surface.
 * The script is loaded in index.html with ?render=explicit; the widget is
 * rendered programmatically from src/routes/Contact.tsx because the form is a
 * lazily mounted route (implicit auto-scan cannot see post-load elements).
 */
interface TurnstileRenderOptions {
  sitekey: string
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
  'timeout-callback'?: () => void
  theme?: 'light' | 'dark' | 'auto'
  appearance?: 'always' | 'execute' | 'interaction-only'
  action?: string
}

interface Turnstile {
  render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string
  remove: (widgetId: string) => void
  reset: (widgetId?: string) => void
  ready: (callback: () => void) => void
}

interface Window {
  turnstile?: Turnstile
}
