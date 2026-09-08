import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import DriverApplication from "@/models/DriverApplication"
import Order from "@/models/Order"

// Public (email-identified, no login): a driver's active deliveries.
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase()
    if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 })

    const driver = await DriverApplication.findOne({ email: new RegExp(`^${email}$`, "i") })
    if (!driver || driver.status !== "approved") {
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
    const { orderId, email, status } = await req.json()
    if (!orderId || !email || !status) {
      return NextResponse.json({ error: "orderId, email and status are required" }, { status: 400 })
    }

    const driver = await DriverApplication.findOne({ email: new RegExp(`^${email.trim()}$`, "i") })
    if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 403 })

    const order = await Order.findOne({ _id: orderId, driverId: driver._id })
    if (!order) return NextResponse.json({ error: "Order not found for this driver" }, { status: 404 })

    order.status = status
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
