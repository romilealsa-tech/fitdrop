import webpush from "web-push"

let configured = false

function ensureConfigured() {
  if (configured) return
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) {
    throw new Error("VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are not configured")
  }
  webpush.setVapidDetails("mailto:romilealsa@gmail.com", publicKey, privateKey)
  configured = true
}

export async function sendPushToDriver(subscription: any, payload: Record<string, any>) {
  try {
    ensureConfigured()
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return true
  } catch (error) {
    console.error("Push notification failed:", error)
    return false
  }
}
