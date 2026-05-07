"use client"
import Link from "next/link"

export default function NewDrops() {
  const drops = [
    { store: "Zara", slug: "zara", item: "Spring Collection 2026", tag: "Just Dropped", desc: "Fresh minimalist pieces for the new season" },
    { store: "Nike", slug: "nike", item: "Air Max Pulse", tag: "Limited", desc: "New colorway dropping this week only" },
    { store: "Uniqlo", slug: "uniqlo", item: "Linen Summer Line", tag: "New", desc: "Lightweight essentials for warmer days" },
    { store: "H&M", slug: "hm", item: "Y2K Revival Edit", tag: "Trending", desc: "The 2000s are back and we're here for it" },
    { store: "COS", slug: "cos", item: "Monochrome Series", tag: "Just Dropped", desc: "Clean, architectural pieces in neutral tones" },
    { store: "Mango", slug: "mango", item: "Mediterranean Summer", tag: "New", desc: "Sun-soaked styles from the coast" },
  ]

  const tagColor = (tag: string) => {
    if (tag === "Limited") return "bg-red-500 text-white"
    if (tag === "Trending") return "bg-[#f5f0e8] text-[#111111]"
    return "bg-[#c9a96e] text-[#111111]"
  }

  return (
    <main className="min-h-screen bg-[#111111] text-[#f5f0e8]">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2a2a2a] sticky top-0 bg-[#111111] z-10">
        <Link href="/home" className="text-2xl font-bold tracking-widest text-[#f5f0e8]">FIT DROP</Link>
        <div className="flex gap-6 text-sm text-[#6b6b6b]">
          <Link href="/home" className="hover:text-[#f5f0e8] transition">Stores</Link>
          <Link href="/new-drops" className="text-[#c9a96e]">New Drops</Link>
          <Link href="/cart" className="hover:text-[#f5f0e8] transition">Cart</Link>
        </div>
      </nav>

      <div className="px-8 py-8">
        <p className="text-[#c9a96e] uppercase tracking-widest text-sm mb-2 font-medium">What's hot right now</p>
        <h2 className="text-4xl font-bold mb-10 text-[#f5f0e8]">New Drops 🔥</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drops.map((drop) => (
            <Link
              key={drop.item}
              href={`/stores/${drop.slug}`}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#c9a96e] transition block"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-[#6b6b6b]">{drop.store}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${tagColor(drop.tag)}`}>
                  {drop.tag}
                </span>
              </div>
              <div className="w-full h-32 bg-[#222222] rounded-xl mb-4 flex items-center justify-center">
                <span className="text-3xl">🔥</span>
              </div>
              <h4 className="font-semibold text-[#f5f0e8] mb-1">{drop.item}</h4>
              <p className="text-[#6b6b6b] text-sm">{drop.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}