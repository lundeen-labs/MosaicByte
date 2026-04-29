import { ContactSchema, type ContactPayload } from './_lib/schema'
import { verifyTurnstile } from './_lib/turnstile'
import { sendContactEmail } from './_lib/resend'
import { checkRate } from './_lib/ratelimit'

export const config = { runtime: 'nodejs' }

const RECIPIENT = 'tyler.lundeen1995@gmail.com'
const DEFAULT_FROM = 'Lundeen Studio <onboarding@resend.dev>'

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'method-not-allowed' }, 405)
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRate(ip)) {
    return json({ error: 'rate-limited' }, 429)
  }

  const body = await req.json().catch(() => null)
  const parsed = ContactSchema.safeParse(body)
  if (!parsed.success) {
    return json({ error: 'invalid', issues: parsed.error.flatten() }, 400)
  }

  const ok = await verifyTurnstile(parsed.data.turnstileToken, ip)
  if (!ok) {
    return json({ error: 'turnstile-failed' }, 403)
  }

  try {
    await sendContactEmail({
      from: process.env.RESEND_FROM ?? DEFAULT_FROM,
      to: RECIPIENT,
      subject: buildSubject(parsed.data),
      replyTo: parsed.data.email,
      html: renderInquiry(parsed.data),
    })
    return json({ ok: true })
  } catch (err) {
    console.error('[contact]', err)
    return json({ error: 'internal' }, 500)
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
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
    '<h1 style="font-family: Georgia, serif; font-size:20px; margin:0 0 16px;">New inquiry — Lundeen Studio</h1>',
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
