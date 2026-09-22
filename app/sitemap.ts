import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"
import { STORES } from "@/lib/stores"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["/home", "/new-drops", "/how-it-works", "/shipping", "/returns", "/contact", "/drive"]
  return [
    ...staticPaths.map(p => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const, priority: p === "/home" ? 1 : 0.6 })),
    ...STORES.map(s => ({ url: `${SITE_URL}/stores/${s.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
  ]
}
