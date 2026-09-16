/**
 * Accessibility — WCAG 2.1 AA conformance and keyboard operability.
 *
 * The site sells a WCAG 2.1 AA claim in COPY (process step 4, and the About
 * credentials block). This suite is what makes that claim a measured fact
 * rather than marketing: every route is scanned by axe in BOTH themes, the
 * one interactive overlay (the mobile drawer) is scanned while open, and the
 * keyboard contract — skip link, reachable calls to action, a visible focus
 * ring, sane tab order, named landmarks, honoured reduced-motion — is
 * exercised against the real production build.
 */
import { test, expect, type Page } from '@playwright/test'
import {
  ALL_ROUTES,
  expectNoAccessibilityViolations,
  presetTheme,
  resolvedTheme,
  type RouteSpec,
} from './fixtures/site'
import { COPY } from '@/content/copy'

/** Upper bound on a forward tab walk before we call the page unreachable. */
const MAX_TAB_STOPS = 60

/** 8 columns × 6 rows — HeroA's MosaicTileGrid. */
const MOSAIC_TILE_COUNT = 48
/**
 * The grid re-rolls on a 2.2s setInterval (TILE_INTERVAL_MS in HeroA.tsx), so
 * samples taken 2.5s apart straddle at least one roll.
 */
const MOSAIC_SAMPLE_GAP_MS = 2_500

/**
 * Navigate and wait until the route itself is on screen.
 *
 * Every route is `React.lazy` behind App's Suspense fallback ("Loading…"), and
 * the prerendered markup is hydrated on top. Asserting the route's own <h1> is
 * visible is what proves an axe scan ran against the real page rather than the
 * fallback — a scan of a one-line spinner passes trivially.
 */
async function openRoute(page: Page, route: RouteSpec) {
  await page.goto(route.path)
  await expect(page.locator('h1').first()).toContainText(route.h1)
}

/**
 * Wait until the app is hydrated and quiet: the route chunk has been fetched
 * and React has taken over the prerendered DOM. Anything that presses keys or
 * samples DOM state needs this, because hydration of a suspended lazy route
 * can replace the markup underneath an in-flight interaction.
 */
async function openRouteHydrated(page: Page, route: RouteSpec) {
  await openRoute(page, route)
  await page.waitForLoadState('networkidle')
}

const HOME = ALL_ROUTES.find((r) => r.path === '/') as RouteSpec

test.describe('axe WCAG 2.1 AA — light theme', () => {
  for (const route of ALL_ROUTES) {
    test(`${route.id} has no accessibility violations in light theme`, async ({ page }) => {
      await presetTheme(page, 'light')
      await openRoute(page, route)
      // Guards the scan against being silently run in the wrong palette.
      expect(await resolvedTheme(page)).toBe('light')
      await expectNoAccessibilityViolations(page)
    })
  }
})

test.describe('axe WCAG 2.1 AA — dark theme', () => {
  for (const route of ALL_ROUTES) {
    test(`${route.id} has no accessibility violations in dark theme`, async ({ page }) => {
      // Dark mode is where contrast regressions hide: the light palette was
      // hand-tuned to AA, and the dark token block has to clear the bar on its
      // own — nothing about the light tuning carries over.
      await presetTheme(page, 'dark')
      await openRoute(page, route)
      expect(await resolvedTheme(page)).toBe('dark')
      await expectNoAccessibilityViolations(page)
    })
  }
})

test.describe('mobile navigation drawer', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('the open drawer has no accessibility violations', async ({ page }) => {
    await openRouteHydrated(page, HOME)

    await page.getByRole('button', { name: 'Open menu' }).click()

    const drawer = page.getByRole('dialog')
    await expect(drawer).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Mobile primary' })).toBeVisible()

    // Scanned as a whole document, not just the dialog subtree: an overlay's
    // failures are mostly relational — a dialog with no accessible name, or
    // focusable page content left reachable behind an aria-hidden wrapper —
    // and none of that is visible from inside the dialog alone.
    await expectNoAccessibilityViolations(page)
  })
})

/**
 * Tab-order coverage is deliberately not run on WebKit.
 *
 * Safari does not move keyboard focus to links with Tab unless the user turns
 * on "Full Keyboard Access" (System Settings > Keyboard), and Playwright's
 * WebKit build inherits that default. Every assertion in these blocks is about
 * where Tab lands, so on WebKit they measure Safari's setting rather than
 * anything about this site — there is no markup change that would make them
 * pass. The same journeys are covered on Chromium and Firefox, where Tab
 * reaches links, and the WCAG requirement itself (a reachable, visible,
 * correctly-ordered focus path) is verified there.
 */
const tabFocusesLinks = () =>
  test.skip(
    test.info().project.name === 'webkit' || test.info().project.name === 'mobile-safari',
    'Safari does not Tab to links unless Full Keyboard Access is enabled',
  )

test.describe('skip link', () => {
  test.beforeEach(tabFocusesLinks)

  for (const route of ALL_ROUTES) {
    test(`${route.id} puts a working skip link on the first tab stop`, async ({ page }) => {
      await openRouteHydrated(page, route)

      const skipLink = page.getByRole('link', { name: 'Skip to content' })
      await page.keyboard.press('Tab')
      await expect(skipLink).toBeFocused()

      // Unfocused it is clipped to 1px and parked at left:-9999px. The `focus:`
      // variants are what make it a real banner, and a dropped variant would
      // leave a keyboard user tabbing an invisible control.
      const box = await skipLink.boundingBox()
      expect(box, 'the focused skip link has no layout box').not.toBeNull()
      const viewport = page.viewportSize()
      if (box && viewport) {
        expect(box.width).toBeGreaterThan(1)
        expect(box.height).toBeGreaterThan(1)
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.y).toBeGreaterThanOrEqual(0)
        expect(box.x).toBeLessThan(viewport.width)
        expect(box.y).toBeLessThan(viewport.height)
      }

      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(/#main$/)

      // A skip link earns its name only if it actually skips the navbar. Two
      // outcomes count: the browser scrolled <main> to the top of the viewport,
      // or it moved the sequential-focus starting point so the next Tab lands
      // past the banner. <main> carries no tabindex, so on engines that do not
      // move the focus starting point for a non-focusable target the fix is
      // `tabindex="-1"` on <main>, not a weaker assertion here.
      const mainTop = await page
        .locator('#main')
        .evaluate((el) => el.getBoundingClientRect().top)

      await page.keyboard.press('Tab')
      const landing = await page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body || el === document.documentElement) return null
        return {
          tag: el.tagName.toLowerCase(),
          insideBanner: !!el.closest('header') && !el.closest('main'),
          insideMain: !!el.closest('main'),
          isSkipLink: el.getAttribute('href') === '#main',
        }
      })

      const scrolledToMain = mainTop <= 1
      const focusMovedPastBanner = !!landing && !landing.insideBanner && !landing.isSkipLink
      expect(
        scrolledToMain || focusMovedPastBanner,
        `activating the skip link neither scrolled #main into view (its top was ${mainTop}px) ` +
          `nor moved focus past the banner (next tab stop: ${JSON.stringify(landing)})`,
      ).toBe(true)
    })
  }
})

interface TabStop {
  /** aria-label when present, otherwise the trimmed text content. */
  name: string
  region: 'banner' | 'hero' | 'main' | 'contentinfo' | 'other'
  tag: string
}

test.describe('keyboard operability on the home page', () => {
  test.beforeEach(tabFocusesLinks)

  // The navbar cluster (nav links, theme toggle, primary CTA) is `hidden`
  // below 768px — below that width these controls live in the drawer instead,
  // so the desktop tab order is only meaningful at a desktop width.
  test.use({ viewport: { width: 1440, height: 900 } })

  test('both primary calls to action are reachable by keyboard', async ({ page }) => {
    await openRouteHydrated(page, HOME)

    const stops: TabStop[] = []
    for (let i = 0; i < MAX_TAB_STOPS; i++) {
      await page.keyboard.press('Tab')
      const stop = await page.evaluate((): TabStop | null => {
        const el = document.activeElement
        if (!el || el === document.body || el === document.documentElement) return null
        const label = el.getAttribute('aria-label')
        const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
        // <header> also wraps section headings inside <main>; only the one
        // outside <main> is the banner.
        const region: TabStop['region'] = el.closest('footer')
          ? 'contentinfo'
          : el.closest('header') && !el.closest('main')
            ? 'banner'
            : el.closest('section[aria-labelledby="hero-heading"]')
              ? 'hero'
              : el.closest('main')
                ? 'main'
                : 'other'
        return { name: (label ?? text).replace(/\s+/g, ' ').trim(), region, tag: el.tagName.toLowerCase() }
      })
      if (!stop) break
      stops.push(stop)
      if (stop.region === 'contentinfo') break
    }

    const reached = stops.map((s) => `${s.region}:${s.tag} "${s.name}"`).join('\n  ')

    // The navbar CTA and the hero CTA carry the same label, so region is what
    // distinguishes them — matching on the label alone would let one reachable
    // CTA satisfy the assertion for both.
    expect(
      stops.some((s) => s.region === 'banner' && s.name.includes(COPY.nav.primaryCta.label)),
      `the navbar primary CTA ("${COPY.nav.primaryCta.label}") was not reachable within ` +
        `${MAX_TAB_STOPS} tab stops. Reached:\n  ${reached}`,
    ).toBe(true)

    expect(
      stops.some((s) => s.region === 'hero' && s.name.includes(COPY.hero.primaryCta.label)),
      `the hero primary CTA ("${COPY.hero.primaryCta.label}") was not reachable within ` +
        `${MAX_TAB_STOPS} tab stops. Reached:\n  ${reached}`,
    ).toBe(true)
  })

  test('every representative control paints a visible focus indicator', async ({ page }) => {
    await openRouteHydrated(page, HOME)

    const probes = [
      { id: 'navbar-cta', label: 'navbar primary CTA', selector: 'header a[href$="/contact"]' },
      { id: 'theme-toggle', label: 'navbar theme toggle', selector: 'header button[data-theme-state]' },
      { id: 'nav-link', label: 'first primary nav link', selector: 'nav[aria-label="Primary"] a' },
      { id: 'faq-trigger', label: 'first FAQ accordion trigger', selector: '#faq button' },
    ]

    // Mark each probe and record how it paints while nothing is focused.
    const unfocused = await page.evaluate((specs) => {
      const out: Record<string, { outlineStyle: string; outlineWidth: string; outlineColor: string; boxShadow: string } | null> = {}
      for (const spec of specs) {
        const el = document.querySelector<HTMLElement>(spec.selector)
        if (!el) {
          out[spec.id] = null
          continue
        }
        el.setAttribute('data-focus-probe', spec.id)
        const style = window.getComputedStyle(el)
        out[spec.id] = {
          outlineStyle: style.outlineStyle,
          outlineWidth: style.outlineWidth,
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow,
        }
      }
      return out
    }, probes.map(({ id, selector }) => ({ id, selector })))

    // Focus is driven by real Tab presses rather than element.focus(): the
    // rules under test are `:focus-visible`, which only matches when the
    // browser judges the focus to be keyboard-driven.
    const focused: Record<string, { outlineStyle: string; outlineWidth: string; outlineColor: string; boxShadow: string }> = {}
    for (let i = 0; i < MAX_TAB_STOPS && Object.keys(focused).length < probes.length; i++) {
      await page.keyboard.press('Tab')
      const hit = await page.evaluate(() => {
        const el = document.activeElement
        const id = el?.getAttribute('data-focus-probe')
        if (!el || !id) return null
        const style = window.getComputedStyle(el)
        return {
          id,
          signature: {
            outlineStyle: style.outlineStyle,
            outlineWidth: style.outlineWidth,
            outlineColor: style.outlineColor,
            boxShadow: style.boxShadow,
          },
        }
      })
      if (hit) focused[hit.id] = hit.signature
    }

    const unmatched = probes.filter((p) => unfocused[p.id] === null).map((p) => p.selector)
    expect(unmatched, 'focus probes matched no element — the selectors have drifted').toEqual([])

    const unreached = probes.filter((p) => unfocused[p.id] && !focused[p.id]).map((p) => p.label)
    expect(unreached, `never took keyboard focus within ${MAX_TAB_STOPS} tab stops`).toEqual([])

    for (const probe of probes) {
      const before = unfocused[probe.id]
      const after = focused[probe.id]
      // Both cases already failed above; this keeps the comparison well typed.
      if (!before || !after) continue

      // Catches `outline: none` with no replacement — the single most common
      // keyboard-accessibility regression, and invisible in an axe scan
      // because axe cannot evaluate focus-state styling.
      expect(
        after,
        `${probe.label} paints identically focused and unfocused: ${JSON.stringify(after)}`,
      ).not.toEqual(before)

      const outlineWidth = Number.parseFloat(after.outlineWidth)
      const perceivable =
        (after.outlineStyle !== 'none' && outlineWidth > 0) || after.boxShadow !== 'none'
      expect(
        perceivable,
        `${probe.label} has no perceivable focus ring: ${JSON.stringify(after)}`,
      ).toBe(true)
    }
  })
})

test.describe('document structure', () => {
  for (const route of ALL_ROUTES) {
    test(`${route.id} exposes one of each landmark and names every nav`, async ({ page }) => {
      await openRoute(page, route)

      await expect(page.getByRole('main')).toHaveCount(1)
      await expect(page.getByRole('banner')).toHaveCount(1)
      await expect(page.getByRole('contentinfo')).toHaveCount(1)

      // Two navigations coexist (Primary and Footer, plus Mobile primary once
      // the drawer opens), so an unnamed <nav> is genuinely ambiguous to a
      // screen-reader user cycling landmarks.
      const navs = page.locator('nav')
      const navCount = await navs.count()
      expect(navCount).toBeGreaterThan(0)
      for (let i = 0; i < navCount; i++) {
        const name = await navs.nth(i).evaluate((el) => {
          const label = el.getAttribute('aria-label')
          if (label) return label.trim()
          const labelledBy = el.getAttribute('aria-labelledby')
          if (!labelledBy) return ''
          return labelledBy
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent ?? '')
            .join(' ')
            .trim()
        })
        expect(name, `<nav> #${i + 1} on ${route.path} has no accessible name`).not.toBe('')
      }
    })

    test(`${route.id} uses no positive tabindex`, async ({ page }) => {
      await openRoute(page, route)

      // A tabindex above 0 jumps the element to the front of the tab order for
      // the whole document, so one of them silently reorders every other
      // control on the page.
      const positive = await page.evaluate(() =>
        [...document.querySelectorAll('[tabindex]')]
          .map((el) => ({
            tabindex: el.getAttribute('tabindex') ?? '',
            element: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ''),
          }))
          .filter((entry) => Number.parseInt(entry.tabindex, 10) > 0),
      )
      expect(positive, `positive tabindex values on ${route.path}`).toEqual([])
    })

    test(`${route.id} declares a document language and title`, async ({ page }) => {
      await openRoute(page, route)

      // WCAG 3.1.1 (Language of Page) and 2.4.2 (Page Titled).
      const lang = await page.locator('html').getAttribute('lang')
      expect(lang, `<html lang> on ${route.path}`).toMatch(/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/)
      await expect(page).toHaveTitle(route.title)
    })
  }
})

/** Serialise the hero mosaic as the per-tile inline opacity, in DOM order. */
async function readMosaicTiles(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const grid = document.querySelector(
      'section[aria-labelledby="hero-heading"] div[aria-hidden="true"]',
    )
    if (!grid) return []
    return [...grid.children].map((tile) => (tile as HTMLElement).style.opacity)
  })
}

test.describe('prefers-reduced-motion is honoured', () => {
  test.describe('with reduced motion requested', () => {
    test.use({ reducedMotion: 'reduce' })

    test('the hero mosaic stops re-rolling', async ({ page }) => {
      await openRouteHydrated(page, HOME)

      const first = await readMosaicTiles(page)
      expect(first, 'the hero mosaic grid was not found').toHaveLength(MOSAIC_TILE_COUNT)

      // Not a synchronisation wait: this is the measurement window. The grid
      // re-rolls every 2.2s, so anything longer than that would have caught at
      // least one roll if the interval were still running.
      await page.waitForTimeout(MOSAIC_SAMPLE_GAP_MS)

      const second = await readMosaicTiles(page)
      expect(
        second,
        'the hero tile grid re-rolled under prefers-reduced-motion — usePrefersReducedMotion ' +
          'is no longer gating the setInterval in HeroA',
      ).toEqual(first)
    })
  })

  test.describe('with motion allowed', () => {
    // Stated explicitly so this control test cannot be neutered by a global
    // `reducedMotion` default: without it, the test above could pass because
    // nothing animates at all.
    test.use({ reducedMotion: 'no-preference' })

    test('the hero mosaic does re-roll', async ({ page }) => {
      await openRouteHydrated(page, HOME)

      const first = await readMosaicTiles(page)
      expect(first, 'the hero mosaic grid was not found').toHaveLength(MOSAIC_TILE_COUNT)

      await expect
        .poll(async () => (await readMosaicTiles(page)).join(','), {
          message: 'the hero tile grid never re-rolled with motion allowed',
          timeout: 8_000,
          intervals: [250],
        })
        .not.toBe(first.join(','))
    })
  })
})
