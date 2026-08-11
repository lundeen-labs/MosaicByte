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
| Router | wouter (client-side, 6 lazy routes) | 3.5 |
| Animation | Framer Motion (tree-shaken out of the eager bundle; hero uses CSS keyframes) | 12.38 |
| 3D (available) | three + @react-three/fiber + drei | 0.183 / 9.5 / 10.7 |
| UI primitives | Radix UI (accordion, dialog, popover, tabs, tooltip, slot) | 1.x |
| Icons | lucide-react | 0.500 |
| Class utils | clsx + tailwind-merge (`cn()`) | 2.1 / 3.0 |
| State | zustand | 5.0 |
| Tests | Vitest + Testing Library + jsdom | 2.1 / 16.x / 25 |
| Lint | ESLint + typescript-eslint + react-hooks/react-refresh plugins | 9.39 / 8.57 |
| Fonts | DM Serif Display + DM Mono (Google Fonts) | — |
| Hosting | GitHub Pages | — |

Head tags (title / meta / link / JSON-LD) are rendered as JSX and hoisted natively by React 19 — there is no `react-helmet-async`, so plain `npm install` works with no `--legacy-peer-deps` flag.

## Project layout

```
src/
  App.tsx              wouter <Switch> over 6 lazy routes
  main.tsx             root render
  index.css            Tailwind v4 @theme tokens (paper/ink + Mosaic Byte accents); light + dark
  components/
    ErrorBoundary.tsx  root error boundary
    hero/              HeroA — split editorial layout + animated mosaic tile grid (+ test)
    ui/                Badge · Button · FAQAccordion · PricingTier · ProcessTimeline · ThemeToggle
    layout/            SkipToContent · Navbar (lazy-mounts MobileDrawer) · MobileDrawer · Footer · Layout
  routes/              Home · Work · About · Contact · Privacy · NotFound  (all lazy)
  content/copy.ts      every visible string — single source of truth
  lib/                 utils (cn) · seo / seo-data (JSON-LD) · theme (light/dark/system hook) · reduced-motion
  test/setup.ts        Vitest + jest-dom setup
scripts/
  generate-sitemap.mjs runs at build time -> dist/sitemap.xml (5 routes)
public/                favicon.svg · robots.txt
docs/                  improvement-roadmap.md · competitive-edge.md · project-audit.md
```

Tooling configs: `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, and a TypeScript project-references set (`tsconfig.json` → `tsconfig.app.json` / `tsconfig.node.json`). `@/*` is aliased to `src/*`.

## Getting started

```bash
npm install            # plain install — no peer-dep flag needed
npm run dev            # vite dev server -> http://localhost:5173
npm run build          # tsc -b && vite build && node scripts/generate-sitemap.mjs -> dist/
npm run preview        # serve dist/ on http://localhost:4173
npm run lint           # eslint .
npm test               # vitest run (58 tests across 9 files)
npm run test:watch     # vitest in watch mode
npm run test:ui        # vitest --ui dashboard
```

`npx tsc --noEmit` for a standalone type-check.

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
| Initial JS gzip (any route) | < 150 KB (currently ~152 KB — within ~2 KB) |

Non-negotiable UX rules: visible focus ring on every interactive element, `prefers-reduced-motion` respected on all motion, full keyboard reachability in DOM order, labeled form inputs, titled/`aria-label`led semantic SVGs, and a skip-to-content link as the first focusable element.

## Deploy

Hosted on GitHub Pages via GitHub Actions (`.github/workflows/pages.yml`). Deployments happen automatically on push to `main`. 

See `DEPLOY.md` for information on setting up custom domains and DNS.

## Status

- Scaffold, hero, UI library, layout, pages, copy, SEO (per-route head tags + JSON-LD + sitemap + robots) are all complete.
- Light/dark/system theme toggle shipped (persisted in `localStorage` under `mosaic-theme`, OS-default, FOUC-guarded by an inline script in `index.html`).
- Rebranded from "Lundeen Studio" to Mosaic Byte (2026-05-26): fictional case studies and invented stats removed, `/work` is an honest "taking our first clients" notice, and tool/stack name-drops stripped in favor of selling the practice.
- 58 Vitest tests pass; tsc + ESLint clean; build emits `dist/` + `sitemap.xml` + `robots.txt` + `favicon.svg`.

GitHub repo: `lundeen-labs/mosaicbyte`. The original static-HTML prototype lives at `lundeej/mosaicbyte`, preserved as a design reference.

## Documentation

- `CLAUDE.md` — agent operating notes + rebrand change log
- `DEPLOY.md` — deployment information
- `docs/improvement-roadmap.md` — audit findings + P0/P1/P2 backlog
