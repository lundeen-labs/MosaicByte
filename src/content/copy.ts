/**
 * Single source of truth for every visible string on the Mosaic Byte site.
 * Pure data file: zero runtime imports.
 *
 * Voice convention (locked 2026-05-26):
 *   • The studio is Jesenia-led. Bio + about + first-person voice = Jesenia.
 *   • Tyler appears in the footer colophon only ("Site engineering by Tyler
 *     Lundeen"). He is not surfaced as a co-founder on About.
 *   • Plural "we" is used where the work genuinely involves both of us
 *     (engineering-heavy builds, anything technical Tyler picks up).
 *   • Nothing in this file may claim work that hasn't shipped. No invented
 *     clients, no invented metrics, no invented years-active. The /work page
 *     is an honest "in flight" notice until real engagements ship under the
 *     Mosaic Byte brand.
 *
 * Updates here propagate to every route. Do not duplicate copy in components.
 */

/**
 * The studio's public address, in one place. The contact CTA, the privacy
 * policy and the crash screen all read it, so changing where inquiries land is
 * a one-line edit. Kept outside COPY because COPY's own literal cannot
 * reference itself.
 */
const CONTACT_EMAIL = 'mosaicbyte.design@gmail.com'

export const COPY = {
  brand: {
    wordmark: 'Mosaic Byte',
    tagline: 'Digital Studio',
    full: 'Mosaic Byte',
    description:
      'A small digital studio designing brand systems and landing pages from Mount Vernon, WA.',
    location: 'Mount Vernon, WA',
  },

  status: {
    available: true,
    slots: 2,
    week: 'OPEN NOW',
  },

  hero: {
    eyebrow: 'DIGITAL STUDIO · MOUNT VERNON, WA',
    titleParts: {
      plain: 'Every pixel',
      italic: 'tells a story',
      rest: '— assembled one tile at a time.',
    },
    sub: 'I design brand systems and landing pages for small teams and self-funded products. Engineered with the same care as the design.',
    primaryCta: { label: 'Start a project', href: '/contact' },
    secondaryCta: { label: 'See how I work', href: '/#process' },
    reassureLines: [
      'Fixed-fee, two-week landing pages.',
      'Copy, design, and build delivered together.',
      'Built in whatever stack your team uses. You own the source on day one.',
    ],
  },

  nav: {
    primary: [
      { num: '01', label: 'Services', href: '/#services', key: 'services' },
      { num: '02', label: 'Process', href: '/#process', key: 'process' },
      { num: '03', label: 'Work', href: '/work', key: 'work' },
      { num: '04', label: 'About', href: '/about', key: 'about' },
    ],
    primaryCta: { label: 'Start a project', href: '/contact' },
  },

  services: {
    heading: 'What I do',
    sectionMark: { number: '01', label: 'SERVICES' },
    intro:
      'Three productized engagements. Custom work above $15K is available — let’s talk.',
    tiers: [
      {
        eyebrow: 'TIER 01',
        name: 'Starter',
        price: '$1,500',
        cadence: 'fixed-fee · 10 days',
        scope: [
          '5-page brouchure site',
          'Mobile responsive',
          'Basic on-page SEO',
          'Contact form',
          'One revision rounds',
          'You own every source file from day one',
        ],
        cta: { label: 'Start a starter', href: '/contact?tier=starter' },
      },
      {
        eyebrow: 'TIER 02 · MOST PICKED',
        name: 'Growth',
        price: '$3,000',
        cadence: 'fixed-fee · 14 days',
        scope: [
          'Up to 10 pages',
          'Custom design (not a stock template reskin)',
          'blog/news section',
          'Google Business Profile Setup',
          'Basic local SEO',
          'Two revision rounds inside the 14-day window',
        ],
        cta: { label: 'Book a 15-min call', href: '/contact?tier=growth' },
        featured: true,
      },
      {
        eyebrow: 'TIER 03',
        name: 'Signature',
        price: 'from $5,000',
        cadence: 'fixed-fee · 20 days',
        scope: [
          'Fully custom design',
          'e-commerce or booking integration',
          'Copywriting included',
          'Advanced SEO/schema setup',
          'Launch support',
        ],
        cta: { label: 'Get a quote', href: '/contact?tier=site' },
      },
    ],
    retainer:
      {
      eyebrow: 'MONTHLY RETAINER OPTIONS',
      name: 'Care Plan',
      price: '$150/mo',
      cadence: 'monthly · 3-month minimum',
      scope: [
        'Hosting, backups, security monitoring, uptime checks.',
        'Small content updates (1-2/month)',
        'Software/plugin updates',
      ],
      cta: { label: 'Discuss a retainer', href: '/contact?tier=retainer' },
    },
  },

  process: {
    heading: 'How it works',
    sectionMark: { number: '02', label: 'PROCESS' },
    intro: 'Four phases across fourteen days. Every step has a written deliverable.',
    steps: [
      {
        day: 'DAY 01-02',
        label: 'Discovery',
        detail:
          'Voice-of-customer interviews, analytics dive, and a quick competitive scan. Output: a one-page positioning brief you sign off on before any pixels move.',
      },
      {
        day: 'DAY 03-05',
        label: 'Copy + wireframe',
        detail:
          'Conversion copywriting first, then a low-fidelity wireframe. Approval gate before design starts.',
      },
      {
        day: 'DAY 06-10',
        label: 'Design + build',
        detail:
          'Bespoke design in your stack. Responsive, accessible, and instrumented from the first day of build. Two revision rounds inside this window.',
      },
      {
        day: 'DAY 11-14',
        label: 'QA + ship',
        detail:
          'Cross-browser QA, performance audit (≥95 desktop), accessibility audit (WCAG 2.1 AA), analytics goal verified. Then we ship together.',
      },
    ],
  },

  faq: {
    heading: 'Frequently asked',
    sectionMark: { number: '03', label: 'FAQ' },
    items: [
      {
        id: 'duration',
        q: 'How long does a landing page project take?',
        a: 'Two weeks from kickoff to launch. Week 1: research, copy, wireframe. Week 2: design, build, QA, ship.',
      },
      {
        id: 'copy',
        q: 'Do you write the copy or do I provide it?',
        a: 'I write it. Conversion copy is half the work — handing me draft copy almost always means starting over. If you already have strong copy you love, we can talk about it on the discovery call.',
      },
      {
        id: 'scope',
        q: 'What is included at $4,500?',
        a: 'Discovery interviews, voice-of-customer research, conversion copy, bespoke design, responsive build in your stack, analytics + heatmap setup, two revision rounds, launch.',
      },
      {
        id: 'engineering',
        q: 'Who builds the engineering side?',
        a: 'I design and write the copy. For builds that need real engineering — custom interactions, analytics rigging, headless CMS — my husband Tyler picks up the technical work. So you get design-led pages that also ship clean code.',
      },
      {
        id: 'stack',
        q: 'Can you work with our existing stack?',
        a: 'Yes. I build in whatever your team already uses so you own the result post-launch — no vendor lock-in to my tooling. If you have a strong preference, mention it on the discovery call.',
      },
      {
        id: 'fit',
        q: 'What kinds of clients do you work with best?',
        a: 'Small teams and self-funded products. Things between $50/mo SaaS, indie e-commerce, and founder brands. PLG-style funnels, not enterprise sales pages.',
      },
      {
        id: 'guarantee',
        q: 'Do you guarantee a conversion lift?',
        a: 'No one honest does. I guarantee a measurably better page than the one you have, against metrics we agree on up front (signup rate, scroll depth, time on page). If I miss it on the agreed metric, full refund.',
      },
      {
        id: 'payment',
        q: 'How does payment work?',
        a: '50% to start, 50% at launch. Wire or Stripe. Net-15 invoicing for retainers.',
      },
    ],
  },

  about: {
    sectionMark: { number: '04', label: 'STUDIO' },
    heading: 'A studio in Mount Vernon, WA.',
    lede:
      'I’m Jesenia Lundeen. I design landing pages and brand systems for small teams that want their site to look the way their product feels.',
    body: [
      'Mosaic Byte is the deliberate small thing. One designer, one or two clients at a time, fixed-fee, two-week engagements. The constraint is the value — I can’t afford to ship a page that doesn’t work, so I don’t.',
      'I do the research, I write the copy, I design the page. When a build calls for engineering that goes beyond what a no-code tool can handle — custom interactions, analytics rigging, a CMS that has to behave — my husband Tyler builds it. He’s a software engineer, and the reason every page that leaves this studio meets WCAG 2.1 AA accessibility standards and ships with real performance instrumentation.',
      'If you have a small product, a landing page or brand that’s leaking, and a budget under $15K — I’m probably the right person to talk to.',
    ],
    credentials: [
      { label: 'Design', detail: 'Brand systems and conversion-focused landing pages' },
      { label: 'Build', detail: 'In whatever stack your team uses — you ship with the source on day one' },
      { label: 'Location', detail: 'Mount Vernon, WA · Pacific time' },
    ],
  },

  contact: {
    sectionMark: { number: '05', label: 'CONTACT' },
    heading: 'Tell me about your project.',
    lede:
      'I read every inquiry myself. Two-business-day response on weekdays. If something is urgent, mention it — I keep one rush slot per quarter.',
    // Single source of truth for the studio's public address. The contact page,
    // the footer, the privacy policy and the crash screen all read this, so
    // changing the address is a one-line edit rather than a grep.
    email: CONTACT_EMAIL,
    emailCtaLabel: `Email ${CONTACT_EMAIL}`,
  },

  cta: {
    sectionMark: { number: '06', label: 'NEXT' },
    heading: 'Two slots open this month.',
    lede: 'Start with a 15-minute call. No pitch.',
    primary: { label: 'Start a project', href: '/contact' },
    secondary: { label: 'Read the process', href: '/#process' },
  },

  work: {
    eyebrow: 'WORK',
    sectionMark: { number: '07', label: 'WORK' },
    heading: 'Currently taking our first clients.',
    body: [
      'Mosaic Byte is new. Past work — design from Jesenia, engineering from Tyler — will be added here as it ships under this brand.',
      'In the meantime, the best way to see what we make is to start a project with us. Every engagement begins with a 15-minute call. No pitch, no slide deck.',
    ],
    cta: { label: 'Start a project', href: '/contact' },
  },

  footer: {
    columns: [
      {
        heading: 'STUDIO',
        items: [
          { label: 'Services', href: '/#services' },
          { label: 'Process', href: '/#process' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      {
        heading: 'WORK',
        items: [
          { label: 'Currently in flight', href: '/work' },
        ],
      },
      {
        heading: 'LEGAL',
        items: [
          { label: 'Privacy', href: '/privacy' },
          { label: 'Sitemap', href: '/sitemap.xml' },
        ],
      },
    ],
    legal: '© 2026 Mosaic Byte. Mount Vernon, WA.',
    colophon: 'Site engineering by Tyler Lundeen.',
  },

  notFound: {
    code: '404',
    heading: 'Route not found.',
    body: 'You followed a link that doesn’t exist on this site. Probably my fault.',
    cta: { label: 'Back to the homepage', href: '/' },
  },

  legal: {
    privacy: {
      eyebrow: 'LEGAL',
      heading: 'Privacy Policy',
      updated: 'Last updated: May 26, 2026',
      intro:
        'Mosaic Byte is a small design studio. This policy explains exactly what data this site collects, why, who processes it, and how to have it deleted. No dark patterns, no surprises.',
      sections: [
        {
          heading: 'What this site collects',
          body: [
            'Nothing. This site is a set of static files with no contact form, no server of its own, no analytics, no tracking pixels, and no advertising cookies. Browsing it creates no record I can see or query.',
            'The one thing stored in your browser is your light/dark theme choice, kept in this site’s own local storage under the key "mosaic-theme". It never leaves your device, and clearing site data removes it.',
          ],
        },
        {
          heading: 'What happens when you email me',
          body: [
            'The contact page opens your own email client against a published address — nothing is submitted through this site. I receive whatever you choose to write, and it lands in my inbox like any other email.',
            'It is used for one purpose only: to read and reply to your inquiry. Your email address is never added to a mailing list, never sold, and never shared with third parties for marketing.',
          ],
        },
        {
          heading: 'Who else sees a request',
          body: [
            'The site is hosted on GitHub Pages, so GitHub serves every page and, like any web host, records standard request logs that include your IP address. Their handling is governed by the GitHub Privacy Statement.',
            'Two typefaces (DM Serif Display and DM Mono) load from Google Fonts, which means Google receives the request for those font files, including your IP address. Nothing else on the page is loaded from a third party.',
          ],
        },
        {
          heading: 'Retention',
          body: [
            'Inquiry emails are kept as long as needed to respond and to maintain a record of the conversation, then deleted on request. There is no other store of visitor data, because none is collected.',
          ],
        },
        {
          heading: 'Your rights',
          body: [
            'You can ask what data I hold about you, request a copy, or request deletion at any time — under GDPR, CCPA, or simply because you asked. I honor deletion requests within 30 days.',
          ],
        },
        {
          heading: 'Contact',
          body: [
            `For any privacy question or deletion request, email ${CONTACT_EMAIL}.`,
          ],
        },
      ],
    },
  },
} as const

export type Copy = typeof COPY
