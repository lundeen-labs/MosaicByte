# Deploy — Lundeen Studio

Status: **ready for first deploy** as of commit `6f0e918` (post-Wave-4).

All quality gates pass:
- `npx tsc -b --force` → 0 errors
- `npm run lint` → 0 errors
- `npx vitest run` → 87/87 tests pass
- `npm run build` → `dist/` produced, sitemap + robots + favicon emitted

---

## One-time setup (you do these once, manually)

Three external services need accounts. All free tiers cover this site at expected traffic.

### 1. Resend (email delivery)

- Sign up at https://resend.com (free tier: 3,000 emails/month, 100/day)
- Verify your domain when ready (or use the shared `onboarding@resend.dev` sender for testing)
- Create an API key under "API Keys" — copy the `re_*` value

### 2. Cloudflare Turnstile (spam protection)

- Sign up at https://dash.cloudflare.com (free)
- Navigate to Turnstile → Add site
- Domain: `lundeen-studio.vercel.app` (and your custom domain when added)
- Widget mode: Managed
- Copy both the **site key** (public, prefixed `0x4AAA…`) and the **secret key** (server-side, prefixed `0x4AAA…`)

### 3. Vercel (hosting)

- Sign up at https://vercel.com (free tier covers everything here)
- Install CLI globally: `npm install -g vercel`
- Authenticate: `vercel login` (opens browser)

---

## First deploy

From `E:\source\repos\lundeen-studio`:

```bash
# 1. Link the local repo to a new Vercel project
vercel link --yes

# 2. Add env vars to Vercel (production scope)
#    You'll be prompted for each value — paste from the dashboards above
vercel env add RESEND_API_KEY production
vercel env add TURNSTILE_SECRET production
vercel env add VITE_TURNSTILE_SITE_KEY production

# 3. Optional: custom site URL for canonical tags + sitemap
vercel env add VITE_SITE_URL production
# Value: https://your-domain.com  (skip for now if using vercel.app subdomain)

# 4. Deploy a preview
vercel deploy

# 5. Test the preview URL it prints
#    - Visit /, /work, /about, /contact in a browser
#    - Submit the contact form (should return 200 + email arrives at tyler.lundeen1995@gmail.com)
#    - View page source: confirm OG meta tags + JSON-LD blobs

# 6. Promote to production
vercel deploy --prod
```

---

## After deploy: replace placeholder metrics

Status strip and Hero A gauge currently show invented numbers. Once production is live, run a real Lighthouse pass against the production URL and update `src/content/copy.ts`:

```ts
// src/content/copy.ts → COPY.status.metrics (and COPY.hero.gauge)
metrics: {
  lcp: 'LCP 0.93s',     // ← real number from production CrUX or Lighthouse
  cls: 'CLS 0.02',
  inp: 'INP 110ms',
  jsKb: 'JS 142KB',     // ← gzip size from build output
}
```

Commit + redeploy. The whole positioning depends on these being honest.

---

## Custom domain

When ready:

1. Buy domain (Namecheap, Cloudflare Registrar, etc.)
2. Vercel dashboard → Project → Settings → Domains → Add
3. Vercel shows the DNS records to add at your registrar (CNAME or A)
4. Update `VITE_SITE_URL` env var to the real URL
5. Redeploy production

Vercel handles SSL automatically.

---

## Outstanding items (from Phase E audit)

| Item | Owner | When |
|---|---|---|
| Replace status-strip placeholder numbers with real Lighthouse output | Tyler | Post first prod deploy |
| Replace 3 invented case studies (Acme/Pulse/Orbital) with real client work or rebrand as "samples" | Tyler | Before public announce |
| Add real 1200×630 OG images for /, /work, /about, /contact | Tyler / designer | Before social sharing |
| Migrate WorkDetail.tsx from inline data to MDX (deferred from D6) | Optional | Follow-up |
| Lazy-mount MobileDrawer to drop raw bundle below 200KB gate | Optional | Perf hardening |
| Wire Cal.com modal to primary CTAs | Optional | Nice-to-have |

---

## Local dev cheat sheet

```bash
npm run dev           # vite at http://localhost:5173
npm run build         # tsc + vite build + sitemap
npm run preview       # serve dist/ at http://localhost:4173
npm run lint          # eslint
npm run test          # vitest run (87 tests)
npm run test:ui       # vitest UI dashboard
```

---

## Architecture quick reference

- `src/index.css` — Tailwind v4 `@theme` token block (cream/oxblood palette + Fraunces/Inter Tight/JetBrains Mono)
- `src/content/copy.ts` — single source of truth for every visible string
- `src/lib/seo.tsx` + `src/lib/seo-data.ts` — Helmet wrapper + JSON-LD blobs (Person, ProfessionalService, FAQPage)
- `src/components/{hero,ui,layout,case-study}/` — domain-grouped components
- `src/routes/` — 6 lazy-loaded route components
- `api/contact.ts` — Vercel serverless POST handler (Zod + Turnstile + Resend + soft rate-limit)
- `scripts/generate-sitemap.mjs` — runs at build time, emits `dist/sitemap.xml`
- `vercel.json` — runtime config, route rewrites
- `docs/plans/launch-multiple-agents-to-glittery-wolf.md` — original multi-agent pipeline plan
- `C:\tmp\lundeen-studio-research\` — research artifacts (competitor analysis, design system, mockups, task graph, audit report)
