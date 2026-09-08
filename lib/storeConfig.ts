// Central registry of every store FitDrop supports.
//
// To onboard a REAL brand: add one entry here with their real Shopify
// domain, then add the same slug/name to the `stores` array in
// app/home/page.tsx (for the homepage store card) and to `STORES` in
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
}

export const STORE_REGISTRY: StoreConfig[] = [
  { slug: "zara", name: "Zara", shopifyDomain: "zara-fitdrop.myshopify.com", pickupAddress: "503 5th Ave, New York, NY 10017" },
  { slug: "uniqlo", name: "Uniqlo", shopifyDomain: "uniqlo-fitdrop.myshopify.com", pickupAddress: "546 Broadway, New York, NY 10012" },
  { slug: "hm", name: "H&M", shopifyDomain: "hm-fitdrop.myshopify.com", pickupAddress: "435 7th Ave, New York, NY 10001" },
  { slug: "nike", name: "Nike", shopifyDomain: "nike-fitdrop.myshopify.com", pickupAddress: "650 5th Ave, New York, NY 10019" },
  { slug: "cos", name: "COS", shopifyDomain: "cos-fitdrop.myshopify.com", pickupAddress: "129 Prince St, New York, NY 10012" },
  { slug: "mango", name: "Mango", shopifyDomain: "mango-fitdrop.myshopify.com", pickupAddress: "1 Herald Sq, New York, NY 10001" },
  // Demo store used for internal testing / showing the app to prospective brands.
  // Not connected to Shopify — its products are added directly in MongoDB.
  { slug: "marlow", name: "Marlow", pickupAddress: "180 Orchard St, New York, NY 10002" },
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
