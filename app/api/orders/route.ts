import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import DriverApplication from "@/models/DriverApplication"
import { sendPushToDriver } from "@/lib/webpush"
import { STORE_PICKUP_ADDRESSES } from "@/lib/storeConfig"

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

    const order = await Order.create({
      items, total, address, store: storeSlug, pickupAddress, dropoffAddress,
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

    return NextResponse.json({ orderId: order._id, assigned })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
