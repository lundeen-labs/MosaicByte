import { COPY } from '@/content/copy'

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://mosaicbyte.design'

export { SITE_URL }

/**
 * Numeric price of a tier, or null for a recurring plan.
 *
 * `priceRange` used to be hardcoded as '$2500-$15000' while COPY.services
 * advertised $1,500 to $5,000 — structured data telling Google one thing and
 * the page telling a visitor another. It is derived here so the two cannot
 * disagree again, and e2e/seo.spec.ts asserts the derived range actually
 * brackets the rendered tier prices.
 */
function oneOffPriceOf(tier: { price: string }): number | null {
  if (/\/(mo|month|yr|year)\b/i.test(tier.price)) return null
  const digits = tier.price.replace(/[^0-9]/g, '')
  return digits ? Number(digits) : null
}

const oneOffPrices = COPY.services.tiers
  .map(oneOffPriceOf)
  .filter((n): n is number => n !== null)

const priceRange = `$${Math.min(...oneOffPrices)}-$${Math.max(...oneOffPrices)}`

/**
 * Person blob for the studio lead (Jesenia). Surfaces on the About route.
 * `sameAs` is intentionally empty until real public profiles are linked.
 */
export const personJsonLd: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#jesenia`,
  name: 'Jesenia Lundeen',
  url: `${SITE_URL}/about`,
  jobTitle: 'Designer · Mosaic Byte',
  description:
    'Designer behind Mosaic Byte. Brand systems and conversion-focused landing pages for small teams.',
  worksFor: { '@id': `${SITE_URL}/#org` },
}

/**
 * Mosaic Byte studio as a ProfessionalService. Tiers come from COPY.services
 * so any price change in copy.ts flows here automatically.
 */
export const orgJsonLd: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#org`,
  name: COPY.brand.full,
  url: SITE_URL,
  image: `${SITE_URL}/og/index.png`,
  description: COPY.brand.description,
  founder: { '@id': `${SITE_URL}/#jesenia` },
  areaServed: { '@type': 'Country', name: 'United States' },
  priceRange,
  serviceType: 'Brand & Landing Page Design',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Mount Vernon',
    addressRegion: 'WA',
    addressCountry: 'US',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services',
    itemListElement: COPY.services.tiers.map((tier) => {
      const oneOff = oneOffPriceOf(tier)
      return {
        '@type': 'Offer',
        name: tier.name,
        priceCurrency: 'USD',
        // A recurring plan has no single price; advertising the bare digits of
        // '$150/mo' as a one-off price of 150 misrepresents it in search.
        ...(oneOff === null
          ? { priceSpecification: { '@type': 'UnitPriceSpecification', priceCurrency: 'USD', price: tier.price } }
          : { price: String(oneOff) }),
      }
    }),
  },
}

export const faqJsonLd: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: COPY.faq.items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}
