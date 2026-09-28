import mongoose from "mongoose"
import Product from "@/models/Product"
import { getStoreLocations, type StoreLocation } from "@/lib/storeConfig"

type LatLng = { lat: number; lng: number }

/** Straight-line distance in miles. */
export function distanceMiles(a: LatLng, b: LatLng) {
  const R = 3958.8
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/**
 * Picks the pickup store for an order:
 *  1. only locations that stock EVERY item in the order (Product.locations; empty = everywhere),
 *  2. the one closest to the customer's drop-off point.
 * Falls back to the closest location overall if none stocks everything, and to the
 * store's first (flagship) location when the customer's coordinates are unknown.
 */
export async function choosePickupLocation(
  storeSlug: string,
  items: { _id?: string; id?: string }[],
  dropoff: LatLng | null
): Promise<(StoreLocation & { distanceMiles: number | null }) | null> {
  const all = getStoreLocations(storeSlug)
  if (all.length === 0) return null

  // Which locations carry every product in the cart?
  const ids = items.map(i => String(i._id || i.id || "")).filter(id => mongoose.isValidObjectId(id))
  let eligible = all
  if (ids.length > 0) {
    const products = await Product.find({ _id: { $in: ids } }, { locations: 1 }).lean() as { locations?: string[] }[]
    eligible = all.filter(loc => products.every(p => !p.locations?.length || p.locations.includes(loc.id)))
    if (eligible.length === 0) eligible = all
  }

  if (!dropoff) return { ...eligible[0], distanceMiles: null }

  const ranked = eligible
    .map(loc => ({ ...loc, distanceMiles: distanceMiles(dropoff, loc) }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
  return ranked[0]
}
