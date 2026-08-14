import { auth } from "@clerk/nextjs/server"

/**
 * Verifies the current Clerk session belongs to a user with admin access.
 * Admin access is granted by setting `publicMetadata.role = "admin"` on a
 * user in the Clerk Dashboard (Users → select user → Metadata → Public).
 *
 * Returns the session claims if the user is an admin, or null otherwise.
 * Callers must treat `null` as "reject the request" (401/403) — never
 * fall back to trusting client-supplied data (headers, body, query params)
 * to decide who is an admin.
 */
export async function requireAdmin() {
  const { sessionClaims } = await auth()
  const metadata = sessionClaims?.publicMetadata as { role?: string } | undefined
  if (metadata?.role !== "admin") return null
  return sessionClaims
}
