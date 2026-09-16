/**
 * Responsive layout integrity.
 *
 * Everything here runs against the prerendered production build in dist/,
 * served by e2e/static-server.mjs. The viewport is set BEFORE navigation so
 * the media queries that decide the layout are already correct at first
 * paint — resizing after load would measure a reflowed page rather than the
 * page a visitor at that width actually receives.
 *
 * The matrix deliberately straddles Tailwind's `md` breakpoint (48rem =
 * 768px at the 16px root font size this site uses). Navbar swaps its whole
 * navigation model there — `hidden md:block` for the desktop nav, `md:hidden`
 * for the hamburger — so an off-by-one at exactly 768 leaves a width with
 * either two navigations or none.
 */
import { test, expect, type Page, type Locator } from '@playwright/test'
import { ALL_ROUTES } from './fixtures/site'

interface Viewport {
  width: number
  height: number
  /** Used verbatim in test titles, so a failure names the width immediately. */
  label: string
}

const VIEWPORTS: Viewport[] = [
  { width: 320, height: 568, label: '320x568 (smallest phone still supported)' },
  { width: 390, height: 844, label: '390x844 (modern phone)' },
  { width: 767, height: 1024, label: '767x1024 (one pixel below the md breakpoint)' },
  { width: 768, height: 1024, label: '768x1024 (exactly the md breakpoint)' },
  { width: 1024, height: 768, label: '1024x768 (small laptop / tablet landscape)' },
  { width: 1440, height: 900, label: '1440x900 (laptop)' },
  { width: 1920, height: 1080, label: '1920x1080 (desktop)' },
]

/** Tailwind `md:` — the width at and above which the desktop nav takes over. */
const MD_BREAKPOINT = 768

/** The smallest viewport in the matrix; the tap-target floor is measured here. */
const SMALLEST = VIEWPORTS[0]

/**
 * Sub-pixel rounding means a page laid out exactly to the viewport edge can
 * report a scrollWidth a fraction larger. One pixel absorbs that and nothing
 * a human would ever see.
 */
const OVERFLOW_TOLERANCE_PX = 1

/** How many overflowing elements to name before the message stops being read. */
const MAX_OFFENDERS_REPORTED = 6

/**
 * A section carrying a headline, body copy and CTAs cannot legitimately render
 * shorter than this at any width. Anything below means the box collapsed or
 * its content was clipped away.
 */
const MIN_SECTION_HEIGHT_PX = 160

/**
 * WCAG 2.2 SC 2.5.8 Target Size (Minimum) — 24 CSS pixels is the normative
 * floor, not a nicety. Apple's HIG asks for 44x44 and Material for 48x48;
 * those are guidelines, so this suite holds the line at the standard's number.
 */
const MIN_TAP_TARGET_PX = 24

/**
 * Web fonts swap in after `load` and change every text metric, so measuring
 * before the swap reports widths no visitor sees. The race caps the wait:
 * on a runner that cannot reach fonts.gstatic.com the stylesheet simply never
 * arrives, and blocking the whole matrix on that would be a timeout, not a
 * finding.
 */
async function settleFonts(page: Page) {
  await page.evaluate(
    () =>
      Promise.race([
        document.fonts.ready.then(() => undefined),
        new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      ]),
  )
}

async function openAt(page: Page, viewport: Viewport, path: string) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height })
  await page.goto(path)
  await settleFonts(page)
}

async function boxOf(locator: Locator, what: string) {
  const box = await locator.boundingBox()
  if (!box) throw new Error(`${what}: no rendered box — the element is detached or display:none`)
  return box
}

interface RouteLayoutReport {
  scrollWidth: number
  innerWidth: number
  clientWidth: number
  /** Human-readable descriptions of the outermost elements past the right edge. */
  overflowOffenders: string[]
  heading: { left: number; right: number; height: number; fontSize: number; text: string } | null
  footer: { height: number; bottom: number; viewportHeight: number } | null
}

/**
 * One pass over a loaded route: horizontal overflow (plus who caused it), the
 * <h1>'s rendered box, and whether the footer can be scrolled to.
 *
 * The footer measurement scrolls to the bottom of the document. That has to
 * happen last: vertical scrolling does not change any horizontal measurement,
 * but it is the only way to prove the footer is reachable rather than merely
 * present in the DOM.
 */
async function measureRouteLayout(page: Page): Promise<RouteLayoutReport> {
  return page.evaluate(
    ({ tolerance, cap }) => {
      const limit = window.innerWidth + tolerance

      const describe = (el: Element): string => {
        const tag = el.tagName.toLowerCase()
        const id = el.id ? `#${el.id}` : ''
        const cls = Array.from(el.classList).slice(0, 2).join('.')
        const aria = el.getAttribute('aria-label')
        const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40)
        const rect = el.getBoundingClientRect()
        return (
          `${tag}${id}${cls ? `.${cls}` : ''}` +
          (aria ? `[aria-label="${aria}"]` : '') +
          ` right=${Math.round(rect.right)}px width=${Math.round(rect.width)}px` +
          (text ? ` text="${text}"` : '')
        )
      }

      const over = new Set<Element>()
      document.querySelectorAll('*').forEach((el) => {
        if (el === document.documentElement || el === document.body) return
        const rect = el.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) return
        if (rect.right > limit) over.add(el)
      })

      // A child inherits its parent's overflow, so listing every descendant
      // buries the one element whose width actually has to change.
      const outermost = Array.from(over).filter(
        (el) => !(el.parentElement !== null && over.has(el.parentElement)),
      )

      const h1 = document.querySelector('h1')
      const headingRect = h1?.getBoundingClientRect() ?? null
      const heading =
        h1 && headingRect
          ? {
              left: headingRect.left,
              right: headingRect.right,
              height: headingRect.height,
              fontSize: Number.parseFloat(window.getComputedStyle(h1).fontSize),
              text: (h1.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 48),
            }
          : null

      // `behavior: 'instant'` overrides the `scroll-behavior: smooth` set on
      // <html>, so the rect below is read after the scroll has landed rather
      // than mid-animation.
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
      const footerEl = document.querySelector('footer')
      const footerRect = footerEl?.getBoundingClientRect() ?? null
      const footer =
        footerEl && footerRect
          ? {
              height: footerRect.height,
              bottom: footerRect.bottom,
              viewportHeight: window.innerHeight,
            }
          : null

      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth,
        overflowOffenders: outermost.slice(0, cap).map(describe),
        heading,
        footer,
      }
    },
    { tolerance: OVERFLOW_TOLERANCE_PX, cap: MAX_OFFENDERS_REPORTED },
  )
}

interface UndersizedTarget {
  label: string
  width: number
  height: number
  /** Distance to the closest neighbouring target's centre, in CSS pixels. */
  nearestNeighbourPx: number
}

/**
 * Every visible link and button inside the layout header and the footer,
 * measured against SC 2.5.8.
 *
 * The success criterion has two limbs and both are applied: a target passes
 * outright at 24x24, and an undersized one still passes under the normative
 * Spacing exception if a 24px-diameter circle centred on its bounding box
 * does not reach the circle of any other target. Checking only the first limb
 * would flag stacked text links that the standard explicitly permits, which
 * is a failure nobody should have to triage.
 */
async function undersizedTapTargets(page: Page): Promise<UndersizedTarget[]> {
  return page.evaluate(
    ({ min }): UndersizedTarget[] => {
      // The layout header is the first <header> in DOM order; Home's section
      // headers are <header> elements too, and none of them are navigation.
      const roots = [document.querySelector('header'), document.querySelector('footer')].filter(
        (root): root is HTMLElement => root !== null,
      )

      const targets: { el: Element; rect: DOMRect }[] = []
      for (const root of roots) {
        root.querySelectorAll('a[href], button').forEach((el) => {
          const rect = el.getBoundingClientRect()
          if (rect.width <= 0 || rect.height <= 0) return
          const style = window.getComputedStyle(el)
          if (style.visibility === 'hidden' || style.display === 'none') return
          targets.push({ el, rect })
        })
      }

      const centreOf = (rect: DOMRect) => ({
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      })

      const describe = (el: Element) => {
        const where = el.closest('footer') ? 'footer' : 'header'
        const aria = el.getAttribute('aria-label')
        const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 32)
        return `${where} <${el.tagName.toLowerCase()}> ${aria ? `aria-label="${aria}"` : `"${text}"`}`
      }

      const offenders: UndersizedTarget[] = []
      for (const target of targets) {
        if (target.rect.width >= min && target.rect.height >= min) continue

        const centre = centreOf(target.rect)
        let nearest = Number.POSITIVE_INFINITY
        for (const other of targets) {
          if (other === target) continue
          const otherCentre = centreOf(other.rect)
          nearest = Math.min(
            nearest,
            Math.hypot(centre.x - otherCentre.x, centre.y - otherCentre.y),
          )
        }
        // Two 12px-radius circles touch at exactly `min` apart; the half pixel
        // keeps rounding from turning a compliant layout into a failure.
        if (nearest >= min - 0.5) continue

        offenders.push({
          label: describe(target.el),
          width: Math.round(target.rect.width * 10) / 10,
          height: Math.round(target.rect.height * 10) / 10,
          nearestNeighbourPx: Math.round(nearest * 10) / 10,
        })
      }
      return offenders
    },
    { min: MIN_TAP_TARGET_PX },
  )
}

test.describe('viewport matrix', () => {
  for (const viewport of VIEWPORTS) {
    test(`every route lays out inside ${viewport.label}`, async ({ page }) => {
      const overflowing: string[] = []
      const clippedHeadings: string[] = []
      const unreachableFooters: string[] = []

      for (const route of ALL_ROUTES) {
        await test.step(route.path, async () => {
          await openAt(page, viewport, route.path)
          const report = await measureRouteLayout(page)

          if (report.scrollWidth > report.innerWidth + OVERFLOW_TOLERANCE_PX) {
            const culprits = report.overflowOffenders.length
              ? report.overflowOffenders.map((o) => `        ${o}`).join('\n')
              : '        (no single element exceeds the edge — check a negative margin or a transform)'
            overflowing.push(
              `    ${route.path}: scrollWidth ${report.scrollWidth}px > innerWidth ${report.innerWidth}px\n${culprits}`,
            )
          }

          if (!report.heading) {
            clippedHeadings.push(`    ${route.path}: no <h1> rendered at all`)
          } else {
            const { left, right, height, fontSize, text } = report.heading
            if (left < -OVERFLOW_TOLERANCE_PX || right > report.clientWidth + OVERFLOW_TOLERANCE_PX) {
              clippedHeadings.push(
                `    ${route.path}: <h1> box spans ${Math.round(left)}..${Math.round(right)}px, ` +
                  `outside the 0..${report.clientWidth}px viewport — "${text}"`,
              )
            }
            // Display faces here use leading as tight as 0.9 (the 404's "404"),
            // so the floor is proportional rather than a full line box; it
            // catches a heading squashed to nothing without flagging tight
            // editorial leading.
            if (height < fontSize * 0.7) {
              clippedHeadings.push(
                `    ${route.path}: <h1> rendered ${Math.round(height)}px tall at ` +
                  `${Math.round(fontSize)}px font-size — text is clipped`,
              )
            }
          }

          if (!report.footer) {
            unreachableFooters.push(`    ${route.path}: no <footer> in the document`)
          } else {
            const { height, bottom, viewportHeight } = report.footer
            if (height <= 0) {
              unreachableFooters.push(`    ${route.path}: <footer> collapsed to zero height`)
            } else if (bottom > viewportHeight + 2) {
              // Scrolled to the very bottom of the document, the footer's last
              // pixel has to be on screen. When it is not, something above it
              // is pinning the scroll height — the classic fixed-height
              // wrapper that swallows the footer on short viewports.
              unreachableFooters.push(
                `    ${route.path}: after scrolling to the document bottom the <footer> still ` +
                  `ends ${Math.round(bottom - viewportHeight)}px below the ${viewportHeight}px viewport`,
              )
            }
          }
        })
      }

      expect
        .soft(overflowing, `horizontal overflow at ${viewport.width}px:\n${overflowing.join('\n')}`)
        .toEqual([])
      expect
        .soft(clippedHeadings, `clipped <h1> at ${viewport.width}px:\n${clippedHeadings.join('\n')}`)
        .toEqual([])
      expect
        .soft(
          unreachableFooters,
          `unreachable footer at ${viewport.width}x${viewport.height}:\n${unreachableFooters.join('\n')}`,
        )
        .toEqual([])
    })
  }
})

test.describe('the md breakpoint', () => {
  for (const viewport of VIEWPORTS) {
    test(`header shows exactly one navigation at ${viewport.label}`, async ({ page }) => {
      await openAt(page, viewport, '/')

      const header = page.locator('header').first()
      const desktopNav = header.locator('nav[aria-label="Primary"]')
      const hamburger = header.getByRole('button', { name: 'Open menu' })

      if (viewport.width >= MD_BREAKPOINT) {
        await expect(desktopNav).toBeVisible()
        await expect(hamburger).toBeHidden()
      } else {
        await expect(desktopNav).toBeHidden()
        await expect(hamburger).toBeVisible()
      }
    })
  }

  test('the desktop nav and the hamburger swap at exactly 768px', async ({ page }) => {
    await page.setViewportSize({ width: 766, height: 900 })
    await page.goto('/')
    await settleFonts(page)

    const header = page.locator('header').first()
    const desktopNav = header.locator('nav[aria-label="Primary"]')
    const hamburger = header.getByRole('button', { name: 'Open menu' })

    // Walking the boundary a pixel at a time is what catches a `min-width:
    // 767px` typo or a rem/px mismatch: the per-viewport tests above would
    // still pass if the flip landed one pixel early.
    for (const width of [766, 767, 768, 769]) {
      await page.setViewportSize({ width, height: 900 })
      const desktop = width >= MD_BREAKPOINT

      // Soft, so a single run names every width that is wrong rather than
      // stopping at the first.
      if (desktop) {
        await expect.soft(desktopNav, `desktop nav at ${width}px`).toBeVisible()
        await expect.soft(hamburger, `hamburger at ${width}px`).toBeHidden()
      } else {
        await expect.soft(desktopNav, `desktop nav at ${width}px`).toBeHidden()
        await expect.soft(hamburger, `hamburger at ${width}px`).toBeVisible()
      }
    }
  })
})

test.describe('hero and pricing sections', () => {
  for (const viewport of VIEWPORTS) {
    test(`home renders both hero columns and a full pricing section at ${viewport.label}`, async ({
      page,
    }) => {
      await openAt(page, viewport, '/')

      const hero = page.locator('section[aria-labelledby="hero-heading"]')
      const heroColumns = hero.locator('> div > div')
      const copyColumn = heroColumns.first()
      const inkPanel = heroColumns.nth(1)
      const heading = page.locator('#hero-heading')

      // Asserting the heading lives inside the first column is what makes the
      // positional selector above trustworthy: if the split grid is ever
      // reordered, this fails rather than silently measuring the wrong box.
      await expect(copyColumn.locator('#hero-heading')).toBeVisible()
      await expect(inkPanel).toBeVisible()
      await expect(heading).toBeVisible()

      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

      const copyBox = await boxOf(copyColumn, 'hero copy column')
      expect(copyBox.width, 'hero copy column has no width').toBeGreaterThan(0)
      expect(
        copyBox.x + copyBox.width,
        `hero copy column runs past the right edge at ${viewport.width}px`,
      ).toBeLessThanOrEqual(clientWidth + OVERFLOW_TOLERANCE_PX)

      const headingBox = await boxOf(heading, 'hero <h1>')
      expect(headingBox.x, `hero <h1> starts left of the viewport at ${viewport.width}px`).toBeGreaterThanOrEqual(
        -OVERFLOW_TOLERANCE_PX,
      )
      expect(
        headingBox.x + headingBox.width,
        `hero <h1> is clipped at the right edge at ${viewport.width}px`,
      ).toBeLessThanOrEqual(clientWidth + OVERFLOW_TOLERANCE_PX)

      const heroBox = await boxOf(hero, 'hero section')
      expect(
        heroBox.height,
        `hero section collapsed to ${Math.round(heroBox.height)}px at ${viewport.width}px`,
      ).toBeGreaterThanOrEqual(MIN_SECTION_HEIGHT_PX)

      const services = page.locator('section#services')
      const servicesHeading = services.locator('h2').first()
      await expect(services).toBeVisible()
      await expect(servicesHeading).toBeVisible()

      const servicesBox = await boxOf(services, 'services section')
      expect(
        servicesBox.height,
        `pricing section collapsed to ${Math.round(servicesBox.height)}px at ${viewport.width}px`,
      ).toBeGreaterThanOrEqual(MIN_SECTION_HEIGHT_PX)

      const servicesHeadingBox = await boxOf(servicesHeading, 'services heading')
      expect(
        servicesHeadingBox.height,
        `pricing heading rendered ${Math.round(servicesHeadingBox.height)}px tall at ${viewport.width}px`,
      ).toBeGreaterThan(0)

      // Every pricing tier has to render; a collapsed grid track shows up here
      // as a zero-height card long before anyone notices the price is missing.
      const tiers = services.locator('ul[role="list"] > li')
      const tierCount = await tiers.count()
      expect(tierCount, 'pricing grid rendered no tiers').toBeGreaterThan(0)
      for (let i = 0; i < tierCount; i += 1) {
        const tierBox = await boxOf(tiers.nth(i), `pricing tier ${i}`)
        expect(
          tierBox.height,
          `pricing tier ${i} collapsed at ${viewport.width}px`,
        ).toBeGreaterThan(0)
        expect(
          tierBox.x + tierBox.width,
          `pricing tier ${i} overflows the right edge at ${viewport.width}px`,
        ).toBeLessThanOrEqual(clientWidth + OVERFLOW_TOLERANCE_PX)
      }
    })
  }
})

test.describe('tap targets', () => {
  test(`header and footer controls meet the 24px floor at ${SMALLEST.label}`, async ({ page }) => {
    await openAt(page, SMALLEST, '/')

    const offenders = await undersizedTapTargets(page)
    const detail = offenders
      .map(
        (o) =>
          `    ${o.label} — ${o.width}x${o.height}px, nearest target centre ${o.nearestNeighbourPx}px away`,
      )
      .join('\n')

    expect(
      offenders,
      `targets below ${MIN_TAP_TARGET_PX}px with too little spacing to qualify for the ` +
        `WCAG 2.2 SC 2.5.8 exception, at ${SMALLEST.width}x${SMALLEST.height}:\n${detail}`,
    ).toEqual([])
  })
})

test.describe('zoom', () => {
  for (const route of ALL_ROUTES) {
    test(`${route.id} does not block pinch zoom`, async ({ page }) => {
      await page.goto(route.path)

      const content = await page.getAttribute('meta[name="viewport"]', 'content')
      expect(content, `${route.path} ships no <meta name="viewport">`).not.toBeNull()

      // Whitespace in the content attribute is free-form, so normalise before
      // matching rather than guessing at the author's spacing.
      const directives = (content ?? '').replace(/\s+/g, '').toLowerCase()

      // Without this the three negative assertions below would also pass on a
      // meta tag that forgot to set a width at all.
      expect(directives, `${route.path} viewport meta: ${content}`).toContain('width=device-width')

      // WCAG 2.1 SC 1.4.4 requires 200% zoom. Each of these three spellings
      // disables or caps it, and all three are one careless copy-paste away.
      expect(directives, `${route.path} disables zoom: ${content}`).not.toContain('user-scalable=no')
      expect(directives, `${route.path} disables zoom: ${content}`).not.toContain('user-scalable=0')
      expect(directives, `${route.path} caps zoom at 100%: ${content}`).not.toContain('maximum-scale=1')
    })
  }
})
