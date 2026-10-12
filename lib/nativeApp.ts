"use client"

// Helpers for when the site is running inside the installed FitDrop app (Capacitor).

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false
  const cap = (window as any).Capacitor
  return !!cap?.isNativePlatform?.()
}

export function nativePlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web"
  return ((window as any).Capacitor?.getPlatform?.() as any) || "web"
}

// Ask for notification permission (one tap) and send the device token to FitDrop.
// silent=true only registers when permission was already granted (no prompt).
export async function registerNativePush(silent = false): Promise<{ ok: boolean; error?: string }> {
  if (!isNativeApp()) return { ok: false, error: "not-native" }
  const { PushNotifications } = await import("@capacitor/push-notifications")

  let perm = await PushNotifications.checkPermissions()
  if (perm.receive !== "granted") {
    if (silent) return { ok: false, error: "not-granted" }
    perm = await PushNotifications.requestPermissions()
  }
  if (perm.receive !== "granted") {
    return { ok: false, error: "Notifications are turned off. Turn them on in Settings → FitDrop → Notifications." }
  }

  await PushNotifications.removeAllListeners()
  const result = await new Promise<{ ok: boolean; error?: string }>(resolve => {
    const timer = setTimeout(() => resolve({ ok: false, error: "Could not reach the notification service. Try again." }), 15000)
    PushNotifications.addListener("registration", async ({ value }) => {
      clearTimeout(timer)
      try {
        const res = await fetch("/api/drivers/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nativeToken: value, platform: nativePlatform() }),
        })
        resolve(res.ok ? { ok: true } : { ok: false, error: "Could not save notifications. Sign in again." })
      } catch {
        resolve({ ok: false, error: "Could not save notifications. Try again." })
      }
    })
    PushNotifications.addListener("registrationError", () => {
      clearTimeout(timer)
      resolve({ ok: false, error: "Could not turn on notifications. Try again." })
    })
    PushNotifications.register().catch(() => {
      clearTimeout(timer)
      resolve({ ok: false, error: "Could not turn on notifications. Try again." })
    })
  })

  // Tapping a notification opens the driver screen
  PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
    const url = (notification.data && notification.data.url) || "/driver"
    if (typeof url === "string" && url.startsWith("/")) window.location.href = url
  })
  return result
}
