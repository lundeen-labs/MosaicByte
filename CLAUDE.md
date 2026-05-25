# Lundeen Studio — Agent Notes

Production marketing site for the Lundeen Studio brand. Single source of truth for the implementation plan: `C:\tmp\lundeen-studio-research\phase-c-task-graph.md`.

## Operating mode

**Tyler is product. Claude is the developer.** Tyler describes intent and outcome. Claude implements: writes code, runs commands, runs tests, commits, deploys, audits, fixes, iterates. Default to action.

- **Always run commands.** When verification is needed (tsc, lint, vitest, build, dev server, curl smoke check), run them — do not describe what to run. Permissions are pre-approved in `.claude/settings.json`.
- **Make reasonable assumptions, ship, course-correct.** If the right answer is one of two reasonable defaults, pick the one that matches the design system and the existing convention, ship it, and note the choice. Do not ask.
- **Never ask questions you can verify.** If `npm run lint` answers it, run it.
- **Verify after every change.** A change is not done until tsc + lint + vitest + the relevant smoke check all pass. "It compiles" is not done; "it renders correctly in the preview" is.
- **Update docs after every code change.** This is not optional. After editing any source file (`src/`, `api/`, `scripts/`, root configs), update CLAUDE.md / README.md / DEPLOY.md / `docs/*.md` to reflect the change in the same turn. Two enforcement layers:
  1. **`PostToolUse` hook** (`doc_reminder.py`, project-level) injects a reminder into the model context after every code edit.
  2. **`Stop` hook** (`doc_drift_check.py`, global) runs `git status` at turn end and BLOCKS the turn from ending if code files are dirty but no doc file is dirty in the same repo. Bypass options: (a) update the relevant doc, (b) commit the current code changes (moves them out of `git status`), or (c) explicitly state in your response that the change does not warrant a doc update (test-only fix, formatting, dep bump).
- **Commit logical chunks.** Each commit is a coherent feature/fix/refactor. Hand-write the message. Never amend pushed commits. Never `git push --force` to main.
- **Destructive actions need explicit ask.** `git reset --hard`, `rm -rf`, dropping a table, force-pushing, deleting branches, `vercel --prod` — pause and confirm with Tyler.

## Performance + UX targets

The site IS the demo. The status strip publishes real metrics. If those metrics drop below "good," the positioning collapses. Treat them as production data.

| Metric | Gate | Notes |
|---|---|---|
| LCP (mobile, real-user CrUX) | ≤ 1.5s | Target 0.8s — well inside CWV "good" (≤2.5s) |
| INP (real-user) | ≤ 150ms | Target 100ms — well inside CWV "good" (≤200ms) |
| CLS | ≤ 0.05 | Hard target zero with `font-display: swap` + reserved layout |
| Lighthouse Performance (desktop, prod URL) | ≥ 95 | Block deploy on regression |
| Lighthouse Accessibility | 100 | Non-negotiable; WCAG 2.1 AA |
| Lighthouse Best Practices | 100 | Non-negotiable |
| Lighthouse SEO | 100 | Non-negotiable |
| Initial JS gzip (any route) | < 150 KB | Currently 142 KB — cutting close, watch for regressions |
| Initial JS raw (any route) | < 200 KB | Currently 447 KB — documented deviation; lazy-mount MobileDrawer to fix |
| Time to first paint on a 4G connection | ≤ 1.0s | Subjective; verify on devtools throttle before merging hero changes |

UX targets that are not negotiable:
- Every interactive element has a visible focus ring.
- Every motion respects `prefers-reduced-motion`.
- Every keyboard user can reach every CTA in DOM order without a mouse.
- Every form input pairs with a `<label>` with `htmlFor`.
- Every SVG with semantic content has a `<title>` and `aria-label`.
- Skip-to-content link is the first focusable element on every page.
- No layout shift on font load (Fraunces preconnected, swap allowed because hero is visible enough that FOUT is acceptable; CLS measured at 0.01 in dev).

## SOLID for component architecture

Apply at the component + module boundary level. Marketing-site code is mostly composition; the principles still bite when components grow past ~100 lines.

- **Single Responsibility.** A component has one reason to change. `Hero.tsx` should not own pricing-tier rendering. `Layout.tsx` should not own the contact form. If a component starts handling >1 concern (data fetch + presentation + animation), split it.
- **Open/Closed.** Components are open for extension via props, closed to direct edits. Adding a new pricing tier means appending to `COPY.services.tiers`, not editing `PricingTier.tsx`. New variants of `Button` go through the `variant` prop, not new files.
- **Liskov Substitution.** A child component receiving a `cta: { label; href }` prop must work whether the href is internal (`/contact`) or external (`https://cal.com/...`). Don't assume `<Link>` everywhere — use `<Link>` for SPA paths and `<a>` for external/hash; `<Button asChild>` accepts both via Radix Slot.
- **Interface Segregation.** Prop interfaces stay narrow. `Footer` does not need the same prop shape as `Navbar` even though both are layout. Don't ship one omnibus `<Layout {...everything}>` prop bag.
- **Dependency Inversion.** Routes depend on `COPY` (an abstraction over copy text) and component contracts (`<HeroA props />`), not on concrete data sources or DOM structures. The `<Seo>` component depends on `react-helmet-async`'s `<Helmet>` interface, not on a specific document.head writer. Swapping helmet for `@unhead/react` should be a one-file change.

Concrete checks when reviewing or writing component code:
- Can this prop interface accept a future variant without an `if`? If not, parametrize it.
- Is this component holding state it does not own? If yes, lift to the parent or `COPY`.
- Is the file > 200 lines? If yes, split.
- Are there magic strings (route paths, color tokens, copy fragments)? If yes, route them through `src/content/copy.ts` or `src/index.css` `@theme`.

## Project root

`E:\source\repos\Applications\lundeen-studio` — always use absolute Windows paths.

## Wave status

- D0 (scaffold): COMPLETE.
- D1-D4 (parallel build): COMPLETE — hero, ui library (13 components), layout (5 components), api (Zod+Turnstile+Resend+rate-limit).
- D5+D7 (pages + copy): COMPLETE — 6 production routes wired to copy.ts; lazy-loaded.
- D6 (MDX case studies): DEFERRED — substituted with inline-data WorkDetail.tsx. Migrate when richer authoring is needed.
- D8 (SEO): COMPLETE — per-route Seo helmet wrapper, JSON-LD (Person/ProfessionalService/FAQPage), sitemap generator, robots.txt, SVG favicon.
- D9 (polish): PARTIAL — ErrorBoundary at root, usePrefersReducedMotion hook. Theme toggle UI deferred.
- E1+E2 (audit): COMPLETE — see `C:\tmp\lundeen-studio-research\phase-e-audit-report.md`.
- DEEP-RESEARCH AUDIT (2026-05-25): COMPLETE — six-agent audit (perf, SEO, a11y, architecture, testing, prod-readiness). Full findings + P0/P1/P2 backlog in `docs/improvement-roadmap.md`.
- F1 (Vercel deploy): BLOCKED on Tyler (needs Resend + Turnstile + Vercel accounts + `vercel login`). See `DEPLOY.md`.

P0 launch-blockers fixed (2026-05-25): Turnstile explicit render — the form was 403ing on every submit because `api.js` was never loaded and a lazy route can't use implicit auto-scan; `vercel.json` security headers + CSP; `--color-ink-3` darkened to WCAG AA (was 3.89:1); `/privacy` route + policy added (dead `/terms` link removed); `@vercel/speed-insights` mounted for real-user CWV.

89 vitest tests pass. tsc and eslint clean. Build emits dist/ + sitemap.xml (8 routes) + robots.txt + favicon.svg.

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

Initial-load Home: the table above is the pre-redesign snapshot and is stale. Measured 2026-05-25 (vite 8.0.10): index 416/128 + Home 155/48 + seo 97/32 = **~667 KB raw / ~206 KB gzip — BOTH gates now FAIL** (<200 raw, <150 gzip). Cause is framer-motion + Radix Dialog + tailwind-merge in the eager chunk, NOT Three.js (which is unused and already tree-shaken out). Fix path: `docs/improvement-roadmap.md` P1 #6/#7 (CSS-fade the hero to drop framer-motion off the eager graph; lazy-mount MobileDrawer; add manualChunks).

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
