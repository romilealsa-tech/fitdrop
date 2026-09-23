import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import { STORE_NAMES } from "@/lib/storeConfig"

// Public, but only reachable with the order's random tracking token.
// Returns just what the tracking map needs — no names, emails or phone numbers.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    if (!/^[a-f0-9]{32}$/.test(token)) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await connectDB()
    const order: any = await Order.findOne({ trackingToken: token }).lean()
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Only share the driver's position while they're actually on the way,
    // and only if it's recent (last 10 minutes).
    const d = order.driverLocation
    const fresh = d?.updatedAt && Date.now() - new Date(d.updatedAt).getTime() < 10 * 60 * 1000
    const showDriver = ["assigned", "picked_up"].includes(order.status) && fresh

    return NextResponse.json(
      {
        status: order.status,
        storeName: STORE_NAMES[order.store] || order.store,
        itemCount: (order.items || []).reduce((n: number, i: any) => n + (i.qty || 1), 0),
        dropoffAddress: order.dropoffAddress,
        pickupLocation: order.pickupLocation || null,
        dropoffLocation: order.dropoffLocation || null,
        driverLocation: showDriver ? { lat: d.lat, lng: d.lng, updatedAt: d.updatedAt } : null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
