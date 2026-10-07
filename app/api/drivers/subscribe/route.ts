import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { getSessionDriver, getApprovedSessionDriver } from "@/lib/driverSession"

// Who is signed in to the driver app (from the session cookie).
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const driver = await getSessionDriver(req)
    if (!driver) return NextResponse.json({ signedIn: false })

    return NextResponse.json({
      signedIn: true,
      approved: driver.status === "approved",
      name: driver.name,
      email: driver.email,
      subscribed: !!driver.pushSubscription,
      available: !!driver.available,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Save this phone's push-notification subscription for the signed-in driver.
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const driver = await getApprovedSessionDriver(req)
    if (!driver) return NextResponse.json({ error: "Please sign in again" }, { status: 401 })

    const { subscription } = await req.json()
    if (!subscription) return NextResponse.json({ error: "subscription is required" }, { status: 400 })

    driver.pushSubscription = subscription
    await driver.save()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
