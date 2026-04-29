// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../_lib/turnstile', () => ({
  verifyTurnstile: vi.fn(),
}))
vi.mock('../_lib/resend', () => ({
  sendContactEmail: vi.fn(),
}))

import handler from '../contact'
import { verifyTurnstile } from '../_lib/turnstile'
import { sendContactEmail } from '../_lib/resend'
import { __resetRateLimit } from '../_lib/ratelimit'

const validPayload = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines',
  budget: '10-25k' as const,
  project:
    'We need a high-converting landing page for our launch in three weeks.',
  turnstileToken: 'fake-turnstile-token-1234567890',
}

function makeRequest(body: unknown, ip = '1.1.1.1', method = 'POST'): Request {
  return new Request('http://localhost/api/contact', {
    method,
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  __resetRateLimit()
})

describe('POST /api/contact', () => {
  it('returns 200 on a valid payload and dispatches the email', async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true)
    vi.mocked(sendContactEmail).mockResolvedValue()

    const res = await handler(makeRequest(validPayload, '10.0.0.1'))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true })
    expect(sendContactEmail).toHaveBeenCalledTimes(1)
    const args = vi.mocked(sendContactEmail).mock.calls[0][0]
    expect(args.to).toBe('tyler.lundeen1995@gmail.com')
    expect(args.replyTo).toBe(validPayload.email)
    expect(args.subject).toContain('Ada Lovelace')
    expect(args.subject).toContain('Analytical Engines')
    expect(args.html).toContain('Ada Lovelace')
  })

  it('escapes user-supplied HTML in the rendered body', async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true)
    vi.mocked(sendContactEmail).mockResolvedValue()

    const hostile = {
      ...validPayload,
      name: 'Mallory <script>alert(1)</script>',
      project:
        '<img src=x onerror=alert(1) /> please redesign our landing page asap',
    }
    const res = await handler(makeRequest(hostile, '10.0.0.2'))

    expect(res.status).toBe(200)
    const args = vi.mocked(sendContactEmail).mock.calls[0][0]
    expect(args.html).not.toContain('<script>')
    expect(args.html).toContain('&lt;script&gt;')
    expect(args.html).toContain('&lt;img')
  })

  it('returns 405 for non-POST methods', async () => {
    const res = await handler(makeRequest(undefined, '10.0.0.3', 'GET'))
    expect(res.status).toBe(405)
    await expect(res.json()).resolves.toEqual({ error: 'method-not-allowed' })
  })

  it('returns 400 when required fields are missing', async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true)
    const res = await handler(
      makeRequest({ name: 'A' }, '10.0.0.4'),
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string; issues: unknown }
    expect(body.error).toBe('invalid')
    expect(body.issues).toBeDefined()
    expect(verifyTurnstile).not.toHaveBeenCalled()
  })

  it('returns 400 when the email is malformed', async () => {
    const res = await handler(
      makeRequest({ ...validPayload, email: 'not-an-email' }, '10.0.0.5'),
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when the project description is too short', async () => {
    const res = await handler(
      makeRequest({ ...validPayload, project: 'too short' }, '10.0.0.6'),
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when the request body is not JSON', async () => {
    const req = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '10.0.0.7',
      },
      body: 'not-json',
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('returns 403 when Turnstile rejects the token', async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(false)
    const res = await handler(makeRequest(validPayload, '10.0.0.8'))
    expect(res.status).toBe(403)
    await expect(res.json()).resolves.toEqual({ error: 'turnstile-failed' })
    expect(sendContactEmail).not.toHaveBeenCalled()
  })

  it('returns 429 after the rate-limit threshold is exceeded for the same IP', async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true)
    vi.mocked(sendContactEmail).mockResolvedValue()

    const ip = '10.0.0.9'
    // 10 allowed, 11th blocked
    for (let i = 0; i < 10; i += 1) {
      const ok = await handler(makeRequest(validPayload, ip))
      expect(ok.status).toBe(200)
    }
    const blocked = await handler(makeRequest(validPayload, ip))
    expect(blocked.status).toBe(429)
    await expect(blocked.json()).resolves.toEqual({ error: 'rate-limited' })
  })

  it('returns 500 when Resend throws', async () => {
    vi.mocked(verifyTurnstile).mockResolvedValue(true)
    vi.mocked(sendContactEmail).mockRejectedValue(new Error('boom'))

    const res = await handler(makeRequest(validPayload, '10.0.0.10'))
    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({ error: 'internal' })
  })
})
