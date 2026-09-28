import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { quotePickup } from "@/lib/pickup"

// Public: which store an order will come from and how long it will take.
// Shown at checkout before payment; orders that can't arrive within 1.5h are blocked there.
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
    const storeSlug = items[0]?.slug || ""
    const quote = await quotePickup(storeSlug, items, dropoff)
    return NextResponse.json(quote)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
