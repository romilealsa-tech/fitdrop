import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getApprovedSessionDriver } from "@/lib/driverSession"
import Order from "@/models/Order"

// The signed-in driver's phone reports its position while it has active deliveries.
export async function PUT(req: NextRequest) {
  try {
    const { lat, lng } = await req.json()
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 })
    }
    // Ignore positions far outside NYC (bad GPS fix or spoofing)
    if (lat < 40.4 || lat > 41.0 || lng < -74.3 || lng > -73.6) {
      return NextResponse.json({ ok: false, ignored: "outside service area" })
    }

    await connectDB()
    const driver = await getApprovedSessionDriver(req)
    if (!driver) return NextResponse.json({ error: "Please sign in again" }, { status: 401 })

    driver.lastLocation = { lat, lng, updatedAt: new Date() }
    await driver.save()

    const result = await Order.updateMany(
      { driverId: driver._id, status: { $in: ["assigned", "picked_up"] } },
      { $set: { driverLocation: { lat, lng, updatedAt: new Date() } } }
    )
    return NextResponse.json({ ok: true, updated: result.modifiedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
