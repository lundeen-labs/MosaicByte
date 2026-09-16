/**
 * Routing and navigation integrity against the production artifact.
 *
 * Two different things are asserted here and they are deliberately kept apart:
 *   • what a crawler or a JS-disabled visitor gets — the bytes in dist/, read
 *     through the `request` fixture, which never executes JavaScript;
 *   • what a visitor with JavaScript gets — the hydrated app, its client-side
 *     navigation, and its history handling.
 * A suite that only tested the second would pass a build whose prerendering
 * silently stopped working.
 */
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import {
  ALL_ROUTES,
  NOT_FOUND_ROUTE,
  ROUTES,
  UNKNOWN_PATH,
  internalLinks,
  type RouteSpec,
} from './fixtures/site'
import { COPY } from '@/content/copy'

/**
 * Look a route up in the fixture manifest. Throwing rather than returning
 * undefined means a nav item pointing at a path that is not a real route
 * fails the test that uses it, instead of silently skipping its assertions.
 */
function routeByPath(path: string): RouteSpec {
  const spec = ROUTES.find((route) => route.path === path)
  if (!spec) throw new Error(`No RouteSpec in the fixture manifest for "${path}"`)
  return spec
}

const HOME = routeByPath('/')

function escapeForRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** A "contains this phrase" matcher for accessible-name assertions. */
function containing(text: string): RegExp {
  return new RegExp(escapeForRegExp(text))
}

/**
 * The hero's <h1> splits its content into an sr-only span (the real accessible
 * name) and an aria-hidden styled span, so its textContent duplicates the
 * phrase. The accessible name is the only honest thing to assert on, and it is
 * also what a screen reader and Google actually consume.
 */
async function expectSoleHeadingNamed(page: Page, expectedFragment: string) {
  const heading = page.locator('h1')
  await expect(heading, 'a page must have exactly one <h1>').toHaveCount(1)
  await expect(heading).toHaveAccessibleName(containing(expectedFragment))
}

/** Assert the browser is on `spec`: URL, document title and rendered heading. */
async function expectOnRoute(page: Page, spec: RouteSpec) {
  await expect
    .poll(() => new URL(page.url()).pathname, {
      message: `expected the browser to be on ${spec.path}`,
    })
    .toBe(spec.path)
  await expect(page).toHaveTitle(spec.title)
  await expectSoleHeadingNamed(page, spec.h1)
}

const SPA_SENTINEL = '__spaSentinel'

/** Stamp a value on `window` that only a full document reload can erase. */
async function stampSentinel(page: Page) {
  await page.evaluate((key) => {
    const globalScope = window as unknown as Record<string, unknown>
    globalScope[key] = true
  }, SPA_SENTINEL)
}

async function sentinelSurvived(page: Page): Promise<boolean> {
  return page.evaluate(
    (key) => (window as unknown as Record<string, unknown>)[key] === true,
    SPA_SENTINEL,
  )
}

/**
 * Click a navbar link by its label, from whichever navbar surface this
 * viewport actually exposes. Below 768px the primary nav and the CTA are
 * `display:none` (so they are absent from the accessibility tree and match no
 * role locator) and the only reachable navbar is the lazy-mounted drawer.
 * The sentinel is stamped immediately before the click so opening the drawer
 * cannot be mistaken for the navigation under test.
 */
async function clickNavbarLink(page: Page, label: string) {
  const header = page.locator('header')
  const desktopLink = header.getByRole('link', { name: label })

  if (await desktopLink.isVisible()) {
    await stampSentinel(page)
    await desktopLink.click()
    return
  }

  await header.getByRole('button', { name: 'Open menu' }).click()
  const drawer = page.getByRole('dialog')
  await expect(drawer).toBeVisible()
  await stampSentinel(page)
  // Drawer links prefix each label with an ordinal ("01 Services"), so the
  // default substring name match is what resolves them.
  await drawer.getByRole('link', { name: label }).click()
}

/** Every navbar destination that is a real route rather than a hash anchor. */
const NAVBAR_ROUTE_TARGETS: { label: string; href: string }[] = [
  ...COPY.nav.primary
    .filter((item) => !item.href.includes('#'))
    .map((item) => ({ label: item.label, href: item.href })),
  { label: COPY.nav.primaryCta.label, href: COPY.nav.primaryCta.href },
]

function splitHref(href: string): { pathname: string; hashId: string } {
  const index = href.indexOf('#')
  if (index === -1) return { pathname: href, hashId: '' }
  return { pathname: href.slice(0, index) || '/', hashId: href.slice(index + 1) }
}

interface FetchedDocument {
  status: number
  body: string
}

/** Fetch a document once per test; dist/ is static, so caching is safe. */
async function fetchDocument(
  request: APIRequestContext,
  cache: Map<string, FetchedDocument>,
  pathname: string,
): Promise<FetchedDocument> {
  const cached = cache.get(pathname)
  if (cached) return cached
  const response = await request.get(pathname)
  const document: FetchedDocument = { status: response.status(), body: await response.text() }
  cache.set(pathname, document)
  return document
}

test.describe('direct hits', () => {
  for (const route of ROUTES) {
    test(`${route.id} (${route.path}) is served at 200 and renders its own page`, async ({
      page,
    }) => {
      const response = await page.goto(route.path)
      expect(response, `no response for ${route.path}`).not.toBeNull()
      expect(response?.status(), `${route.path} must be served from its own file`).toBe(200)

      await expect(page).toHaveTitle(route.title)
      await expectSoleHeadingNamed(page, route.h1)
      // The skip link's target. If <main id="main"> moves or loses its id,
      // keyboard users lose the only way past the header.
      await expect(page.locator('main#main')).toBeVisible()
    })
  }
})

test.describe('prerendered markup (no JavaScript executed)', () => {
  for (const route of ROUTES) {
    test(`${route.id} ships its title and h1 in the HTML source`, async ({ request }) => {
      const response = await request.get(route.path)
      expect(response.status(), `${route.path} must be served at 200`).toBe(200)

      const html = await response.text()
      // The prerenderer stamps `data-prerendered-seo` on the head tags React
      // owns (src/main.tsx removes them before mounting so React's own copies
      // are the only ones a browser keeps), so match the title by content
      // rather than by an exact `<title>` open tag.
      const titleInSource = html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]
      expect(
        titleInSource,
        `${route.path} source has no <title> of its own — the prerender did not stamp it`,
      ).toBe(route.title)
      expect(
        html,
        `${route.path} source has no h1 — a crawler sees an empty shell, so the page is unindexable`,
      ).toContain(route.h1)
    })
  }

  test('each prerendered document is its own page, not one shared shell', async ({ request }) => {
    const about = routeByPath('/about')
    const contact = routeByPath('/contact')

    const aboutHtml = await (await request.get(about.path)).text()
    expect(aboutHtml).toContain(about.h1)
    expect(
      aboutHtml,
      `${about.path} source contains ${contact.path}'s h1, so every route is being written from one shell`,
    ).not.toContain(contact.h1)
  })
})

test.describe('URL resolution', () => {
  test('a trailing slash resolves to the same page', async ({ page }) => {
    const about = routeByPath('/about')
    const response = await page.goto(`${about.path}/`)

    expect(response?.status(), `${about.path}/ must resolve, not 404`).toBe(200)
    await expect(page).toHaveTitle(about.title)
    await expectSoleHeadingNamed(page, about.h1)
  })

  test('an unknown path answers HTTP 404 and renders the NotFound page', async ({ page }) => {
    const response = await page.goto(UNKNOWN_PATH)

    // A soft 404 — the NotFound page served at status 200 — invites search
    // engines to index every typo'd URL as a real page.
    expect(response?.status(), 'an unmatched URL must answer 404, not 200').toBe(404)
    await expect(page).toHaveTitle(NOT_FOUND_ROUTE.title)
    await expectSoleHeadingNamed(page, NOT_FOUND_ROUTE.h1)
  })
})

test.describe('client-side navigation', () => {
  for (const target of NAVBAR_ROUTE_TARGETS) {
    test(`the navbar "${target.label}" link routes to ${target.href} without a reload`, async ({
      page,
    }) => {
      const spec = routeByPath(target.href)

      await page.goto(HOME.path)
      await clickNavbarLink(page, target.label)
      await expectOnRoute(page, spec)

      expect(
        await sentinelSurvived(page),
        `${target.href} reloaded the document instead of routing client-side`,
      ).toBe(true)
    })
  }

  test('back and forward restore the previous route and its title', async ({ page }) => {
    const about = routeByPath('/about')
    const aboutTarget = NAVBAR_ROUTE_TARGETS.find((item) => item.href === about.path)
    if (!aboutTarget) throw new Error('The navbar no longer links to /about')

    await page.goto(HOME.path)
    await clickNavbarLink(page, aboutTarget.label)
    await expectOnRoute(page, about)

    await page.goBack()
    await expectOnRoute(page, HOME)

    await page.goForward()
    await expectOnRoute(page, about)
  })

  test('the 404 page back-to-home link reaches the home route', async ({ page }) => {
    // 404.html is the document GitHub Pages serves for every unmatched URL, so
    // a broken link here strands every visitor who mistypes anything.
    await page.goto(UNKNOWN_PATH)
    await expect(page).toHaveTitle(NOT_FOUND_ROUTE.title)

    const backHome = page.getByRole('main').getByRole('link', { name: COPY.notFound.cta.label })
    await expect(backHome).toBeVisible()
    await backHome.click()

    await expectOnRoute(page, HOME)
  })
})

test.describe('link integrity', () => {
  for (const route of ALL_ROUTES) {
    test(`every internal link on ${route.id} resolves`, async ({ page, request }) => {
      await page.goto(route.path)

      const links = await internalLinks(page)
      expect(links.length, `${route.id} rendered no internal links at all`).toBeGreaterThan(0)

      const documents = new Map<string, FetchedDocument>()

      for (const href of links) {
        const { pathname, hashId } = splitHref(href)

        // The 404 document is the one page whose own URL legitimately answers
        // 404, and its skip link points back at itself.
        const isSelfLinkOn404 = route === NOT_FOUND_ROUTE && pathname === route.path

        if (!isSelfLinkOn404) {
          const { status } = await fetchDocument(request, documents, pathname)
          expect(status, `link "${href}" on ${route.id} answers HTTP ${status}`).toBeLessThan(400)
        }

        if (!hashId) continue

        if (pathname === route.path) {
          await expect(
            page.locator(`[id="${hashId}"]`),
            `link "${href}" on ${route.id} targets an id that is not on this page`,
          ).toHaveCount(1)
        } else {
          // A cross-page anchor (the navbar's /#services and /#process) is
          // checked against the target document's own prerendered markup.
          const { body } = await fetchDocument(request, documents, pathname)
          expect(
            body,
            `link "${href}" on ${route.id} targets id="${hashId}", which ${pathname} does not contain`,
          ).toContain(`id="${hashId}"`)
        }
      }
    })
  }
})

test.describe('external links', () => {
  for (const route of ALL_ROUTES) {
    test(`off-origin links on ${route.id} carry rel="noopener"`, async ({ page }) => {
      await page.goto(route.path)

      const offenders = await page.evaluate(() => {
        const bad: string[] = []
        document.querySelectorAll('a[href^="http"]').forEach((anchor) => {
          const href = anchor.getAttribute('href') ?? ''
          let resolved: URL
          try {
            resolved = new URL(href, window.location.href)
          } catch {
            return
          }
          if (resolved.origin === window.location.origin) return
          const rel = anchor.getAttribute('rel') ?? ''
          if (!rel.toLowerCase().split(/\s+/).includes('noopener')) bad.push(`${href} (rel="${rel}")`)
        })
        return bad
      })

      // No off-origin anchor ships today, so this stands guard: the first
      // social or client link added without rel="noopener" fails here rather
      // than handing the opened tab a live window.opener back into the site.
      expect(
        offenders,
        `off-origin links missing rel="noopener" on ${route.id}:\n${offenders.join('\n')}`,
      ).toEqual([])
    })
  }
})
