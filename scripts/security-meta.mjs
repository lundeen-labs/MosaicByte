/**
 * Content-Security-Policy as a <meta> tag, computed from the page it protects.
 *
 * GitHub Pages cannot send response headers, so the only CSP this site can have
 * is `<meta http-equiv="Content-Security-Policy">`. The one inline script in
 * index.html (the theme pre-paint that stops a dark-mode flash) must run before
 * React mounts, so it is allowed by its sha256 digest rather than by
 * 'unsafe-inline'. The digest is computed here from the script text at build
 * time, so editing that script can never leave a stale hash that silently
 * blocks it in production.
 *
 * A meta CSP cannot express frame-ancestors, report-uri or sandbox; those, and
 * HSTS, need real response headers and are tracked separately (W04).
 */
import { createHash } from 'node:crypto'

/** Matches `<script ...>body</script>` elements that have no src attribute. */
const INLINE_SCRIPT = /<script(?![^>]*\bsrc\s*=)([^>]*)>([\s\S]*?)<\/script>/gi

/**
 * sha256 CSP source expressions for every executable inline script in `html`.
 * Data blocks (type="application/ld+json", etc.) are not executed, so they
 * need no allowance.
 *
 * @param {string} html
 * @returns {string[]} e.g. ["'sha256-AbC...='"]
 */
export function inlineScriptHashes(html) {
  const hashes = []
  for (const [, attributes, body] of html.matchAll(INLINE_SCRIPT)) {
    const type = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attributes)?.[1]?.toLowerCase()
    const executable = !type || type === 'module' || type === 'text/javascript' || type === 'application/javascript'
    if (!executable || body.trim() === '') continue
    // Browsers hash the script text after HTML input-stream preprocessing, which
    // turns CRLF and lone CR into LF. A checkout with CRLF line endings (Windows)
    // would otherwise produce a digest the browser never computes.
    const text = body.replace(/\r\n?/g, '\n')
    hashes.push(`'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`)
  }
  return hashes
}

/**
 * The policy for the built page.
 *
 *  - scripts: this origin plus the pinned inline theme script.
 *  - styles: this origin, Google Fonts' stylesheet host and inline styles.
 *    Inline styles are unavoidable on two counts: the prerendered markup
 *    carries style attributes (tile colours, the availability pill), and the
 *    mobile drawer's Radix Dialog (react-remove-scroll-bar) injects a <style>
 *    element at runtime whose body embeds the measured scrollbar width, so it
 *    has no stable hash to pin. Blocking it silently disables the drawer's
 *    scroll lock. Script execution, the high-value vector, stays hash-pinned.
 *  - fonts: Google Fonts' file host.
 *  - everything else: this origin only; no plugins, no foreign <base>.
 *
 * @param {string} html
 * @returns {string}
 */
export function contentSecurityPolicy(html) {
  const directives = [
    ["default-src", ["'self'"]],
    ["script-src", ["'self'", ...inlineScriptHashes(html)]],
    ["style-src", ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"]],
    ["font-src", ['https://fonts.gstatic.com']],
    ["img-src", ["'self'", 'data:']],
    ["connect-src", ["'self'"]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
  ]
  return directives.map(([name, sources]) => `${name} ${sources.join(' ')}`).join('; ')
}

/**
 * Insert the CSP meta tag immediately after <meta charset>, so it precedes
 * every script and stylesheet it governs. Idempotent: an existing CSP meta is
 * replaced, never duplicated.
 *
 * @param {string} html
 * @returns {string}
 */
export function injectContentSecurityPolicy(html) {
  const tag = `<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(html)}">`
  const existing = /<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/i
  if (existing.test(html)) return html.replace(existing, tag)
  const charset = /<meta\s+charset=[^>]*>/i
  if (!charset.test(html)) throw new Error('index.html has no <meta charset>; cannot place the CSP before scripts')
  return html.replace(charset, (match) => `${match}\n    ${tag}`)
}

/**
 * Vite plugin: stamp the CSP into the built index.html. Build only; the dev
 * server injects its own inline HMR preamble, which a strict policy would block.
 *
 * @returns {import('vite').Plugin}
 */
export function securityMeta() {
  return {
    name: 'mosaic-security-meta',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: (html) => injectContentSecurityPolicy(html),
    },
  }
}
