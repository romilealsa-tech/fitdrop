"use client"
import { useRef, useState } from "react"
import Link from "next/link"
import ProductImage from "../components/ProductImage"
import StoreLogo from "../components/StoreLogo"
import { StoreIcon, BagIcon, ScooterIcon, ClockIcon, PinIcon, TagIcon } from "../components/Icons"
import { STORES, MIN_DELIVERY_FEE, type StoreCard } from "../../lib/stores"
import { getStoreCover, STORE_COVERS } from "../../lib/images"

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

const STEPS = [
  { icon: StoreIcon, title: "Pick a store", text: "Browse Zara, Uniqlo, Nike and more — all nearby in Manhattan." },
  { icon: BagIcon, title: "Build your order", text: "Choose sizes and colors, add to cart and check out securely." },
  { icon: ScooterIcon, title: "Get it today", text: "A FitDrop driver picks it up and brings it to your door." },
]

const BENEFITS = [
  { icon: ClockIcon, text: "Same-day delivery" },
  { icon: PinIcon, text: "Stores near you" },
  { icon: TagIcon, text: `Delivery from ${MIN_DELIVERY_FEE}` },
]

// Three editorial photos for the hero collage
const HERO_PHOTOS = [STORE_COVERS.zara, STORE_COVERS.mango, STORE_COVERS.uniqlo]

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

      {/* Hero — compact, two columns on desktop */}
      <section className="px-4 sm:px-8 pt-10 pb-8 md:pt-14 md:pb-10 grid md:grid-cols-2 gap-10 items-center max-w-7xl mx-auto">
        <div className="text-center md:text-left">
          <p className="text-[#7EC8B8] uppercase tracking-widest text-sm mb-3 font-medium">Fashion. Delivered.</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-[#E8E8EA] leading-tight">
            Because Waiting<br />Isn&apos;t Fashionable
          </h1>
          <p className="text-[#8a8a8e] text-lg mb-7 max-w-md mx-auto md:mx-0">
            Same-day delivery, straight to your door.
          </p>
          <div className="flex gap-3 justify-center md:justify-start flex-wrap">
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

        <div className="hidden md:grid grid-cols-3 gap-3">
          {HERO_PHOTOS.map((src, i) => (
            <ProductImage
              key={src}
              src={src}
              alt="FitDrop fashion edit"
              aspect="aspect-[3/4]"
              sizes="(max-width: 1024px) 16vw, 200px"
              priority={i === 0}
              className={`rounded-2xl border border-[#2B2B2E] ${i === 1 ? "translate-y-6" : ""}`}
            />
          ))}
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#141416] border border-[#2B2B2E] rounded-2xl p-4 sm:p-5">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex items-start gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-[#7EC8B8]/10 text-[#7EC8B8] flex items-center justify-center shrink-0">
                <step.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#E8E8EA]">
                  <span className="text-[#7EC8B8] mr-1">{i + 1}.</span>{step.title}
                </p>
                <p className="text-xs text-[#8a8a8e] mt-0.5 leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits row */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 py-5 text-sm text-[#b5b5b8]">
          {BENEFITS.map(b => (
            <span key={b.text} className="flex items-center gap-2">
              <b.icon className="w-4 h-4 text-[#7EC8B8]" />{b.text}
            </span>
          ))}
          <Link href="/how-it-works" className="text-[#7EC8B8] hover:underline">How it works →</Link>
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
