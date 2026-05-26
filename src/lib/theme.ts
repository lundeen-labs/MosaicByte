import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

/**
 * Theme system — light / dark / system (default).
 *
 * - `light` and `dark` are explicit user overrides, persisted to localStorage
 *   under `mosaic-theme`, and applied via `<html data-theme="…">`.
 * - `system` removes the attribute and lets `@media (prefers-color-scheme:
 *   dark)` in src/index.css decide. Removing the localStorage key signals
 *   "follow system."
 * - FOUC is prevented by the inline pre-paint script in index.html, which
 *   reapplies the explicit override before React mounts.
 * - `resolvedTheme` is derived during render. When in `system` mode it tracks
 *   the OS preference live via `useSyncExternalStore` (cleaner than calling
 *   setState in an effect; the rule react-hooks/set-state-in-effect flags
 *   the latter for good reason).
 */

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'mosaic-theme'

function readStored(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* localStorage blocked (private mode, cookie restrictions) — fall back */
  }
  return 'system'
}

function applyAttribute(theme: Theme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'system') {
    delete root.dataset.theme
  } else {
    root.dataset.theme = theme
  }
}

function persist(theme: Theme): void {
  if (typeof window === 'undefined') return
  try {
    if (theme === 'system') window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* localStorage blocked — choice is in-memory for this session only */
  }
}

/** Subscribe to OS prefers-color-scheme; SSR-safe + matchMedia-safe. */
function subscribeSystem(notify: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', notify)
  return () => mq.removeEventListener('change', notify)
}

function getSystemSnapshot(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getServerSnapshot(): boolean {
  return false // SSR: assume light; client hydrates to the real value
}

export interface UseThemeReturn {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (next: Theme) => void
  cycleTheme: () => void
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(() => readStored())

  // Subscription-driven: re-renders when OS preference changes, but only
  // matters when the user is in `system` mode (we read it conditionally
  // below). No setState-in-effect.
  const systemDark = useSyncExternalStore(subscribeSystem, getSystemSnapshot, getServerSnapshot)

  // Side-effect: mirror the current theme onto <html data-theme>. The
  // pre-paint script in index.html handles the initial paint; this keeps
  // the attribute in sync after user toggles.
  useEffect(() => {
    applyAttribute(theme)
  }, [theme])

  // Derived during render — single source of truth for "what palette is
  // actually showing." `system` resolves via the live matchMedia store.
  const resolvedTheme: ResolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    persist(next)
  }, [])

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system'
      persist(next)
      return next
    })
  }, [])

  return { theme, resolvedTheme, setTheme, cycleTheme }
}
