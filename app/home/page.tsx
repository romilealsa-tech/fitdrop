"use client"
import { useRef, useState } from "react"
import Link from "next/link"
import ProductImage from "../components/ProductImage"
import StoreLogo from "../components/StoreLogo"
import { ScooterIcon, ClockIcon, PinIcon } from "../components/Icons"
import { STORES, type StoreCard } from "../../lib/stores"
import { getStoreCover } from "../../lib/images"

type SortedStore = StoreCard & { distance?: string }

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}




export default function HomePage() {
  const storesRef = useRef<HTMLElement>(null)
  const scrollToStores = () => storesRef.current?.scrollIntoView({ behavior: "smooth" })
  const [sortedStores, setSortedStores] = useState<SortedStore[]>(STORES)
  const [query, setQuery] = useState("")
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const detectLocation = () => {
    setLocationStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLocationStatus("success")
        const sorted = [...STORES]
          .map(store => ({ ...store, d: getDistance(latitude, longitude, store.lat, store.lng) }))
          .sort((a, b) => a.d - b.d)
          .map(({ d, ...store }) => ({ ...store, distance: d.toFixed(1) }))
        setSortedStores(sorted)
        scrollToStores()
      },
      () => setLocationStatus("error")
    )
  }

  const visibleStores = sortedStores.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <main className="bg-[#0D0D0F] text-[#E8E8EA]">

      {/* Hero — compact */}
      <section className="px-4 sm:px-8 pt-12 pb-10 md:pt-16 md:pb-12 max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-[#7EC8B8] uppercase tracking-widest text-sm mb-3 font-medium">Fashion. Delivered.</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-[#E8E8EA] leading-tight">
            Because Waiting<br />Isn&apos;t Fashionable
          </h1>
          <p className="text-[#8a8a8e] text-lg mb-7 max-w-md mx-auto">
            Same-day delivery, straight to your door.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={scrollToStores}
              className="bg-[#7EC8B8] text-[#0D0D0F] px-8 py-3 rounded-full font-bold hover:bg-[#6ab5a5] transition"
            >
              Browse Stores
            </button>
            <button
              onClick={detectLocation}
              className="border border-[#2B2B2E] text-[#E8E8EA] px-6 py-3 rounded-full font-semibold hover:border-[#7EC8B8] hover:text-[#7EC8B8] transition flex items-center gap-2"
            >
              <PinIcon />
              {locationStatus === "loading" ? "Locating..." : locationStatus === "success" ? "Sorted by distance" : "Near Me"}
            </button>
          </div>
          {locationStatus === "error" && (
            <p className="text-red-400 text-sm mt-4">Couldn&apos;t get your location. Please allow location access.</p>
          )}
        </div>

      </section>


      {/* Stores */}
      <section id="stores" ref={storesRef} className="px-4 sm:px-8 pt-4 max-w-7xl mx-auto scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-[#E8E8EA]">
            {locationStatus === "success" ? "Stores Near You" : "Available Stores"}
          </h2>
          <input
            type="text"
            placeholder="Search stores..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-full px-4 py-2 text-sm text-[#E8E8EA] placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] w-full sm:w-56 transition"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleStores.map((store, index) => (
            <Link
              key={store.slug}
              href={`/stores/${store.slug}`}
              className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl overflow-hidden hover:border-[#7EC8B8] transition block relative group"
            >
              <div className="relative">
                <ProductImage
                  src={getStoreCover(store.slug)}
                  alt={`${store.name} on FitDrop`}
                  aspect="aspect-[16/9]"
                  imgClassName="group-hover:scale-105 transition duration-500 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-transparent to-transparent" />
                {locationStatus === "success" && index === 0 && (
                  <span className="absolute top-3 right-3 text-xs bg-[#7EC8B8] text-[#0D0D0F] px-2 py-1 rounded-full font-bold">Closest</span>
                )}
              </div>
              <div className="p-5 pt-0 -mt-7 relative flex items-end gap-3">
                <StoreLogo slug={store.slug} name={store.name} size="md" />
                <div className="min-w-0 pb-0.5">
                  <h3 className="text-lg font-semibold text-[#E8E8EA] leading-tight">{store.name}</h3>
                  <p className="text-[#8a8a8e] text-sm">{store.category}</p>
                </div>
              </div>
              <div className="flex justify-between text-xs text-[#8a8a8e] px-5 pb-5">
                <span className="flex items-center gap-1.5"><ClockIcon className="w-3.5 h-3.5" />{store.time}</span>
                <span className="text-[#7EC8B8] flex items-center gap-1.5">
                  {store.distance
                    ? <><PinIcon className="w-3.5 h-3.5" />{store.distance} mi</>
                    : <><ScooterIcon className="w-3.5 h-3.5" />{store.fee} delivery</>}
                </span>
              </div>
            </Link>
          ))}
        </div>
        {visibleStores.length === 0 && (
          <p className="text-center text-[#6b6b6b] py-10">No stores match &ldquo;{query}&rdquo;</p>
        )}
      </section>
    </main>
  )
}
