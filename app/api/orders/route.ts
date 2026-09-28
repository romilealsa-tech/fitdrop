import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import DriverApplication from "@/models/DriverApplication"
import { sendPushToDriver } from "@/lib/webpush"
import { randomBytes } from "crypto"
import { STORE_PICKUP_ADDRESSES, STORE_PICKUP_LOCATIONS, STORE_NAMES } from "@/lib/storeConfig"
import { sendEmail, newDeliveryEmail } from "@/lib/email"
import { choosePickupLocation } from "@/lib/pickup"

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
    const dropoffAddress = [address.street, address.apt, address.city, address.state, address.zip]
      .filter(Boolean).join(", ")

    // Customer coordinates come from Places autocomplete at checkout (null if typed by hand)
    const loc = address.location
    const dropoffLocation =
      loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng) ? { lat: Number(loc.lat), lng: Number(loc.lng) } : null

    // Pickup from the NEAREST store location that has every item in stock
    const pickup = await choosePickupLocation(storeSlug, items, dropoffLocation)
    const pickupAddress = pickup?.address || STORE_PICKUP_ADDRESSES[storeSlug] || "Pickup address not configured"
    const pickupLocation = pickup ? { lat: pickup.lat, lng: pickup.lng } : STORE_PICKUP_LOCATIONS[storeSlug] || null
    const pickupLocationId = pickup?.id || ""
    const pickupName = pickup?.name || STORE_NAMES[storeSlug] || storeSlug
    const trackingToken = randomBytes(16).toString("hex")

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { location: _omit, ...addressFields } = address
    const order = await Order.create({
      items, total, address: addressFields, store: storeSlug, pickupAddress, dropoffAddress,
      pickupLocation, pickupLocationId, pickupName, dropoffLocation, trackingToken,
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

      // Email works on every phone with no setup (iPhone web push needs a Home Screen install)
      const itemCount = items.reduce((n: number, i: any) => n + (Number(i.qty) || 1), 0)
      await sendEmail({
        to: driver.email,
        ...newDeliveryEmail({
          driverName: driver.name,
          driverEmail: driver.email,
          storeName: pickupName,
          pickupAddress,
          dropoffAddress,
          itemCount,
        }),
      })
    }

    return NextResponse.json({ orderId: order._id, assigned, trackingToken })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
