export default function NewDrops() {
  const drops = [
    { store: "Zara", slug: "zara", item: "Spring Collection 2026", tag: "Just Dropped", desc: "Fresh minimalist pieces for the new season" },
    { store: "Nike", slug: "nike", item: "Air Max Pulse", tag: "Limited", desc: "New colorway dropping this week only" },
    { store: "Uniqlo", slug: "uniqlo", item: "Linen Summer Line", tag: "New", desc: "Lightweight essentials for warmer days" },
    { store: "H&M", slug: "hm", item: "Y2K Revival Edit", tag: "Trending", desc: "The 2000s are back and we're here for it" },
    { store: "COS", slug: "cos", item: "Monochrome Series", tag: "Just Dropped", desc: "Clean, architectural pieces in neutral tones" },
    { store: "Mango", slug: "mango", item: "Mediterranean Summer", tag: "New", desc: "Sun-soaked styles from the coast" },
  ]

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-zinc-800 sticky top-0 bg-black z-10">
        <a href="/" className="text-2xl font-bold tracking-widest">FIT DROP</a>
        <div className="flex gap-6 text-sm text-zinc-400">
          <a href="/" className="hover:text-white transition">Stores</a>
          <a href="/new-drops" className="text-white">New Drops</a>
          <a href="/cart" className="hover:text-white transition">Cart</a>
        </div>
      </nav>

      <div className="px-8 py-8">
        <p className="text-zinc-500 uppercase tracking-widest text-sm mb-2">What's hot right now</p>
        <h2 className="text-4xl font-bold mb-10">New Drops 🔥</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drops.map((drop) => (
            <a key={drop.item} href={`/stores/${drop.slug}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition block">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs text-zinc-500">{drop.store}</span>
                <span className="text-xs bg-white text-black px-2 py-1 rounded-full font-semibold">{drop.tag}</span>
              </div>
              <div className="w-full h-32 bg-zinc-800 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-3xl">🔥</span>
              </div>
              <h4 className="font-semibold text-white mb-1">{drop.item}</h4>
              <p className="text-zinc-400 text-sm">{drop.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}