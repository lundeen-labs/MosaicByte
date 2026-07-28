import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Router } from 'wouter'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

// Vite's BASE_URL always carries a trailing slash ('/' on Vercel, '/MosaicByte/'
// on the GitHub Pages build — see vite.config.ts's GITHUB_PAGES switch). Wouter's
// Router `base` prop does a plain string-prefix strip against location.pathname
// and does NOT special-case a trailing slash the way Vite's `base` config does:
// passing '/MosaicByte/' verbatim strips the boundary slash along with the
// prefix, turning '/MosaicByte/about' into the relative path 'about' (no
// leading slash) instead of '/about'. regexparam compiles every `<Route
// path="/about">` pattern as `^\/about\/?$`, which requires that leading
// slash, so the un-stripped base would leave every non-root route 404ing even
// after adding this Router (only '/' would accidentally still match). Stripping
// the trailing slash first ('/MosaicByte') keeps the leading slash on the
// remainder, and is a no-op on the root deploy ('/'.replace(/\/$/, '') === '').
const ROUTER_BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Router wraps ErrorBoundary (not the reverse) so that even the
        error-fallback UI — rendered in place of a crashed <App /> — still sits
        inside the routing context and can use wouter's <Link> correctly. */}
    <Router base={ROUTER_BASE}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Router>
    {/* Real-user Core Web Vitals (LCP/INP/CLS) — the data source behind the
        status-strip metrics. Cookieless; renders nothing. */}
    <SpeedInsights />
  </StrictMode>
)
