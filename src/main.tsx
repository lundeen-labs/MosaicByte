import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Router } from 'wouter'
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

/**
 * Hand the <head> back to React before it mounts.
 *
 * scripts/prerender.mjs stamps `data-prerendered-seo` on every head tag that
 * src/lib/seo.tsx produced, because the prerendered file is a DOM snapshot
 * rather than React SSR output: React has no hydration record for those nodes,
 * so it appended a second copy of each one and reported a hydration mismatch
 * that discarded the prerendered tree. Removing them here means a JS-less
 * crawler still reads them from the served HTML, while a real browser ends up
 * with exactly one of each — React's own.
 */
document.querySelectorAll('[data-prerendered-seo]').forEach((el) => el.remove())

const rootElement = document.getElementById('root')!
const app = (
  <StrictMode>
    {/* Router wraps ErrorBoundary (not the reverse) so that even the
        error-fallback UI — rendered in place of a crashed <App /> — still sits
        inside the routing context and can use wouter's <Link> correctly. */}
    <Router base={ROUTER_BASE}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Router>
  </StrictMode>
)

/**
 * Always createRoot — never hydrateRoot, even though dist/ ships prerendered
 * markup.
 *
 * What scripts/prerender.mjs writes is a DOM *snapshot* taken out of a real
 * browser, not React SSR output, and the two are not interchangeable. React
 * separates adjacent text nodes in server output with `<!-- -->` markers so it
 * can rebuild the same text-node boundaries on the client; a snapshot has no
 * such markers, so the parser merges `{a}{' '}{b}` into one text node where
 * React expects three. That is unfixable from the snapshot side and it made
 * every route throw hydration error #418, on which React discards the
 * prerendered tree and re-renders anyway — the same work as createRoot, plus a
 * console error and a wasted hydration pass.
 *
 * So the prerendered HTML is treated as what it actually is: real markup for
 * crawlers and for first paint, which React then replaces with an identical
 * tree. e2e/routing.spec.ts asserts the served HTML still carries each route's
 * real content, and e2e/performance.spec.ts asserts no hydration error.
 *
 * The fix for genuine hydration is a real SSR build (renderToPipeableStream)
 * rather than a Puppeteer snapshot — tracked in docs/improvement-roadmap.md.
 */
createRoot(rootElement).render(app)
