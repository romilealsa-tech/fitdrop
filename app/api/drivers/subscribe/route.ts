import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import DriverApplication from "@/models/DriverApplication"

// Public: an approved driver checks/enables push notifications by email.
// There's no login for drivers in this MVP — email is the only identifier.
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase()
    if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 })

    const driver = await DriverApplication.findOne({ email: new RegExp(`^${email}$`, "i") })
    if (!driver) return NextResponse.json({ found: false })

    return NextResponse.json({
      found: true,
      approved: driver.status === "approved",
      name: driver.name,
      subscribed: !!driver.pushSubscription,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, subscription } = await req.json()
    if (!email || !subscription) {
      return NextResponse.json({ error: "email and subscription are required" }, { status: 400 })
    }

    const driver = await DriverApplication.findOne({ email: new RegExp(`^${email.trim()}$`, "i") })
    if (!driver || driver.status !== "approved") {
      return NextResponse.json({ error: "Not an approved driver" }, { status: 403 })
    }

    driver.pushSubscription = subscription
    driver.available = true
    await driver.save()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
