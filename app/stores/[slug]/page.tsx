"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useCart } from "../../CartContext"

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = require("react").use(params)
  const { cart } = useCart()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  const cartCount = cart.reduce((sum: number, i: any) => sum + i.qty, 0)

  const storeNames: Record<string, string> = {
    zara: "Zara", uniqlo: "Uniqlo", hm: "H&M",
    nike: "Nike", cos: "COS", mango: "Mango"
  }

  useEffect(() => {
    fetch(`/api/products?slug=${slug}`)
      .then(res => res.json())
      .then(data => { setProducts(data.products || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  const categories = ["All", ...Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)))]
  const filtered = products.filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === "All" || p.category === activeCategory
    return matchSearch && matchCat
  })

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA]">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2B2B2E] sticky top-0 bg-[#0D0D0F] z-10">
        <Link href="/home" className="text-2xl font-bold tracking-widest text-[#E8E8EA]">FIT DROP</Link>
        <div className="flex gap-6 text-sm text-[#6b6b6b] items-center">
          <Link href="/home" className="hover:text-[#E8E8EA] transition">Stores</Link>
          <Link href="/new-drops" className="hover:text-[#E8E8EA] transition">New Drops</Link>
          <Link href="/cart" className="text-[#E8E8EA] flex items-center gap-1 hover:text-[#7EC8B8] transition">
            Cart {cartCount > 0 && (
              <span className="bg-[#7EC8B8] text-[#0D0D0F] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <Link href="/home" className="text-[#6b6b6b] text-sm hover:text-[#E8E8EA] transition">← All Stores</Link>
          <h1 className="text-4xl font-bold text-[#E8E8EA] mt-2">{storeNames[slug] || slug}</h1>
          <p className="text-[#6b6b6b] mt-1">{products.length} items available</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-full px-4 py-2 text-sm text-[#E8E8EA] placeholder-[#6b6b6b] focus:outline-none focus:border-[#7EC8B8] w-full sm:w-64 transition"
          />
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                  activeCategory === cat
                    ? "bg-[#7EC8B8] text-[#0D0D0F]"
                    : "bg-[#1C1C1E] text-[#6b6b6b] hover:text-[#E8E8EA] border border-[#2B2B2E]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 animate-pulse">
                <div className="w-full h-40 bg-[#2B2B2E] rounded-xl mb-4" />
                <div className="h-4 bg-[#2B2B2E] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#2B2B2E] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6b6b6b]">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product: any) => (
              <Link
                key={product._id}
                href={`/stores/${slug}/${product._id}`}
                className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-5 hover:border-[#7EC8B8] transition block group"
              >
                <div className="w-full h-40 bg-[#2B2B2E] rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-4xl">📦</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#E8E8EA] truncate">{product.name}</p>
                    <p className="text-xs text-[#6b6b6b] mt-0.5">{product.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#7EC8B8]">{product.price}</p>
                    {product.tag && (
                      <span className="text-xs bg-[#7EC8B8] text-[#0D0D0F] px-1.5 py-0.5 rounded-full font-bold mt-1 inline-block">
                        {product.tag}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}