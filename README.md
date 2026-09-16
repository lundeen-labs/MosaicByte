# Mosaic Byte

Marketing site for **Mosaic Byte** — a small digital studio in Mount Vernon, WA, designing brand systems and conversion-focused landing pages for small teams. The site is the demo: it ships strict Core Web Vitals / Lighthouse budgets and sells the practice, not a tool stack.

React 19 + Vite single-page app hosted on GitHub Pages. Design + brand direction by Jesenia Lundeen; site engineering by Tyler Lundeen.

## Tech stack

| Layer | Choice | Version |
|---|---|---|
| UI | React + React DOM | 19.2 |
| Language | TypeScript | 5.9 |
| Build | Vite (Rolldown) | 8.0 |
| Styling | Tailwind CSS (`@tailwindcss/vite`, CSS-first `@theme`) | 4.2 |
| Router | wouter (client-side) | 3.9 |
| UI primitives | Radix UI - accordion, dialog, slot | 1.x |
| Icons | lucide-react | 0.500 |
| Class utils | clsx + tailwind-merge (`cn()`) | 2.1 / 3.5 |
| Prerender | Puppeteer (build-time DOM snapshot per route) | 25.11 |
| Unit tests | Vitest + Testing Library + jsdom | 2.1 / 16.x / 25 |
| End-to-end tests | Playwright + @axe-core/playwright | 1.63 / 4.13 |
| Lint | ESLint + typescript-eslint + react-hooks/react-refresh | 9.39 / 8.59 |
| Fonts | DM Serif Display + DM Mono (Google Fonts) | - |
| Hosting | GitHub Pages (static, no server) | - |

There is no backend. The contact page opens the visitor's own mail client against
`COPY.contact.email`. No analytics, no cookies beyond the theme preference in
`localStorage`, and no third-party scripts at all.

**Removed 2026-09-16** as unused: `framer-motion`, `three`, `@react-three/fiber`,
`@react-three/drei`, `@mdx-js/react`, `@mdx-js/rollup`, `@types/mdx`, `zustand`,
`zod`, and the popover/tabs/tooltip Radix primitives. None were imported
anywhere; dropping them took `node_modules` from 449 MB to 269 MB. Cloudflare
Turnstile came out of `index.html` at the same time - it loaded on every page for
a form that no longer exists.

Head tags (title / meta / link / JSON-LD) are rendered as JSX and hoisted natively
by React 19 - there is no `react-helmet-async`, so plain `npm install` works with
no `--legacy-peer-deps` flag.

## Project layout

```
src/
  App.tsx              wouter <Switch> over 6 routes
  main.tsx             root render; drops the prerendered SEO tags before mounting
  index.css            Tailwind v4 @theme tokens (paper/ink + Mosaic Byte accents); light + dark
  components/
    ErrorBoundary.tsx  root error boundary
    hero/              HeroA - split editorial layout + animated mosaic tile grid (+ test)
    ui/                Badge, Button, FAQAccordion, PricingTier, ProcessTimeline, ThemeToggle
    layout/            SkipToContent, Navbar (lazy-mounts MobileDrawer), MobileDrawer, Footer, Layout
  routes/              Home, Work, About, Contact, Privacy, NotFound
  content/copy.ts      every visible string - single source of truth
  lib/                 utils (cn), seo / seo-data (JSON-LD), theme hook, reduced-motion
  test/setup.ts        Vitest + jest-dom setup
e2e/                   Playwright suite (see "Testing" below)
  fixtures/site.ts     route manifest, budgets, axe + console + animation helpers
  static-server.mjs    serves dist/ with GitHub Pages file-resolution rules
  *.spec.ts            routing, features, seo, accessibility, performance, responsive, visual
  visual.spec.ts-snapshots/   committed screenshot baselines
scripts/
  routes.mjs           the route inventory, shared by all three build scripts
  prerender.mjs        per-route DOM snapshots -> dist/<route>/index.html + 404.html
  generate-og.mjs      per-route 1200x630 share cards -> dist/og/*.png
  generate-sitemap.mjs dist/sitemap.xml + dist/robots.txt
public/                favicon.svg, CNAME, .nojekyll
docs/                  architecture.html (the stack, layer by layer), glossary.html (237 terms),
                       improvement-roadmap.md,
                       competitive-edge.md, project-audit.md, github-pages-research.md
```

Tooling configs: `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, and a TypeScript project-references set (`tsconfig.json` → `tsconfig.app.json` / `tsconfig.node.json`). `@/*` is aliased to `src/*`.

## Getting started

```bash
npm install            # plain install - no peer-dep flag needed
npm run dev            # vite dev server -> http://localhost:5173
npm run build          # tsc -b && vite build && prerender && og cards && sitemap -> dist/
npm run preview        # serve dist/ on http://localhost:4173
npm run lint           # eslint .
npm test               # vitest run (48 unit tests across 8 files)
npm run test:e2e       # build, then playwright test (790 checks across 5 browser projects)
npm run test:e2e:ui    # playwright --ui, for stepping through a failure
npm run test:e2e:update  # re-baseline the visual snapshots, deliberately
npm run test:e2e:report  # open the last HTML report
npm run test:all       # lint + tsc + unit + e2e, the same gate CI runs
```

`npx tsc --noEmit` for a standalone type-check.

## Testing

Two layers with different jobs.

**Unit - Vitest, `src/**/__tests__`.** Component behaviour in jsdom. Fast, run on
every save. `vitest.config.ts` restricts collection to `src/`, because the e2e
specs share the `*.spec.ts` name but need a real browser.

**End-to-end - Playwright, `e2e/`.** Runs against the *production build*, served
by `e2e/static-server.mjs`, which reproduces GitHub Pages' resolution rules
(exact file -> directory index -> `.html` -> `404.html` at status 404). A dev
server cannot tell you whether the prerendered files, the hashed asset graph or
the real 404 behaviour work, so the suite never uses one.

| Spec | Covers |
|---|---|
| `routing.spec.ts` | every route at 200, prerendered markup with JS disabled, real 404 status, SPA navigation without reload, back/forward, every internal link and hash target resolves |
| `features.spec.ts` | theme cycle + persistence + no-flash, mobile drawer focus trap / Escape / lazy chunk, FAQ accordion, pricing tiers vs `COPY`, process steps, contact mailto |
| `seo.spec.ts` | one title/canonical/description per page, unique descriptions, full OG + Twitter set, the share images actually resolve, JSON-LD parses, `priceRange` brackets the real tiers, sitemap matches the routes, robots is sane, heading outline unbroken |
| `accessibility.spec.ts` | axe WCAG 2.0/2.1 A + AA on every route in both themes and on the open drawer, skip link on first tab stop, CTA keyboard reachability, visible focus indicators, landmarks, reduced-motion honoured |
| `performance.spec.ts` | initial JS/CSS gzip budgets with a per-chunk breakdown, request count, CLS, LCP and which element is the LCP, no console errors or failed requests on any route, no hydration error, images reserve space |
| `responsive.spec.ts` | six viewports including 767/768 either side of the `md` breakpoint - no horizontal overflow (naming the offending element), nav collapse, tap-target size, zoom not disabled |
| `visual.spec.ts` | full-page baselines per route x theme x desktop/mobile, plus header, footer, pricing, open drawer and the focused skip link |

Browser matrix: Chromium desktop + mobile, Firefox, WebKit, Mobile Safari.
Performance and visual specs are Chromium-only - LCP/CLS come from
PerformanceObserver entry types the other engines do not implement, and
per-engine font rasterisation would need three sets of pixel baselines that
differ for reasons nobody would act on.

Sixteen keyboard tests are skipped on WebKit and Mobile Safari, with the reason
recorded in the spec: Safari does not move focus to links with Tab unless the
user enables Full Keyboard Access, so on those engines the assertions measure a
Safari setting rather than anything about this site. The same journeys run on
Chromium and Firefox.

`responsive.spec.ts` does not run on the two device-emulated projects. Setting a
1920x1080 viewport on a browser that also reports `isMobile` and a touch screen
describes a device that does not exist, and the repeated resizes under WebKit
mobile emulation were the suite's only flake. The matrix already covers phone
widths itself.

Current: **48 unit tests and 774 end-to-end checks pass, 0 failures** (plus 16 documented skips).

Visual snapshots are a **local** gate. The committed baselines are `-win32`,
taken on the dev machine, so on the Linux CI runner Playwright would not find
them, would silently write new ones and pass - reading as covered while
comparing nothing. `ignoreSnapshots` is therefore on in CI, and every other
spec still runs there. Generating Linux baselines in a container would let CI
gate on them too.

A failing visual test is a prompt to look, not automatically a bug. Open the
report, compare, then either fix the regression or re-baseline deliberately.

## Performance gates

The status strip publishes real metrics, so the budgets below are treated as production data — a regression breaks the positioning.

| Metric | Gate |
|---|---|
| LCP (mobile, real-user) | ≤ 1.5s (target 0.8s) |
| INP (real-user) | ≤ 150ms (target 100ms) |
| CLS | ≤ 0.05 |
| Lighthouse Performance (desktop, prod) | ≥ 95 |
| Lighthouse Accessibility | 100 (WCAG 2.1 AA) |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | 100 |
| Initial JS gzip (any route) | < 150 KB — **currently 87.5 KiB**, measured, 62.5 KiB spare |

Non-negotiable UX rules: visible focus ring on every interactive element, `prefers-reduced-motion` respected on all motion, full keyboard reachability in DOM order, labeled form inputs, titled/`aria-label`led semantic SVGs, and a skip-to-content link as the first focusable element.

## Deploy

Hosted on GitHub Pages via GitHub Actions (`.github/workflows/pages.yml`). Deployments happen automatically on push to `main`. 

See `DEPLOY.md` for information on setting up custom domains and DNS.

## Status

Live at **https://www.mosaicbyte.design** (the apex 301-redirects to `www`).

- Scaffold, hero, UI library, layout, pages, copy and SEO are complete.
- Light/dark/system theme toggle (persisted under `mosaic-theme`, OS default,
  FOUC-guarded by an inline script in `index.html`).
- Rebranded from "Lundeen Studio" to Mosaic Byte (2026-05-26): fictional case
  studies and invented stats removed, `/work` is an honest "taking our first
  clients" notice, tool name-drops replaced by selling the practice.
- Build-time prerendering: every route ships real HTML for crawlers, with a
  genuine 404 page served at a 404 status.
- Per-route Open Graph cards generated from the site's own design tokens.
- WCAG 2.1 AA verified by axe on every route in both themes, not asserted.
- 48 unit tests and 774 end-to-end checks pass; tsc and ESLint clean. CI runs
  all of it before anything publishes.

GitHub repo: `lundeen-labs/MosaicByte`. The original static-HTML prototype lives
at `lundeej/mosaicbyte`, preserved as a design reference.

## Documentation

- `CLAUDE.md` — agent operating notes + rebrand change log
- `DEPLOY.md` — deployment information
- `docs/architecture.html` — **the stack, layer by layer**: what each choice does here, why it
  was made, what was rejected and what it costs, plus an interactive diagram of the build and
  delivery pipeline. Open it in a browser.
- `docs/glossary.html` — **237 terms in plain English**, each with a note on what it points at in
  this codebase specifically. Searchable, filterable by category, cross-linked. The companion to
  the architecture doc.
- `docs/improvement-roadmap.md` — audit findings + P0/P1/P2 backlog
