# Mosaic Byte

Marketing site for **Mosaic Byte** — a small digital studio in Mount Vernon, WA, designing brand systems and conversion-focused landing pages for small teams.

This is the React + Vite app that will power the live site. The original static-HTML prototype lives at [`github.com/lundeej/mosaicbyte`](https://github.com/lundeej/mosaicbyte) — preserved as a design reference.

## Stack

- **React 19** + **TypeScript 5.9** + **Vite 8** (Rolldown)
- **Tailwind v4** (`@theme` token block in `src/index.css`)
- **wouter** client-side router · 5 lazy routes (`/`, `/work`, `/about`, `/contact`, `/privacy`)
- **DM Serif Display** + **DM Mono** (Google Fonts; per-route head tags rendered via React 19 native metadata hoisting in `src/lib/seo.tsx` — no helmet, no `--legacy-peer-deps`)
- **Vercel** hosting (`vercel.json` ships CSP + HSTS + Speed Insights via `src/main.tsx`)
- **Resend** for the contact form, **Cloudflare Turnstile** for spam protection, server recipient via `CONTACT_RECIPIENT` env var
- **Vitest** + Testing Library (58 tests, behavior-focused)

## Project layout

```
src/
  components/
    hero/         HeroA — split editorial layout + animated mosaic tile grid
    ui/           Badge · Button · Card · FAQAccordion · PricingTier · ProcessTimeline · StackBadges
    layout/       SkipToContent · Navbar (lazy-mounts MobileDrawer) · Footer · Layout
  routes/         Home · Work · About · Contact · Privacy · NotFound (all lazy)
  content/        copy.ts — every visible string, single source of truth
  lib/            cn() · seo / seo-data · reduced-motion hook
api/              contact.ts (Vercel serverless) + _lib/{schema, turnstile, resend, ratelimit}
scripts/          generate-sitemap.mjs (runs at build time)
```

## Commands

```bash
npm install                  # plain install — no peer-dep flag needed
npm run dev                  # http://localhost:5173
npm run build                # tsc -b && vite build && node scripts/generate-sitemap.mjs
npm run preview              # serve dist/ on :4173
npm run lint                 # eslint .
npm test                     # vitest run (58 tests)
```

## Environment

Copy `.env.example` to `.env.local` for local dev. For production, set these in Vercel:

```
RESEND_API_KEY=              # Resend API key
TURNSTILE_SECRET=            # Cloudflare Turnstile server secret
VITE_TURNSTILE_SITE_KEY=     # Cloudflare Turnstile client site key (build-time)
CONTACT_RECIPIENT=           # optional — defaults to tyler.lundeen1995@gmail.com
VITE_SITE_URL=               # optional — defaults to https://mosaicbyte.vercel.app
```

## Deploy

```bash
npx vercel link --yes
npx vercel deploy             # preview
npx vercel deploy --prod      # production
```

See `DEPLOY.md` for the first-time setup walkthrough (account creation, env vars, custom domain).

## Documentation

- `CLAUDE.md` — agent operating notes + recent change log (Mosaic Byte rebrand history)
- `DEPLOY.md` — first-deploy + post-deploy procedures
- `docs/improvement-roadmap.md` — full audit findings + P0/P1/P2 backlog

## Who

- **Design + brand direction:** [Jesenia Lundeen](https://github.com/lundeej)
- **Site engineering:** [Tyler Lundeen](https://github.com/Outtsett)

Inquiries through the contact form on the site.
