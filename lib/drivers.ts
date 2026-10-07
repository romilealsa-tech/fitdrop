import DriverApplication from "@/models/DriverApplication"
import { distanceMiles } from "@/lib/pickup"

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** Case-insensitive exact email match, tolerant of stray spaces saved with the application. */
const emailQuery = (email: string) => ({ email: new RegExp(`^\\s*${escapeRegex(email.trim())}\\s*$`, "i") })

/**
 * The same person can have several applications with one email (re-applied,
 * test runs, an older one rejected). Always prefer the APPROVED one; otherwise
 * return the most recent application so callers can tell "pending" from "not found".
 */
export async function findDriverByEmail(email: string) {
  if (!email?.trim()) return null
  const approved = await DriverApplication.findOne({ ...emailQuery(email), status: "approved" }).sort({ createdAt: -1 })
  if (approved) return approved
  return DriverApplication.findOne(emailQuery(email)).sort({ createdAt: -1 })
}

/** Only an approved driver, or null. */
export async function findApprovedDriver(email: string) {
  const driver = await findDriverByEmail(email)
  return driver && driver.status === "approved" ? driver : null
}

/**
 * The approved, available driver closest to a pickup store. Drivers whose phone
 * reported a position in the last 30 minutes are ranked by distance; if nobody
 * has a recent position, falls back to any available driver.
 */
export async function pickNearestDriver(pickup: { lat: number; lng: number } | null) {
  const candidates = await DriverApplication.find({ status: "approved", available: true })
  if (candidates.length === 0) return null
  if (!pickup) return candidates[0]
  const fresh = candidates.filter(d =>
    d.lastLocation?.updatedAt && Date.now() - new Date(d.lastLocation.updatedAt).getTime() < 30 * 60_000
  )
  if (fresh.length === 0) return candidates[0]
  return fresh
    .map(d => ({ d, miles: distanceMiles(pickup, { lat: d.lastLocation.lat, lng: d.lastLocation.lng }) }))
    .sort((a, b) => a.miles - b.miles)[0].d
}
