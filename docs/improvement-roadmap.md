# Lundeen Studio — Improvement Roadmap

Source: six-agent deep-research audit (performance, SEO/rendering, accessibility, architecture, testing, production-readiness) run 2026-05-25 against the live codebase. Each finding is evidence-backed (file:line) and cross-checked against a fresh `vite build`.

Status legend: ✅ done · ⏳ in progress · ⬜ not started

---

## P0 — Launch-blocking (✅ all shipped 2026-05-25)

| # | Fix | Status | Commit scope |
|---|---|---|---|
| 1 | **Turnstile was 403ing 100% of submissions** — `api.js` never loaded; lazy route needs explicit render. Now: `index.html` loads `api.js?render=explicit`; `Contact.tsx` renders via `turnstile.render()` in an effect, captures token via callback (explicit mode does NOT auto-fill `cf-turnstile-response`), resets the single-use token after a failed submit. Types in `vite-env.d.ts`. | ✅ | contact/turnstile |
| 2 | **No security headers** — `vercel.json` now ships CSP (allowlisting Turnstile script+frame+connect, Google Fonts, Vercel insights), HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy. Required for Best Practices = 100. | ✅ | headers |
| 3 | **a11y contrast fail** — `--color-ink-3` was `#737373` (3.89:1 on paper-2, below AA 4.5:1) and used for real readable text. Now `#8F8F8F` (~5.7:1). Recovers Lighthouse a11y = 100. | ✅ | a11y |
| 4 | **Footer `/privacy` + `/terms` 404'd; PII collected with no policy** — added a real `/privacy` route (`Privacy.tsx` + `COPY.legal.privacy`) describing the form data, Resend/Turnstile/Vercel processors, retention, GDPR/CCPA rights. Removed the dead `/terms` link (a brochure site has no ToS to honor; faking one violates the no-placeholder rule). Sitemap updated to 8 routes. | ✅ | legal |
| 5 | **No real-user CWV data** despite the "site IS the demo" positioning — `@vercel/speed-insights` mounted in `main.tsx`. Cookieless LCP/INP/CLS. | ✅ | observability |

Verification after P0: `tsc` 0 · `eslint` 0 · `vitest` 89/89 · `vite build` ok (Privacy chunk 2.48 kB gz 0.88 kB; sitemap 8 routes).

**Still needs a human before `vercel --prod`:** Resend account + `RESEND_API_KEY`; Cloudflare Turnstile account + `VITE_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET`; `vercel login`; then `vercel link` / `vercel env add` / `vercel deploy`. See `DEPLOY.md`.

---

## P1 — High value before declaring v1 "done"

| # | Fix | Evidence | Effort |
|---|---|---|---|
| 6 | **Move framer-motion off the eager Home chunk.** The 5 hero animations are opacity+16px-y fades; replace with CSS `@keyframes` (reduced-motion already handled in `index.css:115`). Drops ~40 KB gz / ~140 KB raw off Home. Biggest bundle win. | `HeroA.tsx:36-152`; Home.js = 154 KB raw / 47.9 KB gz, dominated by motion-dom/framer-motion | M |
| 7 | **Lazy-mount MobileDrawer** (`lazy()` + `Suspense`, render only when `open`) so Radix Dialog (~70 KB src) leaves desktop first paint; add `manualChunks` (react-vendor/radix/motion); `sourcemap:false` in prod. | `Navbar.tsx:5,138`; `vite.config.ts` build block | S |
| 8 | **Stop animating the LCP `<h1>`.** Render headline at `opacity:1`; animate only surrounding elements. ~0.3–0.6s LCP win, zero bundle cost. | `HeroA.tsx:36-41,75-91` | S |
| 9 | **Build-time prerender** (`scripts/prerender.mjs`: crawl `vite preview` with Playwright/puppeteer, write static per-route HTML; `createRoot`→`hydrateRoot`). Social + LLM crawlers (Slack/X/LinkedIn/GPTBot/ClaudeBot) execute no JS and currently see an empty `<div id="root">` — all helmet meta + JSON-LD is invisible to them. Verdict from research: prerender, do NOT migrate frameworks for a 6-page site. | `main.tsx`, `seo.tsx` runtime-only injection; `index.html:15` | M |
| 10 | **Add the OG image** — `public/og/index.png` (1200×630) currently 404s for every crawler; `og:image` points at `/og/index.png`. Per-route PNGs or `@vercel/og` for case studies. | `seo.tsx:15`, `public/og/` empty | S |
| 11 | **`<MotionConfig reducedMotion="user">` at root** + per-field contact-form error association (`aria-invalid`/`aria-describedby`, focus first invalid field, humanize error codes). Real WCAG AA debt Lighthouse can't auto-detect. | `main.tsx`; `Contact.tsx:131-269` | S |
| 12 | **CI + coverage.** `vitest run --coverage` currently errors (no `@vitest/coverage-v8`). Add it + a threshold, and a GitHub Actions pipeline (lint → tsc → vitest → build). Nothing gates merges today. | no `.github/workflows`, no coverage dep | S |

---

## P2 — Hardening & hygiene (post-launch, low risk)

| # | Fix | Evidence | Effort |
|---|---|---|---|
| 13 | **Consolidate triplicated case-study data** into one typed `src/content/work.ts`. `WorkDetail.tsx` (`STUDIES`), `Work.tsx` (`ENTRIES`), `copy.ts:workPreview` diverge — Orbital iterations are 17 in one place, 14 in another. Violates the project's own DIP rule. | `WorkDetail.tsx:23-105`, `Work.tsx:15-43`, `copy.ts:45-49` | M |
| 14 | **Delete ~12 dead components + tests** reachable only from their own test file (HeroB editorial archetype, StatusStrip, instrumentation/marginalia set). | route-import graph never touches them | M |
| 15 | **Remove unused deps** — `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `@radix-ui/react-popover`, `@radix-ui/react-tooltip`, `@mdx-js/*` (+ remove MDX plugin from `vite.config.ts`). 0 KB shipped (already tree-shaken) but ~−43 MB node_modules, smaller `npm audit` surface. | depcheck + grep: zero imports | XS |
| 16 | **Centralize routes** (`src/lib/routes.ts`), pull Navbar/CTA from `COPY` (Navbar duplicates `COPY.nav.primary`), tokenize hardcoded `#0A0A0A`→`var(--color-paper)` (latent light-theme bug in 5 files). | `Navbar.tsx:18-23,105`; `Button.tsx:17` etc. | S |
| 17 | **E2E + a11y + Lighthouse CI** — Playwright (nav, mobile-drawer focus-trap, contact form) + `@axe-core/playwright` + `@lhci/cli` budgets. The keyboard/focus UX gates are untestable in jsdom. | no playwright/axe/lhci installed | M |
| 18 | **`@upstash/ratelimit`** (in-memory limiter is `X-Forwarded-For`-spoofable; Turnstile is the real gate so this is genuinely post-launch) + outbound fetch timeout + `noUncheckedIndexedAccess`. | `api/_lib/ratelimit.ts`; `tsconfig.app.json` | S |

---

## Stale-doc corrections applied 2026-05-25

| Old claim | Reality |
|---|---|
| Font "Fraunces / Inter Tight / JetBrains Mono", cream/oxblood palette | **Geist / Geist Mono**, dark palette (`index.css:5-7,20-34`) |
| Bundle "447 KB raw / 142 KB gz, only raw fails" | Home initial ≈ **667 KB raw / 206 KB gz — both gates fail** (P1 #6/#7 address this) |
| "87 tests" | **89 tests** |
| `DEPLOY.md` path `E:\source\repos\lundeen-studio` | `E:\source\repos\Applications\lundeen-studio` |
| "6 lazy-loaded routes" | **7** (added `/privacy`) |
