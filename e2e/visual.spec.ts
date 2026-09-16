/**
 * Visual regression baselines — Chromium only (playwright.config.ts restricts
 * this file, because per-engine font rasterisation would need three sets of
 * baselines that differ for reasons nobody will ever act on).
 *
 * A FAILING VISUAL TEST IS A PROMPT TO LOOK, NOT AUTOMATICALLY A BUG.
 * The suite cannot tell an intentional redesign from a broken layout — it only
 * tells you the pixels moved. When one of these fails: open the HTML report
 * (`npx playwright show-report`), put the expected/actual/diff triptych side by
 * side, and make a deliberate call. Either the change is a regression and the
 * code gets fixed, or the change is intended and the baseline gets re-recorded
 * on purpose (`npx playwright test visual --update-snapshots`) and reviewed in
 * the diff like any other committed artifact. Re-baselining to make red go away
 * without looking is the one use of this suite that is worse than not having it.
 *
 * Snapshot names are derived from the route id in the fixture manifest, so a
 * route added to e2e/fixtures/site.ts gets its baselines automatically and the
 * missing-snapshot failure is the reminder to record them.
 */
import { test, expect, type Locator, type Page } from '@playwright/test'
import {
  ALL_ROUTES,
  presetTheme,
  resolvedTheme,
  stabilizeForScreenshot,
  type RouteSpec,
} from './fixtures/site'

/**
 * Reduced motion stops the hero mosaic's 2.2s setInterval re-roll, so the tile
 * set cannot change between the stabilize call and the capture. Viewport is
 * pinned here rather than inherited from the project, because the snapshot
 * names below promise "desktop"/"mobile" and both Chromium projects run this
 * file — an inherited viewport would file a Pixel-7-width capture under a name
 * that says desktop.
 */
test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })

const MOBILE_VIEWPORT = { width: 390, height: 844 }

const THEMES = ['light', 'dark'] as const
type CaptureTheme = (typeof THEMES)[number]

function routeById(id: string): RouteSpec {
  const found = ALL_ROUTES.find((route) => route.id === id)
  if (!found) throw new Error(`No route with id "${id}" in the fixture manifest`)
  return found
}

const HOME = routeById('home')

/**
 * The hero's 8x6 tile grid picks its lit/mid tiles with Math.random() on mount
 * (HeroA.tsx `rollTileSets`), and the prerendered markup carries a different
 * roll than the one hydration produces. Its pixels are therefore different on
 * every single run — the one genuinely non-deterministic region on the site.
 */
function heroMosaic(page: Page): Locator {
  return page.locator('section[aria-labelledby="hero-heading"] div.grid[aria-hidden="true"]')
}

function nonDeterministicRegions(page: Page, route: RouteSpec): Locator[] {
  return route.id === HOME.id ? [heroMosaic(page)] : []
}

/**
 * Load a route with the theme decided before first paint, prove the theme
 * actually applied, and freeze fonts/transitions. Asserting the resolved theme
 * matters: if index.html's pre-paint script or the localStorage key regressed,
 * every "dark" baseline would silently record the light palette and the suite
 * would keep passing against the wrong picture.
 */
async function openRoute(page: Page, route: RouteSpec, theme: CaptureTheme): Promise<void> {
  await presetTheme(page, theme)
  await page.goto(route.path)
  await expect(page.locator('h1').first()).toBeVisible()
  expect(await resolvedTheme(page)).toBe(theme)
  await stabilizeForScreenshot(page)
}

test.describe('full page — desktop', () => {
  for (const theme of THEMES) {
    for (const route of ALL_ROUTES) {
      test(`${route.id} — ${theme}`, async ({ page }) => {
        await openRoute(page, route, theme)
        await expect(page).toHaveScreenshot(`${route.id}-${theme}-desktop.png`, {
          fullPage: true,
          mask: nonDeterministicRegions(page, route),
        })
      })
    }
  }
})

test.describe('component regions', () => {
  // These regions are a few hundred pixels inside a page that is several
  // thousand tall. A shifted nav item or a broken footer column is well under
  // the full-page diff tolerance, so it would pass there and fail here.
  for (const theme of THEMES) {
    test(`site header — ${theme}`, async ({ page }) => {
      await openRoute(page, HOME, theme)
      // getByRole('banner') resolves to the ONE top-level <header>: the
      // <header> elements inside Home's <section>s map to generic, not banner.
      await expect(page.getByRole('banner')).toHaveScreenshot(`header-${theme}-desktop.png`)
    })

    test(`site footer — ${theme}`, async ({ page }) => {
      await openRoute(page, HOME, theme)
      await expect(page.getByRole('contentinfo')).toHaveScreenshot(`footer-${theme}-desktop.png`)
    })

    test(`pricing section — ${theme}`, async ({ page }) => {
      await openRoute(page, HOME, theme)
      const pricing = page.locator('#services')
      await expect(pricing).toBeVisible()
      await expect(pricing).toHaveScreenshot(`pricing-${theme}-desktop.png`)
    })
  }
})

test.describe('focus states', () => {
  for (const theme of THEMES) {
    test(`skip link while focused — ${theme}`, async ({ page }) => {
      await openRoute(page, HOME, theme)
      const skipLink = page.getByRole('link', { name: 'Skip to content' })
      // The link is clipped to 1px off-screen until it takes focus, so this is
      // the only state in which its appearance can be captured at all — and the
      // only state in which a keyboard user ever sees it.
      await skipLink.focus()
      await expect(skipLink).toBeFocused()
      await expect(skipLink).toHaveScreenshot(`skip-link-focused-${theme}.png`)
    })
  }
})

test.describe('mobile viewport', () => {
  test.use({ viewport: MOBILE_VIEWPORT })

  for (const theme of THEMES) {
    for (const route of ALL_ROUTES) {
      test(`${route.id} — ${theme}`, async ({ page }) => {
        await openRoute(page, route, theme)
        await expect(page).toHaveScreenshot(`${route.id}-${theme}-mobile.png`, {
          fullPage: true,
          mask: nonDeterministicRegions(page, route),
        })
      })
    }
  }

  for (const theme of THEMES) {
    test(`open mobile drawer — ${theme}`, async ({ page }) => {
      await openRoute(page, HOME, theme)
      await page.getByRole('banner').getByRole('button', { name: 'Open menu' }).click()

      const drawer = page.getByRole('dialog')
      await expect(drawer).toBeVisible()
      await expect(drawer.getByRole('navigation', { name: 'Mobile primary' })).toBeVisible()
      // The drawer is lazy-loaded and portalled in after the first stabilize
      // call, so its own slide-in transition needs freezing separately.
      await stabilizeForScreenshot(page)

      // Viewport-clipped, not fullPage: the dimmed overlay behind the panel is
      // half of what this capture exists to check, and the scroll lock makes a
      // full-page capture of an open dialog meaningless.
      await expect(page).toHaveScreenshot(`mobile-drawer-${theme}.png`)
    })
  }
})

test.describe('mask integrity', () => {
  test('the masked hero region resolves to exactly one element', async ({ page }) => {
    await openRoute(page, HOME, 'light')
    // If HeroA's tile-grid markup changes, `mask` silently matches nothing,
    // the random tiles land in every home baseline, and the home snapshots
    // start flaking for a reason no diff explains. This fails first instead.
    await expect(heroMosaic(page)).toHaveCount(1)
    await expect(heroMosaic(page)).toBeVisible()
  })
})
