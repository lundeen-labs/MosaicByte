/**
 * Performance budgets and runtime cleanliness, measured against the real
 * production artifact in dist/ served by e2e/static-server.mjs.
 *
 * The point of this file is that a bundle-size or layout-stability regression
 * fails the build on the commit that caused it. Every number here comes from
 * BUDGETS in the fixtures, which mirrors the gates in CLAUDE.md.
 *
 * One measurement note that governs the byte assertions: the local static
 * server sends uncompressed bytes, while production is served gzip/brotli. So
 * the transfer figure asserted against the budget is `zlib.gzipSync` over the
 * response body — the same bytes a CDN would put on the wire — and the raw
 * size (content-length where present) is reported alongside it so a failure
 * names both.
 *
 * Chromium only, enforced by playwright.config.ts: layout-shift and
 * largest-contentful-paint are PerformanceObserver entry types Firefox and
 * WebKit do not implement.
 */
import { gzipSync } from 'node:zlib'
import { expect, test, type Page, type Request, type Response } from '@playwright/test'
import { ALL_ROUTES, BUDGETS, captureConsole, expectCleanConsole } from './fixtures/site'

/** Window the CLS observer accumulates over, measured from the load event. */
const CUMULATIVE_LAYOUT_SHIFT_WINDOW_MS = 3_000
/** Settle time before the final LCP candidate is read. */
const LARGEST_CONTENTFUL_PAINT_SETTLE_MS = 2_000
/** Upper bound on the idle wait that stands in for "hydration has finished". */
const HYDRATION_IDLE_TIMEOUT_MS = 2_000

/** `layout-shift` entry fields, which lib.dom does not expose on PerformanceEntry. */
interface LayoutShiftEntry extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

/** `largest-contentful-paint` entry fields used below. */
interface LargestContentfulPaintEntry extends PerformanceEntry {
  element: Element | null
}

/** What the in-page observer hands back about the winning LCP candidate. */
interface LargestContentfulPaintReading {
  startTimeMs: number
  tagName: string | null
  id: string | null
  text: string | null
  insideHeroHeading: boolean
}

declare global {
  interface Window {
    __cumulativeLayoutShift?: number
    __largestContentfulPaint?: LargestContentfulPaintReading | null
  }
}

interface ResourceRecord {
  url: string
  pathname: string
  resourceType: string
  rawBytes: number
  gzipBytes: number
}

interface LoadProfile {
  /** Same-origin responses received up to the load event, deduplicated by URL. */
  resources: ResourceRecord[]
  /** Every same-origin request issued up to the load event, in order. */
  sameOriginRequests: string[]
}

function kib(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KiB`
}

/** Per-file breakdown, largest first, so a failure says WHICH chunk grew. */
function breakdown(records: ResourceRecord[]): string {
  return [...records]
    .sort((a, b) => b.gzipBytes - a.gzipBytes)
    .map((r) => `    ${kib(r.gzipBytes).padStart(10)} gz  (${kib(r.rawBytes).padStart(10)} raw)  ${r.pathname}`)
    .join('\n')
}

/**
 * Chromium does not always label a `<link rel="modulepreload">` fetch as a
 * script, and the preload is exactly how the eager route chunks arrive here,
 * so the extension is the backstop. Missing one would understate the budget.
 */
function isScript(record: ResourceRecord): boolean {
  return record.resourceType === 'script' || record.pathname.endsWith('.js')
}

function isStylesheet(record: ResourceRecord): boolean {
  return record.resourceType === 'stylesheet' || record.pathname.endsWith('.css')
}

/**
 * Navigate and record every same-origin response the browser needed to reach
 * the load event. Bodies are resolved after the listeners are detached, so a
 * request still in flight when `load` fired is still counted rather than
 * silently dropped.
 */
async function profileInitialLoad(page: Page, path: string): Promise<LoadProfile> {
  const requestedUrls: string[] = []
  const pending: Promise<ResourceRecord | null>[] = []

  const onRequest = (request: Request) => {
    requestedUrls.push(request.url())
  }

  const onResponse = (response: Response) => {
    const resourceType = response.request().resourceType()
    pending.push(
      response
        .body()
        .then((buffer): ResourceRecord => {
          const declared = Number(response.headers()['content-length'])
          return {
            url: response.url(),
            pathname: new URL(response.url()).pathname,
            resourceType,
            rawBytes: Number.isFinite(declared) && declared > 0 ? declared : buffer.length,
            gzipBytes: gzipSync(buffer).length,
          }
        })
        // A redirect or an aborted fetch has no readable body; it also carries
        // no bytes worth budgeting, so dropping it does not hide weight.
        .catch(() => null),
    )
  }

  page.on('request', onRequest)
  page.on('response', onResponse)

  await page.goto(path)
  await page.waitForLoadState('load')

  page.off('request', onRequest)
  page.off('response', onResponse)

  const settled: (ResourceRecord | null)[] = []
  while (pending.length > 0) {
    settled.push(...(await Promise.all(pending.splice(0))))
  }

  const origin = new URL(page.url()).origin
  const seen = new Set<string>()
  const resources: ResourceRecord[] = []
  for (const record of settled) {
    if (!record) continue
    if (new URL(record.url).origin !== origin) continue
    if (seen.has(record.url)) continue
    seen.add(record.url)
    resources.push(record)
  }

  return {
    resources,
    sameOriginRequests: requestedUrls.filter((url) => new URL(url).origin === origin),
  }
}

/**
 * Attach the web-vital observers before any page script runs, so the first
 * frame's shifts and the first paint candidate are both captured.
 */
async function installWebVitalObservers(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__cumulativeLayoutShift = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as LayoutShiftEntry
        // A shift the visitor caused by clicking or typing is not a defect.
        if (shift.hadRecentInput) continue
        window.__cumulativeLayoutShift = (window.__cumulativeLayoutShift ?? 0) + shift.value
      }
    }).observe({ type: 'layout-shift', buffered: true })

    window.__largestContentfulPaint = null
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1] as LargestContentfulPaintEntry | undefined
      if (!last) return
      const element = last.element ?? null
      window.__largestContentfulPaint = {
        startTimeMs: last.startTime,
        tagName: element ? element.tagName.toLowerCase() : null,
        id: element ? element.id : null,
        text: element ? (element.textContent ?? '').trim().slice(0, 80) : null,
        // The hero <h1> splits its accessible name across an sr-only span and
        // an aria-hidden span, so the candidate may be the h1 or something
        // inside it. Anything outside it means the LCP element moved.
        insideHeroHeading: element !== null && element.closest('#hero-heading') !== null,
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  })
}

/**
 * Wait until the page has genuinely finished: hydration, the lazily imported
 * route chunk and deferred third-party scripts all run after `load`. An idle
 * callback with a ceiling proves the main thread went quiet, where a fixed
 * sleep would only guess.
 */
async function settleAfterHydration(page: Page): Promise<void> {
  await page.waitForLoadState('load')
  await page.evaluate(
    (idleTimeout) =>
      new Promise<void>((resolve) => {
        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(() => resolve(), { timeout: idleTimeout })
        } else {
          window.setTimeout(resolve, idleTimeout / 2)
        }
      }),
    HYDRATION_IDLE_TIMEOUT_MS,
  )
}

test.describe('transfer budgets', () => {
  test('initial JavaScript stays under the gzip budget', async ({ page }) => {
    const { resources } = await profileInitialLoad(page, '/')
    const scripts = resources.filter(isScript)

    // Guard against a broken profiler making the budget assertion vacuous:
    // zero recorded scripts would "pass" a bundle of any size.
    expect(
      scripts.length,
      'no same-origin scripts were recorded for / — the resource profiler is broken, not the bundle',
    ).toBeGreaterThan(0)

    const totalGzip = scripts.reduce((sum, record) => sum + record.gzipBytes, 0)
    expect(
      totalGzip,
      `initial JS is ${kib(totalGzip)} gzipped, over the ${kib(BUDGETS.initialJsGzipBytes)} budget:\n${breakdown(scripts)}`,
    ).toBeLessThan(BUDGETS.initialJsGzipBytes)
  })

  test('initial CSS stays under the gzip budget', async ({ page }) => {
    const { resources } = await profileInitialLoad(page, '/')
    const stylesheets = resources.filter(isStylesheet)

    expect(
      stylesheets.length,
      'no same-origin stylesheet was recorded for / — the page would be unstyled, or the profiler is broken',
    ).toBeGreaterThan(0)

    const totalGzip = stylesheets.reduce((sum, record) => sum + record.gzipBytes, 0)
    expect(
      totalGzip,
      `initial CSS is ${kib(totalGzip)} gzipped, over the ${kib(BUDGETS.initialCssGzipBytes)} budget:\n${breakdown(stylesheets)}`,
    ).toBeLessThan(BUDGETS.initialCssGzipBytes)
  })

  test('the home page loads without a long tail of requests', async ({ page }) => {
    const { sameOriginRequests } = await profileInitialLoad(page, '/')
    const listed = sameOriginRequests.map((url) => `    ${new URL(url).pathname}`).join('\n')

    expect(
      sameOriginRequests.length,
      `/ needed ${sameOriginRequests.length} same-origin requests, over the budget of ${BUDGETS.maxInitialRequests}:\n${listed}`,
    ).toBeLessThan(BUDGETS.maxInitialRequests)
  })

  test('the built CSS is a single render-blocking link in the served <head>', async ({ page, request }) => {
    // Read the markup the server actually sends. A stylesheet injected by JS
    // after paint would be invisible here but reintroduce the FOUC the
    // pre-paint theme script and the head link exist to prevent.
    const html = await (await request.get('/')).text()
    const headEnd = html.indexOf('</head>')
    expect(headEnd, 'served markup has no </head> — the prerender produced something unusable').toBeGreaterThan(0)
    const head = html.slice(0, headEnd)

    const sameOriginStylesheetTags = [...html.matchAll(/<link\b[^>]*>/gi)]
      .map((match) => match[0])
      .filter((tag) => /rel\s*=\s*["'][^"']*\bstylesheet\b[^"']*["']/i.test(tag))
      .filter((tag) => {
        const href = tag.match(/href\s*=\s*["']([^"']*)["']/i)?.[1] ?? ''
        return href.startsWith('/') || href.startsWith('./') || href.startsWith('assets/')
      })

    expect(
      sameOriginStylesheetTags,
      `expected exactly one same-origin stylesheet in the served HTML, found:\n${sameOriginStylesheetTags.join('\n')}`,
    ).toHaveLength(1)

    const builtCssTag = sameOriginStylesheetTags[0]
    const href = builtCssTag.match(/href\s*=\s*["']([^"']*)["']/i)?.[1] ?? ''
    expect(href, `stylesheet href is not a hashed build asset: ${builtCssTag}`).toMatch(/^\/assets\/.+\.css$/)
    expect(head.includes(builtCssTag), `the built stylesheet link is outside <head>: ${builtCssTag}`).toBe(true)

    // And nothing adds a second one once the app is running. The half above
    // reads the served bytes through `request`; this half needs the page
    // actually loaded, or it inspects about:blank and finds nothing.
    await page.goto('/')
    await settleAfterHydration(page)
    const runtimeStylesheets = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLLinkElement>('link[rel~="stylesheet"]')]
        .filter((link) => new URL(link.href, window.location.href).origin === window.location.origin)
        .map((link) => ({ href: new URL(link.href, window.location.href).pathname, inHead: link.parentElement === document.head })),
    )
    expect(
      runtimeStylesheets,
      `after hydration the page carries ${runtimeStylesheets.length} same-origin stylesheets:\n${runtimeStylesheets.map((s) => `    ${s.href} (in head: ${s.inHead})`).join('\n')}`,
    ).toHaveLength(1)
    expect(runtimeStylesheets[0]?.inHead, 'the built stylesheet was moved or re-inserted outside <head>').toBe(true)
  })
})

test.describe('web vitals', () => {
  test('layout is stable through the font swap and the first tile re-roll', async ({ page }) => {
    await installWebVitalObservers(page)
    await page.goto('/')
    await page.waitForLoadState('load')

    // The window is the measurement, not a synchronisation wait: it has to
    // outlast the late web-font swap and the hero mosaic's first 2.2s
    // re-roll, which is exactly where a CLS regression would come from.
    const cumulativeLayoutShift = await page.evaluate(
      (windowMs) =>
        new Promise<number>((resolve) => {
          window.setTimeout(() => resolve(window.__cumulativeLayoutShift ?? 0), windowMs)
        }),
      CUMULATIVE_LAYOUT_SHIFT_WINDOW_MS,
    )

    expect(
      cumulativeLayoutShift,
      `cumulative layout shift ${cumulativeLayoutShift.toFixed(4)} over ${CUMULATIVE_LAYOUT_SHIFT_WINDOW_MS}ms exceeds the ${BUDGETS.maxCumulativeLayoutShift} budget`,
    ).toBeLessThan(BUDGETS.maxCumulativeLayoutShift)
  })

  test('largest contentful paint is fast and is still the hero heading', async ({ page }) => {
    await installWebVitalObservers(page)
    await page.goto('/')
    await page.waitForLoadState('load')

    const reading = await page.evaluate(
      (settleMs) =>
        new Promise<LargestContentfulPaintReading | null>((resolve) => {
          window.setTimeout(() => resolve(window.__largestContentfulPaint ?? null), settleMs)
        }),
      LARGEST_CONTENTFUL_PAINT_SETTLE_MS,
    )

    expect(reading, 'no largest-contentful-paint entry was reported — the page painted nothing measurable').not.toBeNull()
    const lcp = reading as LargestContentfulPaintReading

    expect(
      lcp.startTimeMs,
      `largest contentful paint at ${lcp.startTimeMs.toFixed(0)}ms exceeds the ${BUDGETS.maxLargestContentfulPaintMs}ms budget (element: <${lcp.tagName}> #${lcp.id})`,
    ).toBeLessThan(BUDGETS.maxLargestContentfulPaintMs)

    // HeroA leaves the <h1> un-animated specifically to protect this metric
    // (the fade-up classes are on every sibling but not on it). If an image or
    // a late-rendering block becomes the LCP element, that decision has been
    // silently undone and the budget above stops meaning anything.
    expect(
      lcp.insideHeroHeading,
      `LCP element is <${lcp.tagName}> id="${lcp.id}" ("${lcp.text}"), not the hero <h1 id="hero-heading">`,
    ).toBe(true)
  })
})

test.describe('runtime cleanliness', () => {
  for (const route of ALL_ROUTES) {
    test(`${route.id} loads with no console errors or failed requests`, async ({ page }) => {
      // Listeners must be attached before navigation or the first errors are lost.
      const capture = captureConsole(page)

      await page.goto(route.path)
      await expect(page.locator('#main')).toBeVisible()
      await settleAfterHydration(page)

      expectCleanConsole(capture)
    })
  }

  test('hydration reuses the prerendered DOM instead of discarding it', async ({ page }) => {
    const hydrationComplaints: string[] = []
    page.on('console', (message) => {
      const type = message.type()
      if ((type === 'error' || type === 'warning') && /hydrat/i.test(message.text())) {
        hydrationComplaints.push(`${type}: ${message.text()}`)
      }
    })
    page.on('pageerror', (error) => {
      if (/hydrat/i.test(error.message)) hydrationComplaints.push(`pageerror: ${error.message}`)
    })

    await page.goto('/')
    await settleAfterHydration(page)

    // React tags the container it owns with an internal `__reactContainer$…`
    // key. Without this check the assertion below would pass on a page where
    // React never ran at all, which is the loudest possible failure to miss.
    const reactAttached = await page.evaluate(() => {
      const root = document.getElementById('root')
      return root !== null && Object.keys(root).some((key) => key.startsWith('__reactContainer$'))
    })
    expect(reactAttached, 'React never attached to #root — nothing hydrated, so the mismatch check would be vacuous').toBe(true)

    // A mismatch makes React throw away the prerendered markup and re-render
    // client-side, which destroys the SEO benefit the prerender exists for.
    expect(
      hydrationComplaints,
      `React reported a hydration problem on /:\n${hydrationComplaints.join('\n')}`,
    ).toEqual([])
  })

  for (const route of ALL_ROUTES) {
    test(`${route.id} images reserve their space before they load`, async ({ page }) => {
      await page.goto(route.path)
      await settleAfterHydration(page)

      const unreservedImages = await page.evaluate(() =>
        [...document.querySelectorAll('img')]
          .map((image) => ({
            src: image.currentSrc || image.getAttribute('src') || '(no src)',
            width: image.getAttribute('width'),
            height: image.getAttribute('height'),
            aspectRatio: window.getComputedStyle(image).aspectRatio,
          }))
          .filter(
            (image) =>
              !(image.width !== null && image.height !== null) &&
              (image.aspectRatio === '' || image.aspectRatio === 'auto'),
          ),
      )

      expect(
        unreservedImages,
        `images without width+height or an aspect-ratio will shift layout on load:\n${unreservedImages
          .map((image) => `    ${image.src} (width=${image.width} height=${image.height} aspect-ratio=${image.aspectRatio})`)
          .join('\n')}`,
      ).toEqual([])
    })
  }
})
