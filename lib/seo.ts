import type { Metadata } from "next"

export const SITE_URL = "https://www.shopfitdrop.com"
export const SITE_NAME = "FitDrop"
export const DEFAULT_DESCRIPTION =
  "Shop Zara, Uniqlo, H&M, Nike, COS, Mango and more — delivered to your door in Manhattan the same day, in as little as 30 minutes."

type OgOptions = { title: string; subtitle?: string; image?: string }

/** URL of the generated 1200x630 share image (app/og/route.tsx). */
export function ogImageUrl({ title, subtitle, image }: OgOptions) {
  const params = new URLSearchParams({ title })
  if (subtitle) params.set("subtitle", subtitle)
  if (image) params.set("image", image)
  return `/og?${params.toString()}`
}

type PageMetaOptions = {
  /** Page title WITHOUT the "| FitDrop" suffix (the root layout template adds it). */
  title: string
  description: string
  /** Path of the page, e.g. "/stores/zara" — used for canonical + og:url. */
  path: string
  og?: OgOptions
  /** Set to true for private pages (cart, orders) that shouldn't be indexed. */
  noindex?: boolean
}

/** Unique title + description + Open Graph + Twitter Card for one page. */
export function pageMeta({ title, description, path, og, noindex }: PageMetaOptions): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`
  const image = {
    url: ogImageUrl(og ?? { title, subtitle: description }),
    width: 1200,
    height: 630,
    alt: fullTitle,
  }
  return {
    // `absolute` so nested layouts (store → product) never lose the "| FitDrop" suffix
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title: fullTitle,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image.url],
    },
  }
}
