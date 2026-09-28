import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { quotePickup, MAX_DELIVERY_MINUTES } from "@/lib/pickup"
import { STORE_NAMES } from "@/lib/storeConfig"

// Public: for each store in the cart, which location it'll be picked up from and
// how long it will take. Shown at checkout before payment.
export async function POST(req: NextRequest) {
  try {
    const { items, location } = await req.json()
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items are required" }, { status: 400 })
    }
    const dropoff =
      location && Number.isFinite(location.lat) && Number.isFinite(location.lng)
        ? { lat: Number(location.lat), lng: Number(location.lng) }
        : null
    await connectDB()

    const slugs = [...new Set(items.map((i: any) => String(i.slug || "").toLowerCase()))]
    const pickups = await Promise.all(
      slugs.map(async slug => ({
        store: STORE_NAMES[slug] || slug,
        quote: await quotePickup(slug, items.filter((i: any) => String(i.slug || "").toLowerCase() === slug), dropoff),
      }))
    )

    const blocked = pickups.find(p => !p.quote.ok)
    const etas = pickups.map(p => (p.quote.ok ? p.quote.etaMinutes : null)).filter((m): m is number => m !== null)
    const etaMinutes = etas.length === pickups.length && etas.length > 0 ? Math.max(...etas) : null

    return NextResponse.json({
      ok: !blocked,
      message: blocked && !blocked.quote.ok ? blocked.quote.message : undefined,
      pickups,
      etaMinutes, // the whole order arrives when the slowest pickup does
      overLimit: etaMinutes !== null && etaMinutes > MAX_DELIVERY_MINUTES,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
