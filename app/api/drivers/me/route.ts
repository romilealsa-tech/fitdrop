import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { findApprovedDriver } from "@/lib/drivers"
import Order from "@/models/Order"

// Public (email-identified, no login): a driver's active deliveries.
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase()
    if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 })

    const driver = await findApprovedDriver(email)
    if (!driver) {
      return NextResponse.json({ error: "Not an approved driver" }, { status: 403 })
    }

    const orders = await Order.find({
      driverId: driver._id,
      status: { $in: ["assigned", "picked_up"] },
    }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ orders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Public: driver advances an order's status (assigned -> picked_up -> delivered).
export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    const { orderId, email, status, lat, lng } = await req.json()
    const hasPoint = Number.isFinite(lat) && Number.isFinite(lng)
    if (status === "picked_up" && !hasPoint) {
      return NextResponse.json({ error: "Location is required to mark an order as picked up" }, { status: 400 })
    }
    if (!orderId || !email || !status) {
      return NextResponse.json({ error: "orderId, email and status are required" }, { status: 400 })
    }

    const driver = await findApprovedDriver(email)
    if (!driver) return NextResponse.json({ error: "Not an approved driver" }, { status: 403 })

    const order = await Order.findOne({ _id: orderId, driverId: driver._id })
    if (!order) return NextResponse.json({ error: "Order not found for this driver" }, { status: 404 })

    order.status = status
    if (hasPoint) order.driverLocation = { lat, lng, updatedAt: new Date() }
    await order.save()

    if (status === "delivered") {
      driver.available = true
      await driver.save()
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Public (email-identified): an approved driver goes online / offline.
// Only available drivers get new orders assigned.
export async function PATCH(req: NextRequest) {
  try {
    await connectDB()
    const { email, available, lat, lng } = await req.json()
    if (!email || typeof available !== "boolean") {
      return NextResponse.json({ error: "email and available (true/false) are required" }, { status: 400 })
    }
    if (available && !(Number.isFinite(lat) && Number.isFinite(lng))) {
      return NextResponse.json({ error: "Location is required to go available" }, { status: 400 })
    }
    const driver = await findApprovedDriver(email)
    if (!driver) return NextResponse.json({ error: "Not an approved driver" }, { status: 403 })
    driver.available = available
    await driver.save()
    return NextResponse.json({ available: driver.available })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
