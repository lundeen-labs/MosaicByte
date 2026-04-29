import { z } from 'zod'

/**
 * Contact form payload schema.
 *
 * Mirrors the fields collected by the public contact form. Server-side
 * validation MUST treat this as the source of truth — never trust the
 * client to enforce these constraints.
 */
export const ContactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  company: z.string().max(80).optional(),
  budget: z.enum(['<5k', '5-10k', '10-25k', '25k+']).optional(),
  project: z.string().min(20).max(2000),
  turnstileToken: z.string().min(10),
})

export type ContactPayload = z.infer<typeof ContactSchema>
