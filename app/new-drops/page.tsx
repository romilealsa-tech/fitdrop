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
    if (tag === "Trending") return "bg-[#E8E8EA] text-[#0D0D0F]"
    return "bg-[#7EC8B8] text-[#0D0D0F]"
  }

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA]">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2B2B2E] sticky top-0 bg-[#0D0D0F] z-10">
        <Link href="/home" className="text-2xl font-bold tracking-widest text-[#E8E8EA]">FIT DROP</Link>
        <div className="flex gap-6 text-sm text-[#6b6b6b]">
          <Link href="/home" className="hover:text-[#E8E8EA] transition">Stores</Link>
          <Link href="/new-drops" className="text-[#7EC8B8]">New Drops</Link>
          <Link href="/cart" className="hover:text-[#E8E8EA] transition">Cart</Link>
        </div>
      </nav>

      <div className="px-8 py-8">
        <p className="text-[#7EC8B8] uppercase tracking-widest text-sm mb-2 font-medium">What's hot right now</p>
        <h2 className="text-4xl font-bold mb-10 text-[#E8E8EA]">New Drops 🔥</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drops.map((drop) => (
            <Link
              key={drop.item}
              href={`/stores/${drop.slug}`}
              className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 hover:border-[#7EC8B8] transition block"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-[#6b6b6b]">{drop.store}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${tagColor(drop.tag)}`}>
                  {drop.tag}
                </span>
              </div>
              <div className="w-full h-32 bg-[#2B2B2E] rounded-xl mb-4 flex items-center justify-center">
                <span className="text-3xl">🔥</span>
              </div>
              <h4 className="font-semibold text-[#E8E8EA] mb-1">{drop.item}</h4>
              <p className="text-[#6b6b6b] text-sm">{drop.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}