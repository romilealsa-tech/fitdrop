import mongoose from "mongoose"
import Product from "@/models/Product"
import { getStoreLocations, STORE_NAMES, type StoreLocation } from "@/lib/storeConfig"

type LatLng = { lat: number; lng: number }

/** FitDrop promise: every order arrives within 90 minutes. */
export const MAX_DELIVERY_MINUTES = 90

// Delivery-time estimate (tune these as real delivery data comes in)
const DRIVER_TO_STORE_MIN = 15 // driver heading to the store
const STORE_PREP_MIN = 10       // store picks & bags the items
const MINUTES_PER_MILE = 6      // ~10 mph average in Manhattan traffic
const STREET_GRID_FACTOR = 1.3  // streets are longer than a straight line

/** Straight-line distance in miles. */
export function distanceMiles(a: LatLng, b: LatLng) {
  const R = 3958.8
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** Estimated minutes from order to door when picking up at a store `miles` away from the customer. */
export function estimateMinutes(miles: number) {
  return Math.round(DRIVER_TO_STORE_MIN + STORE_PREP_MIN + miles * STREET_GRID_FACTOR * MINUTES_PER_MILE)
}

type CartItem = { _id?: string; id?: string; name?: string }

export type PickupQuote =
  | {
      ok: true
      location: StoreLocation
      distanceMiles: number | null
      etaMinutes: number | null
      /** Set when the closest store couldn't be used because it's missing items. */
      nearest: { name: string; missingItems: string[] } | null
    }
  | { ok: false; reason: "too_far" | "not_in_stock_nearby" | "unknown_store"; message: string }

/**
 * Chooses where an order is picked up:
 *  1. only store locations that stock EVERY item (Product.locations; empty = everywhere),
 *  2. only locations that can deliver within MAX_DELIVERY_MINUTES,
 *  3. the closest of those to the customer.
 * Without customer coordinates, returns the first eligible (flagship) location with no ETA.
 */
export async function quotePickup(storeSlug: string, items: CartItem[], dropoff: LatLng | null): Promise<PickupQuote> {
  const all = getStoreLocations(storeSlug)
  const brand = STORE_NAMES[storeSlug] || storeSlug
  if (all.length === 0) return { ok: false, reason: "unknown_store", message: `We couldn't find ${brand} pickup locations.` }

  // Stock per location
  const ids = items.map(i => String(i._id || i.id || "")).filter(id => mongoose.isValidObjectId(id))
  const products = ids.length
    ? ((await Product.find({ _id: { $in: ids } }, { name: 1, locations: 1 }).lean()) as { name: string; locations?: string[] }[])
    : []
  const missingAt = (loc: StoreLocation) =>
    products.filter(p => p.locations?.length && !p.locations.includes(loc.id)).map(p => p.name)
  const inStock = all.filter(loc => missingAt(loc).length === 0)

  if (!dropoff) {
    if (inStock.length === 0) {
      return { ok: false, reason: "not_in_stock_nearby", message: `No single ${brand} store has all the items in your cart right now.` }
    }
    return { ok: true, location: inStock[0], distanceMiles: null, etaMinutes: null, nearest: null }
  }

  const ranked = all
    .map(loc => {
      const miles = distanceMiles(dropoff, loc)
      return { loc, miles, eta: estimateMinutes(miles) }
    })
    .sort((a, b) => a.miles - b.miles)

  const closest = ranked[0]
  if (closest.eta > MAX_DELIVERY_MINUTES) {
    return {
      ok: false,
      reason: "too_far",
      message: `This address is too far from ${brand} for FitDrop delivery (max 1.5 hours).`,
    }
  }

  const best = ranked.find(r => r.eta <= MAX_DELIVERY_MINUTES && missingAt(r.loc).length === 0)
  if (!best) {
    return {
      ok: false,
      reason: "not_in_stock_nearby",
      message: `The ${brand} stores close enough to deliver in under 1.5 hours don't have everything in your cart. Try removing an item.`,
    }
  }

  return {
    ok: true,
    location: best.loc,
    distanceMiles: Math.round(best.miles * 10) / 10,
    etaMinutes: best.eta,
    nearest: best.loc.id === closest.loc.id ? null : { name: closest.loc.name, missingItems: missingAt(closest.loc) },
  }
}
