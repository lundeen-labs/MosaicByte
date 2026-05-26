# Mosaic Byte — Agent Notes

Production marketing site for the **Mosaic Byte** brand (Jesenia Lundeen). Same codebase as the prior "Lundeen Studio" identity — rebranded 2026-05-26 (see "Rebrand to Mosaic Byte" below). The local directory is still named `lundeen-studio\` to avoid churn; the deployed brand and the destination GitHub repo are `mosaicbyte`.

Single source of truth for the original implementation plan: `C:\tmp\lundeen-studio-research\phase-c-task-graph.md` (historical — predates the rebrand).

## Rebrand to Mosaic Byte (in progress, 2026-05-26)

Branch: `feature/mosaicbyte-rebrand` (off `feature/p0-launch-blockers`).

**Decided + done in this chunk (content):**
- Brand: every visible string now reads "Mosaic Byte" (driven by `src/content/copy.ts`). Domain default `mosaicbyte.vercel.app` (was `lundeen-studio.vercel.app`) in `src/lib/seo-data.ts`.
- Voice: Jesenia first-person on `/about` ("I'm Jesenia Lundeen..."). Tyler appears only in the footer colophon ("Site engineering by Tyler Lundeen") — `COPY.footer.colophon` + `Footer` `colophon` prop.
- Fictional content removed: Acme/Pulse/Orbital case studies (and `WorkDetail.tsx` entirely), "148 projects shipped", "60+ clients", "12 years active", "+34% trial signups", `COPY.workPreview.*`, `COPY.instrumentation.*`, `COPY.status.metrics`, the heroB editorial-archetype block.
- `/work` is now an honest "currently taking our first clients" notice (`src/routes/Work.tsx` + `COPY.work`). `/work/:slug` route + WorkDetail.tsx deleted from `src/App.tsx` + sitemap.
- Dead-component purge (architecture audit P2 #14 closed): 16 dead components + 3 colocated tests removed — HeroB, OscilloscopeChart, DefinitionBlock, HeroSub, HeroEyebrow, HeroTitle, Marginalia, InstrumentGauge, StatusStrip, InstrumentationBlock, TestimonialCarousel, Marquee, RuleTick, KbdHint, MarginaliaLabel, WorkPreview, MetricsBlock. None were reachable from any route.
- Architecture-audit DIP fix: `Navbar` and `MobileDrawer` now consume `COPY.nav.primary` / `COPY.nav.primaryCta` instead of duplicating the list locally (architecture audit #7 closed).
- API recipient now env-configurable: `api/contact.ts` reads `CONTACT_RECIPIENT` (default still `tyler.lundeen1995@gmail.com` for technical continuity; flip to `hello@mosaicbyte.co` via Vercel env when that mailbox exists).
- Verified after content chunk: tsc 0, lint 0, **58/58 vitest pass** (was 89/89; the drop is the 3 deleted dead-component test files, not regressions).

**Done in the second chunk (visual identity):**
- `@theme` tokens flipped dark → editorial paper. `--color-paper: #f5f2ec`, `--color-ink: #0f0e0d`, `--color-ink-3: #6b6660` (re-tuned to keep WCAG AA ≥4.89:1 on the new paper bg). Accent palette is Mosaic Byte: coral rust `#d9472b`, teal moss `#1a6e60`, violet plum `#3d3086`, amber ochre `#c96a1b`. Added `--color-tile-*` aliases for the hero mosaic. `color-scheme: light`. The light-theme alternate block deleted; light is now the only theme. CSS chunk shrunk 39.99 → 33.94 KB (-15%).
- Fonts: Geist + Geist Mono → DM Serif Display + DM Mono. `index.html` preconnect + stylesheet rewritten. Existing CSP allowlist already covered fonts.googleapis/gstatic — no `vercel.json` change needed.
- `HeroA.tsx` rebuilt for the Mosaic Byte aesthetic: split editorial grid (left copy column + right ink panel), DM Serif headline with teal italic accent on the studio's tagline phrase, coral primary CTA, ghost secondary, reassure bullets, location footnote. Right panel renders an 8×6 animated `MosaicTileGrid` (subcomponent) ported from Jesenia's `main.js` — `setInterval` re-rolls lit/mid sets every 2.2s, gated by `usePrefersReducedMotion` so reduced-motion users get the initial roll only. LCP `<h1>` still unanimated. Bottom-right availability badge wired to `COPY.status` so the "X slots open" reading stays live.
- `usePrefersReducedMotion` hardened: now guards `typeof window.matchMedia !== 'function'` so jsdom (no matchMedia) doesn't throw — fixes 4 HeroA test failures the rebuild surfaced.
- Hardcoded `text-[#0A0A0A]` in `Button.tsx`, `PricingTier.tsx`, and `HeroA.tsx` tokenized to `text-[var(--color-paper)]` — the dark-theme paper hex was wrong intent on the new coral CTA (closes architecture audit #10).
- Remaining components (`Navbar`, `Footer`, `MobileDrawer`, `Layout`, `FAQAccordion`, `ProcessTimeline`, etc.) all consume `--color-*` tokens and adapted automatically — no per-component edits needed.

**Verified live in browser:** title `Mosaic Byte — Digital Studio`, body bg `#f5f2ec`, body font DM Mono, h1 font DM Serif Display, wordmark `Mosaic Byte`, CTA `Start a project`, tile grid rendering with random lit/mid sets. 58/58 tests pass; tsc/lint/build green.

**Repo move done (`MB-13`):** new repo at `https://github.com/Outtsett/mosaicbyte` (private), 12+ commits pushed to `main` via `gh repo create --source . --push`. Jesenia (`lundeej`) invited as collaborator with **write** permission (`maintain` is org-only — personal-account repos only accept `pull`/`push`/`admin`). Pending: Jesenia accepts the invitation (link: `https://github.com/Outtsett/mosaicbyte/invitations`), Tyler runs `git push` for the local README rewrite commit (the harness blocks the agent from pushing to main without per-command authorization), and Jesenia archives the original `github.com/lundeej/mosaicbyte` static prototype.

**Dark mode toggle (`MB-15`, 2026-05-26):** Three-state theme switcher (light / dark / system) defaulting to OS preference, persisted in `localStorage` under `mosaic-theme`, applied via `<html data-theme>`. Files: `src/lib/theme.ts` (the `useTheme` hook, uses `useSyncExternalStore` to track `prefers-color-scheme` live in system mode — avoids the `react-hooks/set-state-in-effect` antipattern), `src/components/ui/ThemeToggle.tsx` (Sun/Moon/Monitor cycling button). Wired into both `Navbar` (desktop, right of the CTA) and `MobileDrawer` (header, next to Close). The dark token block + `@media (prefers-color-scheme: dark)` live in `src/index.css`; only paper/ink axes flip, accents (rust/teal/moss/plum/ochre + tile-*) stay constant to preserve brand identity across modes. FOUC is prevented by a synchronous inline `<script>` in `index.html` that reads localStorage and sets `<html data-theme>` before React mounts. `Layout`'s old per-route `theme` prop removed (global toggle drives it now). Turnstile `theme: 'auto'` so the captcha widget follows the visitor's `prefers-color-scheme`. Browser-verified cycle: system → light → dark → system; bodyBg flips correctly, ink-3 contrast holds AA on both backgrounds, no FOUC observed on reload. 58/58 tests pass (Navbar tab-order test updated for the new toggle button using `toHaveAccessibleName`).

**Honesty pass on credentials (`MB-14`, 2026-05-26):** Tyler's directive — "tools or specific builds should be mentioned unless we can give examples with the web design itself." Stripped every Webflow / Framer / Next.js / Astro / Sanity / Contentful / Figma / PostHog / Plausible / Hotjar / Lighthouse name-drop from `src/content/copy.ts`. The site now sells the *practice* (stack-agnostic, you own the source) rather than the SKU list:
- `COPY.stack` block deleted entirely; `StackBadges` section removed from `Home.tsx`; `StackBadges.tsx` deleted (dead). `Card.tsx` also deleted (already unused after the WorkDetail purge).
- Hero reassure line: "Built in whatever stack your team uses. You own the source on day one." (was "Webflow, Framer, Next.js. You own it on day one.")
- Services tier scopes neutralized: "Responsive build in your team's stack" / "CMS wired against your existing content infrastructure" / "Brand guidelines document (PDF + source files)" — no proprietary tool names.
- Process step 4: "performance audit (≥95 desktop), accessibility audit (WCAG 2.1 AA)" (was "Lighthouse pass (≥95 perf, 100 a11y)").
- About body para 2: "meets WCAG 2.1 AA accessibility standards" (was "passes 100/100 Lighthouse a11y" — softened from a claim about every-page-shipped to a standard the build process meets).
- FAQ "stack" question dropped the "(Webflow, Framer, Next.js)" parenthetical and added "If you have a strong preference, mention it on the discovery call."
- `COPY.about.credentials` collapsed from 4 rows (Design / Stack / Tools / Location) to 3 (Design / Build / Location) with stack-agnostic Build phrasing. tsc 0, lint 0, 58/58.

Single source of truth for the rebrand brief: `docs/improvement-roadmap.md` (MB section).

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

L2 follow-up (2026-05-25, discovered live in dev browser): `react-helmet-async@2.0.5` was a project-wide SEO bug on React 19 — it emitted only `<title>` and dropped every `<meta>`/`<link>`/JSON-LD script. Every route shipped one global description, no canonical, no OG, zero structured data. Replaced with React 19 native head-hoisting (`<title>`/`<meta>`/`<link>` rendered as JSX, automatically dedup'd into `<head>`). Removed the static `<title>` + `<meta description>` from `index.html` so per-route tags aren't duplicated. Also drops the `--legacy-peer-deps` requirement and shaves ~14 KB raw / ~5 KB gz from the eager bundle.

58 vitest tests pass (was 89 pre-rebrand; the 31-test drop is the 3 deleted dead-component test files — Marquee, StatusStrip, MetricsBlock, OscilloscopeChart, HeroB — not regressions). tsc and eslint clean. Build emits dist/ + sitemap.xml (5 routes — /, /work, /about, /contact, /privacy) + robots.txt + favicon.svg.

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

Initial-load Home: the table above is the pre-redesign snapshot. Measured 2026-05-25 post-P1 (vite 8.0.10): react-vendor 392/117 + Home 32/8 + seo 27/9 + utils 28/9 + index 15/6 + shared+css ≈ **~500 KB raw / ~152 KB gzip** (vs ~654/~202 post-L2). Raw gate <200 is structurally infeasible with React 19 (react-vendor alone is 392 KB raw / 117 KB gz). Gz gate <150 is missed by ~2 KB — one more swap (drop tailwind-merge in favor of bare clsx, roadmap P2 #16) clears it. What changed in P1: framer-motion completely tree-shaken out (HeroA now uses CSS keyframes — `.fade-up*` in index.css); MobileDrawer is `lazy()`-mounted so the Radix Dialog ecosystem (31 KB raw / 11 KB gz) is no longer eager — only loads on hamburger tap; `manualChunks(react-vendor)` separates React from app code for cache stability; `sourcemap:false` in prod (stops shipping ~1.6 MB of .map). LCP `<h1>` no longer animates (it was waiting on a 0.6s fade before reporting).

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
- ~~`npm install --legacy-peer-deps` was required~~ — REMOVED 2026-05-25. `react-helmet-async@2.0.5` declared a peer range of React 16/17/18 AND was actually broken on React 19: it emitted only `<title>` and silently dropped every `<meta>`/`<link>`/JSON-LD `<script>` (verified live in dev). Removed and replaced with React 19's native head-hoisting in `src/lib/seo.tsx`. Plain installs work again. See `docs/improvement-roadmap.md` L2.
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
