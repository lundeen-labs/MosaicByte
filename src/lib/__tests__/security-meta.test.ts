import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  contentSecurityPolicy,
  injectContentSecurityPolicy,
  inlineScriptHashes,
} from '../../../scripts/security-meta.mjs'

const sha256 = (text: string) => `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`

const PAGE = `<!doctype html><html><head><meta charset="UTF-8" />
<script>var a = 1;</script>
<script type="module" src="/assets/app.js"></script>
<script type="application/ld+json">{"@type":"Thing"}</script>
</head><body></body></html>`

describe('inlineScriptHashes', () => {
  it('hashes each executable inline script and skips src scripts and data blocks', () => {
    expect(inlineScriptHashes(PAGE)).toEqual([sha256('var a = 1;')])
  })

  it('hashes the text a browser parses: CRLF and lone CR become LF', () => {
    const crlf = '<script>var a = 1;\r\nvar b = 2;\rvar c = 3;</script>'
    expect(inlineScriptHashes(crlf)).toEqual([sha256('var a = 1;\nvar b = 2;\nvar c = 3;')])
  })

  it('hashes the real theme pre-paint script in index.html as the browser parses it', () => {
    const html = readFileSync(resolve(__dirname, '../../../index.html'), 'utf8')
    const body = /<script>([\s\S]*?)<\/script>/.exec(html)![1].replace(/\r\n?/g, '\n')
    expect(inlineScriptHashes(html)).toEqual([sha256(body)])
  })
})

describe('contentSecurityPolicy', () => {
  const policy = contentSecurityPolicy(PAGE)
  const directive = (name: string) => policy.split('; ').find((d) => d.startsWith(`${name} `))

  it('allows scripts from this origin and the pinned inline hash, never unsafe-inline', () => {
    expect(directive('script-src')).toBe(`script-src 'self' ${sha256('var a = 1;')}`)
    expect(directive('script-src')).not.toContain("'unsafe-inline'")
    expect(directive('script-src')).not.toContain("'unsafe-eval'")
  })

  it('limits third parties to the two Google Fonts hosts', () => {
    expect(directive('style-src')).toBe("style-src 'self' https://fonts.googleapis.com 'unsafe-inline'")
    expect(directive('font-src')).toBe('font-src https://fonts.gstatic.com')
    const foreign = policy.match(/https:\/\/[a-z.]+/g) ?? []
    expect([...new Set(foreign)].sort()).toEqual(['https://fonts.googleapis.com', 'https://fonts.gstatic.com'])
  })

  it('forbids plugins and foreign base URLs', () => {
    expect(directive('object-src')).toBe("object-src 'none'")
    expect(directive('base-uri')).toBe("base-uri 'self'")
  })
})

describe('injectContentSecurityPolicy', () => {
  it('places the meta right after charset, before any script', () => {
    const out = injectContentSecurityPolicy(PAGE)
    const meta = out.indexOf('http-equiv="Content-Security-Policy"')
    expect(meta).toBeGreaterThan(out.indexOf('<meta charset'))
    expect(meta).toBeLessThan(out.indexOf('<script'))
  })

  it('is idempotent', () => {
    const once = injectContentSecurityPolicy(PAGE)
    expect(injectContentSecurityPolicy(once)).toBe(once)
    expect(once.match(/Content-Security-Policy/g)).toHaveLength(1)
  })

  it('refuses a page it cannot place safely', () => {
    expect(() => injectContentSecurityPolicy('<html><head></head></html>')).toThrow(/charset/)
  })
})
