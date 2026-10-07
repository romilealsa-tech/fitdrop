// Driver login: a 6-digit code is emailed, and a signed cookie keeps the driver
// signed in for 30 days. Every driver API reads the driver from this cookie —
// knowing someone's email is no longer enough.
import { createHash, createHmac, randomInt, timingSafeEqual } from "crypto"
import type { NextRequest, NextResponse } from "next/server"
import DriverApplication from "@/models/DriverApplication"

export const DRIVER_COOKIE = "fd_driver"
const SESSION_DAYS = 30
export const CODE_TTL_MINUTES = 10
export const MAX_CODE_ATTEMPTS = 5

// Signing key: DRIVER_SESSION_SECRET if set, otherwise derived from the Clerk secret
// (already a long random secret in every environment), so no new setup is needed.
function secret() {
  const base = process.env.DRIVER_SESSION_SECRET || process.env.CLERK_SECRET_KEY
  if (!base) throw new Error("Missing DRIVER_SESSION_SECRET / CLERK_SECRET_KEY")
  return createHash("sha256").update(`fitdrop-driver-session:${base}`).digest()
}

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString("base64url")
const sign = (data: string) => b64(createHmac("sha256", secret()).update(data).digest())

export function createSessionToken(driverId: string) {
  const payload = b64(JSON.stringify({ id: driverId, exp: Date.now() + SESSION_DAYS * 86400_000 }))
  return `${payload}.${sign(payload)}`
}

function readSessionToken(token: string | undefined): string | null {
  if (!token || !token.includes(".")) return null
  const [payload, sig] = token.split(".")
  const expected = sign(payload)
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const { id, exp } = JSON.parse(Buffer.from(payload, "base64url").toString())
    return typeof id === "string" && Date.now() < exp ? id : null
  } catch {
    return null
  }
}

export function setSessionCookie(res: NextResponse, driverId: string) {
  res.cookies.set(DRIVER_COOKIE, createSessionToken(driverId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  })
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(DRIVER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 })
}

/** The signed-in driver (any status), or null. */
export async function getSessionDriver(req: NextRequest) {
  const id = readSessionToken(req.cookies.get(DRIVER_COOKIE)?.value)
  if (!id) return null
  return DriverApplication.findById(id)
}

/** The signed-in driver only if still approved, or null. */
export async function getApprovedSessionDriver(req: NextRequest) {
  const driver = await getSessionDriver(req)
  return driver && driver.status === "approved" ? driver : null
}

// ---- One-time login codes ----
export const hashCode = (driverId: string, code: string) =>
  createHash("sha256").update(`${driverId}:${code}`).digest("hex")

export const newCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0")
