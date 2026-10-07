import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getApprovedSessionDriver } from "@/lib/driverSession"
import Order from "@/models/Order"

const SIGN_IN = () => NextResponse.json({ error: "Please sign in again" }, { status: 401 })

// The signed-in driver's active deliveries.
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const driver = await getApprovedSessionDriver(req)
    if (!driver) return SIGN_IN()

    const orders = await Order.find({
      driverId: driver._id,
      status: { $in: ["assigned", "picked_up"] },
    }).sort({ priority: -1, createdAt: 1 }).lean() // fast-delivery orders first, then oldest first

    return NextResponse.json({ orders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Driver advances one of THEIR orders: assigned -> picked_up -> delivered.
const NEXT_STATUS: Record<string, string> = { assigned: "picked_up", picked_up: "delivered" }

export async function PUT(req: NextRequest) {
  try {
    await connectDB()
    const driver = await getApprovedSessionDriver(req)
    if (!driver) return SIGN_IN()

    const { orderId, status, lat, lng } = await req.json()
    const hasPoint = Number.isFinite(lat) && Number.isFinite(lng)
    if (!orderId || !status) return NextResponse.json({ error: "orderId and status are required" }, { status: 400 })
    if (status === "picked_up" && !hasPoint) {
      return NextResponse.json({ error: "Location is required to mark an order as picked up" }, { status: 400 })
    }

    const order = await Order.findOne({ _id: orderId, driverId: driver._id })
    if (!order) return NextResponse.json({ error: "Order not found for this driver" }, { status: 404 })
    if (NEXT_STATUS[order.status] !== status) {
      return NextResponse.json({ error: `This order can't go from ${order.status} to ${status}` }, { status: 400 })
    }

    order.status = status
    if (hasPoint) order.driverLocation = { lat, lng, updatedAt: new Date() }
    await order.save()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// The signed-in driver goes online / offline. Only available drivers get new orders.
export async function PATCH(req: NextRequest) {
  try {
    await connectDB()
    const driver = await getApprovedSessionDriver(req)
    if (!driver) return SIGN_IN()

    const { available, lat, lng } = await req.json()
    if (typeof available !== "boolean") {
      return NextResponse.json({ error: "available (true/false) is required" }, { status: 400 })
    }
    if (available && !(Number.isFinite(lat) && Number.isFinite(lng))) {
      return NextResponse.json({ error: "Location is required to go available" }, { status: 400 })
    }
    driver.available = available
    await driver.save()
    return NextResponse.json({ available: driver.available })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
