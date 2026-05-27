# Mosaic Byte Project Audit

**Date:** April 30, 2026
**Status:** Documented

## Architecture Overview

Mosaic Byte is a high-performance, conversion-focused marketing site built with a modern frontend stack and lightweight serverless backend.

### Frontend
- **Stack:** React 19, TypeScript, Vite.
- **Styling:** Tailwind CSS v4.
- **Routing:** Wouter (lightweight alternative to React Router).
- **Animation:** Framer Motion for entrance and layout transitions.
- **Content:** MDX-driven case studies for rich portfolio presentation.
- **SEO:** `react-helmet-async` for dynamic meta tag management.

### Backend (API)
- **Environment:** Node.js serverless functions (Vercel compatible).
- **Communication:** Lead generation via contact form integration.
- **Services:**
    - **Resend:** Transactional email for form submissions.
    - **Cloudflare Turnstile:** Bot protection/CAPTCHA.
    - **Internal Rate Limiting:** Prevents abuse of the contact endpoint.

## Directory Map

```
/
├── api/             # Node.js Serverless Functions
│   ├── _lib/        # Shared API utilities (Ratelimit, Resend, Turnstile)
│   └── contact.ts   # Main contact form endpoint
├── src/             # Frontend React Source
│   ├── components/  # UI Primitives and Page Sections
│   ├── routes/      # Page components (Home, Work, About, Contact)
│   ├── lib/         # Shared hooks, utils, and SEO logic
│   ├── content/     # Site-wide copy and data
│   └── App.tsx      # Routing and App Provider setup
├── scripts/         # Post-build and automation scripts
├── public/          # Static assets (Favicons, Robots.txt)
├── docs/            # Project documentation and research
└── dist/            # Compiled production build
```

## Key Workflows

1. **Development:** `npm run dev` launches the Vite server.
2. **Testing:** `npm test` runs Vitest for both frontend components and API endpoints.
3. **Build:** `npm run build` triggers TypeScript compilation followed by Vite bundling.
4. **Sitemap:** Sitemap generation is automated as part of the post-build process via `scripts/generate-sitemap.mjs`.

## Operational Mandates (from CLAUDE.md)
- Tyler is Product; Claude is Developer.
- Default to action.
- Verify every change with `tsc + lint + vitest`.
- Documentation updates are mandatory after every code change.
