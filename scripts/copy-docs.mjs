#!/usr/bin/env node
/**
 * Publish the HTML documents in docs/ alongside the built site.
 *
 * Why this exists: GitHub serves a .html file from a repository as
 * `text/plain`, so clicking docs/architecture.html on github.com shows the
 * source, not the page — 189 KB of markup for the glossary. The documents are
 * written to be read in a browser, so they have to be served from somewhere
 * that sets a real content type.
 *
 * Copying at build time rather than keeping a second set in public/ means
 * docs/ stays the single source of truth; edit the document, rebuild, and the
 * published copy follows. The published copies carry `noindex` (see
 * ensureNoIndex below) so they never compete with the marketing pages in
 * search — they are for the team, not for prospects.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC = join(ROOT, 'docs')
const OUT = join(ROOT, 'dist', 'docs')

const NOINDEX = '<meta name="robots" content="noindex, nofollow">'

/**
 * Insert a noindex directive if the document does not already carry one.
 * Done here rather than in the source file so the documents stay clean to read
 * and edit, and so the rule is applied uniformly to every one of them.
 */
function ensureNoIndex(html) {
  if (/name=["']robots["']/i.test(html)) return html
  return html.replace(/<meta charset=["'][^"']*["']\s*>/i, (m) => `${m}\n${NOINDEX}`)
}

function main() {
  if (!existsSync(SRC)) {
    console.error(`[docs] no docs/ directory at ${SRC}`)
    process.exit(1)
  }

  const pages = readdirSync(SRC).filter((f) => f.endsWith('.html'))
  if (!pages.length) {
    console.error('[docs] no .html documents to publish - did docs/ lose its pages?')
    process.exit(1)
  }

  mkdirSync(OUT, { recursive: true })

  for (const page of pages) {
    const html = ensureNoIndex(readFileSync(join(SRC, page), 'utf8'))
    writeFileSync(join(OUT, page), html)
    console.log(`[docs] ${basename(page)}`)
  }

  // A plain index so /docs/ is not a dead end for anyone who trims the URL.
  const links = pages
    .map((p) => {
      const name = p.replace(/\.html$/, '')
      const title = name.charAt(0).toUpperCase() + name.slice(1)
      return `      <li><a href="./${p}">${title}</a></li>`
    })
    .join('\n')

  writeFileSync(
    join(OUT, 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    ${NOINDEX}
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mosaic Byte - Documentation</title>
    <style>
      body { background:#f5f2ec; color:#0f0e0d; font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
             line-height:1.7; max-width:44rem; margin:0 auto; padding:4rem 1.5rem; }
      h1 { font-family:Georgia,serif; font-weight:400; font-size:2rem; letter-spacing:-.02em; margin:0 0 .5rem; }
      p { color:#6b6660; }
      ul { margin-top:1.5rem; padding-left:1.1rem; }
      li { margin-bottom:.5rem; }
      a { color:#ad3922; }
      @media (prefers-color-scheme: dark) {
        body { background:#0f0e0d; color:#f5f2ec; }
        p { color:#8a8478; }
        a { color:#ef8f79; }
      }
    </style>
  </head>
  <body>
    <h1>Mosaic Byte documentation</h1>
    <p>Engineering reference for the Mosaic Byte site. Not part of the public site.</p>
    <ul>
${links}
    </ul>
  </body>
</html>
`
  )

  console.log(`[docs] ${pages.length} document(s) + index -> ${OUT}`)
}

main()
