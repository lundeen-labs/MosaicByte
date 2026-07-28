import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'

export default defineConfig({
  // Vercel serves this site from the domain root ('/'), so that stays the
  // default. GitHub Pages project sites serve from a subpath
  // (https://lundeen-labs.github.io/MosaicByte/), so the Pages build sets
  // GITHUB_PAGES=true (see .github/workflows/pages.yml) to rewrite every
  // asset URL to that subpath at build time. The Vercel build never sets
  // this env var, so its output is unaffected.
  base: process.env.GITHUB_PAGES === 'true' ? '/MosaicByte/' : '/',
  plugins: [
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    target: 'es2022',
    // Production sourcemaps disabled to stop shipping ~1.6 MB of .map files.
    // Flip back to true if Sentry/error-tracking is wired (roadmap P2 #17).
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split React (rarely changes) from app code so a copy-tweak in src/
        // doesn't bust the React-vendor cache on every deploy. Function form
        // is used because Rolldown's TS types only accept ManualChunksFunction.
        //
        // Deliberately NOT grouping @radix-ui/*: Dialog is only needed by the
        // lazy MobileDrawer, but Accordion is eager via FAQ. A combined radix
        // chunk would pull Dialog into the eager graph (Rolldown loads any
        // chunk referenced by an eager importer). Letting Rolldown auto-split
        // puts each primitive in its actual consumer's chunk.
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react-vendor'
          }
        },
      },
    },
  },
  preview: {
    allowedHosts: ['localhost', '127.0.0.1', 'host.docker.internal'],
  },
  server: {
    allowedHosts: ['localhost', '127.0.0.1', 'host.docker.internal'],
  },
})
