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
  dropoffAddress: string
  status: string
  address: { firstName: string; lastName: string }
  pickupLocation?: { lat: number; lng: number } | null
  dropoffLocation?: { lat: number; lng: number } | null
}

export default function DriverPage() {
  const [email, setEmail] = useState("")
  const [stage, setStage] = useState<"enter" | "checking" | "not-approved" | "ready">("enter")
  const [subscribed, setSubscribed] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState("")
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState("")

  const savedEmail = typeof window !== "undefined" ? localStorage.getItem("fitdrop_driver_email") : null

  useEffect(() => {
    if (savedEmail) {
      setEmail(savedEmail)
      checkDriver(savedEmail)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchOrders = useCallback(async (em: string) => {
    const res = await fetch(`/api/drivers/me?email=${encodeURIComponent(em)}`)
    if (res.ok) {
      const data = await res.json()
      setOrders(data.orders || [])
    }
  }, [])

  useEffect(() => {
    if (stage !== "ready") return
    fetchOrders(email)
    const interval = setInterval(() => fetchOrders(email), 8000)
    return () => clearInterval(interval)
  }, [stage, email, fetchOrders])

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
          body: JSON.stringify({ email, ...point }),
        }).catch(() => {})
      },
      () => setLocationError("Turn on location so customers can follow their delivery."),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [stage, hasActive, email])

  async function checkDriver(em: string) {
    setStage("checking")
    setError("")
    try {
      const res = await fetch(`/api/drivers/subscribe?email=${encodeURIComponent(em)}`)
      const data = await res.json()
      if (!data.found || !data.approved) {
        setStage("not-approved")
        return
      }
      setSubscribed(!!data.subscribed)
      localStorage.setItem("fitdrop_driver_email", em)
      setStage("ready")
    } catch {
      setError("Something went wrong. Try again.")
      setStage("enter")
    }
  }

  async function enableNotifications() {
    setError("")
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setError("This browser doesn't support push notifications.")
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
        body: JSON.stringify({ email, subscription }),
      })
      if (!res.ok) throw new Error("Could not save subscription")
      setSubscribed(true)
    } catch (err: any) {
      setError(err.message || "Could not enable notifications.")
    }
  }

  async function advanceStatus(orderId: string, status: string) {
    await fetch("/api/drivers/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, email, status }),
    })
    fetchOrders(email)
  }

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA] flex flex-col items-center px-4 py-10">
      <Link href="/home" className="text-xl font-bold tracking-widest mb-10">FitDrop</Link>

      <div className="w-full max-w-md">
        <p className="text-[#7EC8B8] uppercase tracking-widest text-xs mb-2 font-medium text-center">Driver</p>
        <h1 className="text-3xl font-bold mb-8 text-center">Your Deliveries</h1>

        {stage === "enter" && (
          <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6">
            <p className="text-sm text-[#6b6b6b] mb-4">Enter the email you applied with.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-[#0D0D0F] border border-[#2B2B2E] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-[#7EC8B8]"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              onClick={() => email && checkDriver(email)}
              className="w-full bg-[#7EC8B8] text-[#0D0D0F] py-3 rounded-full font-bold hover:bg-[#6ab5a5] transition"
            >
              Continue
            </button>
          </div>
        )}

        {stage === "checking" && <p className="text-center text-[#6b6b6b]">Checking...</p>}

        {stage === "not-approved" && (
          <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 text-center">
            <p className="text-sm text-[#6b6b6b] mb-4">
              We couldn&apos;t find an approved driver application for that email.
            </p>
            <Link href="/drive" className="text-[#7EC8B8] text-sm font-semibold underline">
              Apply to drive →
            </Link>
          </div>
        )}

        {stage === "ready" && (
          <div>
            {!subscribed && (
              <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 mb-6">
                <p className="text-sm text-[#6b6b6b] mb-4">
                  Enable notifications so you get alerted the instant a delivery is assigned to you.
                </p>
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                <button
                  onClick={enableNotifications}
                  className="w-full bg-[#7EC8B8] text-[#0D0D0F] py-3 rounded-full font-bold hover:bg-[#6ab5a5] transition"
                >
                  Enable Notifications
                </button>
              </div>
            )}
            {subscribed && (
              <p className="text-xs text-[#7EC8B8] mb-6 text-center">🔔 Notifications enabled</p>
            )}

            {locationError && orders.length > 0 && (
              <p className="text-xs text-red-400 mb-4 text-center">{locationError}</p>
            )}
            {!locationError && myLocation && orders.length > 0 && (
              <p className="text-xs text-[#6b6b6b] mb-4 text-center">📡 Sharing your location with the customer</p>
            )}

            {orders.length === 0 && (
              <p className="text-center text-[#6b6b6b] text-sm">No deliveries assigned right now.</p>
            )}

            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-5">
                  <p className="text-xs text-[#7EC8B8] uppercase tracking-widest font-bold mb-3">
                    {order.status === "assigned" ? "New delivery" : "Picked up"}
                  </p>
                  <div className="mb-3">
                    <p className="text-xs text-[#6b6b6b] mb-1">📍 Pickup</p>
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
