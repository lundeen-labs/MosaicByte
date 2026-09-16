import { Route, Switch } from 'wouter'

import Home from './routes/Home'
import Work from './routes/Work'
import About from './routes/About'
import Contact from './routes/Contact'
import Privacy from './routes/Privacy'
import NotFound from './routes/NotFound'
// /work/:slug deleted with the rebrand (2026-05-26) — Mosaic Byte has no real
// case studies yet, and the Work page is now an honest "in flight" notice.

export default function App() {
  return (
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/work" component={Work} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route component={NotFound} />
      </Switch>
  )
}
