# GitHub Pages — research findings

Research conducted 2026-07-28 to diagnose and fix MosaicByte's GitHub Pages
mirror, which builds and deploys successfully but renders a 404 (Not Found)
page on every URL, including the homepage. Sources cited inline; all are
GitHub's own documentation unless marked otherwise.

## 1. Serving model: project sites live at a subpath

GitHub Pages has two site types ([About GitHub Pages][about]):

- **User/organization sites** — `https://<owner>.github.io`, one per account.
- **Project sites** — `https://<owner>.github.io/<repo>`, one per repository.

MosaicByte is a project site under the `lundeen-labs` org, so its real address
is `https://lundeen-labs.github.io/MosaicByte/` — every asset, route, and
internal link must account for that `/MosaicByte` prefix. This is the root
cause category: GitHub Pages does not rewrite anything to strip or add this
prefix. The application is fully responsible for being subpath-aware.

## 2. GitHub Pages is a static file server — no server-side rewrites

Confirmed across GitHub's docs and community discussions: Pages has no
mechanism to rewrite an incoming request path to `index.html` server-side
(no `vercel.json`-style rewrites, no nginx-style `try_files`). A request for
any path with no matching file on disk is a genuine miss, and GitHub Pages
falls back to serving whatever `404.html` exists at the site root — with an
HTTP 404 status code ([troubleshooting 404 errors][404-troubleshoot];
community discussion on the limitation ([Discussion #64096][disc-64096],
[Discussion #27676][disc-27676]).

This is *the* structural reason any client-side-routed (Wouter, React Router)
single-page application needs an explicit fallback strategy on Pages — the
gap that doesn't exist on Vercel (whose `vercel.json` rewrite handles it
transparently).

## 3. The critical mechanic: 404.html is served AT the original URL, not via a redirect

This is the load-bearing fact for the whole fix. When GitHub Pages can't find
a file, it serves `404.html`'s *content* while the browser's address bar and
`window.location.pathname` **keep the originally requested path** — there is
no HTTP redirect involved, only a 404 status code with substituted content
([Simon Willison's GitHub Pages notes][til-willison]; corroborated by
[Discussion #55673][disc-55673] and multiple community write-ups on the
404-fallback pattern).

Practical consequence: copying `dist/index.html` to `dist/404.html` (which
MosaicByte's `.github/workflows/pages.yml` already does) is sufficient by
itself — no query-string-encode-and-redirect trick (the more elaborate
[rafgraph/spa-github-pages][spa-ghpages] pattern, needed on hosts that
*do* 30x-redirect to the 404 page) is required here. The browser still shows
`/MosaicByte/about` in the address bar when 404.html's content loads, so a
subpath-aware client router reading `location.pathname` on mount will resolve
the correct route on its own.

**This is why MosaicByte's mirror 404s on literally every path including `/`:**
the 404.html fallback is correctly wired, but the client-side router itself
was never told about the `/MosaicByte` prefix, so even the preserved,
correct pathname fails to match any route once wouter tries to compare it
against `path="/"` etc.

## 4. Wouter's fix: the `Router` component's `base` prop

Wouter (the router this project uses) exposes exactly the mechanism needed —
a `base` prop on its `<Router>` component ([wouter README][wouter-readme]):

```jsx
import { Router, Route, Link } from "wouter";

const App = () => (
  <Router base="/app">
    <Link href="/users">Users</Link>
    <Route path="/users">The current path is /app/users!</Route>
  </Router>
);
```

Two things confirmed about scope:

- **Route matching** is base-relative: `path="/users"` matches the full
  pathname `/app/users` once `base="/app"` is set.
- **`<Link>` href generation** is also base-aware: `<Link href="/users">`
  inside that router renders an actual `href="/app/users"` in the DOM.

Critically, **this only covers wouter's own `<Route>`/`<Link>` machinery.**
It does nothing for a plain `<a href="/contact">` — that's a real, unmodified
browser anchor resolved against the domain root, completely bypassing
wouter's base-path awareness. MosaicByte has many of these (`copy.ts` hrefs
consumed as raw `<a>` tags in `HeroA`, `PricingTier`, `Home`, `About`,
`Contact`, `ErrorBoundary`, `Navbar`'s hash anchors, `MobileDrawer`) — each
one is an independent 404 on the Pages mirror even after `Router base` is
added, and each needs to either become a wouter `<Link>` or be manually
prefixed with `import.meta.env.BASE_URL` (which Vite sets to the resolved
`base` config value at build time — i.e. `/MosaicByte/` on the Pages build,
`/` on the Vercel build, so this stays correctly conditional without a new
env var).

## 5. GitHub Actions publishing vs. legacy branch-based publishing

Two publishing sources exist ([Configuring a publishing source][pub-source]):

- **Branch-based (legacy)**: push to a branch (optionally a `/docs` folder),
  GitHub runs Jekyll automatically and publishes the result. Simple, but no
  control over the build.
- **GitHub Actions (what MosaicByte uses)**: any workflow that ends by
  calling `actions/upload-pages-artifact` then `actions/deploy-pages`. Full
  control over the build step — this is required for a Vite/React app, since
  Jekyll cannot build it.

Requirements confirmed for the Actions path: a `github-pages` deployment
environment (auto-created if absent), `permissions: {pages: write, id-token:
write}`, and `actions/deploy-pages` being skipped on pull-request-triggered
runs (deploy jobs must run on push/dispatch, matching MosaicByte's existing
workflow trigger). All of this already matches `.github/workflows/pages.yml`.

## 6. Jekyll processing and `.nojekyll` — not required for this pipeline, cheap to add anyway

Jekyll, when it runs, silently excludes files/folders starting with `_`, `.`,
or `#` from the published output ([About GitHub Pages and Jekyll][jekyll]).
The `.nojekyll` empty marker file disables that processing.

For MosaicByte specifically: **Jekyll never runs in this pipeline at all.**
Jekyll processing is only triggered by the legacy branch-based publishing
source (which runs it automatically) or by an explicit
`actions/jekyll-build-pages` step. MosaicByte's workflow calls
`actions/upload-pages-artifact` directly on the Vite `dist/` output with no
Jekyll step in between, so nothing in the pipeline ever touches or excludes
underscore-prefixed files. `.nojekyll` is therefore not required today.

It's still worth adding as zero-cost insurance: `upload-pages-artifact`
includes dotfiles in the artifact by default (excluding only `.git`/`.github`),
so a stray future underscore-prefixed asset folder (some bundler plugins do
emit e.g. `_astro/`-style directories) would silently vanish if the publishing
source were ever switched back to branch-based. Recommendation: add an empty
`public/.nojekyll` so Vite copies it into every build's `dist/` verbatim —
harmless now, prevents a confusing future regression.

## 7. Custom domains (not currently applicable, noted for completeness)

Adding a custom domain to a GitHub Pages project site is done via a `CNAME`
file at the repository root ([Managing a custom domain][custom-domain]).
Once a custom domain is attached, **the site serves from the domain root**,
not `/<repo>/` — meaning `base` would need to become `/` again, exactly like
the Vercel build. MosaicByte has no custom domain configured for the Pages
mirror today (confirmed: no `CNAME` file in `public/`), so this doesn't
currently apply, but it's the reason the `base` path must stay
conditional/build-mode-driven rather than hardcoded — a future custom-domain
switch would need the same `base: '/'` the Vercel build already uses.

## Summary — what actually needs to change

1. Wrap the app root in `<Router base={import.meta.env.BASE_URL}>` (Wouter) —
   fixes route matching AND any existing `<Link>` usage (e.g. `Footer.tsx`,
   already built correctly) automatically.
2. Convert every plain `<a href="/...">` internal navigation to wouter
   `<Link>`, or prefix with `import.meta.env.BASE_URL` where `<Link>` can't be
   used (hash-anchor scroll targets like `/#process`).
3. Template `public/robots.txt`'s `Sitemap:` line the same way
   `scripts/generate-sitemap.mjs` already templates its own output, instead of
   shipping a static Vercel-hardcoded URL.
4. Add an empty `public/.nojekyll` (defensive, not currently required).
5. No change needed to the existing `dist/index.html` → `dist/404.html` copy
   step — confirmed architecturally correct and sufficient as-is (§3).

[about]: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
[pub-source]: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
[jekyll]: https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll
[custom-domain]: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
[404-troubleshoot]: https://docs.github.com/ja/github-ae@latest/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites
[disc-64096]: https://github.com/orgs/community/discussions/64096
[disc-27676]: https://github.com/orgs/community/discussions/27676
[disc-55673]: https://github.com/orgs/community/discussions/55673
[til-willison]: https://til.simonwillison.net/github/github-pages
[spa-ghpages]: https://github.com/rafgraph/spa-github-pages
[wouter-readme]: https://github.com/molefrog/wouter
