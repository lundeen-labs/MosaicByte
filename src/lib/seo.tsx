import { Helmet } from 'react-helmet-async'
import { COPY } from '@/content/copy'
import { SITE_URL } from './seo-data'

export interface SeoProps {
  title?: string
  description?: string
  ogImage?: string
  canonicalPath?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

const DEFAULT_TITLE = `${COPY.brand.full} — SaaS Landing Pages That Convert`
const DEFAULT_DESCRIPTION = COPY.brand.description
const DEFAULT_OG = `${SITE_URL}/og/index.png`

export function Seo({ title, description, ogImage, canonicalPath = '/', jsonLd }: SeoProps) {
  const t = title ?? DEFAULT_TITLE
  const d = description ?? DEFAULT_DESCRIPTION
  const og = ogImage ?? DEFAULT_OG
  const canonical = `${SITE_URL}${canonicalPath}`

  const blobs = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      <title>{t}</title>
      <meta name="description" content={d} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:image" content={og} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={COPY.brand.full} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content={og} />

      {blobs.map((b, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(b)}
        </script>
      ))}
    </Helmet>
  )
}

