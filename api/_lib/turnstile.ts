/**
 * Cloudflare Turnstile siteverify wrapper.
 *
 * Posts the user-supplied token to Cloudflare's verification endpoint and
 * returns whether the challenge was passed. Reads the secret from
 * `process.env.TURNSTILE_SECRET`. If the secret is missing the function
 * fails closed (returns false) and emits a console warning so misconfig is
 * visible in Vercel logs without blocking deploys at import time.
 *
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface SiteverifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
}

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET
  if (!secret) {
    console.warn('[turnstile] TURNSTILE_SECRET is not set; rejecting request')
    return false
  }

  const params = new URLSearchParams()
  params.set('secret', secret)
  params.set('response', token)
  if (ip) params.set('remoteip', ip)

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    if (!res.ok) {
      console.warn('[turnstile] siteverify returned status', res.status)
      return false
    }
    const data = (await res.json()) as SiteverifyResponse
    if (!data.success) {
      console.warn('[turnstile] verification failed', data['error-codes'] ?? [])
    }
    return data.success === true
  } catch (err) {
    console.warn('[turnstile] siteverify network error', err)
    return false
  }
}
