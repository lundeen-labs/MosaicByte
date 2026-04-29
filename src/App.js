import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Switch } from 'wouter';
import Home from './routes/Home';
import Work from './routes/Work';
import WorkDetail from './routes/WorkDetail';
import About from './routes/About';
import Contact from './routes/Contact';
import NotFound from './routes/NotFound';
export default function App() {
    return (_jsxs(Switch, { children: [_jsx(Route, { path: "/", component: Home }), _jsx(Route, { path: "/work", component: Work }), _jsx(Route, { path: "/work/:slug", component: WorkDetail }), _jsx(Route, { path: "/about", component: About }), _jsx(Route, { path: "/contact", component: Contact }), _jsx(Route, { component: NotFound })] }));
}
