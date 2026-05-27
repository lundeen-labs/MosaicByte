# Serverless Functions (api)

Node.js serverless functions for the Mosaic Byte backend, primarily handling form submissions and lead generation.

## Endpoints

- `contact.ts`: Handles the `/api/contact` POST request from the lead capture form.
    - Validates input using Zod.
    - Verifies Cloudflare Turnstile tokens.
    - Implements rate limiting.
    - Sends emails via Resend.

## Internal Library (_lib)

- `ratelimit.ts`: Memory-based or Redis-ready rate limiting logic.
- `resend.ts`: Configuration and wrapper for the Resend email API.
- `schema.ts`: Shared Zod schemas for request validation.
- `turnstile.ts`: Wrapper for Cloudflare Turnstile verification.

## Testing

- `__tests__/contact.test.ts`: Integration tests for the contact endpoint using Vitest.
