// Customer-facing store directory (home cards, footer, SEO).
// Backend/Shopify config for the same slugs lives in lib/storeConfig.ts.

export type StoreCard = {
  name: string
  slug: string
  category: string
  time: string
  fee: string
  lat: number
  lng: number
}

export const STORES: StoreCard[] = [
  { name: "Zara", slug: "zara", category: "Fashion & Basics", time: "30-45 min", fee: "$2.99", lat: 40.7580, lng: -73.9855 },
  { name: "Uniqlo", slug: "uniqlo", category: "Essentials & Comfort", time: "25-40 min", fee: "$1.99", lat: 40.7549, lng: -73.9840 },
  { name: "H&M", slug: "hm", category: "Trends & Streetwear", time: "35-50 min", fee: "$2.49", lat: 40.7527, lng: -73.9772 },
  { name: "Nike", slug: "nike", category: "Sport & Lifestyle", time: "20-35 min", fee: "$3.99", lat: 40.7614, lng: -73.9776 },
  { name: "COS", slug: "cos", category: "Minimal & Modern", time: "30-45 min", fee: "$2.99", lat: 40.7233, lng: -74.0030 },
  { name: "Mango", slug: "mango", category: "Mediterranean Style", time: "25-40 min", fee: "$1.99", lat: 40.7589, lng: -73.9851 },
  { name: "Marlow", slug: "marlow", category: "Elevated Everyday", time: "25-40 min", fee: "$2.49", lat: 40.7245, lng: -73.9968 },
]

export const STORE_BY_SLUG: Record<string, StoreCard> = Object.fromEntries(STORES.map(s => [s.slug, s]))

/** Lowest delivery fee across all stores, e.g. "$1.99". */
export const MIN_DELIVERY_FEE = STORES
  .map(s => s.fee)
  .sort((a, b) => parseFloat(a.slice(1)) - parseFloat(b.slice(1)))[0]

/**
 * Delivery fee for a cart: each store in the cart is a separate pickup, so the
 * cart pays that store's fee once (e.g. Uniqlo only → $1.99; Uniqlo + Nike → $5.98).
 * Placeholder pricing until real delivery pricing is defined.
 */
export function deliveryFeeFor(cart: { store?: string; slug?: string }[]): number {
  const fees = new Map<string, number>()
  for (const item of cart) {
    const key = (item.slug || item.store || "").toLowerCase()
    const store = STORE_BY_SLUG[key] || STORES.find(s => s.name.toLowerCase() === key)
    const id = store?.slug || key
    if (!fees.has(id)) fees.set(id, store ? parseFloat(store.fee.slice(1)) : 2.99)
  }
  return Math.round([...fees.values()].reduce((a, b) => a + b, 0) * 100) / 100
}
