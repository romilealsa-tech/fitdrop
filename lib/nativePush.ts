import crypto from "crypto"
import http2 from "http2"

// Push notifications for the installed FitDrop app (iPhone via APNs, Android via FCM).
// Each sender quietly skips when its keys are not configured yet.

export type NativePushToken = { token: string; platform: "ios" | "android" }
export type PushPayload = { title: string; body: string; url?: string }

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_")

const pem = (raw: string) => raw.replace(/\\n/g, "\n").trim()

// ---------- iPhone (APNs) ----------
let apnsJwt: { token: string; at: number } | null = null

function apnsToken() {
  const keyId = process.env.APNS_KEY_ID
  const teamId = process.env.APNS_TEAM_ID
  const key = process.env.APNS_KEY
  if (!keyId || !teamId || !key) return null
  const now = Math.floor(Date.now() / 1000)
  if (apnsJwt && now - apnsJwt.at < 50 * 60) return apnsJwt.token
  const header = b64url(JSON.stringify({ alg: "ES256", kid: keyId }))
  const claims = b64url(JSON.stringify({ iss: teamId, iat: now }))
  const sig = crypto.sign("sha256", Buffer.from(`${header}.${claims}`), { key: pem(key), dsaEncoding: "ieee-p1363" })
  apnsJwt = { token: `${header}.${claims}.${b64url(sig)}`, at: now }
  return apnsJwt.token
}

async function sendApns(deviceToken: string, payload: PushPayload): Promise<boolean> {
  const jwt = apnsToken()
  if (!jwt) return false
  const host = process.env.APNS_SANDBOX === "1" ? "https://api.sandbox.push.apple.com" : "https://api.push.apple.com"
  const topic = process.env.APNS_BUNDLE_ID || "com.fitdrop.app"
  const body = JSON.stringify({
    aps: { alert: { title: payload.title, body: payload.body }, sound: "default" },
    url: payload.url || "/driver",
  })
  return new Promise((resolve) => {
    const client = http2.connect(host)
    client.on("error", (err) => { console.error("APNs connection failed:", err); resolve(false) })
    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${deviceToken}`,
      authorization: `bearer ${jwt}`,
      "apns-topic": topic,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    })
    let status = 0
    let text = ""
    req.on("response", (headers) => { status = Number(headers[":status"]) })
    req.on("data", (chunk) => { text += chunk })
    req.on("end", () => {
      client.close()
      if (status !== 200) console.error("APNs push failed:", status, text)
      resolve(status === 200)
    })
    req.on("error", (err) => { console.error("APNs push failed:", err); client.close(); resolve(false) })
    req.setTimeout(10000, () => { req.close(); client.close(); resolve(false) })
    req.end(body)
  })
}

// ---------- Android (Firebase Cloud Messaging v1) ----------
let fcmAccess: { token: string; exp: number } | null = null

function serviceAccount(): { project_id: string; client_email: string; private_key: string } | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) return null
  try {
    const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")
    return JSON.parse(json)
  } catch {
    console.error("FIREBASE_SERVICE_ACCOUNT is not valid JSON")
    return null
  }
}

async function fcmAccessToken(sa: { client_email: string; private_key: string }) {
  const now = Math.floor(Date.now() / 1000)
  if (fcmAccess && fcmAccess.exp - 60 > now) return fcmAccess.token
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const claims = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }))
  const sig = crypto.sign("RSA-SHA256", Buffer.from(`${header}.${claims}`), pem(sa.private_key))
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${b64url(sig)}`,
    }),
  })
  const data = await res.json()
  if (!res.ok || !data.access_token) throw new Error(`FCM auth failed: ${JSON.stringify(data)}`)
  fcmAccess = { token: data.access_token, exp: now + (data.expires_in || 3600) }
  return fcmAccess.token
}

async function sendFcm(deviceToken: string, payload: PushPayload): Promise<boolean> {
  const sa = serviceAccount()
  if (!sa) return false
  try {
    const access = await fcmAccessToken(sa)
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
      method: "POST",
      headers: { authorization: `Bearer ${access}`, "content-type": "application/json" },
      body: JSON.stringify({
        message: {
          token: deviceToken,
          notification: { title: payload.title, body: payload.body },
          data: { url: payload.url || "/driver" },
          android: { priority: "high", notification: { sound: "default" } },
        },
      }),
    })
    if (!res.ok) console.error("FCM push failed:", res.status, await res.text())
    return res.ok
  } catch (error) {
    console.error("FCM push failed:", error)
    return false
  }
}

export async function sendNativePush(target: NativePushToken | null | undefined, payload: PushPayload) {
  if (!target?.token) return false
  return target.platform === "ios" ? sendApns(target.token, payload) : sendFcm(target.token, payload)
}
