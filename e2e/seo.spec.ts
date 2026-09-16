/**
 * SEO and structured-data integrity, asserted against the production build
 * served with GitHub Pages resolution rules.
 *
 * Two things make this suite worth more than a lint rule.
 *
 * 1. It reads the *served* document, so it covers the prerender step as well
 *    as the component. A regression can be introduced in src/lib/seo.tsx, in
 *    index.html, or in scripts/prerender.mjs, and all three land here.
 * 2. It never hardcodes the deployed origin. `dist/sitemap.xml`,
 *    `dist/robots.txt` and the canonical tags are all stamped from
 *    VITE_SITE_URL at build time, so a local build made without that variable
 *    has a different origin than a Pages build. Every origin assertion below
 *    is therefore relative to whatever origin the homepage canonical declares
 *    — which turns "is the origin right?" into "do these three artifacts
 *    agree?", the question that actually catches a broken deploy.
 */
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { ALL_ROUTES, ROUTES } from './fixtures/site'
import { COPY } from '@/content/copy'

/** Search snippets are truncated past this, so anything longer is wasted. */
const MAX_DESCRIPTION_LENGTH = 160

/** Every social tag the Seo component promises to render on every route. */
const REQUIRED_SOCIAL_KEYS = [
  'og:title',
  'og:description',
  'og:image',
  'og:url',
  'og:type',
  'og:site_name',
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
] as const

interface HeadSnapshot {
  titles: string[]
  canonicals: string[]
  /** Every <meta> in <head>, keyed by `name` or `property`. */
  metaByKey: Record<string, string[]>
  lang: string
}

interface DocumentStructure {
  headings: { level: number; text: string }[]
  imagesMissingAlt: string[]
  namelessLinks: string[]
}

/**
 * Navigate and wait until the route's own content is on screen, so head
 * assertions are made against a settled document rather than a transitional
 * one.
 */
async function openRoute(page: Page, path: string) {
  await page.goto(path)
  await expect(page.locator('h1').first()).toBeVisible()
}

/** Everything <head> claims about this page, read in one round trip. */
async function readHead(page: Page): Promise<HeadSnapshot> {
  return page.evaluate(() => {
    const metaByKey: Record<string, string[]> = {}
    document.head.querySelectorAll('meta').forEach((meta) => {
      const key = meta.getAttribute('name') ?? meta.getAttribute('property')
      if (!key) return
      if (!metaByKey[key]) metaByKey[key] = []
      metaByKey[key].push(meta.getAttribute('content') ?? '')
    })

    return {
      titles: Array.from(document.head.querySelectorAll('title')).map(
        (node) => node.textContent ?? '',
      ),
      canonicals: Array.from(document.head.querySelectorAll('link[rel="canonical"]')).map(
        (node) => node.getAttribute('href') ?? '',
      ),
      metaByKey,
      lang: document.documentElement.getAttribute('lang') ?? '',
    }
  })
}

/** Heading outline, image alts and link names — the crawler-legibility set. */
async function readStructure(page: Page): Promise<DocumentStructure> {
  return page.evaluate(() => {
    /**
     * A deliberately generous approximation of the accessible-name algorithm:
     * anything that yields a name here is a name a crawler or screen reader
     * can also find, so a link that comes back empty is genuinely unlabelled.
     */
    const accessibleName = (element: Element): string => {
      const label = element.getAttribute('aria-label')
      if (label && label.trim()) return label.trim()

      const labelledBy = element.getAttribute('aria-labelledby')
      if (labelledBy) {
        const referenced = labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? '')
          .join(' ')
          .trim()
        if (referenced) return referenced
      }

      const text = (element.textContent ?? '').trim()
      if (text) return text

      const title = element.getAttribute('title')
      if (title && title.trim()) return title.trim()

      const imageAlt = element.querySelector('img[alt]')?.getAttribute('alt') ?? ''
      if (imageAlt.trim()) return imageAlt.trim()

      const svgTitle = element.querySelector('svg title')?.textContent ?? ''
      if (svgTitle.trim()) return svgTitle.trim()

      return ''
    }

    return {
      headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(
        (heading) => ({
          level: Number(heading.tagName.slice(1)),
          text: (heading.textContent ?? '').trim().slice(0, 60),
        }),
      ),
      imagesMissingAlt: Array.from(document.querySelectorAll('img'))
        .filter((image) => !image.hasAttribute('alt'))
        .map((image) => image.getAttribute('src') ?? '(no src)'),
      namelessLinks: Array.from(document.querySelectorAll('a'))
        .filter((anchor) => accessibleName(anchor) === '')
        .map((anchor) => anchor.getAttribute('href') ?? '(no href)'),
    }
  })
}

let cachedCanonicalOrigin: Promise<string> | undefined

/**
 * The origin this build actually stamped into its canonical tags. Read from
 * the served homepage rather than from an env var, because the served
 * document is the only thing a crawler ever sees.
 */
function canonicalOrigin(request: APIRequestContext): Promise<string> {
  if (!cachedCanonicalOrigin) {
    cachedCanonicalOrigin = (async () => {
      const response = await request.get('/')
      expect(response.status(), 'homepage must be served before anything else can be checked').toBe(
        200,
      )
      const html = await response.text()
      const tag = html.match(/<link[^>]*rel="canonical"[^>]*>/i)?.[0] ?? ''
      const href = tag.match(/href="([^"]+)"/i)?.[1] ?? ''
      expect(href, 'homepage ships no <link rel="canonical">').not.toBe('')
      return new URL(href).origin
    })()
  }
  return cachedCanonicalOrigin
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseJsonLd(raw: string): Record<string, unknown> {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`JSON-LD block is not valid JSON (${reason}): ${raw.slice(0, 200)}`)
  }
  if (!isRecord(parsed)) {
    throw new Error(`JSON-LD block is not an object: ${raw.slice(0, 200)}`)
  }
  return parsed
}

/** Digits-only price for a COPY tier, e.g. 'from $5,000' -> 5000. */
function tierPriceNumber(price: string): number {
  return Number(price.replace(/[^0-9]/g, ''))
}

for (const spec of ALL_ROUTES) {
  test.describe(`SEO · ${spec.id} (${spec.path})`, () => {
    test('renders exactly one title, canonical and description', async ({ page, request }) => {
      const origin = await canonicalOrigin(request)
      await openRoute(page, spec.path)
      const head = await readHead(page)

      // index.html deliberately carries no static <title>/<meta description>:
      // React 19 hoists the per-route ones, so reinstating a static pair would
      // ship two titles and a duplicate-description warning in Search Console.
      // Counting is the only assertion that catches that regression.
      expect(head.titles, `expected one <title>, got ${head.titles.length}`).toHaveLength(1)
      expect(head.titles[0]).toBe(spec.title)

      expect(
        head.canonicals,
        `expected one <link rel="canonical">, got ${head.canonicals.length}: ${head.canonicals.join(', ')}`,
      ).toHaveLength(1)
      expect(head.canonicals[0]).toBe(`${origin}${spec.canonicalPath}`)

      const descriptions = head.metaByKey['description'] ?? []
      expect(
        descriptions,
        `expected one <meta name="description">, got ${descriptions.length}`,
      ).toHaveLength(1)
      expect(descriptions[0].trim(), 'description is empty').not.toBe('')
      expect(
        descriptions[0].length,
        `description is ${descriptions[0].length} chars and will be truncated in results: ${descriptions[0]}`,
      ).toBeLessThan(MAX_DESCRIPTION_LENGTH)

      expect(head.lang.trim(), '<html lang> is unset, so screen readers and Search guess').not.toBe(
        '',
      )
    })

    test('ships a complete Open Graph and Twitter card', async ({ page, request }) => {
      const origin = await canonicalOrigin(request)
      await openRoute(page, spec.path)
      const head = await readHead(page)

      for (const key of REQUIRED_SOCIAL_KEYS) {
        const values = head.metaByKey[key] ?? []
        expect(values, `expected exactly one ${key}, got ${values.length}`).toHaveLength(1)
        expect(values[0].trim(), `${key} is present but empty`).not.toBe('')
      }

      // A share card pointing at a different URL than the canonical splits
      // engagement signals between two addresses for the same page.
      expect(head.metaByKey['og:url'][0]).toBe(`${origin}${spec.canonicalPath}`)
      expect(head.metaByKey['og:url'][0]).toBe(head.canonicals[0])

      // The 1200x630 OG asset is only rendered large by this card type.
      expect(head.metaByKey['twitter:card'][0]).toBe('summary_large_image')
    })

    test('the declared share images actually exist in the build', async ({ page, request }) => {
      const origin = await canonicalOrigin(request)
      await openRoute(page, spec.path)
      const head = await readHead(page)

      for (const key of ['og:image', 'twitter:image'] as const) {
        const declared = head.metaByKey[key]?.[0] ?? ''
        expect(declared, `${key} is missing`).not.toBe('')

        // The tag names the production origin, which a test runner cannot
        // reach. The asset itself must exist in dist/, so request its path
        // from the server under test.
        const target = new URL(declared, `${origin}/`)
        const response = await request.get(`${target.pathname}${target.search}`)

        expect(
          response.status(),
          `${key} points at ${declared}, which is not in the build — every share card for ${spec.path} renders blank`,
        ).toBe(200)
        expect(
          response.headers()['content-type'] ?? '',
          `${key} resolves to a non-image response`,
        ).toMatch(/^image\//)
      }
    })

    test('renders the expected JSON-LD blocks and every one is valid', async ({ page }) => {
      await openRoute(page, spec.path)

      const raw = await page.locator('script[type="application/ld+json"]').allTextContents()
      expect(
        raw,
        `expected ${spec.jsonLdBlocks} JSON-LD block(s) on ${spec.path}, got ${raw.length}`,
      ).toHaveLength(spec.jsonLdBlocks)

      for (const block of raw) {
        const parsed = parseJsonLd(block)
        // A blob without @context/@type is inert: Google parses it and
        // extracts nothing, which looks identical to shipping no markup.
        expect(
          parsed['@context'],
          `JSON-LD block has the wrong @context: ${block.slice(0, 120)}`,
        ).toBe('https://schema.org')

        const type = parsed['@type']
        expect(
          typeof type === 'string' && type.length > 0,
          `JSON-LD block has no @type: ${block.slice(0, 120)}`,
        ).toBe(true)
      }
    })

    test('is legible to a crawler: one h1, unbroken outline, named links', async ({ page }) => {
      await openRoute(page, spec.path)
      const structure = await readStructure(page)

      const h1s = structure.headings.filter((heading) => heading.level === 1)
      expect(
        h1s.length,
        `expected exactly one <h1>, found ${h1s.length}: ${h1s.map((h) => h.text).join(' | ')}`,
      ).toBe(1)

      // Assistive tech and crawlers both read the outline as a tree. Jumping
      // h2 -> h4 tells them a level exists that never renders.
      for (let i = 1; i < structure.headings.length; i += 1) {
        const previous = structure.headings[i - 1]
        const current = structure.headings[i]
        expect(
          current.level - previous.level,
          `heading level jumps from h${previous.level} ("${previous.text}") to h${current.level} ("${current.text}")`,
        ).toBeLessThanOrEqual(1)
      }

      expect(
        structure.imagesMissingAlt,
        `images with no alt attribute (use alt="" for decorative):\n${structure.imagesMissingAlt.join('\n')}`,
      ).toEqual([])

      expect(
        structure.namelessLinks,
        `links with no accessible name — unfollowable for a crawler, unreadable for a screen reader:\n${structure.namelessLinks.join('\n')}`,
      ).toEqual([])
    })
  })
}

test.describe('SEO · site-wide', () => {
  test('every route ships a distinct meta description', async ({ page }) => {
    // The exact bug that shipped here before: react-helmet-async silently
    // dropped per-route <meta>, so all five routes served one global
    // description and competed with each other for the same snippet.
    const seen = new Map<string, string[]>()

    for (const spec of ALL_ROUTES) {
      await openRoute(page, spec.path)
      const head = await readHead(page)
      const description = head.metaByKey['description']?.[0] ?? ''
      const paths = seen.get(description) ?? []
      paths.push(spec.path)
      seen.set(description, paths)
    }

    const duplicates = [...seen.entries()].filter(([, paths]) => paths.length > 1)
    expect(
      duplicates,
      `routes sharing one description:\n${duplicates
        .map(([description, paths]) => `${paths.join(', ')} -> "${description}"`)
        .join('\n')}`,
    ).toEqual([])
  })

  test('the ProfessionalService priceRange brackets the real tier prices', async ({ page }) => {
    await openRoute(page, '/')
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      parseJsonLd,
    )

    const service = blocks.find((block) => block['@type'] === 'ProfessionalService')
    if (!service) {
      throw new Error('the homepage renders no ProfessionalService JSON-LD block')
    }

    const allTierPrices = COPY.services.tiers.map((tier) => tierPriceNumber(tier.price))
    // The care plan is a recurring monthly fee, not a project price: a
    // $150/mo retainer must not be read as the floor of the project range.
    const projectTierPrices = COPY.services.tiers
      .filter((tier) => !/\/mo\b/i.test(tier.price))
      .map((tier) => tierPriceNumber(tier.price))

    expect(
      projectTierPrices.length,
      'COPY.services.tiers has no project-priced tier',
    ).toBeGreaterThan(0)
    for (const price of allTierPrices) {
      expect(Number.isFinite(price) && price > 0, 'a tier price parsed to nothing usable').toBe(true)
    }

    const cheapest = Math.min(...projectTierPrices)
    const dearest = Math.max(...projectTierPrices)

    const priceRange = String(service['priceRange'] ?? '')
    const bounds = priceRange.match(/\$?([\d,]+)\s*[-–—]\s*\$?([\d,]+)/)
    if (!bounds) {
      throw new Error(`priceRange "${priceRange}" is not a parseable low-high range`)
    }
    const low = Number(bounds[1].replace(/[^0-9]/g, ''))
    const high = Number(bounds[2].replace(/[^0-9]/g, ''))

    // A rich result advertising a $2,500 floor when the site sells a $1,500
    // tier misprices the studio in the SERP itself.
    expect(
      low,
      `JSON-LD priceRange "${priceRange}" starts at $${low}, above the cheapest real tier ($${cheapest})`,
    ).toBeLessThanOrEqual(cheapest)
    expect(
      high,
      `JSON-LD priceRange "${priceRange}" tops out at $${high}, below the dearest real tier ($${dearest})`,
    ).toBeGreaterThanOrEqual(dearest)

    const catalog = service['hasOfferCatalog']
    const rawItems = isRecord(catalog) ? catalog['itemListElement'] : undefined
    if (!Array.isArray(rawItems)) {
      throw new Error('ProfessionalService JSON-LD has no hasOfferCatalog.itemListElement array')
    }
    const offers = (rawItems as unknown[]).filter(isRecord)
    expect(offers.length, 'the offer catalog is empty').toBeGreaterThan(0)

    for (const offer of offers) {
      const price = Number(String(offer['price'] ?? '').replace(/[^0-9]/g, ''))
      expect(
        allTierPrices,
        `Offer "${String(offer['name'])}" advertises $${price}, which is not a price in COPY.services.tiers`,
      ).toContain(price)
    }
  })

  test('sitemap.xml lists every indexable route exactly once and nothing that 404s', async ({
    page,
    request,
  }) => {
    const origin = await canonicalOrigin(request)

    const response = await request.get('/sitemap.xml')
    expect(response.status(), 'sitemap.xml is not served by the build').toBe(200)
    const xml = await response.text()

    // Parsed by a real XML parser, not a regex: a malformed document is
    // rejected wholesale by Search Console, and a regex would happily read
    // <loc> values out of one.
    await page.goto('/')
    const parsed = await page.evaluate((source: string) => {
      const doc = new DOMParser().parseFromString(source, 'application/xml')
      const failure = doc.querySelector('parsererror')
      return {
        error: failure ? (failure.textContent ?? 'unknown parse error').trim().slice(0, 300) : null,
        locations: Array.from(doc.getElementsByTagName('loc')).map(
          (node) => (node.textContent ?? '').trim(),
        ),
      }
    }, xml)

    expect(parsed.error, `sitemap.xml is not well-formed XML: ${parsed.error}`).toBeNull()

    const expected = ROUTES.filter((spec) => spec.inSitemap).map(
      (spec) => `${origin}${spec.canonicalPath}`,
    )
    // Sorted comparison catches all three failure modes at once: a route
    // added to App.tsx but not to the generator, a stale entry for a deleted
    // route, and a duplicated <loc>.
    expect([...parsed.locations].sort()).toEqual([...expected].sort())

    // A sitemap is a set of indexing invitations, so a dead entry spends
    // crawl budget on a 404 every time it is fetched.
    for (const location of parsed.locations) {
      const target = new URL(location)
      const probe = await request.get(target.pathname)
      expect(
        probe.status(),
        `sitemap advertises ${location}, which answers ${probe.status()}`,
      ).toBeLessThan(400)
    }

    const unindexablePaths = ALL_ROUTES.filter((spec) => !spec.inSitemap).flatMap((spec) => [
      spec.path,
      spec.canonicalPath,
    ])
    const listedPaths = parsed.locations.map((location) => new URL(location).pathname)
    for (const path of unindexablePaths) {
      // dist/404.html resolves at /404 with a 200, so the reachability loop
      // above would not notice the error page being submitted for indexing.
      expect(listedPaths, `sitemap lists ${path}, which must never be submitted`).not.toContain(path)
    }
  })

  test('robots.txt allows crawling and advertises the sitemap that is actually served', async ({
    request,
  }) => {
    const origin = await canonicalOrigin(request)

    const response = await request.get('/robots.txt')
    expect(response.status(), 'robots.txt is not served by the build').toBe(200)
    const body = await response.text()

    const lines = body
      .split(/\r?\n/)
      .map((line) => line.replace(/#.*$/, '').trim())
      .filter(Boolean)

    let inWildcardGroup = false
    const wildcardDisallows: string[] = []
    for (const line of lines) {
      const separator = line.indexOf(':')
      if (separator === -1) continue
      const field = line.slice(0, separator).trim().toLowerCase()
      const value = line.slice(separator + 1).trim()
      if (field === 'user-agent') {
        inWildcardGroup = value === '*'
        continue
      }
      if (field === 'disallow' && inWildcardGroup) wildcardDisallows.push(value)
    }

    // `Disallow: /` under `User-agent: *` de-indexes the entire site. It is a
    // one-character edit away from the `Disallow: /admin` lines that belong.
    expect(
      wildcardDisallows,
      `robots.txt blocks every crawler from the whole site:\n${body}`,
    ).not.toContain('/')

    const advertised = lines
      .filter((line) => /^sitemap\s*:/i.test(line))
      .map((line) => line.slice(line.indexOf(':') + 1).trim())

    expect(advertised, 'robots.txt advertises no sitemap').toHaveLength(1)

    // The previous static robots.txt hardcoded a Vercel URL and kept
    // advertising it from the GitHub Pages build — a sitemap on a host that
    // build never published to.
    const sitemapUrl = new URL(advertised[0])
    expect(
      sitemapUrl.origin,
      `robots.txt advertises ${advertised[0]}, but canonicals declare ${origin}`,
    ).toBe(origin)
    expect(sitemapUrl.pathname).toBe('/sitemap.xml')

    const served = await request.get(sitemapUrl.pathname)
    expect(
      served.status(),
      `robots.txt points at ${advertised[0]}, which is not in this build`,
    ).toBe(200)
  })
})
