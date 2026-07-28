import { ContactSchema, type ContactPayload } from './_lib/schema'
import { verifyTurnstile } from './_lib/turnstile'
import { sendContactEmail } from './_lib/resend'
import { checkRate } from './_lib/ratelimit'

export const config = { runtime: 'nodejs' }

// Recipient lives in env so the studio can change it without a redeploy
// (e.g. flip to hello@mosaicbyte.co once that mailbox is provisioned).
const RECIPIENT = process.env.CONTACT_RECIPIENT ?? 'tyler.lundeen1995@gmail.com'
const DEFAULT_FROM = 'Mosaic Byte <onboarding@resend.dev>'

// The GitHub Pages mirror (static-only — it cannot host this serverless
// function) posts here cross-origin using an absolute URL
// (src/routes/Contact.tsx VITE_API_BASE_URL). Scoped to this exact origin,
// not '*', because the endpoint accepts a POST carrying a Turnstile token
// and should not be callable from an arbitrary third-party page.
const ALLOWED_ORIGIN = 'https://lundeen-labs.github.io'

function corsHeaders(origin: string | null): Record<string, string> {
  if (origin !== ALLOWED_ORIGIN) return {}
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    Vary: 'Origin',
  }
}

export default async function handler(req: Request): Promise<Response> {
  const cors = corsHeaders(req.headers.get('origin'))

  // The browser preflights the actual POST because it carries a
  // content-type: application/json header, which is not a CORS-simple
  // request. Answer the preflight before any other check.
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (req.method !== 'POST') {
    return json({ error: 'method-not-allowed' }, 405, cors)
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRate(ip)) {
    return json({ error: 'rate-limited' }, 429, cors)
  }

  const body = await req.json().catch(() => null)
  const parsed = ContactSchema.safeParse(body)
  if (!parsed.success) {
    return json({ error: 'invalid', issues: parsed.error.flatten() }, 400, cors)
  }

  const ok = await verifyTurnstile(parsed.data.turnstileToken, ip)
  if (!ok) {
    return json({ error: 'turnstile-failed' }, 403, cors)
  }

  try {
    await sendContactEmail({
      from: process.env.RESEND_FROM ?? DEFAULT_FROM,
      to: RECIPIENT,
      subject: buildSubject(parsed.data),
      replyTo: parsed.data.email,
      html: renderInquiry(parsed.data),
    })
    return json({ ok: true }, 200, cors)
  } catch (err) {
    console.error('[contact]', err)
    return json({ error: 'internal' }, 500, cors)
  }
}

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  })
}

function buildSubject(p: ContactPayload): string {
  const suffix = p.company ? ` @ ${p.company}` : ''
  return `New inquiry — ${p.name}${suffix}`
}

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInquiry(p: ContactPayload): string {
  const company = p.company ? escape(p.company) : '—'
  const budget = p.budget ? escape(p.budget) : '—'
  const projectHtml = escape(p.project).replace(/\r?\n/g, '<br />')
  return [
    '<!doctype html>',
    '<html><body style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; color:#171413; line-height:1.5;">',
    '<h1 style="font-family: Georgia, serif; font-size:20px; margin:0 0 16px;">New inquiry — Mosaic Byte</h1>',
    '<table style="border-collapse:collapse; font-size:14px;">',
    `<tr><td style="padding:4px 12px 4px 0; color:#6B5F55;">Name</td><td style="padding:4px 0;">${escape(p.name)}</td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0; color:#6B5F55;">Email</td><td style="padding:4px 0;">${escape(p.email)}</td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0; color:#6B5F55;">Company</td><td style="padding:4px 0;">${company}</td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0; color:#6B5F55;">Budget</td><td style="padding:4px 0;">${budget}</td></tr>`,
    '</table>',
    '<h2 style="font-family: Georgia, serif; font-size:16px; margin:20px 0 8px;">Project</h2>',
    `<div style="white-space:normal; font-size:14px;">${projectHtml}</div>`,
    '</body></html>',
  ].join('')
}
