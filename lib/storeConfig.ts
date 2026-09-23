// Central registry of every store FitDrop supports.
//
// To onboard a REAL brand: add one entry here with their real Shopify
// domain, then add the same slug/name to `STORES` in lib/stores.ts
// (homepage card, footer, SEO) and to `STORES` in
// app/admin/dashboard/page.tsx (so admins can manage that store's
// inventory). Everything else (search, shop filters, sync, webhooks)
// reads from here or derives brand names directly from product data.

export type StoreConfig = {
  slug: string
  name: string
  /** Real Shopify domain, e.g. "my-brand.myshopify.com". Only needed if this store syncs via Shopify. */
  shopifyDomain?: string
  /** Pickup address used for driver assignment. Made up for demo/test stores. */
  pickupAddress?: string
  /** Map coordinates of the pickup address (approximate for demo stores). */
  pickupLocation?: { lat: number; lng: number }
}

export const STORE_REGISTRY: StoreConfig[] = [
  { slug: "zara", name: "Zara", shopifyDomain: "zara-fitdrop.myshopify.com", pickupAddress: "503 5th Ave, New York, NY 10017", pickupLocation: { lat: 40.7536, lng: -73.9803 } },
  { slug: "uniqlo", name: "Uniqlo", shopifyDomain: "uniqlo-fitdrop.myshopify.com", pickupAddress: "546 Broadway, New York, NY 10012", pickupLocation: { lat: 40.7236, lng: -73.9983 } },
  { slug: "hm", name: "H&M", shopifyDomain: "hm-fitdrop.myshopify.com", pickupAddress: "435 7th Ave, New York, NY 10001", pickupLocation: { lat: 40.751, lng: -73.9905 } },
  { slug: "nike", name: "Nike", shopifyDomain: "nike-fitdrop.myshopify.com", pickupAddress: "650 5th Ave, New York, NY 10019", pickupLocation: { lat: 40.76, lng: -73.9763 } },
  { slug: "cos", name: "COS", shopifyDomain: "cos-fitdrop.myshopify.com", pickupAddress: "129 Prince St, New York, NY 10012", pickupLocation: { lat: 40.7253, lng: -73.999 } },
  { slug: "mango", name: "Mango", shopifyDomain: "mango-fitdrop.myshopify.com", pickupAddress: "1 Herald Sq, New York, NY 10001", pickupLocation: { lat: 40.7496, lng: -73.988 } },
  // Demo store used for internal testing / showing the app to prospective brands.
  // Not connected to Shopify — its products are added directly in MongoDB.
  { slug: "marlow", name: "Marlow", pickupAddress: "180 Orchard St, New York, NY 10002", pickupLocation: { lat: 40.7219, lng: -73.9885 } },
]

export const STORE_CONFIGS: Record<string, { storeName: string; domain: string }> =
  Object.fromEntries(
    STORE_REGISTRY.filter(s => s.shopifyDomain).map(s => [
      s.slug,
      { storeName: s.name, domain: s.shopifyDomain! },
    ])
  )

export const STORE_MAP: Record<string, string> = Object.fromEntries(
  STORE_REGISTRY.filter(s => s.shopifyDomain).map(s => [s.shopifyDomain!, s.slug])
)

export const STORE_NAMES: Record<string, string> = Object.fromEntries(
  STORE_REGISTRY.map(s => [s.slug, s.name])
)

export const STORE_PICKUP_ADDRESSES: Record<string, string> = Object.fromEntries(
  STORE_REGISTRY.filter(s => s.pickupAddress).map(s => [s.slug, s.pickupAddress!])
)

export const STORE_PICKUP_LOCATIONS: Record<string, { lat: number; lng: number }> = Object.fromEntries(
  STORE_REGISTRY.filter(s => s.pickupLocation).map(s => [s.slug, s.pickupLocation!])
)
