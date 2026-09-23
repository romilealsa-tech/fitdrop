import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import DriverApplication from "@/models/DriverApplication"
import Order from "@/models/Order"

// Driver's phone reports its position while it has active deliveries.
// Same email-based identification as /api/drivers/me (no login yet).
export async function PUT(req: NextRequest) {
  try {
    const { email, lat, lng } = await req.json()
    if (!email || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "email, lat and lng are required" }, { status: 400 })
    }
    // Ignore positions far outside NYC (bad GPS fix or spoofing)
    if (lat < 40.4 || lat > 41.0 || lng < -74.3 || lng > -73.6) {
      return NextResponse.json({ ok: false, ignored: "outside service area" })
    }

    await connectDB()
    const driver = await DriverApplication.findOne({ email: new RegExp(`^${escapeRegex(email.trim())}$`, "i") })
    if (!driver || driver.status !== "approved") {
      return NextResponse.json({ error: "Not an approved driver" }, { status: 403 })
    }

    const result = await Order.updateMany(
      { driverId: driver._id, status: { $in: ["assigned", "picked_up"] } },
      { $set: { driverLocation: { lat, lng, updatedAt: new Date() } } }
    )
    return NextResponse.json({ ok: true, updated: result.modifiedCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
