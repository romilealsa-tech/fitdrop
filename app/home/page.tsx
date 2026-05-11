"use client"
import { useRef, useState } from "react"
import Link from "next/link"
import { SignOutButton } from "@clerk/nextjs"

const stores = [
  { name: "Zara", slug: "zara", category: "Fashion & Basics", time: "30-45 min", fee: "$2.99", lat: 40.7580, lng: -73.9855 },
  { name: "Uniqlo", slug: "uniqlo", category: "Essentials & Comfort", time: "25-40 min", fee: "$1.99", lat: 40.7549, lng: -73.9840 },
  { name: "H&M", slug: "hm", category: "Trends & Streetwear", time: "35-50 min", fee: "$2.49", lat: 40.7527, lng: -73.9772 },
  { name: "Nike", slug: "nike", category: "Sport & Lifestyle", time: "20-35 min", fee: "$3.99", lat: 40.7614, lng: -73.9776 },
  { name: "COS", slug: "cos", category: "Minimal & Modern", time: "30-45 min", fee: "$2.99", lat: 40.7233, lng: -74.0030 },
  { name: "Mango", slug: "mango", category: "Mediterranean Style", time: "25-40 min", fee: "$1.99", lat: 40.7589, lng: -73.9851 },
]

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function HomePage() {
  const storesRef = useRef<HTMLElement>(null)
  const scrollToStores = () => storesRef.current?.scrollIntoView({ behavior: "smooth" })
  const [sortedStores, setSortedStores] = useState(stores)
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const detectLocation = () => {
    setLocationStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLocationStatus("success")
        const sorted = [...stores].sort((a, b) => {
          const distA = getDistance(latitude, longitude, a.lat, a.lng)
          const distB = getDistance(latitude, longitude, b.lat, b.lng)
          return distA - distB
        }).map(store => ({
          ...store,
          distance: getDistance(latitude, longitude, store.lat, store.lng).toFixed(1)
        }))
        setSortedStores(sorted as any)
        scrollToStores()
      },
      () => setLocationStatus("error")
    )
  }

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA]">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2B2B2E] sticky top-0 bg-[#0D0D0F] z-10">
        <h1 className="text-2xl font-bold tracking-widest text-[#E8E8EA]">FIT DROP</h1>
        <div className="flex gap-6 text-sm text-[#6b6b6b] items-center">
          <button onClick={scrollToStores} className="hover:text-[#E8E8EA] transition">Stores</button>
          <Link href="/new-drops" className="hover:text-[#E8E8EA] transition">New Drops</Link>
          <Link href="/cart" className="hover:text-[#E8E8EA] transition">Cart</Link>
          <SignOutButton>
            <button className="text-[#6b6b6b] hover:text-[#E8E8EA] transition">Sign Out</button>
          </SignOutButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
        <p className="text-[#2DD4BF] uppercase tracking-widest text-sm mb-4 font-medium">Fashion. Delivered.</p>
        <h2 className="text-6xl font-bold mb-6 text-[#E8E8EA] leading-tight">Because Waiting<br />Isn't Fashionable</h2>
        <p className="text-[#6b6b6b] text-lg mb-10 max-w-md">Same-day delivery from your favorite Manhattan stores, straight to your door.</p>
        <div className="flex gap-3">
          <button
            onClick={scrollToStores}
            className="bg-[#2DD4BF] text-[#0D0D0F] px-8 py-3 rounded-full font-bold hover:bg-[#22b8a4] transition"
          >
            Browse Stores
          </button>
          <button
            onClick={detectLocation}
            className="border border-[#2B2B2E] text-[#E8E8EA] px-6 py-3 rounded-full font-semibold hover:border-[#2DD4BF] hover:text-[#2DD4BF] transition flex items-center gap-2"
          >
            {locationStatus === "loading" ? "Locating..." : locationStatus === "success" ? "📍 Sorted by distance" : "📍 Near Me"}
          </button>
        </div>
        {locationStatus === "error" && (
          <p className="text-red-400 text-sm mt-4">Couldn't get your location. Please allow location access.</p>
        )}
      </section>

      {/* Stores */}
      <section ref={storesRef} className="px-8 pb-16">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-[#E8E8EA]">
            {locationStatus === "success" ? "Stores Near You 📍" : "Available Stores"}
          </h3>
          <input
            type="text"
            placeholder="Search stores..."
            className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-full px-4 py-2 text-sm text-[#E8E8EA] placeholder-[#6b6b6b] focus:outline-none focus:border-[#2DD4BF] w-48 transition"
            onChange={(e) => {
              const val = e.target.value.toLowerCase()
              document.querySelectorAll("[data-store]").forEach((el) => {
                const name = el.getAttribute("data-store") || ""
                ;(el as HTMLElement).style.display = name.includes(val) ? "block" : "none"
              })
            }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStores.map((store: any, index) => (
            <Link
              key={store.name}
              data-store={store.name.toLowerCase()}
              href={`/stores/${store.slug}`}
              className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 hover:border-[#2DD4BF] transition block no-underline relative group"
            >
              {locationStatus === "success" && index === 0 && (
                <span className="absolute top-4 right-4 text-xs bg-[#2DD4BF] text-[#0D0D0F] px-2 py-1 rounded-full font-bold">Closest</span>
              )}
              <div className="w-12 h-12 bg-[#2B2B2E] rounded-full mb-4 flex items-center justify-center">
                <span className="text-[#2DD4BF] font-bold text-sm">{store.name[0]}</span>
              </div>
              <h4 className="text-lg font-semibold mb-1 text-[#E8E8EA]">{store.name}</h4>
              <p className="text-[#6b6b6b] text-sm mb-4">{store.category}</p>
              <div className="flex justify-between text-xs text-[#6b6b6b]">
                <span>🕐 {store.time}</span>
                <span className="text-[#2DD4BF]">{store.distance ? `📍 ${store.distance} mi` : `🛵 ${store.fee}`}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}