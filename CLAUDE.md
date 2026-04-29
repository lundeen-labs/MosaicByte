# Lundeen Studio — Agent Notes

Production marketing site for the Lundeen Studio brand. Single source of truth for the implementation plan: `C:\tmp\lundeen-studio-research\phase-c-task-graph.md`.

## Project root

`E:\source\repos\lundeen-studio` — always use absolute Windows paths.

## Wave status

- D0 (scaffold): COMPLETE.
- D1-D4 (parallel build): COMPLETE — hero, ui library (13 components), layout (5 components), api (Zod+Turnstile+Resend+rate-limit).
- D5+D7 (pages + copy): COMPLETE — 6 production routes wired to copy.ts; lazy-loaded.
- D6 (MDX case studies): DEFERRED — substituted with inline-data WorkDetail.tsx. Migrate when richer authoring is needed.
- D8 (SEO): COMPLETE — per-route Seo helmet wrapper, JSON-LD (Person/ProfessionalService/FAQPage), sitemap generator, robots.txt, SVG favicon.
- D9 (polish): PARTIAL — ErrorBoundary at root, usePrefersReducedMotion hook. Theme toggle UI deferred.
- E1+E2 (audit): COMPLETE — see `C:\tmp\lundeen-studio-research\phase-e-audit-report.md`. All gates pass except raw-bundle (gzip clears at 142KB; raw 447KB documented deviation due to Radix Dialog + Framer Motion).
- F1 (Vercel deploy): BLOCKED on Tyler. See `DEPLOY.md` for the manual deploy steps.

87 vitest tests pass. tsc and eslint clean. Build emits dist/ + sitemap.xml + robots.txt + favicon.svg.

## Bundle (post-Wave-4)

| Chunk | Raw | Gzip |
|---|---|---|
| index.js (entry) | 214 KB | 69 KB |
| seo.js (Layout + Nav + Footer + StatusStrip + Seo + COPY) | 207 KB | 66 KB |
| Home.js | 26 KB | 8 KB |
| WorkDetail.js | 12 KB | 4 KB |
| Contact.js | 5 KB | 2 KB |
| Work.js | 4 KB | 2 KB |
| Button.js (shared) | 3 KB | 1 KB |
| About.js | 2 KB | 1 KB |
| NotFound.js | 1 KB | 1 KB |

Initial-load Home: 447 KB raw / 142 KB gzip. Gate: <200 KB raw (FAIL, deferred) / <150 KB gzip (PASS).

## Architecture

```
src/
  components/
    hero/         (D1) HeroA / HeroB + chart + gauge
    ui/           (D2, D9) Component library
    layout/       (D3) Shell + Navbar + Footer + MobileDrawer
    case-study/   (D6) MDX renderer + section components
  routes/         (D0 stubs -> D5 production -> D8 +Seo -> D9 NotFound)
  lib/            cn() helper (D0); seo, analytics, theme, reduced-motion (D8/D9)
  content/        copy.ts (D7)
  test/           Vitest setup
api/              (D4) Vercel serverless: contact.ts + _lib (turnstile, resend, ratelimit, schema)
content/case-studies/   (D6) MDX
public/og/       (D8) Open Graph PNGs
scripts/         (D8) generate-sitemap.mjs
```

## Justified deviations from MathLens conventions

These are documented in `phase-a2-mathlens-conventions.md` §"Justified deviations" and applied here:

1. **Tailwind v4 `@theme` token block** in `src/index.css`. MathLens used plain CSS vars under `:root`. A token-heavy editorial brand needs first-class Tailwind tokens (`text-ink`, `bg-paper`, `font-mono-label`, `px-s7`, etc.) so utility classes resolve at build time. Dark theme stays in `:root[data-theme="dark"]` so the toggle is a single attribute swap.
2. **`cn()` helper at `src/lib/utils.ts`** combining `clsx` + `tailwind-merge`. MathLens used template literals; a CTA-driven marketing site with variant components (Button, Card, Badge, PricingTier) benefits from merge-aware class composition.
3. **Path alias `@/*` -> `src/*`** in both `tsconfig.app.json` and `vite.config.ts`. Imports across `routes/`, `components/`, `lib/` are deep enough that relative paths hurt readability.
4. **No body `overflow:hidden` lock** — marketing sites scroll. `html { scroll-behavior: smooth }` instead.

## Other deliberate design decisions

- **Prerender omitted in D0.** `vite-plugin-prerender` is unmaintained against the React 19 / Vite 8 line. SEO is handled by `react-helmet-async` (D8) for per-route OG/meta and `scripts/generate-sitemap.mjs` for sitemap. If post-launch GSC indexing is weak, the path forward is Vike or migration to a framework with first-class SSG; not blocking v1.
- **Build script temporary state.** D0's `package.json` build is `tsc -b && vite build`. The task graph's full build line includes `node scripts/generate-sitemap.mjs` after `vite build`. That script is owned by D8 and does not exist yet, so the current build skips it. D8 will add the script and restore the full build line.
- **`tsconfig.app.json` adds `"noEmit": true`** (D0 patch vs. the task graph's verbatim block). The task graph block sets `allowImportingTsExtensions: true` but omits `noEmit`, which makes `tsc -b` fail with TS5096. Adding `noEmit` is the standard React+Vite TypeScript pairing — Vite handles emit, TypeScript only type-checks.
- **`src/vite-env.d.ts` reference file added** (D0 patch). The task graph omits a Vite ambient-types file, but `import './index.css'` in `main.tsx` and `import.meta.env` in future code both need `/// <reference types="vite/client" />`. This is a one-line file — standard for any Vite scaffold.
- **`npm install --legacy-peer-deps` was required.** `react-helmet-async@2.0.5` declares a peer range of React 16/17/18 and rejects React 19. The package itself works at runtime under React 19 (it has been confirmed compatible by the maintainer; the peer range simply hasn't been bumped). If/when `react-helmet-async@3.x` ships with React 19 in its peer range, this flag can be dropped. Alternative: switch to `@unhead/react` — Tyler can choose later if peer-dep noise becomes a problem.
- **`vite.config.ts` allows `host.docker.internal`** in both `server.allowedHosts` and `preview.allowedHosts`. Required so review tooling running inside a Docker container (Playwright via the MCP browser, etc.) can hit `vite preview` on the Windows host. Vite ≥ 6.0 blocks unknown hosts by default; this is the explicit allowlist. Has no production impact — Vercel never sees these flags.

## Conventions (enforced)

- **Component prop typing:** `interface` (never `type` for props) per A2.
- **Framer Motion:** inline configs (`initial`, `animate`, `transition` directly on the element). No extracted variants.
- **Folder depth:** max 2 levels under `src/components/` (e.g. `src/components/ui/Button.tsx`, `src/components/ui/__tests__/Button.test.tsx`).
- **Absolute Windows paths** in any script that touches the filesystem.
- **No emojis** in code or UI.
- **No skeleton/TODO/`as any`** in committed code.

## Commands

```bash
# Develop
npm run dev          # http://localhost:5173

# Build
npm run build        # tsc -b && vite build  -> dist/

# Lint + type-check
npm run lint
npx tsc --noEmit

# Test
npm test
npx vitest run src/components/hero
npx vitest run src/components/ui
npx vitest run src/components/layout
npx vitest run src/components/case-study
npx vitest run src/routes
npx vitest run api/__tests__
```

## Contact form environment

- `RESEND_API_KEY` — Resend (free 3K/mo). Recipient hardcoded to `tyler.lundeen1995@gmail.com`.
- `TURNSTILE_SECRET` — Cloudflare Turnstile server-side secret.
- `VITE_TURNSTILE_SITE_KEY` — Cloudflare Turnstile client-side site key.
- `VITE_VERCEL_ANALYTICS=1` — gates `@vercel/analytics` lazy load.

Rate-limit is in-memory per Vercel instance (soft). For >1k visits/day or DDoS exposure, add `@upstash/redis` + `@upstash/ratelimit` (free tier) — small follow-up; not blocking launch.

## Open questions for Tyler

1. Hero archetype for `/`: defaults to **Hero A** (productized-promise) per A3 cold-traffic data.
2. Real client logos / testimonials — none yet; copy ships with placeholders (Acme Cloud, Pulse, Orbital).
3. Custom domain — defaults to `lundeen-studio.vercel.app`; JSON-LD URLs templated against `import.meta.env.VITE_SITE_URL`.
4. Brand wordmark — defaults to "Lundeen & Co. EST. 2025" from `src/content/copy.ts`.
5. Calendar embed (Cal.com modal) — Wave 5 follow-up; not blocking v1.
6. Status-strip honesty — post-deploy, replace `COPY.status.metrics` with real Lighthouse output.
