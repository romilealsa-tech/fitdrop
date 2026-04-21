"use client"
import { useRef } from "react"

const stores = [
  { name: "Zara", slug: "zara", category: "Fashion & Basics", time: "30-45 min", fee: "$2.99" },
  { name: "Uniqlo", slug: "uniqlo", category: "Essentials & Comfort", time: "25-40 min", fee: "$1.99" },
  { name: "H&M", slug: "hm", category: "Trends & Streetwear", time: "35-50 min", fee: "$2.49" },
  { name: "Nike", slug: "nike", category: "Sport & Lifestyle", time: "20-35 min", fee: "$3.99" },
  { name: "COS", slug: "cos", category: "Minimal & Modern", time: "30-45 min", fee: "$2.99" },
  { name: "Mango", slug: "mango", category: "Mediterranean Style", time: "25-40 min", fee: "$1.99" },
]

export default function Home() {
  const storesRef = useRef<HTMLElement>(null)
  const scrollToStores = () => storesRef.current?.scrollIntoView({ behavior: "smooth" })

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-zinc-800 sticky top-0 bg-black z-10">
        <h1 className="text-2xl font-bold tracking-widest">FIT DROP</h1>
        <div className="flex gap-6 text-sm text-zinc-400 items-center">
          <button onClick={scrollToStores} className="hover:text-white transition">Stores</button>
          <a href="/new-drops" className="hover:text-white transition">New Drops</a>
          <a href="/cart" className="hover:text-white transition">Cart</a>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
        <p className="text-zinc-500 uppercase tracking-widest text-sm mb-4">Fashion. Delivered.</p>
        <h2 className="text-6xl font-bold mb-6">Shop the Drop.</h2>
        <button onClick={scrollToStores} className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-zinc-200 transition">
          Browse Stores
        </button>
      </section>

      <section ref={storesRef} className="px-8 pb-16">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold">Available Stores</h3>
          <input
            type="text"
            placeholder="Search stores..."
            className="bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 w-48"
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
          {stores.map((store) => (
            <a key={store.name} data-store={store.name.toLowerCase()} href={`/stores/${store.slug}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition block no-underline">
              <div className="w-12 h-12 bg-white rounded-full mb-4 flex items-center justify-center">
                <span className="text-black font-bold text-sm">{store.name[0]}</span>
              </div>
              <h4 className="text-lg font-semibold mb-1 text-white">{store.name}</h4>
              <p className="text-zinc-400 text-sm mb-4">{store.category}</p>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>🕐 {store.time}</span>
                <span>🛵 {store.fee}</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}