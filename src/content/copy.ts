/**
 * Single source of truth for every visible string on the marketing site.
 * Pure data file: zero runtime imports.
 *
 * Updates here propagate to every route. Do not duplicate copy in components.
 */

export const COPY = {
  brand: {
    wordmark: 'Lundeen & Co.',
    tagline: 'EST. 2025',
    full: 'Lundeen Studio',
    description: 'Conversion-focused landing pages for B2B SaaS. Two-week turnaround. Instrumented.',
  },

  status: {
    available: true,
    slots: 2,
    week: 'WEEK OF MAY 5',
    rev: 'a3f9c1',
    metrics: {
      lcp: 'LCP 0.81s',
      cls: 'CLS 0.01',
      inp: 'INP 92ms',
      jsKb: 'JS 87KB',
    },
  },

  stack: {
    label: 'I build in your stack — no vendor lock-in',
    items: [
      { name: 'Next.js', detail: 'App Router' },
      { name: 'Webflow', detail: 'CMS + handoff' },
      { name: 'Framer', detail: 'Marketing sites' },
      { name: 'Astro', detail: 'Content-heavy' },
      { name: 'Sanity', detail: 'Headless CMS' },
      { name: 'Tailwind v4', detail: 'Design tokens' },
    ],
  },

  workPreview: {
    sectionMark: { number: '01', label: 'WORK' },
    heading: 'Three engagements, three measurable wins.',
    intro: 'Each rebuild ships with confidence intervals and sample sizes. No "+34%" without the n behind it.',
    items: [
      { slug: 'acme-cloud', client: 'Acme Cloud', sector: 'Dev tooling SaaS · YC S24', outcome: '+34% trial signups', outcomeTone: 'moss' as const },
      { slug: 'pulse-pricing-page', client: 'Pulse', sector: 'B2B analytics SaaS', outcome: '+18% pricing -> trial CTR', outcomeTone: 'moss' as const },
      { slug: 'orbital-marketing-site', client: 'Orbital', sector: 'Infra observability SaaS', outcome: '7-page site, 21-day build', outcomeTone: 'plum' as const },
    ],
    allLink: { label: 'See all case studies', href: '/work' },
  },

  instrumentation: {
    sectionMark: { number: '05', label: 'INSTRUMENTATION' },
    heading: 'This site is its own demo.',
    body: 'Every page I ship comes with the analytics rig, not just the picture. The metrics below are live readings from the page you are looking at right now — verifiable in your DevTools. Every page I deliver to clients comes with a public Lighthouse CI run, a tracked goal, and a written test plan.',
    metrics: [
      { label: 'LCP', value: '0.81', unit: 's', target: 'TARGET ≤ 2.5s', tone: 'moss' as const },
      { label: 'CLS', value: '0.01', target: 'TARGET ≤ 0.10', tone: 'moss' as const },
      { label: 'INP', value: '92', unit: 'ms', target: 'TARGET ≤ 200ms', tone: 'moss' as const },
      { label: 'JS BUNDLE', value: '142', unit: 'KB', target: 'BUDGET 150KB', tone: 'ochre' as const },
      { label: 'A11Y SCORE', value: '100', target: 'LIGHTHOUSE', tone: 'moss' as const },
    ],
  },

  hero: {
    eyebrow: 'PRODUCTIZED LANDING PAGE · 14 DAYS · INSTRUMENTED',
    titleParts: {
      plain: 'Ship a landing page that actually',
      italic: 'converts',
      rest: 'in fourteen days.',
    },
    sub: 'A productized landing-page service for funded B2B SaaS. Conversion copywriting, design, build, and analytics — handed off in your stack. Refund in full if it does not beat your control.',
    primaryCta: { label: 'Get a free audit', href: '/audit' },
    secondaryCta: { label: 'Or book a 15-min call', href: '/contact' },
    reassureLines: [
      'No pitch deck. 5-page PDF audit in 48 hours.',
      'Full refund if the rebuild does not beat your control on a pre-agreed metric.',
      'Built in your stack — Webflow, Framer, Next.js. No vendor lock-in.',
    ],
    gauge: {
      lcp: '0.81s',
      cls: '0.01',
      inp: '92ms',
      jsKb: '87KB',
      a11y: '100',
    },
  },

  heroB: {
    sectionMark: { number: '00', label: 'FOLIO' },
    titleLines: [
      { line: 'A landing page is not' },
      { line: 'a hero image and a CTA.', italic: true },
      { line: 'It is an instrument', underline: true },
      { line: 'for measuring intent.', indent: true },
    ],
    sub: 'Most freelancers ship a picture. The studio that ships the analytics rig wins the renewal.',
    definition: {
      term: 'in·stru·ment·ed',
      pron: '/ˈinstrəˌmen(t)əd/',
      defs: [
        '1. Equipped with instruments for measurement.',
        '2. (of a page) Built so that every claim is backed by a number, every number by a confidence interval, every interval by a sample size.',
      ],
    },
    primaryCta: { label: 'Get a free audit', href: '/audit' },
    secondaryCta: { label: 'Or book a 15-min call', href: '/contact' },
    microReassure: 'No pitch. 5-page PDF in 48 hours.',
    chart: {
      points: [4.2, 4.0, 4.3, 4.1, 4.4, 4.2, 4.3, 4.5, 4.7, 5.0, 5.4, 5.6, 5.5, 5.6, 5.6],
      ciLow:  [3.9, 3.8, 4.0, 3.9, 4.1, 4.0, 4.0, 4.2, 4.4, 4.6, 5.0, 5.1, 5.0, 5.1, 5.1],
      ciHigh: [4.5, 4.3, 4.6, 4.4, 4.7, 4.5, 4.6, 4.8, 5.0, 5.4, 5.8, 6.1, 6.0, 6.1, 6.1],
      annotation: 'Variant B trial-signup rate (95% CI). n=38,612 over 21 days.',
    },
  },

  nav: {
    primary: [
      { num: '01', label: 'Work', href: '/work', key: 'work' },
      { num: '02', label: 'Services', href: '/#services', key: 'services' },
      { num: '03', label: 'Process', href: '/#process', key: 'process' },
      { num: '04', label: 'About', href: '/about', key: 'about' },
    ],
    primaryCta: { label: 'Free audit', href: '/audit' },
  },

  services: {
    heading: 'Services',
    sectionMark: { number: '02', label: 'SERVICES' },
    intro: 'Three productized engagements. Custom available above $15K — let us talk.',
    tiers: [
      {
        eyebrow: 'TIER 01',
        name: 'Conversion Audit',
        price: '$1,500',
        cadence: 'one-time · 5-day SLA',
        scope: [
          'Heuristic + analytics review of your existing page',
          'Identification of the top 5 conversion leaks ranked by impact',
          'Specific copy + design + technical fixes per leak',
          '5-page PDF report, 30-min walkthrough call',
          'Audit cost credits 100% toward a project booked within 30 days',
        ],
        cta: { label: 'Start an audit', href: '/contact?tier=audit' },
      },
      {
        eyebrow: 'TIER 02 · MOST PICKED',
        name: 'Landing Page',
        price: '$4,500',
        cadence: 'fixed-fee · 14 days',
        scope: [
          'Discovery call + voice-of-customer research',
          'Conversion copywriting (headline, subhead, body, CTAs)',
          'Bespoke design (no templates, no stock illustration)',
          'Responsive build in your stack — Webflow, Framer, or Next.js',
          'Analytics + heatmap setup with a tracked goal',
          'Two revision rounds within the 14-day window',
          'Full refund if the launched page does not beat your control on the pre-agreed metric',
        ],
        cta: { label: 'Book a 15-min call', href: '/contact?tier=landing' },
        featured: true,
      },
      {
        eyebrow: 'TIER 03',
        name: 'Full Marketing Site',
        price: 'from $12,000',
        cadence: 'fixed-fee · 4-6 weeks',
        scope: [
          'Up to 7 pages: home, product, pricing, about, blog index, two case studies',
          'Information architecture + sitemap',
          'Conversion copywriting for every page',
          'Component system handed off to your team',
          'CMS wired (Sanity, Contentful, or in-stack)',
          'Sitemap + JSON-LD + analytics across the surface',
        ],
        cta: { label: 'Get a quote', href: '/contact?tier=site' },
      },
    ],
    retainer: {
      eyebrow: 'OPTIONAL',
      name: 'CRO Retainer',
      price: '$3,500/mo',
      cadence: 'monthly · 3-month minimum',
      scope: [
        'One CRO experiment shipped per month',
        'Statistical analysis with confidence intervals reported, not just lift %',
        'Monthly written report and 30-min sync',
      ],
      cta: { label: 'Discuss a retainer', href: '/contact?tier=retainer' },
    },
  },

  process: {
    heading: 'Process',
    sectionMark: { number: '03', label: 'PROCESS' },
    intro: 'Four phases across fourteen days. Every step has a written deliverable.',
    steps: [
      {
        day: 'DAY 01-02',
        label: 'Discovery',
        detail: 'Voice-of-customer interviews, analytics dive, competitive teardown. Output: a one-page positioning brief.',
      },
      {
        day: 'DAY 03-05',
        label: 'Copy + wireframe',
        detail: 'Conversion copywriting first, then a low-fidelity wireframe in Figma. Approval gate before design.',
      },
      {
        day: 'DAY 06-10',
        label: 'Design + build',
        detail: 'Bespoke design in your stack. Responsive, accessible, instrumented. Two revision rounds inside this window.',
      },
      {
        day: 'DAY 11-14',
        label: 'QA + ship',
        detail: 'Cross-browser QA, Lighthouse pass (≥95 perf, 100 a11y), analytics goal verified. Then we ship together.',
      },
    ],
  },

  faq: {
    heading: 'Frequently asked',
    sectionMark: { number: '04', label: 'FAQ' },
    items: [
      {
        id: 'duration',
        q: 'How long does a landing page project take?',
        a: 'Two weeks from kickoff to launch. Week 1: research, copy, wireframe. Week 2: design, build, QA, ship.',
      },
      {
        id: 'copy',
        q: 'Do you write the copy or do I provide it?',
        a: 'I write it. Conversion copywriting is half the work — handing me draft copy almost always means starting over.',
      },
      {
        id: 'scope',
        q: 'What is included at $4,500?',
        a: 'Discovery call, voice-of-customer research, copy, design, responsive build, analytics + heatmap setup, two revision rounds, launch.',
      },
      {
        id: 'guarantee',
        q: 'Do you guarantee a conversion lift?',
        a: 'No one honest does. I guarantee a measurably better page than what you have, by metrics agreed up front (signup rate, scroll depth, time-on-page). Full refund if I miss it.',
      },
      {
        id: 'stack',
        q: 'Can you work with our existing stack (Webflow, Framer, Next.js)?',
        a: 'Yes. I build in your stack so your team owns it post-launch. No vendor lock-in to my tooling.',
      },
      {
        id: 'audit-vs-project',
        q: 'What is the difference between the audit and the full project?',
        a: 'The audit is a $1,500 written report identifying conversion leaks. The full project executes the fixes. Audit cost credits 100% toward a project booked within 30 days.',
      },
      {
        id: 'fit',
        q: 'What kinds of SaaS do you work with best?',
        a: 'B2B SaaS with $50-500/mo pricing and self-serve signup. PLG-style funnels, not enterprise sales pages.',
      },
      {
        id: 'payment',
        q: 'How does payment work?',
        a: '50% to start, 50% at launch. Wire or Stripe. Net-15 invoicing for retainers.',
      },
    ],
  },

  about: {
    sectionMark: { number: '05', label: 'STUDIO' },
    heading: 'A studio of one, instrumented.',
    lede: 'I am Tyler Lundeen. I design landing pages for B2B SaaS. Before this I shipped engineering systems — which is why every page I build comes with the analytics rig, not just the picture.',
    body: [
      'Lundeen Studio is the deliberate small thing. One designer. Two clients at a time. Fixed-fee, two-week engagements. The constraint is the value: I cannot afford to ship a page that does not work, so I do not.',
      'I write the copy. I do the research. I build it in your stack. I instrument it. I am on the call when it ships.',
      'If you have a B2B SaaS product, a landing page that is leaking, and a budget under $15K — I am probably the right person.',
    ],
    credentials: [
      { label: 'Engineering', detail: '10+ years shipping production software (Rust, Python, TypeScript)' },
      { label: 'Design', detail: 'Conversion-focused landing pages and marketing sites since 2022' },
      { label: 'Stack', detail: 'Webflow, Framer, Next.js, Astro, plain HTML/CSS' },
      { label: 'Tools', detail: 'PostHog, Plausible, Hotjar, Microsoft Clarity, Lighthouse CI' },
    ],
  },

  contact: {
    sectionMark: { number: '06', label: 'CONTACT' },
    heading: 'Tell me about your project.',
    lede: 'Two-week response on weekdays. If urgent, mention it — I keep one rush slot per quarter.',
    fields: {
      nameLabel: 'Your name',
      emailLabel: 'Email',
      companyLabel: 'Company (optional)',
      budgetLabel: 'Budget',
      projectLabel: 'What are you working on?',
      submitLabel: 'Send inquiry',
    },
    budgetOptions: [
      { value: '<5k', label: 'Under $5K' },
      { value: '5-10k', label: '$5K – $10K' },
      { value: '10-25k', label: '$10K – $25K' },
      { value: '25k+', label: '$25K+' },
    ],
    successHeading: 'Got it.',
    successBody: 'I will reply within two business days. If you are urgent, reply to the confirmation email and say so.',
    errorHeading: 'Did not send.',
    errorBody: 'Try again, or email tyler.lundeen1995@gmail.com directly.',
  },

  cta: {
    sectionMark: { number: '07', label: 'NEXT' },
    heading: 'Two slots open this month.',
    lede: 'Start with the free audit. If we are a fit, the cost credits toward the build.',
    primary: { label: 'Get a free audit', href: '/audit' },
    secondary: { label: 'Book a 15-min call', href: '/contact' },
  },

  footer: {
    columns: [
      {
        heading: 'STUDIO',
        items: [
          { label: 'About', href: '/about' },
          { label: 'Process', href: '/#process' },
          { label: 'Journal', href: '/journal' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      {
        heading: 'WORK',
        items: [
          { label: 'All case studies', href: '/work' },
          { label: 'Acme Cloud', href: '/work/acme-cloud' },
          { label: 'Pulse Pricing', href: '/work/pulse-pricing-page' },
          { label: 'Orbital', href: '/work/orbital-marketing-site' },
        ],
      },
      {
        heading: 'SERVICES',
        items: [
          { label: 'Audit', href: '/#services' },
          { label: 'Landing page', href: '/#services' },
          { label: 'Full site', href: '/#services' },
          { label: 'Retainer', href: '/#services' },
        ],
      },
      {
        heading: 'LEGAL',
        items: [
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
          { label: 'Sitemap', href: '/sitemap.xml' },
        ],
      },
    ],
    legal: '© 2026 Lundeen Studio. Built by hand on the West Coast.',
  },

  notFound: {
    code: '404',
    heading: 'Route not found.',
    body: 'You followed a link that does not exist on this site. Probably my fault.',
    cta: { label: 'Back to the homepage', href: '/' },
  },
} as const

export type Copy = typeof COPY
