import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import DriverApplication from "@/models/DriverApplication"
import { sendPushToDriver } from "@/lib/webpush"
import { randomBytes } from "crypto"
import { STORE_PICKUP_ADDRESSES, STORE_PICKUP_LOCATIONS, STORE_NAMES, getStoreLocations } from "@/lib/storeConfig"
import { sendEmail, newDeliveryEmail } from "@/lib/email"
import { quotePickup } from "@/lib/pickup"

/** Split a cart into one group per store (Zara + Uniqlo → two pickups). */
function groupByStore(items: any[]) {
  const groups = new Map<string, any[]>()
  for (const item of items) {
    const slug = String(item.slug || "").toLowerCase()
    groups.set(slug, [...(groups.get(slug) || []), item])
  }
  return [...groups.entries()].map(([slug, items]) => ({ slug, items }))
}

// Public: called right after a successful Stripe payment. Creates ONE pickup order per
// store in the cart (each with its own nearest store, ETA and tracking link) and
// auto-assigns them to the first available approved driver.
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { items, total, address, priority } = await req.json()

    if (!items?.length || !total || !address) {
      return NextResponse.json({ error: "items, total and address are required" }, { status: 400 })
    }

    const isPriority = priority === true
    const dropoffAddress = [address.street, address.apt, address.city, address.state, address.zip]
      .filter(Boolean).join(", ")

    // Customer coordinates come from Places autocomplete at checkout (null if typed by hand)
    const loc = address.location
    const dropoffLocation =
      loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng) ? { lat: Number(loc.lat), lng: Number(loc.lng) } : null

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { location: _omit, ...addressFields } = address
    const groupId = randomBytes(8).toString("hex") // ties the pickups of one checkout together
    const groups = groupByStore(items)

    const driver = await DriverApplication.findOne({ status: "approved", available: true })
    const created: { orderId: string; trackingToken: string; storeName: string }[] = []

    for (const group of groups) {
      // Nearest location of THIS store that has every item of this group
      // (if something changed since checkout, fall back to the flagship rather than lose a paid order)
      const quote = await quotePickup(group.slug, group.items, dropoffLocation)
      const pickup = quote.ok ? quote.location : getStoreLocations(group.slug)[0] || null
      if (!quote.ok) console.warn(`[orders] pickup quote failed after payment for ${group.slug} (${quote.reason}) — using flagship`)

      const pickupAddress = pickup?.address || STORE_PICKUP_ADDRESSES[group.slug] || "Pickup address not configured"
      const pickupLocation = pickup ? { lat: pickup.lat, lng: pickup.lng } : STORE_PICKUP_LOCATIONS[group.slug] || null
      const pickupName = pickup?.name || STORE_NAMES[group.slug] || group.slug
      const trackingToken = randomBytes(16).toString("hex")

      const order = await Order.create({
        items: group.items,
        total, // the full amount the customer paid (shared by every pickup of this checkout)
        groupId,
        pickupCount: groups.length,
        address: addressFields,
        store: group.slug,
        pickupAddress,
        pickupLocationId: pickup?.id || "",
        pickupName,
        pickupLocation,
        dropoffAddress,
        dropoffLocation,
        trackingToken,
        priority: isPriority,
        ...(driver ? { driverId: driver._id, status: "assigned" } : {}),
      })
      created.push({ orderId: String(order._id), trackingToken, storeName: pickupName })

      if (driver) {
        if (driver.pushSubscription) {
          await sendPushToDriver(driver.pushSubscription, {
            title: isPriority ? "⚡ PRIORITY FitDrop delivery — do this one first" : "🛵 New FitDrop delivery",
            body: `Pickup: ${pickupName}\nDrop-off: ${dropoffAddress}`,
            url: "/driver",
          }).catch(() => {})
        }
        // Email works on every phone with no setup (iPhone web push needs a Home Screen install)
        await sendEmail({
          to: driver.email,
          ...newDeliveryEmail({
            driverName: driver.name,
            driverEmail: driver.email,
            storeName: groups.length > 1 ? `${pickupName} (pickup ${created.length} of ${groups.length})` : pickupName,
            pickupAddress,
            dropoffAddress,
            itemCount: group.items.reduce((n: number, i: any) => n + (Number(i.qty) || 1), 0),
            priority: isPriority,
          }),
        })
      }
    }

    return NextResponse.json({
      orderId: created[0]?.orderId,
      trackingToken: created[0]?.trackingToken,
      pickups: created, // one per store
      assigned: !!driver,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
