import { NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import { connectDB } from "@/lib/mongodb"
import { findApprovedDriver } from "@/lib/drivers"
import { hashCode, setSessionCookie, MAX_CODE_ATTEMPTS } from "@/lib/driverSession"

const WRONG = "That code isn't right or has expired. Check your email or ask for a new code."

// Step 2 of driver sign-in: check the emailed code and set the session cookie.
export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()
    const clean = String(code || "").replace(/\D/g, "")
    if (!email || clean.length !== 6) return NextResponse.json({ error: WRONG }, { status: 400 })

    await connectDB()
    const driver = await findApprovedDriver(String(email))
    if (!driver || !driver.loginCodeHash || !driver.loginCodeExpires) {
      return NextResponse.json({ error: WRONG }, { status: 400 })
    }
    if (new Date(driver.loginCodeExpires).getTime() < Date.now() || driver.loginCodeAttempts >= MAX_CODE_ATTEMPTS) {
      return NextResponse.json({ error: WRONG }, { status: 400 })
    }

    const expected = Buffer.from(driver.loginCodeHash)
    const given = Buffer.from(hashCode(String(driver._id), clean))
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
      driver.loginCodeAttempts = (driver.loginCodeAttempts || 0) + 1
      await driver.save()
      return NextResponse.json({ error: WRONG }, { status: 400 })
    }

    // Code used — it can't be reused
    driver.loginCodeHash = ""
    driver.loginCodeExpires = null
    driver.loginCodeAttempts = 0
    await driver.save()

    const res = NextResponse.json({ ok: true, name: driver.name })
    setSessionCookie(res, String(driver._id))
    return res
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
