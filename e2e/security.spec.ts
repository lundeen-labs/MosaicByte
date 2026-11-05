/**
 * Meta security policy on the production build.
 *
 * GitHub Pages sends no response headers, so the site's only Content-Security-
 * Policy and Referrer-Policy are <meta> tags stamped into the document. These
 * tests read the SERVED html (prerendered files included) and then exercise the
 * app under that policy in a real browser, because a CSP that is present but
 * wrong fails by silently blocking the site's own code.
 */
import { createHash } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'
import { ALL_ROUTES } from './fixtures/site'

const PHONE_VIEWPORT = { width: 390, height: 844 }

/** Record every CSP violation the browser reports, before any page script runs. */
async function recordCspViolations(page: Page) {
  await page.addInitScript(() => {
    ;(window as unknown as { __cspViolations: string[] }).__cspViolations = []
    document.addEventListener('securitypolicyviolation', (event) => {
      ;(window as unknown as { __cspViolations: string[] }).__cspViolations.push(
        `${event.violatedDirective} blocked ${event.blockedURI || 'inline'} (${event.sourceFile || 'document'}:${event.lineNumber})`,
      )
    })
  })
}

const cspViolations = (page: Page) =>
  page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations)

test.describe('security meta tags in the served document', () => {
  for (const route of ALL_ROUTES) {
    test(`${route.id}: carries the CSP and referrer policy, with the theme script pinned by hash`, async ({
      request,
    }) => {
      const response = await request.get(route.path)
      const html = await response.text()

      const csp = /<meta http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)?.[1]
      expect(csp, 'Content-Security-Policy meta is missing').toBeTruthy()
      expect(html).toContain('<meta name="referrer" content="strict-origin-when-cross-origin"')

      // The inline theme script is allowed by the digest of its exact text.
      const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1])
      expect(inline, 'expected the single inline theme pre-paint script').toHaveLength(1)
      const digest = `'sha256-${createHash('sha256').update(inline[0], 'utf8').digest('base64')}'`
      expect(csp).toContain(`script-src 'self' ${digest}`)

      // The policy stays closed: no blanket inline or eval allowance for scripts.
      expect(csp).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/)
      expect(csp).toContain("object-src 'none'")

      // The policy precedes every script, so it governs all of them.
      expect(html.indexOf('http-equiv="Content-Security-Policy"')).toBeLessThan(html.indexOf('<script'))
    })
  }
})

test.describe('the app runs cleanly under its own CSP', () => {
  test('home page, theme cycling and a reload raise no CSP violations', async ({ page }) => {
    await recordCspViolations(page)
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()

    const toggle = page.locator('header button[data-theme-state]')
    if (await toggle.isVisible()) {
      await toggle.click()
      await toggle.click()
    }
    await page.reload()
    await expect(page.locator('h1')).toBeVisible()

    expect(await cspViolations(page)).toEqual([])
  })

  test.describe('phone width', () => {
    test.use({ viewport: PHONE_VIEWPORT })

    test('opening the mobile drawer (lazy Radix Dialog) raises no CSP violations', async ({ page }) => {
      await recordCspViolations(page)
      await page.goto('/')
      await page.locator('header button[aria-label="Open menu"]').click()
      await expect(page.getByRole('dialog', { name: 'Mobile navigation' })).toBeVisible()
      await page.keyboard.press('Escape')

      expect(await cspViolations(page)).toEqual([])
    })
  })

  for (const route of ALL_ROUTES) {
    test(`${route.id}: first paint raises no CSP violations`, async ({ page }) => {
      await recordCspViolations(page)
      await page.goto(route.path)
      await expect(page.locator('h1')).toBeVisible()
      expect(await cspViolations(page)).toEqual([])
    })
  }
})
