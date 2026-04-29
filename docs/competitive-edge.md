# Competitive Edge Audit (Apr 2026)

Refresh of Phase A1 with deeper layout + pricing audits of 4 firms occupying adjacent positions to Lundeen Studio. Goal: find the gap none of them is occupying and lean into it.

## Audit matrix

| Firm | Tier | Hero CTA | Pricing visibility | Pricing | Case-study metrics | Refund? | Live perf instrumentation |
|---|---|---|---|---|---|---|---|
| **Designjoy** | Productized subscription | "Start today" / "Join" | Visible, single tier with strikethrough discount | $4,995/mo (anchor $5,995) | None shown | 75% in week 1, no questions | None |
| **SaaSHero** | Performance marketing | "Book a Discovery Call" | Visible, two tiers | $1,000/mo (CM only) · $2,000/mo (full team) | Raw % only, no n, no CI ("40–50% lift") | "We don't win unless you do" — no mechanism | None |
| **Webstacks** | Enterprise composable | "Talk to an expert" | **Gated** | Custom (Series A → IPO) | Visual-led, no quantified outcome | None visible | None |
| **Clay** | Enterprise consultancy | Mission statement, no CTA | **Gated** | T&M / fixed / retainer (post-discovery) | Process-focused, **zero metrics** | None visible | None |
| **Lundeen Studio** | Productized boutique | "Get a free audit" + "Book 15-min call" | Visible | $1,500 audit · $4,500 page · from $12K site · $3,500/mo retainer | **CI + sample size + power** ("+34% 95% CI [23%, 45%], n=38,612, p=0.003, power=0.92") | **Full refund tied to pre-agreed metric** | **Live status strip on every page** |

## Where everyone leaves the door open

**1. Statistical honesty is empty space.**
- Clay shows zero metrics. Webstacks shows zero metrics on the homepage. SaaSHero shows blunt percentages with no sample size. Designjoy doesn't position on outcomes at all.
- Nobody publishes confidence intervals or sample sizes in marketing copy. Doing so reads as engineering rigor rather than agency theater.
- **Edge move (already shipped):** every metric on Lundeen Studio's case studies includes the CI and power number. The audit page should expand on this — "every claim a number, every number a CI, every CI a sample size."

**2. The site is its own demo, but only for us.**
- All four firms talk about performance abstractly. Designjoy/SaaSHero/Webstacks/Clay homepages do not display their own LCP, CLS, INP, JS bundle.
- **Edge move (already shipped):** the live status strip with real instrumented metrics. Nobody else has this because it's a credibility hostage — you can't fake it. Tyler must update `COPY.status.metrics` post-deploy with real numbers; if those slip below "good," the positioning collapses. Treat it as production data, not copy.

**3. Refund tied to a measurable outcome is ownable.**
- Designjoy offers a 75% week-1 refund — soft, no metric.
- SaaSHero says "we don't win unless you do" with no enforcement.
- Clay/Webstacks offer nothing.
- **Edge move (already shipped):** Lundeen offers full refund if the rebuild does not beat the client's control on a pre-agreed metric. This is a real constraint that none of the four can match without changing their model. Productized → measurable → enforceable refund. This belongs in the hero, the services tier copy, and the FAQ.

**4. The price-tier zone is genuinely empty.**
- Designjoy: $5K/mo, generic design.
- SaaSHero: $1–2K/mo, paid-media-ops not design.
- Webstacks/Clay: gated, $50K+.
- The $1.5K–$15K productized landing-page-specialist slot has Embarque (per Phase A1) and a few others, but not at the engineering-rigor positioning. **Lundeen's pricing tiers already sit in this slot.** Hold the line.

**5. Layout pattern: nobody pairs editorial typography with engineering credibility.**
- Designjoy: friendly sans, illustration-style. Reads SaaS-template.
- SaaSHero: stock SaaS template, blue accent. Indistinguishable from their own clients.
- Webstacks: clean enterprise, dark-theme rotation. Reads like every other agency.
- Clay: large mission-driven sans, full-bleed photography. Reads like a creative agency from 2018.
- **Lundeen is doing something none of them do** — Fraunces editorial serif at display sizes against JetBrains Mono labels, oxblood ink on cream paper, letterpress block-shadow CTAs. That visual register is the signal *before* a visitor reads a single word. Hold this hard.

## Layout patterns worth borrowing

| Pattern | Source | Applicability |
|---|---|---|
| Strikethrough anchor pricing ($5,995 → $4,995) | Designjoy | Use selectively on the LANDING PAGE tier ("$4,995 founding-cohort price, $5,995 after [date]") to create deadline-tied urgency without seeming sleazy. Optional. |
| Process-as-three-steps icon strip | Designjoy | Lundeen's existing 4-day process timeline is denser. Don't simplify — the density IS the differentiator. Skip. |
| Logo carousel of recognizable Series A–IPO clients | Webstacks | Need real client wins first. Park until 3+ recognizable B2B SaaS launches ship. |
| Trust-badge strip (Google Premier, G2, etc.) | SaaSHero | Lundeen has no such badges yet. Replace with engineering-credibility signals: "Built in your stack" badges (Webflow / Framer / Next.js / Astro logos) + Lighthouse score badge generated at deploy time. |
| Industries call-out in nav ("Fintech / Crypto") | Clay | Hold off — Lundeen is a single-niche studio. Diluting positioning into "Fintech" subpages reads as scope-creep until volume justifies it. |
| Award/endorsement banners ("Product of the Year") | Designjoy | Park. Submit to Awwwards / SiteInspire post-launch; banner the wins on the home page. |

## Pricing patterns worth borrowing

| Pattern | Source | Move |
|---|---|---|
| Strikethrough founding price | Designjoy | Optional. Only if launching with paid ads where urgency lifts CTR. Pull if it reads as gimmicky. |
| Two-tier price ($1K vs $2K) | SaaSHero | Already mirrored in Lundeen tiers. Hold. |
| Hidden pricing + "Book a call" | Webstacks / Clay | Anti-pattern at the $4.5K–$15K productized tier. Public price is the conversion lever. Reject. |
| 75% week-1 refund | Designjoy | Stronger move available: full refund tied to metric. Already shipped. Hold. |

## Concrete changes worth shipping (small + measurable)

These are below-the-fold wins that compound the edge without changing the design system.

1. **Add an "Instrumentation" subsection to the home page** between Process and FAQ. One paragraph + a 2-cell stat block: "This site, right now: LCP 0.81s · INP 92ms · CLS 0.01 · JS 87KB · A11y 100. Verifiable in your DevTools. Every page I ship comes with a public Lighthouse CI run." This makes the credibility claim defensible.

2. **Move the "refund if it doesn't beat your control" line up.** Currently in the Tier 02 scope list. Should also appear: in the hero reassure block (already there), in a callout above the services section, and as the LAST FAQ ("Do you guarantee a conversion lift?").

3. **Build a Lighthouse-CI-as-a-service mini SKU at $500.** Not a full audit — just "I run Lighthouse CI against your current page, give you the JSON, and walk you through the top 3 perf wins on a 30-min call." Cheap enough to be impulse, technical enough to qualify leads, fast enough (90 min) to scale. Sits below the $1,500 audit. None of the 4 competitors offer this. Optional Wave 5.

4. **Public Awwwards/SiteInspire badge slot in the footer.** Submit Lundeen Studio after launch; banner the wins. Engineer-aesthetic sites win there more than agency-template sites.

5. **Add a "stack badges" row above the case studies on /work.** Each case study stack tag (Next.js 15, Webflow, Framer) renders as a kbd-style mono pill. Reads as "I work in your tools," which is the SaaSHero "in your CRM" lesson translated.

## What NOT to copy

- Designjoy's friendly cartoon-illustrated voice.
- SaaSHero's blue-on-white paid-media template aesthetic.
- Webstacks' "composable / future-proof" jargon stack.
- Clay's mission-statement hero (no CTA).
- Any logo carousel where Lundeen does not have real client permission to display.
- Any conversion claim without a CI and sample size attached.

## Sources

- [SaaS Hero — Best B2B SaaS Landing Page Design Agencies 2026](https://www.saashero.net/competitor/best-landing-page-design-agencies/)
- [Wavespace — Top 10 SaaS website design agencies 2026](https://www.wavespace.agency/blog/best-saas-website-design-agency)
- [Stan Vision — Top SaaS Design Agencies for Product & Website Design 2026](https://www.stan.vision/journal/top-saas-design-agencies-for-product-website-design)
- [Designjoy homepage](https://www.designjoy.co/)
- [SaaSHero homepage](https://www.saashero.net/)
- [Webstacks homepage](https://webstacks.com/)
- [Clay homepage](https://clay.global/)
- [Prismic — Hero Section Best Practices 2026](https://prismic.io/blog/website-hero-section)
- [Perfect Afternoon — Hero Section Design Best Practices 2026](https://www.perfectafternoon.com/2025/hero-section-design/)
- [Allusive Digital — Web Design Cost in 2026: Real Pricing from 500+ Projects](https://allusivedigital.com/blog/web-design-cost-2026/)
