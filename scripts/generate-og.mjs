/**
 * Build-time Open Graph card generator.
 *
 * Why this exists: src/lib/seo.tsx has always advertised
 * `<meta property="og:image" content="${SITE_URL}/og/<route>.png">` on every
 * page, but no og/ directory ever existed in public/ or dist/. Every share on
 * LinkedIn, Slack, iMessage, X and Discord rendered a blank card, and the
 * e2e/seo.spec.ts suite now fails the build if the advertised image 404s.
 *
 * Rather than hand-maintain six PNGs that drift from the brand the moment a
 * token changes, each card is rendered here from the site's own design tokens,
 * read straight out of src/index.css. Change --color-rust and the cards change
 * with it on the next build.
 *
 * Output: dist/og/index.png plus dist/og/<route>.png, each exactly 1200x630 —
 * the size seo.tsx already declares in og:image:width / og:image:height.
 */
import puppeteer from 'puppeteer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { OG_CARDS } from './routes.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '..', 'dist')
const cssPath = path.resolve(__dirname, '..', 'src', 'index.css')
const outDir = path.join(distDir, 'og')

const WIDTH = 1200
const HEIGHT = 630

/**
 * Pull the light-theme token values out of index.css so the cards cannot drift
 * from the site. Only the first `:root` block is read — the dark-theme block
 * below it redefines the same names, and share cards are always light.
 */
async function readTokens() {
  const css = await fs.readFile(cssPath, 'utf8')
  const tokens = {}
  const firstBlock = css.slice(0, css.indexOf('[data-theme="dark"]') >>> 0 || css.length)
  for (const [, name, value] of firstBlock.matchAll(/(--color-[\w-]+)\s*:\s*([^;]+);/g)) {
    if (!(name in tokens)) tokens[name] = value.trim()
  }
  const need = [
    '--color-paper',
    '--color-paper-2',
    '--color-paper-3',
    '--color-ink',
    '--color-ink-3',
    '--color-rust',
    '--color-moss',
    '--color-ochre',
    '--color-plum',
  ]
  const missing = need.filter((n) => !tokens[n])
  if (missing.length) throw new Error(`index.css is missing tokens: ${missing.join(', ')}`)
  return tokens
}

/**
 * Deterministic tile pattern. The hero re-rolls its grid on an interval with
 * Math.random; a share card must be byte-stable across builds or every build
 * produces a spurious diff, so the lit tiles come from a fixed hash of the
 * card's own id instead.
 */
function tiles(seedText, cols, rows, accents) {
  let h = 2166136261
  for (const ch of seedText) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  const out = []
  for (let i = 0; i < cols * rows; i += 1) {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    const r = Math.abs(h) % 100
    out.push(r < 22 ? accents[Math.abs(h >>> 3) % accents.length] : null)
  }
  return out
}

function cardHtml(card, tokens) {
  const accents = [
    tokens['--color-rust'],
    tokens['--color-moss'],
    tokens['--color-ochre'],
    tokens['--color-plum'],
  ]
  const cols = 9
  const rows = 12
  const grid = tiles(card.id, cols, rows, accents)
    .map(
      (color) =>
        `<span style="background:${color ?? tokens['--color-paper']};opacity:${color ? 1 : 0.14}"></span>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=block">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${WIDTH}px;height:${HEIGHT}px;display:flex;background:${tokens['--color-paper']};
       color:${tokens['--color-ink']};font-family:'DM Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
       overflow:hidden}
  .copy{flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:64px 56px}
  .eyebrow{font-size:17px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;
           color:${tokens['--color-ochre']};display:flex;align-items:center;gap:14px}
  .eyebrow::before{content:'';width:34px;height:2px;background:${tokens['--color-ochre']}}
  h1{font-family:'DM Serif Display',Georgia,'Times New Roman',serif;font-weight:400;
     font-size:${card.titleSize ?? 66}px;line-height:1.04;letter-spacing:-.035em;max-width:16ch}
  h1 em{font-style:italic;color:${tokens['--color-moss']}}
  .sub{font-size:19px;line-height:1.6;color:${tokens['--color-ink-3']};max-width:44ch}
  .foot{display:flex;align-items:center;justify-content:space-between;font-size:16px;
        letter-spacing:.08em;text-transform:uppercase;color:${tokens['--color-ink-3']}}
  .mark{display:flex;align-items:center;gap:12px;color:${tokens['--color-ink']};font-weight:500}
  .dot{width:9px;height:9px;border-radius:99px;background:${tokens['--color-rust']}}
  .panel{width:396px;background:${tokens['--color-ink']};display:grid;
         grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);gap:5px;padding:26px}
  .panel span{border-radius:3px;display:block}
</style></head>
<body>
  <div class="copy">
    <div class="eyebrow">${card.eyebrow}</div>
    <h1>${card.title}</h1>
    <div class="sub">${card.sub}</div>
    <div class="foot">
      <span class="mark"><span class="dot"></span>Mosaic Byte</span>
      <span>mosaicbyte.design</span>
    </div>
  </div>
  <div class="panel">${grid}</div>
</body></html>`
}

async function main() {
  const tokens = await readTokens()
  await fs.mkdir(outDir, { recursive: true })

  const browser = await puppeteer.launch({
    headless: true,
    // Same reasoning as scripts/prerender.mjs: Puppeteer's downloaded Chrome
    // has no AppArmor profile, so it cannot open a sandbox on the ubuntu-latest
    // runner. Only first-party local HTML is rendered here.
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 })

  for (const card of OG_CARDS) {
    // 'load', not 'networkidle0': the Google Fonts connection is kept alive
    // between cards, so the network never goes idle again after the first one
    // and every subsequent setContent times out. Font readiness is handled
    // explicitly below, which is what actually matters here.
    await page.setContent(cardHtml(card, tokens), { waitUntil: 'load', timeout: 20_000 })
    // font-display:block plus this wait keeps a slow CI font fetch from baking
    // the fallback stack into the card. If the fetch genuinely fails the card
    // still renders in the fallback serif rather than failing the build.
    await page
      .evaluate(() => document.fonts.ready.then(() => undefined))
      .catch(() => undefined)
    const file = path.join(outDir, `${card.id}.png`)
    await page.screenshot({ path: file, type: 'png' })
    console.log(`[og] ${card.id}.png`)
  }

  await browser.close()
  console.log(`[og] ${OG_CARDS.length} cards -> ${outDir}`)
}

main().catch((err) => {
  console.error('[og] generation failed:', err)
  process.exit(1)
})
