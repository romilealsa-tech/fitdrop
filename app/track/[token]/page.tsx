"use client"
import React, { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import DeliveryMap from "../../components/DeliveryMap"
import { hasMapsKey } from "@/lib/googleMaps"

type Point = { lat: number; lng: number }
type Tracking = {
  status: "placed" | "assigned" | "picked_up" | "delivered"
  storeName: string
  itemCount: number
  dropoffAddress: string
  pickupLocation: Point | null
  dropoffLocation: Point | null
  driverLocation: (Point & { updatedAt: string }) | null
  updatedAt: string
}

const STEPS: { key: Tracking["status"]; label: string; text: (t: Tracking) => string }[] = [
  { key: "placed", label: "Order placed", text: () => "We received your order." },
  { key: "assigned", label: "Driver on the way to the store", text: t => `Heading to ${t.storeName}.` },
  { key: "picked_up", label: "Picked up — on the way to you", text: () => "Your order is on its way." },
  { key: "delivered", label: "Delivered", text: () => "Enjoy your new pieces!" },
]

export default function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = React.use(params)
  const [data, setData] = useState<Tracking | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/track/${token}`, { cache: "no-store" })
      if (!res.ok) { setError(true); return }
      setData(await res.json())
    } catch { /* keep last known state */ }
  }, [token])

  useEffect(() => {
    load()
    const id = setInterval(load, 10000)
    return () => clearInterval(id)
  }, [load])

  if (error) return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-lg mb-3">We couldn&apos;t find this order.</p>
      <Link href="/orders" className="text-[#7EC8B8] hover:underline">← Your orders</Link>
    </main>
  )

  if (!data) return <main className="min-h-[60vh] flex items-center justify-center text-[#6b6b6b]">Loading your order…</main>

  const current = STEPS.findIndex(s => s.key === data.status)
  const done = data.status === "delivered"

  return (
    <main className="bg-[#0D0D0F] text-[#E8E8EA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <Link href="/orders" className="text-[#6b6b6b] text-sm hover:text-[#E8E8EA] transition">← Your orders</Link>
        <p className="text-[#7EC8B8] uppercase tracking-widest text-xs mt-5 mb-2 font-medium">Track your delivery</p>
        <h1 className="text-3xl font-bold mb-1">{STEPS[Math.max(current, 0)].label}</h1>
        <p className="text-[#8a8a8e] text-sm mb-6">
          {data.itemCount} item{data.itemCount !== 1 ? "s" : ""} from {data.storeName} · to {data.dropoffAddress}
        </p>

        {!done && hasMapsKey() && (data.pickupLocation || data.dropoffLocation) && (
          <DeliveryMap
            pickup={data.pickupLocation}
            dropoff={data.dropoffLocation}
            driver={data.driverLocation}
            pickupLabel={data.storeName}
            className="h-72 sm:h-96 mb-6"
          />
        )}

        <ol className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-5 space-y-4">
          {STEPS.map((s, i) => {
            const reached = i <= current
            return (
              <li key={s.key} className="flex gap-3">
                <span className={`mt-0.5 w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                  reached ? "bg-[#7EC8B8] text-[#0D0D0F]" : "border border-[#2B2B2E] text-[#6b6b6b]"
                }`}>{reached ? "✓" : i + 1}</span>
                <div>
                  <p className={`text-sm font-semibold ${reached ? "text-[#E8E8EA]" : "text-[#6b6b6b]"}`}>{s.label}</p>
                  {i === current && <p className="text-xs text-[#8a8a8e] mt-0.5">{s.text(data)}</p>}
                </div>
              </li>
            )
          })}
        </ol>

        {!done && (
          <p className="text-[11px] text-[#6b6b6b] mt-4 text-center">
            This page updates automatically{data.driverLocation ? " · driver location shown live" : ""}.
          </p>
        )}
      </div>
    </main>
  )
}
