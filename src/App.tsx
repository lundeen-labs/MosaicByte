import { lazy, Suspense } from 'react'
import { Route, Switch } from 'wouter'

const Home = lazy(() => import('./routes/Home'))
const Work = lazy(() => import('./routes/Work'))
const About = lazy(() => import('./routes/About'))
const Contact = lazy(() => import('./routes/Contact'))
const Privacy = lazy(() => import('./routes/Privacy'))
const NotFound = lazy(() => import('./routes/NotFound'))
// /work/:slug deleted with the rebrand (2026-05-26) — Mosaic Byte has no real
// case studies yet, and the Work page is now an honest "in flight" notice.

function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]"
    >
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/work" component={Work} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  )
}
