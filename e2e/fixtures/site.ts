/**
 * Shared end-to-end fixtures: the route manifest every spec asserts against,
 * plus the helpers that keep assertions honest across specs.
 *
 * The manifest is the contract. If a route is added to src/App.tsx, adding it
 * here is what makes every suite — routing, SEO, accessibility, performance,
 * visual — cover it automatically. `seo.spec.ts` asserts the manifest and
 * dist/sitemap.xml agree, so a route added to one and not the other fails.
 */
import { expect, type Page, type Request, type Response } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/** Canonical origin the production build stamps into its SEO tags. */
export const SITE_ORIGIN = 'https://mosaicbyte.design'

export interface RouteSpec {
  /** URL path as served. */
  path: string
  /** Short id used in screenshot names and test titles. */
  id: string
  /** Exact document title the route must render. */
  title: string
  /** Substring that must appear in the route's single <h1>. */
  h1: string
  /** Canonical path stamped by <Seo canonicalPath>. */
  canonicalPath: string
  /** Whether this route is expected in sitemap.xml. */
  inSitemap: boolean
  /** Number of JSON-LD blocks the route renders. */
  jsonLdBlocks: number
}

const BRAND = 'Mosaic Byte'

export const ROUTES: RouteSpec[] = [
  {
    path: '/',
    id: 'home',
    title: `${BRAND} — Digital Studio`,
    h1: 'Every pixel tells a story',
    canonicalPath: '/',
    inSitemap: true,
    jsonLdBlocks: 3,
  },
  {
    path: '/work',
    id: 'work',
    title: `Work — ${BRAND}`,
    h1: 'Currently taking our first clients.',
    canonicalPath: '/work',
    inSitemap: true,
    jsonLdBlocks: 0,
  },
  {
    path: '/about',
    id: 'about',
    title: `About — ${BRAND}`,
    h1: 'A studio in Mount Vernon, WA.',
    canonicalPath: '/about',
    inSitemap: true,
    jsonLdBlocks: 1,
  },
  {
    path: '/contact',
    id: 'contact',
    title: `Contact — ${BRAND}`,
    h1: 'Tell me about your project.',
    canonicalPath: '/contact',
    inSitemap: true,
    jsonLdBlocks: 0,
  },
  {
    path: '/privacy',
    id: 'privacy',
    title: `Privacy Policy — ${BRAND}`,
    h1: 'Privacy Policy',
    canonicalPath: '/privacy',
    inSitemap: true,
    jsonLdBlocks: 0,
  },
]

/** A path that matches no prerendered file, so the server must serve 404.html. */
export const UNKNOWN_PATH = '/this-route-does-not-exist'

export const NOT_FOUND_ROUTE: RouteSpec = {
  path: UNKNOWN_PATH,
  id: '404',
  title: `404 — ${BRAND}`,
  h1: '404',
  canonicalPath: '/404',
  inSitemap: false,
  jsonLdBlocks: 0,
}

/** Every route the suite exercises, including the 404. */
export const ALL_ROUTES: RouteSpec[] = [...ROUTES, NOT_FOUND_ROUTE]

export type ThemeName = 'light' | 'dark' | 'system'

/**
 * Performance budgets, enforced by performance.spec.ts against the real
 * production artifact. These mirror the gates documented in CLAUDE.md.
 *
 * `initialJsGzipBytes` is the sum of every script the browser fetches before
 * the page is interactive — the number that actually governs time-to-usable on
 * a phone, not the total of everything in dist/assets.
 */
export const BUDGETS = {
  initialJsGzipBytes: 150 * 1024,
  initialCssGzipBytes: 20 * 1024,
  /** Cumulative Layout Shift. The design reserves layout, so this is strict. */
  maxCumulativeLayoutShift: 0.05,
  /** Largest Contentful Paint on an unthrottled local server. */
  maxLargestContentfulPaintMs: 1500,
  /** A single document should not need this many requests to become usable. */
  maxInitialRequests: 40,
} as const

/**
 * Wait until nothing on the page is mid-animation.
 *
 * The hero and the section blocks fade up with staggered CSS animations
 * (`.fade-up-1` … in src/index.css). axe computes contrast from the *composited*
 * colour, so a scan that lands mid-fade reads blends that exist for a few
 * hundred milliseconds and never as a final state — #c59064 instead of the
 * ochre, #b6b2ac instead of ink-3. Those are not real contrast failures, and
 * treating them as such would train everyone to ignore the suite.
 *
 * Fonts matter for the same reason: a fallback face can change the computed
 * font size axe uses to pick the 4.5:1 versus 3:1 threshold.
 */
export async function settleAnimations(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    const running = document
      .getAnimations()
      .filter((a) => a.playState === 'running')
      .map((a) =>
        Promise.race([
          a.finished.catch(() => undefined),
          // An infinite animation never finishes; do not hang the suite on one.
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]),
      )
    await Promise.all(running)
  })
}

/**
 * Run an axe accessibility scan and assert zero violations.
 *
 * Scoped to WCAG 2.0/2.1 A and AA, which is the standard the site claims to
 * meet in COPY (`process` step 4 and the About credentials block). Any
 * violation is returned in the assertion message with its help URL so a
 * failure is actionable without re-running locally.
 */
export async function expectNoAccessibilityViolations(
  page: Page,
  context?: { include?: string; disableRules?: string[] },
) {
  await settleAnimations(page)

  let builder = new AxeBuilder({ page }).withTags([
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
  ])
  if (context?.include) builder = builder.include(context.include)
  if (context?.disableRules?.length) builder = builder.disableRules(context.disableRules)

  const results = await builder.analyze()

  const summary = results.violations
    .map((v) => {
      const where = v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join('\n      ')
      return `  [${v.impact ?? 'unknown'}] ${v.id}: ${v.help}\n      ${where}\n      ${v.helpUrl}`
    })
    .join('\n')

  expect(results.violations, `axe found ${results.violations.length} violation(s):\n${summary}`).toEqual([])
}

/**
 * Set the stored theme before the first paint, the same way index.html's
 * pre-paint script reads it. Must be called before `page.goto`.
 */
export async function presetTheme(page: Page, theme: Exclude<ThemeName, 'system'>) {
  await page.addInitScript((t) => {
    try {
      window.localStorage.setItem('mosaic-theme', t)
    } catch {
      /* storage blocked — the app falls back to system, which the test asserts */
    }
  }, theme)
}

/** Read the resolved theme actually applied to the document. */
export async function resolvedTheme(page: Page): Promise<'light' | 'dark'> {
  return page.evaluate(() => {
    const attr = document.documentElement.dataset.theme
    if (attr === 'light' || attr === 'dark') return attr
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
}

export interface ConsoleCapture {
  errors: string[]
  pageErrors: string[]
  failedRequests: { url: string; failure: string }[]
  badResponses: { url: string; status: number }[]
}

/**
 * Attach listeners that record everything a healthy page should not produce.
 * Call before navigating; assert with `expectCleanConsole` afterwards.
 *
 * Google Fonts is allowed to fail: CI runners and offline dev machines can't
 * always reach fonts.gstatic.com, and the design ships a real fallback stack.
 * Nothing served from our own origin gets that latitude.
 */
export function captureConsole(page: Page): ConsoleCapture {
  const capture: ConsoleCapture = {
    errors: [],
    pageErrors: [],
    failedRequests: [],
    badResponses: [],
  }

  const isThirdParty = (url: string) =>
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com') ||
    url.startsWith('data:') ||
    url.startsWith('chrome-extension:')

  page.on('console', (msg) => {
    const from = msg.location().url ?? ''
    if (msg.type() !== 'error' || isThirdParty(from)) return
    // The 404 route's own document is *supposed* to answer 404, and the browser
    // logs that as a console error. Everything else is a real failure.
    if (from.includes(UNKNOWN_PATH)) return
    capture.errors.push(`${msg.text()} @ ${from}:${msg.location().lineNumber}`)
  })
  page.on('pageerror', (err) => capture.pageErrors.push(err.message))
  page.on('requestfailed', (req: Request) => {
    const url = req.url()
    if (isThirdParty(url)) return
    capture.failedRequests.push({ url, failure: req.failure()?.errorText ?? 'unknown' })
  })
  page.on('response', (res: Response) => {
    const url = res.url()
    if (isThirdParty(url)) return
    // The 404 route is expected to answer 404 for its own document.
    if (res.status() >= 400 && !url.includes(UNKNOWN_PATH)) {
      capture.badResponses.push({ url, status: res.status() })
    }
  })

  return capture
}

export function expectCleanConsole(capture: ConsoleCapture) {
  expect(capture.pageErrors, `uncaught page errors:\n${capture.pageErrors.join('\n')}`).toEqual([])
  expect(capture.errors, `console errors:\n${capture.errors.join('\n')}`).toEqual([])
  expect(
    capture.failedRequests,
    `failed requests:\n${capture.failedRequests.map((r) => `${r.url} (${r.failure})`).join('\n')}`,
  ).toEqual([])
  expect(
    capture.badResponses,
    `non-OK responses:\n${capture.badResponses.map((r) => `${r.status} ${r.url}`).join('\n')}`,
  ).toEqual([])
}

/**
 * Freeze everything that makes a screenshot flake: the hero's tile animation
 * re-rolls on a 2.2s interval, and web fonts swap in late. Reduced motion is
 * set at the context level in playwright.config.ts; this waits for fonts and
 * kills residual animation.
 */
export async function stabilizeForScreenshot(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
scroll-behavior: auto !important;
    }`,
  })
  await page.waitForTimeout(150)
}

/** Every same-origin internal link on the page, deduplicated. */
export async function internalLinks(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out = new Set<string>()
    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href') ?? ''
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return
      const url = new URL(href, window.location.href)
      if (url.origin !== window.location.origin) return
      out.add(url.pathname + url.hash)
    })
    return [...out]
  })
}
