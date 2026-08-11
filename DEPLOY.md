# Deploy — Mosaic Byte

Status: **ready for first deploy**.

All quality gates pass:
- `npx tsc -b --force` → 0 errors
- `npm run lint` → 0 errors
- `npx vitest run` → 89/89 tests pass
- `npm run build` → `dist/` produced, sitemap + robots + favicon emitted

---

## Deployment

This site is statically hosted on GitHub Pages and deployed automatically via GitHub Actions (`.github/workflows/pages.yml`) on every push to the `main` branch. 

### Setting up a custom domain
1. Ensure the `public/CNAME` file contains your domain name (e.g. `mosaicbyte.design`).
2. Add your custom domain to your GitHub repository settings under Settings → Pages.
3. Update DNS settings at your domain registrar.
   - Create a `CNAME` record pointing your domain (or a subdomain) to your GitHub Pages URL (e.g., `lundeen-labs.github.io`).
   - If you are using an apex domain, configure the necessary `A` records to point to GitHub's IPs.

---

## Local dev cheat sheet

```bash
npm run dev           # vite at http://localhost:5173
npm run build         # tsc + vite build + sitemap
npm run preview       # serve dist/ at http://localhost:4173
npm run lint          # eslint
npm run test          # vitest run (89 tests)
npm run test:ui       # vitest UI dashboard
```

---

## Architecture quick reference

- `src/index.css` — Tailwind v4 `@theme` token block (modern dark palette + Geist / Geist Mono)
- `src/content/copy.ts` — single source of truth for every visible string (incl. `legal.privacy`)
- `src/lib/seo.tsx` + `src/lib/seo-data.ts` — Helmet wrapper + JSON-LD blobs (Person, ProfessionalService, FAQPage)
- `src/components/{hero,ui,layout,case-study}/` — domain-grouped components
- `src/routes/` — 7 lazy-loaded route components (Home, Work, WorkDetail, About, Contact, Privacy, NotFound)
- `scripts/generate-sitemap.mjs` — runs at build time, emits `dist/sitemap.xml` (8 routes)
- `src/main.tsx` — root render
- `C:\tmp\mosaicbyte-research\` — research artifacts (competitor analysis, design system, mockups, task graph, audit report)
