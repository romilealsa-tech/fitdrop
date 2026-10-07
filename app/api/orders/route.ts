import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import { sendPushToDriver } from "@/lib/webpush"
import { randomBytes } from "crypto"
import { STORE_PICKUP_ADDRESSES, STORE_PICKUP_LOCATIONS, STORE_NAMES, getStoreLocations } from "@/lib/storeConfig"
import { sendEmail, newDeliveryEmail } from "@/lib/email"
import { quotePickup } from "@/lib/pickup"
import { getStripe } from "@/lib/stripe"
import { cartFromMetadata, priceCart } from "@/lib/pricing"
import { auth } from "@clerk/nextjs/server"
import { pickNearestDriver } from "@/lib/drivers"
import { orderConfirmationEmail } from "@/lib/email"

/** Split a cart into one group per store (Zara + Uniqlo → two pickups). */
function groupByStore(items: any[]) {
  const groups = new Map<string, any[]>()
  for (const item of items) {
    const slug = String(item.slug || "").toLowerCase()
    groups.set(slug, [...(groups.get(slug) || []), item])
  }
  return [...groups.entries()].map(([slug, items]) => ({ slug, items }))
}

// Called right after payment. Only works with a REAL, successful Stripe payment:
// the server checks the payment with Stripe and builds the order from what was
// actually paid for (never from prices or totals sent by the browser).
// Creates ONE pickup order per store in the cart (each with its own nearest store,
// ETA and tracking link) and auto-assigns them to the first available approved driver.
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { paymentIntentId, items: clientItems, address } = await req.json()

    if (!paymentIntentId || typeof paymentIntentId !== "string" || !address) {
      return NextResponse.json({ error: "paymentIntentId and address are required" }, { status: 400 })
    }

    // 1. The payment must exist and have succeeded
    let pi
    try {
      pi = await getStripe().paymentIntents.retrieve(paymentIntentId)
    } catch {
      return NextResponse.json({ error: "Payment not found" }, { status: 402 })
    }
    if (pi.status !== "succeeded") {
      return NextResponse.json({ error: "Payment has not been completed" }, { status: 402 })
    }

    // 2. One payment = one order. Retries (refresh, double click) get the same order back.
    const existing = await Order.find({ groupId: paymentIntentId }).lean() as any[]
    if (existing.length > 0) {
      return NextResponse.json({
        orderId: String(existing[0]._id),
        trackingToken: existing[0].trackingToken,
        pickups: existing.map(o => ({ orderId: String(o._id), trackingToken: o.trackingToken, storeName: o.pickupName })),
        assigned: existing.some(o => !!o.driverId),
      })
    }

    // 3. Items = exactly what was paid for (from the payment's metadata, priced from the DB)
    const paidLines = cartFromMetadata(pi.metadata as Record<string, string>)
    const isPriority = pi.metadata?.priority === "1"
    const priced = await priceCart(paidLines, isPriority)
    if (priced.totalCents !== pi.amount_received && priced.totalCents !== pi.amount) {
      // Prices changed between payment and now — keep the paid amount, just log it
      console.warn(`[orders] price drift for ${paymentIntentId}: paid ${pi.amount}, now ${priced.totalCents}`)
    }
    // Keep the size/color label the customer chose (display only)
    const label = new Map(
      (Array.isArray(clientItems) ? clientItems : []).map((i: any) => [String(i?._id || i?.id || ""), String(i?.name || "")])
    )
    const items = priced.lines.map(l => ({
      id: l.id,
      name: label.get(l.id) || l.name,
      store: l.store,
      slug: l.slug,
      price: `$${(l.priceCents / 100).toFixed(2)}`,
      qty: l.qty,
    }))
    const total = (pi.amount / 100).toFixed(2)
    const dropoffAddress = [address.street, address.apt, address.city, address.state, address.zip]
      .filter(Boolean).join(", ")

    // Customer coordinates come from Places autocomplete at checkout (null if typed by hand)
    const loc = address.location
    const dropoffLocation =
      loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng) ? { lat: Number(loc.lat), lng: Number(loc.lng) } : null

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { location: _omit, ...addressFields } = address
    const groupId = paymentIntentId // ties the pickups of one checkout together (and blocks duplicates)
    const groups = groupByStore(items)

    // Signed-in customers get the order saved to their account
    const { userId } = await auth().catch(() => ({ userId: null }))
    const created: { orderId: string; trackingToken: string; storeName: string; etaMinutes: number | null }[] = []
    let anyAssigned = false

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

      // Nearest available driver to THIS store
      const driver = await pickNearestDriver(pickupLocation)
      if (driver) anyAssigned = true

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
        customerUserId: userId || "",
        ...(driver ? { driverId: driver._id, status: "assigned" } : {}),
      })
      created.push({ orderId: String(order._id), trackingToken, storeName: pickupName, etaMinutes: quote.ok ? quote.etaMinutes : null })

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

    // Confirmation email to the customer, with a tracking link per store
    if (addressFields.email) {
      await sendEmail({
        to: String(addressFields.email),
        ...orderConfirmationEmail({
          firstName: String(addressFields.firstName || ""),
          items,
          total,
          dropoffAddress,
          priority: isPriority,
          pickups: created,
        }),
      }).catch(() => {})
    }

    return NextResponse.json({
      orderId: created[0]?.orderId,
      trackingToken: created[0]?.trackingToken,
      pickups: created, // one per store
      assigned: anyAssigned,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
