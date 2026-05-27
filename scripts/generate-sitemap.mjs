#!/usr/bin/env node
// Generate dist/sitemap.xml from the static route list. No CMS yet, so we
// hand-author the route inventory here. Update this when adding routes.

import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SITE_URL = process.env.VITE_SITE_URL || 'https://mosaicbyte.vercel.app'

const ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/work', priority: '0.6', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
]

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
const outPath = join(distDir, 'sitemap.xml')
writeFileSync(outPath, xml, 'utf8')
console.log(`[sitemap] ${ROUTES.length} routes -> ${outPath}`)
