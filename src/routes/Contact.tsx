import { useState, type FormEvent } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/lib/seo'
import { COPY } from '@/content/copy'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

const inputClass =
  'w-full border-0 border-b border-[var(--color-paper-line)] bg-transparent px-0 py-[var(--spacing-s2)] font-body text-[1rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] focus:border-[var(--color-rust)] focus:border-b-[1.5px] focus:outline-none'

const labelClass =
  'block font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]'

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    const form = e.currentTarget
    const fd = new FormData(form)
    const turnstileToken =
      (fd.get('cf-turnstile-response') as string | null) ??
      'dev-no-turnstile-token-configured'

    const payload = {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      company: String(fd.get('company') ?? '') || undefined,
      budget: (fd.get('budget') as string) || undefined,
      project: String(fd.get('project') ?? ''),
      turnstileToken,
    }

    try {
      const res = await fetch('/api/contact', {
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
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'network-error')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <Layout>
        <article className="mx-auto w-full max-w-[800px] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-moss)]">
            STATUS: RECEIVED · 200 OK
          </span>
          <h1 className="mt-[var(--spacing-s4)] font-display text-[3rem] leading-[1.04] tracking-[-0.025em] text-[var(--color-ink)] md:text-[4rem]">
            {COPY.contact.successHeading}
          </h1>
          <p className="mt-[var(--spacing-s5)] max-w-[60ch] text-[1.25rem] leading-[1.55] text-[var(--color-ink-2)]">
            {COPY.contact.successBody}
          </p>
          <div className="mt-[var(--spacing-s7)]">
            <Button asChild variant="ghost">
              <a href="/">← Back to home</a>
            </Button>
          </div>
        </article>
      </Layout>
    )
  }

  return (
    <Layout>
      <Seo
        title="Contact — Lundeen Studio"
        description="Tell me about your project. Two-week response on weekdays."
        canonicalPath="/contact"
      />
      <article className="mx-auto w-full max-w-[800px] px-[var(--spacing-s5)] py-[var(--spacing-s8)] md:px-[var(--spacing-s7)]">
        <header className="mb-[var(--spacing-s7)] flex flex-col gap-[var(--spacing-s4)]">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
            § {COPY.contact.sectionMark.number} / {COPY.contact.sectionMark.label}
          </span>
          <h1 className="font-display text-[3rem] leading-[1.04] tracking-[-0.025em] text-[var(--color-ink)] md:text-[4rem]">
            {COPY.contact.heading}
          </h1>
          <p className="max-w-[60ch] text-[1.25rem] leading-[1.55] text-[var(--color-ink-2)]">
            {COPY.contact.lede}
          </p>
        </header>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[var(--spacing-s6)]">
          <div className="grid grid-cols-1 gap-[var(--spacing-s5)] md:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClass}>
                {COPY.contact.fields.nameLabel}
              </label>
              <input id="name" name="name" type="text" required minLength={2} maxLength={80} className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                {COPY.contact.fields.emailLabel}
              </label>
              <input id="email" name="email" type="email" required maxLength={160} className={inputClass} />
            </div>
            <div>
              <label htmlFor="company" className={labelClass}>
                {COPY.contact.fields.companyLabel}
              </label>
              <input id="company" name="company" type="text" maxLength={80} className={inputClass} />
            </div>
            <div>
              <label htmlFor="budget" className={labelClass}>
                {COPY.contact.fields.budgetLabel}
              </label>
              <select id="budget" name="budget" className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select a range
                </option>
                {COPY.contact.budgetOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
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
              className={inputClass + ' resize-y'}
            />
          </div>

          {TURNSTILE_SITE_KEY ? (
            <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} />
          ) : (
            <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-ochre)]">
              NOTE: Turnstile not configured for this environment. Form will submit but be rejected by the backend.
            </p>
          )}

          {status === 'error' && (
            <div className="border border-[var(--color-rust)] bg-[var(--color-paper-2)] p-[var(--spacing-s4)]">
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--color-rust)]">
                {COPY.contact.errorHeading} · {errorMsg}
              </p>
              <p className="mt-[var(--spacing-s2)] text-[var(--color-ink)]">{COPY.contact.errorBody}</p>
            </div>
          )}

          <div>
            <Button type="submit" variant="primary" size="lg" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending…' : COPY.contact.fields.submitLabel}
            </Button>
          </div>
        </form>
      </article>
    </Layout>
  )
}
