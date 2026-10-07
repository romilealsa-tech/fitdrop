import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { findApprovedDriver } from "@/lib/drivers"
import { hashCode, newCode, CODE_TTL_MINUTES } from "@/lib/driverSession"
import { sendEmail, driverLoginCodeEmail } from "@/lib/email"

// Step 1 of driver sign-in: email a 6-digit code to an approved driver.
// Always answers the same way, so it can't be used to find out who is a driver.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }
    await connectDB()
    const driver = await findApprovedDriver(email)

    // At most one code per minute per driver
    const recentlySent = driver?.loginCodeSentAt && Date.now() - new Date(driver.loginCodeSentAt).getTime() < 60_000
    if (driver && !recentlySent) {
      const code = newCode()
      driver.loginCodeHash = hashCode(String(driver._id), code)
      driver.loginCodeExpires = new Date(Date.now() + CODE_TTL_MINUTES * 60_000)
      driver.loginCodeAttempts = 0
      driver.loginCodeSentAt = new Date()
      await driver.save()
      await sendEmail({ to: driver.email, ...driverLoginCodeEmail(driver.name, code) })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
