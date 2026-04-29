import { Route, Switch } from 'wouter'
import Home from './routes/Home'
import Work from './routes/Work'
import WorkDetail from './routes/WorkDetail'
import About from './routes/About'
import Contact from './routes/Contact'
import NotFound from './routes/NotFound'

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/work" component={Work} />
      <Route path="/work/:slug" component={WorkDetail} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  )
}
