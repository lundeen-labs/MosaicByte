import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { securityMeta } from './scripts/security-meta.mjs'

export default defineConfig({
  // Vercel and GitHub Pages (with custom domain) both serve this site
  // from the domain root ('/'), so that stays the default.
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    // Meta Content-Security-Policy for the built pages (GitHub Pages sends no
    // headers). Computed from index.html so the inline theme script's sha256
    // can never go stale. See scripts/security-meta.mjs.
    securityMeta(),
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
