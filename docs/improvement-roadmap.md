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

---

## L2 — runtime SEO bug discovered during browser verification (✅ fixed 2026-05-25)

Browser verification of the P0 work surfaced a pre-existing project-wide bug the audit missed (the audit read code; this only shows up in a live DOM):

| Symptom | Reality |
|---|---|
| **`react-helmet-async@2.0.5` on React 19 emits only `<title>`** | Every `<meta>`, `<link rel="canonical">`, OG tag, Twitter card, and `<script type="application/ld+json">` was silently dropped. |
| Per-route metadata invisible to **every** crawler (not just non-JS ones) | Even Google sees one global description, no canonical, no OG cards, no Person/ProfessionalService/FAQPage JSON-LD. |
| The CLAUDE.md "deviation" recommending `--legacy-peer-deps` | Was masking the bug, not just a cosmetic peer-range issue. |

**Fix:** removed `react-helmet-async` entirely; `src/lib/seo.tsx` now renders `<title>`/`<meta>`/`<link>`/`<script>` as plain JSX and React 19's native head-hoisting deduplicates them into `<head>`. `HelmetProvider` wrapper deleted from `main.tsx`. Static `<title>` and `<meta description>` removed from `index.html` (React 19 hoists alongside static tags, so a static fallback would duplicate). Browser-verified: Home now ships 3 JSON-LD scripts (Person, ProfessionalService, FAQPage), Privacy/Contact/About each ship correct per-route title + description + canonical + OG.

**Bonus wins:** removes the `--legacy-peer-deps` requirement project-wide; shrinks the eager index chunk by ~14 KB raw / ~5 KB gz.

**Remaining caveat:** no-JS crawlers (social unfurlers, LLM bots) still see an empty `<head>` until prerender lands (P1 #9). That's the same situation as before — fixed by the prerender path, not by this swap.

**Still needs a human before `vercel --prod`:** Resend account + `RESEND_API_KEY`; Cloudflare Turnstile account + `VITE_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET`; `vercel login`; then `vercel link` / `vercel env add` / `vercel deploy`. See `DEPLOY.md`.

---

## P1 — High value before declaring v1 "done"

| # | Fix | Status | Evidence / outcome | Effort |
|---|---|---|---|---|
| 6 | **Move framer-motion off the eager Home chunk.** Replaced the 5 HeroA fades with CSS `@keyframes` (`.fade-up*` in `index.css`); the global `prefers-reduced-motion` block already neutralizes them. | ✅ 2026-05-25 | `framer-motion` now 100% tree-shaken — gone from every chunk. | M |
| 7 | **Lazy-mount MobileDrawer + chunking.** `Navbar` now `lazy()`-imports the drawer behind a `Suspense` gated on `open`. `vite.config.ts` adds `manualChunks(react-vendor)` (deliberately NOT grouping `@radix-ui/*` — a combined radix chunk would pull Dialog into the eager graph because Accordion eager-references it) and `sourcemap:false` in prod. | ✅ 2026-05-25 | Radix Dialog ecosystem isolated into `MobileDrawer-*.js` (31 KB raw / 11 KB gz, lazy). React vendor pinned to its own chunk for cache stability. | S |
| 8 | **Stop animating the LCP `<h1>`.** Headline renders at `opacity:1` from first paint; only the eyebrow/sub/CTA/reassure-line fade. | ✅ 2026-05-25 | LCP no longer waits on a 0.6s fade. | S |

**P1 bundle outcome (measured post-fix):** initial-load Home = **~500 KB raw / ~152 KB gz** (was ~654/~202 post-L2 — a −154 KB raw / −50 KB gz win). Raw `<200 KB` gate is structurally infeasible with React 19 (react-vendor alone is 392 KB raw / 117 KB gz). Gz `<150 KB` gate is missed by ~2 KB; one more swap (drop `tailwind-merge` for bare `clsx`, P2 #16) clears it.
| 9 | **Build-time prerender** (`scripts/prerender.mjs`: crawl `vite preview` with Playwright/puppeteer, write static per-route HTML; `createRoot`→`hydrateRoot`). Social + LLM crawlers (Slack/X/LinkedIn/GPTBot/ClaudeBot) execute no JS and currently see an empty `<div id="root">` — all per-route meta + JSON-LD is invisible to them. (L2 fixed the JS-executing case; this is the remaining no-JS case.) Verdict from research: prerender, do NOT migrate frameworks for a 6-page site. | ⬜ | `main.tsx`, `seo.tsx` runtime-only injection; `index.html:15` | M |
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
