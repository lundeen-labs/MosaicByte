# Lundeen Studio

Conversion-focused landing pages for B2B SaaS. Two-week turnaround. Instrumented.

Marketing site + studio portfolio for Tyler Lundeen. React 19 + Vite 8 + TypeScript + Tailwind v4, with Wouter routing, Framer Motion, Radix primitives, and MDX case studies. Deploys to Vercel with serverless contact endpoint (Resend + Cloudflare Turnstile).

## Stack

- React 19, TypeScript 5.9, Vite 8
- Tailwind CSS v4 (`@theme` token block)
- Wouter for routing, Framer Motion for transitions
- Radix UI primitives (Accordion, Dialog, Popover, Tabs, Tooltip)
- MDX for case studies (`@mdx-js/rollup`)
- React Helmet Async for SEO
- Vercel serverless functions (`api/contact.ts`)

## Install

```bash
npm install
```

## Develop

```bash
npm run dev          # http://localhost:5173
```

## Build

```bash
npm run build        # tsc -b && vite build  -> dist/
npm run preview      # serve dist/ on :4173
```

## Test

```bash
npm test             # vitest run (one-shot)
npm run test:watch   # watch mode
npm run test:ui      # vitest UI dashboard
```

## Lint + type-check

```bash
npm run lint
npx tsc --noEmit
```

## Environment

Copy `.env.example` to `.env.local` and populate before running the contact form locally:

```
RESEND_API_KEY=
TURNSTILE_SECRET=
VITE_TURNSTILE_SITE_KEY=
VITE_VERCEL_ANALYTICS=1
```

## Project layout

```
src/
  components/
    hero/         HeroA / HeroB archetypes + chart + gauge
    ui/           Button / Card / Badge / Marquee / Accordion / etc.
    layout/      Layout shell + Navbar + Footer + MobileDrawer
    case-study/   MDX renderer + per-section case-study components
  routes/         Wouter route components (Home, Work, WorkDetail, About, Contact, NotFound)
  lib/            cn() helper, SEO, theme, scroll-restoration
  content/        Production copy as typed `as const` data
  test/           Vitest setup
api/              Vercel serverless functions
content/case-studies/   MDX case studies
public/          Static assets (favicon, OG images, robots.txt)
scripts/         Build-time scripts (sitemap)
```

## Deployment

Vercel project via `vercel.json`. Production deploy requires `RESEND_API_KEY`, `TURNSTILE_SECRET`, `VITE_TURNSTILE_SITE_KEY` set in Vercel env.

```bash
npx vercel link --yes
npx vercel deploy             # preview
npx vercel deploy --prod      # production
```
