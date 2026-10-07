"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import DeliveryMap from "../components/DeliveryMap"
import { navigationUrl, hasMapsKey } from "@/lib/googleMaps"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

type Order = {
  _id: string
  items: { name: string; qty: number }[]
  pickupAddress: string
  pickupName?: string
  priority?: boolean
  pickupCount?: number
  dropoffAddress: string
  status: string
  address: { firstName: string; lastName: string }
  pickupLocation?: { lat: number; lng: number } | null
  dropoffLocation?: { lat: number; lng: number } | null
}

const LOCATION_REQUIRED = 'Location is required. Allow location for shopfitdrop.com — on iPhone: tap “aA” in the address bar → Website Settings → Location → Allow (or Settings → Privacy → Location Services → Safari Websites → While Using). Then try again.'

export default function DriverPage() {
  const [email, setEmail] = useState("")
  const [stage, setStage] = useState<"checking" | "enter" | "code" | "not-approved" | "ready">("checking")
  const [code, setCode] = useState("")
  const [sending, setSending] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [available, setAvailable] = useState(false)
  const [savingAvailable, setSavingAvailable] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState("")
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState("")
  const [locationRetry, setLocationRetry] = useState(0) // bump to restart live tracking

  // Signed in? (the session lives in a secure cookie for 30 days)
  useEffect(() => {
    try { localStorage.removeItem("fitdrop_driver_email") } catch {}
    loadSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/drivers/me")
    if (res.status === 401) { setStage("enter"); return }
    if (res.ok) {
      const data = await res.json()
      setOrders(data.orders || [])
    }
  }, [])

  useEffect(() => {
    if (stage !== "ready") return
    fetchOrders()
    const interval = setInterval(fetchOrders, 8000)
    return () => clearInterval(interval)
  }, [stage, fetchOrders])

  // Share live location while there are active deliveries (customer tracking map).
  // Sends at most one update every 15 seconds.
  const hasActive = orders.length > 0
  useEffect(() => {
    if (stage !== "ready" || !hasActive || !("geolocation" in navigator)) return
    let lastSent = 0
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMyLocation(point)
        setLocationError("")
        if (Date.now() - lastSent < 15000) return
        lastSent = Date.now()
        fetch("/api/drivers/location", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(point),
        }).catch(() => {})
      },
      () => setLocationError("Location is off — turn it back on so the customer can follow the delivery."),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [stage, hasActive, locationRetry])

  async function loadSession() {
    setStage("checking")
    try {
      const data = await (await fetch("/api/drivers/subscribe")).json()
      if (!data.signedIn) { setStage("enter"); return }
      if (!data.approved) { setStage("not-approved"); return }
      setEmail(data.email || "")
      setSubscribed(!!data.subscribed)
      setAvailable(!!data.available)
      setStage("ready")
    } catch {
      setStage("enter")
    }
  }

  async function sendCode() {
    if (!email.trim()) return
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/drivers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) throw new Error()
      setCode("")
      setStage("code")
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setSending(false)
    }
  }

  async function verifyCode() {
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/drivers/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "That code didn't work."); return }
      await loadSession()
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setSending(false)
    }
  }

  async function signOut() {
    await fetch("/api/drivers/logout", { method: "POST" }).catch(() => {})
    setOrders([])
    setCode("")
    setStage("enter")
  }

  async function toggleAvailable() {
    const next = !available
    setSavingAvailable(true)
    setError("")
    try {
      // Going available requires location turned on
      let point: { lat: number; lng: number } | null = null
      if (next) {
        point = await getLocation()
        if (!point) { setError(LOCATION_REQUIRED); return }
        setMyLocation(point)
      }
      const res = await fetch("/api/drivers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: next, ...(point || {}) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not update")
      setAvailable(!!data.available)
    } catch (e: any) {
      setError(e.message || "Could not update availability. Try again.")
    } finally {
      setSavingAvailable(false)
    }
  }

  async function enableNotifications() {
    setError("")
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        // iPhone/iPad: Safari only allows web push once the page is installed to the Home Screen
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
        const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone
        if (isIOS && !standalone) {
          setError("On iPhone, notifications only work from the Home Screen app: tap Share (the square with the arrow ↑) → “Add to Home Screen” → Add. Then open FitDrop Driver from your Home Screen and tap Enable notifications again.")
        } else {
          setError("This browser doesn't support push notifications. On iPhone, update to iOS 16.4 or newer and use the Home Screen app.")
        }
        return
      }
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setError("Notifications permission was not granted.")
        return
      }
      const registration = await navigator.serviceWorker.register("/sw.js")
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
      const res = await fetch("/api/drivers/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      })
      if (!res.ok) throw new Error("Could not save subscription")
      setSubscribed(true)
    } catch (err: any) {
      setError(err.message || "Could not enable notifications.")
    }
  }

  // Current GPS position, or null if the driver denied / has location off.
  function getLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise(resolve => {
      if (!("geolocation" in navigator)) return resolve(null)
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
      )
    })
  }

  // "Turn on location" button: asks the phone again and restarts live sharing
  async function retryLocation() {
    const point = await getLocation()
    if (point) {
      setMyLocation(point)
      setLocationError("")
      setLocationRetry(n => n + 1)
      fetch("/api/drivers/location", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(point),
      }).catch(() => {})
    } else {
      setLocationError(LOCATION_REQUIRED)
    }
  }

  async function advanceStatus(orderId: string, status: string) {
    setError("")
    // Picking up requires location so the customer can follow the delivery
    let point: { lat: number; lng: number } | null = null
    if (status === "picked_up") {
      point = await getLocation()
      if (!point) { setError(LOCATION_REQUIRED); return }
      setMyLocation(point)
    }
    const res = await fetch("/api/drivers/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status, ...(point || {}) }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || "Could not update the delivery. Try again.")
    }
    fetchOrders()
  }

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA] flex flex-col items-center px-4 py-10">
      <Link href="/home" className="text-xl font-bold tracking-widest mb-10">FitDrop</Link>

      <div className="w-full max-w-md">
        <p className="text-[#7EC8B8] uppercase tracking-widest text-xs mb-2 font-medium text-center">Driver</p>
        <h1 className="text-3xl font-bold mb-8 text-center">Your Deliveries</h1>

        {stage === "enter" && (
          <form
            onSubmit={e => { e.preventDefault(); sendCode() }}
            className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6"
          >
            <p className="text-sm text-[#6b6b6b] mb-4">Enter the email you applied with. We&apos;ll send you a 6-digit code to sign in.</p>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-[#7EC8B8]"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="w-full bg-[#7EC8B8] text-[#0D0D0F] py-3 rounded-full font-bold hover:bg-[#6ab5a5] transition disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send me a code"}
            </button>
          </form>
        )}

        {stage === "code" && (
          <form
            onSubmit={e => { e.preventDefault(); verifyCode() }}
            className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6"
          >
            <p className="text-sm text-[#b5b5b8] mb-1">If <strong className="text-[#E8E8EA]">{email}</strong> is an approved driver, we just emailed a 6-digit code.</p>
            <p className="text-xs text-[#6b6b6b] mb-4">It can take a minute — check your spam folder too.</p>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-2xl tracking-[0.5em] text-center mb-4 focus:outline-none focus:border-[#7EC8B8]"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={sending || code.length !== 6}
              className="w-full bg-[#7EC8B8] text-[#0D0D0F] py-3 rounded-full font-bold hover:bg-[#6ab5a5] transition disabled:opacity-50"
            >
              {sending ? "Checking…" : "Sign in"}
            </button>
            <div className="flex justify-between mt-4 text-xs">
              <button type="button" onClick={() => { setError(""); setStage("enter") }} className="text-[#6b6b6b] hover:text-[#E8E8EA]">← Different email</button>
              <button type="button" onClick={sendCode} disabled={sending} className="text-[#7EC8B8] hover:underline">Send a new code</button>
            </div>
          </form>
        )}

        {stage === "checking" && <p className="text-center text-[#6b6b6b]">Checking...</p>}

        {stage === "not-approved" && (
          <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 text-center">
            <p className="text-sm text-[#6b6b6b] mb-4">
              Your driver application hasn&apos;t been approved yet. We&apos;ll email you as soon as it is.
            </p>
            <Link href="/drive" className="text-[#7EC8B8] text-sm font-semibold underline">
              Apply to drive →
            </Link>
          </div>
        )}

        {stage === "ready" && (
          <div>
            <div className="flex items-center justify-between text-xs text-[#6b6b6b] mb-3">
              <span>Signed in as {email}</span>
              <button onClick={signOut} className="hover:text-[#E8E8EA] underline underline-offset-4">Sign out</button>
            </div>
            {/* Online / offline — only available drivers get new orders */}
            <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-5 mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[#E8E8EA]">{available ? "You're available" : "You're offline"}</p>
                <p className="text-xs text-[#6b6b6b] mt-1">
                  {available
                    ? "New deliveries will be assigned to you. You'll get an email for each one."
                    : "Turn this on to start receiving deliveries."}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={available}
                aria-label="Available for deliveries"
                onClick={toggleAvailable}
                disabled={savingAvailable}
                className={`relative shrink-0 w-14 h-8 rounded-full transition ${available ? "bg-[#7EC8B8]" : "bg-[#2B2B2E]"} ${savingAvailable ? "opacity-60" : ""}`}
              >
                <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${available ? "translate-x-6" : ""}`} />
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

            {/* Optional extra: push notifications (Android, or iPhone Home Screen app) */}
            {!subscribed ? (
              <button
                onClick={enableNotifications}
                className="w-full text-xs text-[#6b6b6b] hover:text-[#E8E8EA] underline underline-offset-4 mb-6"
              >
                Optional: also get push notifications on this phone
              </button>
            ) : (
              <p className="text-xs text-[#7EC8B8] mb-6 text-center">🔔 Push notifications enabled</p>
            )}

            {locationError && orders.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 mb-4 text-center">
                <p className="text-xs text-red-300 mb-3">{locationError}</p>
                <button
                  onClick={retryLocation}
                  className="bg-[#7EC8B8] text-[#0D0D0F] px-5 py-2 rounded-full font-bold text-sm hover:bg-[#6ab5a5] transition"
                >
                  📍 Turn on location
                </button>
              </div>
            )}
            {!locationError && myLocation && orders.length > 0 && (
              <p className="text-xs text-[#6b6b6b] mb-4 text-center">📡 Sharing your location with the customer</p>
            )}

            {orders.length === 0 && (
              <p className="text-center text-[#6b6b6b] text-sm">No deliveries assigned right now.</p>
            )}

            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div key={order._id} className={`bg-[#1C1C1E] border rounded-2xl p-5 ${order.priority ? "border-[#7EC8B8] ring-1 ring-[#7EC8B8]/40" : "border-[#2B2B2E]"}`}>
                  {order.priority && (
                    <p className="text-xs bg-[#7EC8B8] text-[#0D0D0F] font-black uppercase tracking-widest rounded-full px-3 py-1 inline-block mb-3">
                      ⚡ Priority — do this one first
                    </p>
                  )}
                  <p className="text-xs text-[#7EC8B8] uppercase tracking-widest font-bold mb-3">
                    {order.status === "assigned" ? "New delivery" : "Picked up"}
                    {(order.pickupCount ?? 1) > 1 && (
                      <span className="text-[#b5b5b8] normal-case tracking-normal font-semibold"> · 1 of {order.pickupCount} stores for this customer</span>
                    )}
                  </p>
                  <div className="mb-3">
                    <p className="text-xs text-[#6b6b6b] mb-1">📍 Pickup</p>
                    {order.pickupName && <p className="text-sm font-semibold">{order.pickupName}</p>}
                    <p className="text-sm">{order.pickupAddress}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-[#6b6b6b] mb-1">🏠 Drop-off</p>
                    <p className="text-sm">{order.dropoffAddress}</p>
                    <p className="text-xs text-[#6b6b6b] mt-1">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                  </div>
                  {hasMapsKey() && (order.pickupLocation || order.dropoffLocation) && (
                    <DeliveryMap
                      pickup={order.pickupLocation}
                      dropoff={order.dropoffLocation}
                      driver={myLocation}
                      pickupLabel="Pickup"
                      className="h-48 mb-3"
                    />
                  )}
                  <a
                    href={order.status === "assigned"
                      ? navigationUrl(order.pickupLocation || order.pickupAddress)
                      : navigationUrl(order.dropoffLocation || order.dropoffAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-[#2B2B2E] text-[#E8E8EA] py-2.5 rounded-full font-semibold text-sm hover:bg-[#3a3a3e] transition mb-2"
                  >
                    🧭 Navigate to {order.status === "assigned" ? "store" : "customer"} in Google Maps
                  </a>
                  {order.status === "assigned" && (
                    <button
                      onClick={() => advanceStatus(order._id, "picked_up")}
                      className="w-full border border-[#7EC8B8] text-[#7EC8B8] py-2.5 rounded-full font-semibold text-sm hover:bg-[#7EC8B8] hover:text-[#0D0D0F] transition"
                    >
                      Mark Picked Up
                    </button>
                  )}
                  {order.status === "picked_up" && (
                    <button
                      onClick={() => advanceStatus(order._id, "delivered")}
                      className="w-full bg-[#7EC8B8] text-[#0D0D0F] py-2.5 rounded-full font-bold text-sm hover:bg-[#6ab5a5] transition"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
