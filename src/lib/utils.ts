import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Prefixes an internal href that plain `<a>` tags render outside wouter's
 * routing (hash-scroll anchors like '/#process', or static assets like
 * '/sitemap.xml') with Vite's resolved BASE_URL, so it resolves correctly
 * under both the root deploy (Vercel, BASE_URL='/') and the GitHub Pages
 * subpath deploy (BASE_URL='/MosaicByte/'). wouter's own `<Link>` does this
 * automatically for real app routes — this helper covers the hrefs that
 * can't go through `<Link>` because they aren't SPA routes.
 *
 * BASE_URL always ends in a trailing slash, so the href's own leading slash
 * is stripped first to avoid producing a double slash on concatenation.
 */
export function withBasePath(href: string): string {
  return `${import.meta.env.BASE_URL}${href.replace(/^\//, '')}`
}
