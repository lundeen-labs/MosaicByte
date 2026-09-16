import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Unit tests live beside the components they cover, under src/. The
    // end-to-end suite in e2e/ also uses a *.spec.ts name but imports
    // @playwright/test and drives a real browser, so vitest's default glob
    // would collect it and fail to load every file. Playwright owns e2e/;
    // vitest owns src/.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
}))
