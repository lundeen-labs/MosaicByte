import { Resend } from 'resend'

/**
 * Thin wrapper over the Resend SDK for the contact endpoint.
 *
 * The recipient is hardcoded by the caller (currently
 * `tyler.lundeen1995@gmail.com`). The `from` address must use a domain that
 * is verified in the Resend dashboard; until `lundeen-studio.com` is
 * verified, callers can fall back to Resend's shared
 * `onboarding@resend.dev` sender (suitable for testing only).
 *
 * Throws on any Resend SDK error so the route handler can map it to a 500.
 */
export interface SendArgs {
  from: string
  to: string
  subject: string
  html: string
  replyTo: string
}

let cachedClient: Resend | null = null

function getClient(): Resend {
  if (cachedClient) return cachedClient
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }
  cachedClient = new Resend(apiKey)
  return cachedClient
}

export async function sendContactEmail(args: SendArgs): Promise<void> {
  const client = getClient()
  const { error } = await client.emails.send({
    from: args.from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    replyTo: args.replyTo,
  })
  if (error) {
    throw new Error(`resend: ${error.name ?? 'unknown'} — ${error.message ?? ''}`)
  }
}
