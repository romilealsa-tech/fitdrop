import { auth, clerkClient } from "@clerk/nextjs/server"

/**
 * Verifies the current Clerk session belongs to a user with admin access.
 * Admin access is granted by setting `publicMetadata.role = "admin"` on a
 * user in the Clerk Dashboard (Users → select user → Metadata → Public).
 *
 * Clerk does NOT include publicMetadata in the session token by default, so
 * if it's missing from the session claims we look the user up directly.
 *
 * Returns the session claims if the user is an admin, or null otherwise.
 * Callers must treat `null` as "reject the request" (401/403) — never
 * fall back to trusting client-supplied data (headers, body, query params)
 * to decide who is an admin.
 */
export async function requireAdmin() {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null

  const claimed = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role
  if (claimed === "admin") return sessionClaims

  // Fallback: read the role from the user record itself
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = (user.publicMetadata as { role?: string } | undefined)?.role
    return role === "admin" ? (sessionClaims ?? { sub: userId }) : null
  } catch {
    return null
  }
}
