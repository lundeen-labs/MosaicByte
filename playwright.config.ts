import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end configuration for the Mosaic Byte site.
 *
 * Two deliberate choices shape everything below.
 *
 * 1. Tests run against the PRODUCTION ARTIFACT, not the dev server. `npm run
 *    test:e2e` builds dist/ first, and e2e/static-server.mjs serves it with
 *    GitHub Pages' resolution rules. So these tests exercise the prerendered
 *    HTML, the hashed asset graph, the real code-split boundaries and the real
 *    404 behaviour — the things a dev-server run cannot tell you about.
 *
 * 2. Browser coverage is tiered by what each test can actually learn.
 *    Correctness specs (routing, features, SEO, accessibility) run on all
 *    engines, because engine differences are exactly what they exist to catch.
 *    Performance specs run on Chromium only — LCP/CLS come from PerformanceObserver
 *    entry types Firefox and WebKit do not implement. Visual snapshots run on
 *    Chromium only, because per-engine font rasterisation would otherwise
 *    require three sets of baselines that differ for reasons nobody will ever act on.
 */

const PORT = Number(process.env.E2E_PORT ?? 4321)
const BASE_URL = `http://127.0.0.1:${PORT}`
const isCI = !!process.env.CI

/** Specs that depend on Chromium-only measurement APIs or pixel baselines. */
const CHROMIUM_ONLY = ['**/performance.spec.ts', '**/visual.spec.ts']
/** Specs that are meaningful on every engine. */
const CROSS_BROWSER = [
  '**/routing.spec.ts',
  '**/features.spec.ts',
  '**/seo.spec.ts',
  '**/accessibility.spec.ts',
  '**/responsive.spec.ts',
]

export default defineConfig({
  testDir: './e2e',
  // Fixtures and the static server are not specs.
  testMatch: '**/*.spec.ts',

  // A static site has no shared state, so everything can run at once.
  fullyParallel: true,
  workers: isCI ? 2 : undefined,

  // A flake that only reproduces under retry is still a defect. Retrying once
  // in CI absorbs genuine infrastructure noise (a cold runner, a font fetch)
  // without hiding a real intermittent bug, which shows up as "flaky" in the
  // report rather than as a pass.
  retries: isCI ? 1 : 0,

  // Never let a `test.only` reach CI and silently skip the rest of the suite.
  forbidOnly: isCI,

  timeout: 30_000,

  // Screenshot baselines are per-platform: the committed ones are
  // `-win32`, taken on the dev machine. On the Linux CI runner Playwright
  // would not find them and would silently WRITE new ones and pass, which
  // reads as "visual regression is covered" while comparing nothing. Skipping
  // the comparison there is the honest state: visual regression is a local
  // gate until Linux baselines are generated in a container (roadmap item).
  // Every other spec still runs in CI.
  ignoreSnapshots: isCI,

  expect: {
    timeout: 7_000,
    toHaveScreenshot: {
      // Font hinting and sub-pixel AA differ enough between a local run and a
      // CI runner that a zero-tolerance baseline is unmaintainable. 1.5% of
      // pixels absorbs that without hiding a layout break.
      maxDiffPixelRatio: 0.015,
      animations: 'disabled',
      caret: 'hide',
    },
  },

  reporter: isCI
    ? [['github'], ['html', { open: 'never' }], ['json', { outputFile: 'playwright-report/results.json' }], ['list']]
    : [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: BASE_URL,
    // Keep the evidence for anything that fails, and nothing for what passes.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
    actionTimeout: 7_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
      testMatch: CROSS_BROWSER,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
      testMatch: CROSS_BROWSER,
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
      testMatch: CROSS_BROWSER,
    },
  ],

  webServer: {
    command: `node e2e/static-server.mjs ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 30_000,
  },

  outputDir: 'test-results',
})

export { CHROMIUM_ONLY, CROSS_BROWSER }
