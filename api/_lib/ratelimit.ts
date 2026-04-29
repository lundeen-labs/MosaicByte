/**
 * Soft, per-instance rate limiter.
 *
 * IMPORTANT LIMITATION — read before relying on this for abuse prevention:
 *
 * This implementation stores counts in a process-local `Map`. On Vercel
 * each warm function instance has its own memory, so the effective limit
 * is `max * (number of warm instances)`. Cold starts also reset state.
 * It is sufficient for incidental abuse and accidental form-spam from a
 * single tab, but it is NOT a defense against distributed abuse.
 *
 * For a strict, globally-consistent limit add `@upstash/redis` +
 * `@upstash/ratelimit` (free tier covers low-traffic marketing sites) and
 * swap this module's body for an Upstash-backed sliding window. The
 * exported signature does not need to change.
 *
 * Algorithm: fixed window per IP. The first request in a window allocates
 * a `resetAt` timestamp; subsequent requests in that window increment a
 * counter. Once `count > max` the function returns `false` until
 * `Date.now() >= resetAt`.
 */
interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

const DEFAULT_MAX = 10
const DEFAULT_WINDOW_MS = 60_000

/**
 * Returns `true` if the request is allowed, `false` if it should be
 * rejected with 429. Increments the counter on every call.
 *
 * @param ip      Client IP (or any opaque key — the function does not parse).
 * @param max     Allowed requests per window. Default 10.
 * @param windowMs Window length in ms. Default 60_000 (1 minute).
 */
export function checkRate(
  ip: string,
  max: number = DEFAULT_MAX,
  windowMs: number = DEFAULT_WINDOW_MS,
): boolean {
  const now = Date.now()
  const existing = buckets.get(ip)

  if (!existing || existing.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (existing.count >= max) {
    return false
  }

  existing.count += 1
  return true
}

/**
 * Test-only helper. Clears the in-memory buckets so test cases do not bleed
 * state into one another. Not exported via any public API surface.
 */
export function __resetRateLimit(): void {
  buckets.clear()
}
