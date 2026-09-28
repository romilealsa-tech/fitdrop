import DriverApplication from "@/models/DriverApplication"

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
