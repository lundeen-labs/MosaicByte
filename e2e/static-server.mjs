/**
 * GitHub Pages-equivalent static server for end-to-end tests.
 *
 * `vite preview` is NOT a faithful stand-in for production here: it is an SPA
 * server, so it answers every unmatched path with index.html at status 200.
 * GitHub Pages does the opposite — it looks for a real file, and when there
 * isn't one it serves 404.html with an actual 404 status. Testing against
 * `vite preview` would therefore pass a build whose 404 handling and
 * prerendered per-route files are both broken in production.
 *
 * This server reproduces GitHub Pages' resolution order against dist/:
 *   1. exact file            /assets/app.js   -> dist/assets/app.js
 *   2. directory index       /about           -> dist/about/index.html
 *   3. extensionless .html   /about           -> dist/about.html
 *   4. miss                  /nope            -> dist/404.html, status 404
 *
 * Run standalone with:  node e2e/static-server.mjs [port] [rootDir]
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = Number(process.argv[2] ?? process.env.E2E_PORT ?? 4321)
const ROOT = path.resolve(process.argv[3] ?? path.join(__dirname, '..', 'dist'))

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function readIfFile(p) {
  try {
    if (fs.statSync(p).isFile()) return fs.readFileSync(p)
  } catch {
    /* not a file */
  }
  return null
}

/**
 * Resolve a URL pathname the way GitHub Pages does.
 * Returns { body, contentType, status }.
 */
function resolve(pathname) {
  // Normalise and refuse to escape the publish root.
  const decoded = decodeURIComponent(pathname.split('?')[0])
  const rel = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '')
  const target = path.join(ROOT, rel)
  if (!target.startsWith(ROOT)) {
    return { body: Buffer.from('Forbidden'), contentType: MIME['.txt'], status: 403 }
  }

  const candidates =
    rel === '' || rel.endsWith(path.sep)
      ? [path.join(target, 'index.html')]
      : [target, path.join(target, 'index.html'), `${target}.html`]

  for (const candidate of candidates) {
    const body = readIfFile(candidate)
    if (body) {
      const ext = path.extname(candidate).toLowerCase()
      return { body, contentType: MIME[ext] ?? 'application/octet-stream', status: 200 }
    }
  }

  const notFound = readIfFile(path.join(ROOT, '404.html'))
  if (notFound) return { body: notFound, contentType: MIME['.html'], status: 404 }
  return { body: Buffer.from('Not Found'), contentType: MIME['.txt'], status: 404 }
}

export function createServer() {
  return http.createServer((req, res) => {
    const { body, contentType, status } = resolve(new URL(req.url, 'http://localhost').pathname)
    res.writeHead(status, {
      'Content-Type': contentType,
      'Content-Length': body.length,
      // Pages sets no-cache on HTML and long cache on hashed assets. Tests
      // re-request pages constantly, so keep everything uncached to avoid a
      // stale response masking a rebuild.
      'Cache-Control': 'no-store',
    })
    res.end(req.method === 'HEAD' ? undefined : body)
  })
}

// Only bind a port when this file is executed directly. Importing
// `createServer` from a test or a script must not start a server as a side
// effect of the import.
const invokedDirectly =
  !!process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (invokedDirectly) {
  if (!fs.existsSync(ROOT)) {
    console.error(`[e2e-server] publish root not found: ${ROOT}\nRun \`npm run build\` first.`)
    process.exit(1)
  }

  createServer().listen(PORT, () => {
    console.log(`[e2e-server] serving ${ROOT} on http://127.0.0.1:${PORT} (GitHub Pages semantics)`)
  })
}
