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
  /**
   * Physical stores a driver can pick up from. Orders go to the NEAREST location
   * to the customer that stocks every item in the order (see lib/pickup.ts).
   * Stores without this list use pickupAddress/pickupLocation as their only location.
   */
  locations?: StoreLocation[]
}

export type StoreLocation = {
  /** Stable id, e.g. "zara-hudson-yards". Product.locations references these. */
  id: string
  name: string
  address: string
  lat: number
  lng: number
}

export const STORE_REGISTRY: StoreConfig[] = [
  {
    slug: "zara", name: "Zara", shopifyDomain: "zara-fitdrop.myshopify.com",
    pickupAddress: "503 5th Ave, New York, NY 10017", pickupLocation: { lat: 40.7536, lng: -73.9803 },
    locations: [
      { id: "zara-fifth-ave", name: "Zara Fifth Avenue", address: "503 5th Ave, New York, NY 10017", lat: 40.7536, lng: -73.9803 },
      { id: "zara-hudson-yards", name: "Zara Hudson Yards", address: "20 Hudson Yards (Level 3), New York, NY 10001", lat: 40.7538, lng: -74.002 },
      { id: "zara-34th-st", name: "Zara 34th Street", address: "39 W 34th St, New York, NY 10001", lat: 40.7494, lng: -73.9859 },
      { id: "zara-soho", name: "Zara SoHo", address: "503 Broadway, New York, NY 10012", lat: 40.7222, lng: -73.9995 },
      { id: "zara-fidi", name: "Zara Financial District", address: "222 Broadway, New York, NY 10038", lat: 40.7109, lng: -74.0089 },
    ],
  },
  {
    slug: "uniqlo", name: "Uniqlo", shopifyDomain: "uniqlo-fitdrop.myshopify.com",
    pickupAddress: "546 Broadway, New York, NY 10012", pickupLocation: { lat: 40.7236, lng: -73.9983 },
    locations: [
      { id: "uniqlo-soho", name: "Uniqlo SoHo", address: "546 Broadway, New York, NY 10012", lat: 40.7236, lng: -73.9983 },
      { id: "uniqlo-fifth-ave", name: "Uniqlo Fifth Avenue", address: "666 5th Ave, New York, NY 10103", lat: 40.7603, lng: -73.9757 },
      { id: "uniqlo-34th-st", name: "Uniqlo 34th Street", address: "31 W 34th St, New York, NY 10001", lat: 40.7489, lng: -73.9863 },
      { id: "uniqlo-bryant-park", name: "Uniqlo Bryant Park", address: "510 5th Ave, New York, NY 10036", lat: 40.754, lng: -73.9806 },
      { id: "uniqlo-union-square", name: "Uniqlo Union Square", address: "860 Broadway, New York, NY 10003", lat: 40.7374, lng: -73.9903 },
      { id: "uniqlo-hudson-yards", name: "Uniqlo Hudson Yards", address: "20 Hudson Yards, New York, NY 10001", lat: 40.7538, lng: -74.002 },
    ],
  },
  {
    slug: "hm", name: "H&M", shopifyDomain: "hm-fitdrop.myshopify.com",
    pickupAddress: "1 Herald Center, New York, NY 10001", pickupLocation: { lat: 40.7494, lng: -73.9887 },
    locations: [
      { id: "hm-herald-square", name: "H&M Herald Square", address: "1 Herald Center, New York, NY 10001", lat: 40.7494, lng: -73.9887 },
      { id: "hm-fifth-ave", name: "H&M Fifth Avenue", address: "505 5th Ave, New York, NY 10017", lat: 40.7532, lng: -73.9805 },
      { id: "hm-hudson-yards", name: "H&M Hudson Yards", address: "20 Hudson Yards, New York, NY 10001", lat: 40.7538, lng: -74.002 },
      { id: "hm-soho", name: "H&M SoHo", address: "558 Broadway, New York, NY 10012", lat: 40.7241, lng: -73.9978 },
      { id: "hm-harlem", name: "H&M Harlem", address: "125 W 125th St, New York, NY 10027", lat: 40.8083, lng: -73.9469 },
    ],
  },
  {
    slug: "nike", name: "Nike", shopifyDomain: "nike-fitdrop.myshopify.com",
    pickupAddress: "650 5th Ave, New York, NY 10019", pickupLocation: { lat: 40.76, lng: -73.9763 },
    locations: [
      { id: "nike-fifth-ave", name: "Nike House of Innovation", address: "650 5th Ave, New York, NY 10019", lat: 40.76, lng: -73.9763 },
      { id: "nike-soho", name: "Nike SoHo", address: "529 Broadway, New York, NY 10012", lat: 40.7232, lng: -73.9992 },
    ],
  },
  { slug: "cos", name: "COS", shopifyDomain: "cos-fitdrop.myshopify.com", pickupAddress: "129 Prince St, New York, NY 10012", pickupLocation: { lat: 40.7253, lng: -73.999 } },
  {
    slug: "mango", name: "Mango", shopifyDomain: "mango-fitdrop.myshopify.com",
    pickupAddress: "711 5th Ave, New York, NY 10022", pickupLocation: { lat: 40.7621, lng: -73.9745 },
    locations: [
      { id: "mango-fifth-ave", name: "Mango Fifth Avenue", address: "711 5th Ave, New York, NY 10022", lat: 40.7621, lng: -73.9745 },
      { id: "mango-soho", name: "Mango SoHo", address: "561 Broadway, New York, NY 10012", lat: 40.724, lng: -73.9975 },
      { id: "mango-hudson-yards", name: "Mango Hudson Yards", address: "20 Hudson Yards, New York, NY 10001", lat: 40.7538, lng: -74.002 },
      { id: "mango-lincoln-square", name: "Mango Lincoln Square", address: "1976 Broadway, New York, NY 10023", lat: 40.7751, lng: -73.982 },
    ],
  },
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

/** All pickup locations for a store (a single one for stores without a `locations` list). */
export function getStoreLocations(slug: string): StoreLocation[] {
  const store = STORE_REGISTRY.find(s => s.slug === slug)
  if (!store) return []
  if (store.locations?.length) return store.locations
  if (store.pickupAddress && store.pickupLocation) {
    return [{ id: `${slug}-main`, name: store.name, address: store.pickupAddress, ...store.pickupLocation }]
  }
  return []
}
