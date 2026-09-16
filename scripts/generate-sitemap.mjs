#!/usr/bin/env node
// Generate dist/sitemap.xml and dist/robots.txt from the static route list.
// The route inventory lives in scripts/routes.mjs, shared with prerender.mjs
// and generate-og.mjs so the three cannot drift apart.
//
// robots.txt used to be a static file at public/robots.txt with a hardcoded
// `Sitemap: https://mosaicbyte.vercel.app/sitemap.xml` line — wrong on every
// build mode except the plain Vercel one (Vite copies public/ verbatim, with
// no templating, so a GitHub Pages build deployed under
// https://lundeen-labs.github.io/MosaicByte/ would still advertise the
// Vercel sitemap URL). It's generated here instead, using the same
// VITE_SITE_URL env var this script already reads for sitemap.xml, so both
// files always agree on which origin actually built them.

import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTES } from './routes.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SITE_URL = process.env.VITE_SITE_URL || 'https://mosaicbyte.design'

const today = new Date().toISOString().slice(0, 10)

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ROUTES.map(
    (r) =>
      `  <url>\n` +
      `    <loc>${SITE_URL}${r.path}</loc>\n` +
      `    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>${r.changefreq}</changefreq>\n` +
      `    <priority>${r.priority}</priority>\n` +
      `  </url>`,
  ).join('\n') +
  `\n</urlset>\n`

const distDir = join(ROOT, 'dist')
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true })

const sitemapPath = join(distDir, 'sitemap.xml')
writeFileSync(sitemapPath, xml, 'utf8')
console.log(`[sitemap] ${ROUTES.length} routes -> ${sitemapPath}`)

const robotsTxt =
  `User-agent: *\n` +
  `Allow: /\n` +
  `Disallow: /admin\n` +
  `Disallow: /api\n` +
  `\n` +
  `Sitemap: ${SITE_URL}/sitemap.xml\n`

const robotsPath = join(distDir, 'robots.txt')
writeFileSync(robotsPath, robotsTxt, 'utf8')
console.log(`[robots] Sitemap -> ${SITE_URL}/sitemap.xml -> ${robotsPath}`)
