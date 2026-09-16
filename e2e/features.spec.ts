/**
 * Feature behaviour — every interactive affordance on the production build.
 *
 * These run against dist/, which is prerendered by scripts/prerender.mjs and
 * then hydrated by React. So every assertion below is really two assertions in
 * one: the markup shipped correctly AND the hydrated handler is wired to it.
 * A component that renders but never hydrates fails here and nowhere else.
 */
import { expect, test, type Page } from '@playwright/test'
import { COPY } from '@/content/copy'
import { ROUTES, presetTheme, resolvedTheme } from './fixtures/site'

/** Wide enough for the `md:` (768px) breakpoint — the desktop nav + toggle. */
const DESKTOP_VIEWPORT = { width: 1280, height: 900 }
/** Below `md:` — hamburger, no desktop nav. */
const PHONE_VIEWPORT = { width: 390, height: 844 }

/**
 * The header's ThemeToggle. MobileDrawer renders a second one, but Radix
 * portals it to <body>, so scoping to <header> keeps this to exactly one
 * element even while the drawer is open.
 */
const headerThemeToggle = (page: Page) => page.locator('header button[data-theme-state]')

/**
 * Attribute selector rather than getByRole: while the drawer is open Radix
 * marks everything outside the portal aria-hidden, which removes the
 * hamburger from the accessibility tree and therefore from role queries.
 */
const hamburgerButton = (page: Page) => page.locator('header button[aria-label="Open menu"]')

const mobileDrawer = (page: Page) => page.getByRole('dialog', { name: 'Mobile navigation' })

/**
 * `system` is encoded as the ABSENCE of the attribute, so that the CSS
 * `prefers-color-scheme` block is what decides. Passing `null` asserts that.
 */
async function expectDocumentTheme(page: Page, expected: 'light' | 'dark' | null) {
  const html = page.locator('html')
  if (expected === null) await expect(html).not.toHaveAttribute('data-theme', /.*/)
  else await expect(html).toHaveAttribute('data-theme', expected)
}

test.describe('theme toggle — desktop header', () => {
  test.use({ viewport: DESKTOP_VIEWPORT })

  test('cycles system -> light -> dark -> system and wraps back to light', async ({ page }) => {
    await page.goto('/')
    const toggle = headerThemeToggle(page)
    await expect(toggle).toBeVisible()

    // Clean context: nothing in localStorage, so the app starts in `system`.
    await expect(toggle).toHaveAttribute('data-theme-state', 'system')
    await expectDocumentTheme(page, null)
    // The label names the NEXT action, not the current state — a screen-reader
    // user pressing "Switch to light theme" must actually land on light.
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme')

    await toggle.click()
    await expect(toggle).toHaveAttribute('data-theme-state', 'light')
    await expectDocumentTheme(page, 'light')
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme')

    await toggle.click()
    await expect(toggle).toHaveAttribute('data-theme-state', 'dark')
    await expectDocumentTheme(page, 'dark')
    await expect(toggle).toHaveAttribute('aria-label', 'Use system theme')

    await toggle.click()
    await expect(toggle).toHaveAttribute('data-theme-state', 'system')
    await expectDocumentTheme(page, null)

    // Fourth press proves the cycle wraps rather than dead-ending on system.
    await toggle.click()
    await expect(toggle).toHaveAttribute('data-theme-state', 'light')
    await expectDocumentTheme(page, 'light')
  })

  test('a chosen theme survives a reload', async ({ page }) => {
    await page.goto('/')
    const toggle = headerThemeToggle(page)
    await expect(toggle).toBeVisible()

    // Reach dark through the app's own persist path (system -> light -> dark)
    // rather than seeding storage, so this covers the write as well as the read.
    await toggle.click()
    await toggle.click()
    await expectDocumentTheme(page, 'dark')
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('mosaic-theme')))
      .toBe('dark')

    await page.reload()
    await expectDocumentTheme(page, 'dark')
    await expect(headerThemeToggle(page)).toHaveAttribute('data-theme-state', 'dark')
  })

  test('the saved theme is applied before any bundle runs — no flash of light', async ({ page }) => {
    await presetTheme(page, 'dark')

    // Block the whole hashed module graph. With React unable to boot, the only
    // code that can possibly set <html data-theme> is the synchronous inline
    // script in index.html — so finding 'dark' here proves the attribute is in
    // place at first paint rather than after hydration. That is precisely the
    // "no flash of light" property; reading it right after a `commit`-only
    // navigation would race the parser instead of proving anything.
    const blockedScripts: string[] = []
    await page.route('**/assets/*.js', async (route) => {
      blockedScripts.push(route.request().url())
      await route.abort()
    })

    await page.goto('/')
    await expectDocumentTheme(page, 'dark')
    expect(
      blockedScripts.length,
      'no /assets/*.js request was intercepted, so this run did not actually test the pre-hydration path',
    ).toBeGreaterThan(0)
  })

  test.describe('with the OS preference set to dark', () => {
    test.use({ colorScheme: 'dark' })

    test('follows the OS while in system mode', async ({ page }) => {
      await page.goto('/')
      await expect(headerThemeToggle(page)).toHaveAttribute('data-theme-state', 'system')
      // System mode must leave the attribute off so CSS decides; stamping
      // data-theme="light" here would pin the site to light on a dark OS.
      await expectDocumentTheme(page, null)
      expect(await resolvedTheme(page)).toBe('dark')
    })
  })
})

test.describe('mobile drawer', () => {
  test.use({ viewport: PHONE_VIEWPORT })

  test('replaces the desktop nav below the md breakpoint', async ({ page }) => {
    await page.goto('/')
    await expect(hamburgerButton(page)).toBeVisible()
    await expect(page.locator('nav[aria-label="Primary"]')).toBeHidden()
  })

  test('opens, traps focus, and returns focus to the hamburger on Escape', async ({ page }) => {
    await page.goto('/')
    const hamburger = hamburgerButton(page)
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false')

    // Open via keyboard: WebKit does not focus a <button> on mouse click, so a
    // click-then-assert-restore test would fail there for a reason that has
    // nothing to do with the drawer. Focusing first makes the restore target
    // unambiguous on every engine.
    await hamburger.focus()
    await expect(hamburger).toBeFocused()
    await hamburger.press('Enter')

    const drawer = mobileDrawer(page)
    await expect(drawer).toBeVisible()
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('navigation', { name: 'Mobile primary' })).toBeVisible()

    await expect
      .poll(() => drawer.evaluate((el) => el.contains(document.activeElement)), {
        message: 'focus must move inside the drawer, or a keyboard user is stranded behind it',
      })
      .toBe(true)

    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false')
    await expect(hamburger).toBeFocused()
  })

  test('closes via its own Close button', async ({ page }) => {
    await page.goto('/')
    await hamburgerButton(page).click()
    const drawer = mobileDrawer(page)
    await expect(drawer).toBeVisible()

    await drawer.getByRole('button', { name: 'Close menu' }).click()
    await expect(drawer).toBeHidden()
    await expect(hamburgerButton(page)).toHaveAttribute('aria-expanded', 'false')
  })

  test('a nav link inside the drawer navigates and dismisses the drawer', async ({ page }) => {
    // The hash items scroll in place; only a real route link proves navigation.
    const drawerRoute = COPY.nav.primary.find((item) => !item.href.includes('#'))
    expect(
      drawerRoute,
      'COPY.nav.primary must contain at least one non-hash route for the drawer to navigate to',
    ).toBeDefined()
    const routeSpec = ROUTES.find((route) => route.path === drawerRoute?.href)
    expect(routeSpec, `ROUTES must describe the drawer link target ${drawerRoute?.href}`).toBeDefined()

    await page.goto('/')
    await hamburgerButton(page).click()
    const drawer = mobileDrawer(page)
    await expect(drawer).toBeVisible()

    await drawer.getByRole('link', { name: drawerRoute?.label ?? '' }).click()

    await expect(page).toHaveURL(drawerRoute?.href ?? '')
    // Title proves the route actually rendered, not just that history changed.
    await expect(page).toHaveTitle(routeSpec?.title ?? '')
    await expect(drawer).toBeHidden()
    await expect(hamburgerButton(page)).toHaveAttribute('aria-expanded', 'false')
  })

  test('its chunk is not fetched until the hamburger is tapped', async ({ page }) => {
    // Guards the bundle decision in CLAUDE.md: the Radix Dialog ecosystem
    // (~31 KB raw) is lazy() so it stays out of the eager `/` payload. A stray
    // static import in Navbar would silently pull it back into the entry graph
    // and this is the only thing that would notice.
    const drawerChunkRequests: string[] = []
    page.on('request', (request) => {
      if (/MobileDrawer/.test(request.url())) drawerChunkRequests.push(request.url())
    })

    await page.goto('/')
    await expect(hamburgerButton(page)).toBeVisible()
    // Settle the network so "not requested yet" means it, rather than meaning
    // the request simply had not been issued at the moment we looked.
    await page.waitForLoadState('networkidle')
    expect(
      drawerChunkRequests,
      'the MobileDrawer chunk must not be part of the initial payload',
    ).toEqual([])

    await hamburgerButton(page).click()
    await expect(mobileDrawer(page)).toBeVisible()
    expect(drawerChunkRequests.length).toBeGreaterThan(0)
  })
})

test.describe('home page sections', () => {
  const faqItems = COPY.faq.items.slice(0, 2)

  test('FAQ answers open on demand and report their state', async ({ page }) => {
    await page.goto('/')
    const faq = page.locator('#faq')
    await expect(faq).toBeVisible()

    for (const item of faqItems) {
      const trigger = faq.getByRole('button', { name: item.q })
      await expect(trigger).toBeVisible()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')

      // Resolve the panel through aria-controls rather than the panel's
      // accessible name: the name is computed through aria-labelledby and the
      // three engines do not agree on it, but the id wiring is the same
      // everywhere — and a broken wire is itself the defect worth catching.
      const panelId = await trigger.getAttribute('aria-controls')
      expect(panelId, `FAQ trigger "${item.q}" must point at its panel via aria-controls`).toBeTruthy()
      const panel = page.locator(`[id="${panelId ?? ''}"]`)
      await expect(panel).toBeHidden()

      await trigger.click()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await expect(panel).toBeVisible()
      await expect(panel).toContainText(item.a)
    }

    // `type="multiple"` — opening the second must not have collapsed the first.
    for (const item of faqItems) {
      await expect(faq.getByRole('button', { name: item.q })).toHaveAttribute('aria-expanded', 'true')
    }
  })

  test('renders exactly the pricing tiers COPY declares', async ({ page }) => {
    await page.goto('/')
    // Direct children of #services only: the retainer is a fourth PricingTier
    // living in its own <aside>, and counting it here would hide a dropped tier.
    const tierCards = page.locator('#services > ul[role="list"] > li article')
    await expect(tierCards).toHaveCount(COPY.services.tiers.length)

    for (const [index, tier] of COPY.services.tiers.entries()) {
      const card = tierCards.nth(index)
      await expect(card).toContainText(tier.name)
      await expect(card).toContainText(tier.price)
      const featured = 'featured' in tier && tier.featured === true
      await expect(card).toHaveAttribute('data-featured', String(featured))
    }

    // The retainer is a separate COPY key; it went missing from the page once
    // already when the tiers array was reshaped.
    const retainer = page.locator('aside[aria-label="Optional retainer"] article')
    await expect(retainer).toContainText(COPY.services.retainer.name)
    await expect(retainer).toContainText(COPY.services.retainer.price)
  })

  test('renders every process step in COPY order', async ({ page }) => {
    await page.goto('/')
    const steps = page.locator('ol[aria-label="Process timeline"] > li')
    await expect(steps).toHaveCount(COPY.process.steps.length)

    for (const [index, step] of COPY.process.steps.entries()) {
      const item = steps.nth(index)
      await expect(item).toContainText(step.label)
      await expect(item).toContainText(step.day)
    }
  })

  test('the hero secondary CTA scrolls to its in-page anchor', async ({ page }) => {
    // WebKit gets a longer budget for this one. Smooth scrolling is the only
    // assertion in the suite that waits on the compositor, and under parallel
    // load WebKit is slow enough to miss it: run in isolation it passed 8/8,
    // run inside the full mobile-safari project it failed roughly 1 in 6. The
    // assertions below are unchanged - this only stops a scheduling artefact
    // being reported as a product defect.
    test.slow(
      test.info().project.name === 'webkit' || test.info().project.name === 'mobile-safari',
      'WebKit smooth scrolling needs more headroom under parallel load',
    )

    const href = COPY.hero.secondaryCta.href
    expect(href, 'the hero secondary CTA is the in-page jump; it must carry a hash').toContain('#')
    const targetId = href.split('#')[1]

    await page.goto('/')
    const cta = page
      .locator('section[aria-labelledby="hero-heading"]')
      .getByRole('link', { name: COPY.hero.secondaryCta.label })
    await expect(cta).toBeVisible()
    expect(await page.evaluate(() => window.scrollY)).toBe(0)

    const target = page.locator(`#${targetId}`)
    await expect(target).toHaveCount(1)

    await cta.click()
    await expect(page).toHaveURL(new RegExp(`#${targetId}$`))

    // scroll-behavior is smooth, so poll rather than sample once. The section
    // top landing near the viewport top is what distinguishes a real anchor
    // jump from a hash that merely changed the URL.
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 }).toBeGreaterThan(0)

    // How close to the top the section lands depends on the sticky header's
    // height, which differs between a 1440px desktop and a 390px phone, and on
    // how far smooth scrolling has got when the poll samples. Anchoring the
    // threshold to a third of the viewport keeps the assertion meaningful -
    // the section is at the top of the screen, not merely somewhere on it -
    // without encoding one device's header height as a magic number.
    const viewportHeight = page.viewportSize()?.height ?? 900
    await expect
      .poll(() => target.evaluate((el) => Math.round(el.getBoundingClientRect().top)), {
        message: `#${targetId} should be scrolled to the top of the viewport`,
        timeout: 10_000,
      })
      .toBeLessThan(Math.round(viewportHeight / 3))
    await expect(target).toBeInViewport()
  })
})

test.describe('contact route', () => {
  test('offers a well-formed mailto affordance whose label matches its href', async ({ page }) => {
    // /contact is mailto-only — the serverless form went away with the Vercel
    // backend, so the email link is the entire conversion path for the route.
    await page.goto('/contact')

    const emailLink = page.locator('main a[href^="mailto:"]')
    await expect(emailLink).toHaveCount(1)
    await expect(emailLink).toBeVisible()

    const href = await emailLink.getAttribute('href')
    const address = (href ?? '').replace(/^mailto:/, '').split('?')[0]
    expect(address, `contact mailto must be a real address, got "${href}"`).toMatch(
      /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i,
    )
    expect(address).toBe(COPY.contact.email)

    // A label advertising one address while the href opens another is the
    // failure mode that loses an inquiry silently.
    await expect(emailLink).toHaveText(COPY.contact.emailCtaLabel)
    await expect(emailLink).toContainText(address)
  })
})
