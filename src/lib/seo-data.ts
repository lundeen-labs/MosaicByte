import { COPY } from '@/content/copy'

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://lundeen-studio.vercel.app'

export { SITE_URL }

export const personJsonLd: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#tyler`,
  name: 'Tyler Lundeen',
  url: SITE_URL,
  jobTitle: 'SaaS Landing Page Designer',
  description:
    'Freelance designer specializing in high-converting landing pages for B2B SaaS companies.',
  worksFor: { '@id': `${SITE_URL}/#org` },
}

export const orgJsonLd: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#org`,
  name: COPY.brand.full,
  url: SITE_URL,
  image: `${SITE_URL}/og/index.png`,
  description: COPY.brand.description,
  founder: { '@id': `${SITE_URL}/#tyler` },
  areaServed: { '@type': 'Country', name: 'United States' },
  priceRange: '$1500-$15000',
  serviceType: 'Landing Page Design',
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
