/**
 * The site's route inventory, in one place.
 *
 * Three build steps need this list and it used to be hand-copied into each of
 * them: scripts/prerender.mjs (which pages get server-rendered HTML),
 * scripts/generate-sitemap.mjs (what search engines are told exists) and
 * scripts/generate-og.mjs (which share cards get rendered). A route added to
 * one and not the others ships as a page with no sitemap entry, or a sitemap
 * entry pointing at a page with no prerendered markup.
 *
 * This list must stay in step with the <Route> elements in src/App.tsx and
 * with ROUTES in e2e/fixtures/site.ts — e2e/seo.spec.ts asserts the sitemap and
 * the test manifest agree, so drift fails the suite rather than shipping.
 */

/** @typedef {{ path: string, id: string, priority: string, changefreq: string }} SiteRoute */

/** @type {SiteRoute[]} */
export const ROUTES = [
  { path: '/', id: 'index', priority: '1.0', changefreq: 'weekly' },
  { path: '/work', id: 'work', priority: '0.6', changefreq: 'monthly' },
  { path: '/about', id: 'about', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', id: 'contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy', id: 'privacy', priority: '0.3', changefreq: 'yearly' },
]

/** Paths the prerenderer walks. The 404 is handled separately by that script. */
export const PRERENDER_PATHS = ROUTES.map((r) => r.path)

/**
 * Open Graph card content, one per route plus the 404.
 *
 * Deliberately NOT read from src/content/copy.ts: that is a TypeScript module
 * with a `@/` path alias, and these are plain Node scripts that run before any
 * bundling. Keeping the card copy here means the generator has no build-order
 * dependency; the trade-off is that a headline rewrite in copy.ts does not
 * automatically restyle the share card, which is fine — a share card is its own
 * piece of writing and is usually shorter than the page headline anyway.
 */
export const OG_CARDS = [
  {
    id: 'index',
    eyebrow: 'Digital Studio · Mount Vernon, WA',
    title: 'Every pixel <em>tells a story</em>',
    sub: 'Brand systems and landing pages for small teams and self-funded products. Engineered with the same care as the design.',
  },
  {
    id: 'work',
    eyebrow: 'Work',
    title: 'Taking on our <em>first clients</em>',
    sub: 'Past and in-flight work is added here as it ships under the studio.',
  },
  {
    id: 'about',
    eyebrow: 'About',
    title: 'A studio in <em>Mount Vernon</em>, WA',
    sub: 'Jesenia Lundeen designs brand systems and landing pages. Small practice, stack-agnostic, you own the source.',
  },
  {
    id: 'contact',
    eyebrow: 'Contact',
    title: 'Tell me about <em>your project</em>',
    sub: 'Every inquiry read personally. Two-business-day response on weekdays.',
  },
  {
    id: 'privacy',
    eyebrow: 'Legal',
    title: 'Privacy <em>Policy</em>',
    sub: 'No form, no analytics, no tracking. What that means in full.',
    titleSize: 72,
  },
  {
    id: '404',
    eyebrow: 'Status · Route not found',
    title: 'That page <em>moved on</em>',
    sub: 'The link is dead, but the studio is not. Start from the homepage.',
    titleSize: 72,
  },
]
