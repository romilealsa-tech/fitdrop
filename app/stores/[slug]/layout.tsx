import type { Metadata } from "next"
import { pageMeta } from "@/lib/seo"
import { STORE_BY_SLUG } from "@/lib/stores"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const store = STORE_BY_SLUG[slug]
  const name = store?.name || slug

  return pageMeta({
    title: `${name} — Same-Day Fashion Delivery`,
    description: store
      ? `Shop ${name} (${store.category.toLowerCase()}) on FitDrop and get it delivered in Manhattan today — ${store.time}, delivery ${store.fee}.`
      : `Shop ${name} on FitDrop with same-day delivery in Manhattan.`,
    path: `/stores/${slug}`,
    og: {
      title: `${name}, delivered today`,
      subtitle: store ? `${store.category} · ${store.time} · delivery ${store.fee}` : "Same-day fashion delivery in Manhattan",
    },
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
