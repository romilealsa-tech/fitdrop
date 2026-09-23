import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import DriverApplication from "@/models/DriverApplication"
import { sendPushToDriver } from "@/lib/webpush"
import { randomBytes } from "crypto"
import { STORE_PICKUP_ADDRESSES, STORE_PICKUP_LOCATIONS } from "@/lib/storeConfig"

// Public: called right after a successful Stripe payment to persist the
// order and auto-assign it to the first available approved driver.
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { items, total, address } = await req.json()

    if (!items?.length || !total || !address) {
      return NextResponse.json({ error: "items, total and address are required" }, { status: 400 })
    }

    const storeSlug = items[0]?.slug || ""
    const pickupAddress = STORE_PICKUP_ADDRESSES[storeSlug] || "Pickup address not configured"
    const dropoffAddress = [address.street, address.apt, address.city, address.state, address.zip]
      .filter(Boolean).join(", ")

    // Coordinates for the delivery map (dropoff comes from Places autocomplete, when available)
    const pickupLocation = STORE_PICKUP_LOCATIONS[storeSlug] || null
    const loc = address.location
    const dropoffLocation =
      loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng) ? { lat: Number(loc.lat), lng: Number(loc.lng) } : null
    const trackingToken = randomBytes(16).toString("hex")

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { location: _omit, ...addressFields } = address
    const order = await Order.create({
      items, total, address: addressFields, store: storeSlug, pickupAddress, dropoffAddress,
      pickupLocation, dropoffLocation, trackingToken,
    })

    // Auto-assign to the first approved & available driver.
    const driver = await DriverApplication.findOne({ status: "approved", available: true })
    let assigned = false

    if (driver) {
      order.driverId = driver._id
      order.status = "assigned"
      await order.save()
      assigned = true

      if (driver.pushSubscription) {
        await sendPushToDriver(driver.pushSubscription, {
          title: "🛵 New FitDrop delivery",
          body: `Pickup: ${pickupAddress}\nDrop-off: ${dropoffAddress}`,
          url: "/driver",
        })
      }
    }

    return NextResponse.json({ orderId: order._id, assigned, trackingToken })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
