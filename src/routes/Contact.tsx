import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/lib/seo'
import { COPY } from '@/content/copy'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

// Empty string preserves the Vercel build's same-origin relative fetch
// ('/api/contact'). The GitHub Pages build (static-only, no serverless
// functions) sets VITE_API_BASE_URL to the Vercel origin at build time
// (see .github/workflows/pages.yml) so the form posts cross-origin to the
// real API. api/contact.ts allows that specific origin via CORS.
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

const inputClass =
  'w-full rounded-xl border border-[var(--color-paper-3)] bg-[var(--color-paper-2)] px-4 py-3 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] focus:border-[var(--color-rust)] focus:outline-none aria-invalid:border-[var(--color-rust)] transition-[border-color] duration-[180ms]'

const labelClass =
  'mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--color-ink-2)]'

const helperClass = 'mt-1.5 text-[12px] text-[var(--color-ink-3)]'

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const turnstileRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | undefined>(undefined)

  // Explicit Turnstile render. The api.js script (index.html) loads with
  // ?render=explicit, so the widget must be rendered programmatically once this
  // lazily mounted route is in the DOM and the script is ready. The token
  // arrives via the callback — explicit mode does NOT auto-populate a
  // cf-turnstile-response hidden input the way implicit mode does.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return
    let pollId: ReturnType<typeof setTimeout> | undefined

    function renderWidget() {
      const el = turnstileRef.current
      if (!el) return
      if (window.turnstile?.render) {
        widgetIdRef.current = window.turnstile.render(el, {
          sitekey: TURNSTILE_SITE_KEY!,
          // 'auto' lets the widget follow the visitor's prefers-color-scheme.
          // It won't react to mid-session toggles via our ThemeToggle, but
          // re-rendering the challenge on every theme change isn't worth the
          // UX cost — the initial render is what matters.
          theme: 'auto',
          callback: (token) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
        })
      } else {
        // Script not ready yet (async/defer). Poll until window.turnstile exists.
        pollId = setTimeout(renderWidget, 150)
      }
    }
    renderWidget()

    return () => {
      if (pollId) clearTimeout(pollId)
      if (widgetIdRef.current !== undefined) {
        window.turnstile?.remove(widgetIdRef.current)
        widgetIdRef.current = undefined
      }
    }
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    const form = e.currentTarget
    const fd = new FormData(form)

    // Token comes from the Turnstile callback (state) in configured envs. With
    // no site key (local dev) fall back to the sentinel the backend rejects,
    // preserving prior dev behavior.
    const token = TURNSTILE_SITE_KEY ? turnstileToken : 'dev-no-turnstile-token-configured'
    if (TURNSTILE_SITE_KEY && !token) {
      setErrorMsg('verification-incomplete')
      setStatus('error')
      return
    }

    const payload = {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      company: String(fd.get('company') ?? '') || undefined,
      budget: (fd.get('budget') as string) || undefined,
      project: String(fd.get('project') ?? ''),
      turnstileToken: token,
    }

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setStatus('success')
        form.reset()
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setErrorMsg(data.error ?? 'request-failed')
        setStatus('error')
        // Turnstile tokens are single-use; reset so a retry gets a fresh one.
        if (widgetIdRef.current !== undefined) {
          window.turnstile?.reset(widgetIdRef.current)
          setTurnstileToken('')
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'network-error')
      setStatus('error')
      if (widgetIdRef.current !== undefined) {
        window.turnstile?.reset(widgetIdRef.current)
        setTurnstileToken('')
      }
    }
  }

  if (status === 'success') {
    return (
      <Layout>
        <Seo
          title={`Inquiry received — ${COPY.brand.full}`}
          description="Thanks. I will reply within two business days."
          canonicalPath="/contact"
        />
        <article
          aria-labelledby="success-heading"
          className="mx-auto w-full max-w-[860px] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]"
        >
          <span
            role="status"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-moss)]/30 bg-[var(--color-moss)]/10 px-3 py-1 text-[12px] font-medium text-[var(--color-moss)]"
          >
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-moss)]" />
            Inquiry received
          </span>
          <h1
            id="success-heading"
            className="mt-6 font-display text-[3rem] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--color-ink)] md:text-[4rem]"
          >
            {COPY.contact.successHeading}
          </h1>
          <p className="mt-6 max-w-[60ch] text-[1.125rem] leading-[1.55] text-[var(--color-ink-2)] md:text-[1.25rem]">
            {COPY.contact.successBody}
          </p>
          <div className="mt-12">
            <Button asChild variant="ghost">
              <a href="/">← Back to home</a>
            </Button>
          </div>
        </article>
      </Layout>
    )
  }

  const errorRegionId = 'contact-error-region'

  return (
    <Layout>
      <Seo
        title={`Contact — ${COPY.brand.full}`}
        description="Tell me about your project. Two-business-day response on weekdays."
        canonicalPath="/contact"
      />
      <article
        aria-labelledby="contact-heading"
        className="mx-auto w-full max-w-[1024px] px-6 py-24 md:px-8 md:py-32"
      >
        <header className="mb-12 flex flex-col gap-4">
          <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--color-rust)]">
            Contact
          </span>
          <h1
            id="contact-heading"
            className="font-display text-[3rem] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--color-ink)] md:text-[4rem]"
          >
            {COPY.contact.heading}
          </h1>
          <p className="max-w-[60ch] text-[1.125rem] leading-[1.55] text-[var(--color-ink-2)] md:text-[1.25rem]">
            {COPY.contact.lede}
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          noValidate
          aria-describedby={status === 'error' ? errorRegionId : undefined}
          className="grid grid-cols-1 gap-[var(--spacing-s7)] md:grid-cols-[2fr_1fr]"
        >
          <fieldset className="flex flex-col gap-[var(--spacing-s6)] border-0 p-0">
            <legend className="sr-only">Project inquiry details</legend>

            <div className="grid grid-cols-1 gap-[var(--spacing-s5)] md:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClass}>
                  {COPY.contact.fields.nameLabel}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  aria-required="true"
                  aria-describedby="name-helper"
                  className={inputClass}
                />
                <p id="name-helper" className={helperClass}>
                  At least 2 characters.
                </p>
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  {COPY.contact.fields.emailLabel}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={160}
                  autoComplete="email"
                  aria-required="true"
                  aria-describedby="email-helper"
                  className={inputClass}
                />
                <p id="email-helper" className={helperClass}>
                  Used for the reply only — never added to a list.
                </p>
              </div>
              <div>
                <label htmlFor="company" className={labelClass}>
                  {COPY.contact.fields.companyLabel}
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  maxLength={80}
                  autoComplete="organization"
                  aria-describedby="company-helper"
                  className={inputClass}
                />
                <p id="company-helper" className={helperClass}>
                  Optional — helps me tailor the audit.
                </p>
              </div>
              <div>
                <label htmlFor="budget" className={labelClass}>
                  {COPY.contact.fields.budgetLabel}
                </label>
                <select
                  id="budget"
                  name="budget"
                  defaultValue=""
                  aria-describedby="budget-helper"
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select a range
                  </option>
                  {COPY.contact.budgetOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p id="budget-helper" className={helperClass}>
                  Ballpark only — informs scope, not a quote.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="project" className={labelClass}>
                {COPY.contact.fields.projectLabel}
              </label>
              <textarea
                id="project"
                name="project"
                required
                minLength={20}
                maxLength={2000}
                rows={6}
                aria-required="true"
                aria-describedby="project-helper"
                className={inputClass + ' resize-y'}
              />
              <p id="project-helper" className={helperClass}>
                20-2000 characters. Current page URL, what's broken, what success looks like.
              </p>
            </div>

            {TURNSTILE_SITE_KEY ? (
              <div role="group" aria-label="Anti-spam verification">
                <div ref={turnstileRef} />
              </div>
            ) : (
              <p
                role="note"
                className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-ochre)]"
              >
                Note: Turnstile not configured for this environment. Form will submit but be rejected by the backend.
              </p>
            )}

            <div
              id={errorRegionId}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className="min-h-0"
            >
              {status === 'error' && (
                <div className="border border-[var(--color-rust)] bg-[var(--color-paper-2)] p-[var(--spacing-s4)]">
                  <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-rust)]">
                    {COPY.contact.errorHeading} · {errorMsg}
                  </p>
                  <p className="mt-[var(--spacing-s2)] text-[var(--color-ink)]">
                    {COPY.contact.errorBody}
                  </p>
                </div>
              )}
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={status === 'submitting'}
                aria-busy={status === 'submitting'}
              >
                {status === 'submitting' ? 'Sending…' : COPY.contact.fields.submitLabel}
              </Button>
            </div>
          </fieldset>

          <aside
            aria-label="What happens next"
            className="border-l border-[var(--color-paper-3)] pl-[var(--spacing-s5)]"
          >
            <h2 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
              What happens next
            </h2>
            <ol className="mt-[var(--spacing-s4)] flex flex-col gap-[var(--spacing-s4)] text-[var(--color-ink)]">
              <li className="flex gap-[var(--spacing-s3)]">
                <span aria-hidden="true" className="font-mono text-[11px] tracking-[0.08em] text-[var(--color-plum)]">01</span>
                <span>I read every inquiry myself within two business days.</span>
              </li>
              <li className="flex gap-[var(--spacing-s3)]">
                <span aria-hidden="true" className="font-mono text-[11px] tracking-[0.08em] text-[var(--color-plum)]">02</span>
                <span>If we&rsquo;re a fit, I send a 5-page audit of your current page.</span>
              </li>
              <li className="flex gap-[var(--spacing-s3)]">
                <span aria-hidden="true" className="font-mono text-[11px] tracking-[0.08em] text-[var(--color-plum)]">03</span>
                <span>You decide: keep the audit, or roll the cost into a project.</span>
              </li>
            </ol>

            <p className="mt-[var(--spacing-s6)] font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-ink-3)]">
              Or email{' '}
              <a
                href="mailto:tyler.lundeen1995@gmail.com"
                className="text-[var(--color-rust)] underline underline-offset-4 hover:text-[var(--color-rust-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-rust)]"
              >
                tyler.lundeen1995@gmail.com
              </a>
            </p>
          </aside>
        </form>
      </article>
    </Layout>
  )
}
