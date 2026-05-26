import { COPY } from '@/content/copy'

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://mosaicbyte.vercel.app'

export { SITE_URL }

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
  priceRange: '$2500-$15000',
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
    itemListElement: COPY.services.tiers.map((tier) => ({
      '@type': 'Offer',
      name: tier.name,
      priceCurrency: 'USD',
      price: tier.price.replace(/[^0-9]/g, '').slice(0, 5),
    })),
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
