"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useCart } from "../../CartContext"

const storeInfo: Record<string, { name: string; category: string }> = {
  zara: { name: "Zara", category: "Fashion & Basics" },
  uniqlo: { name: "Uniqlo", category: "Essentials & Comfort" },
  hm: { name: "H&M", category: "Trends & Streetwear" },
  nike: { name: "Nike", category: "Sport & Lifestyle" },
  cos: { name: "COS", category: "Minimal & Modern" },
  mango: { name: "Mango", category: "Mediterranean Style" },
}

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { addToCart, cart } = useCart()
  const { slug } = React.use(params)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const store = storeInfo[slug] || {
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    category: "Fashion",
  }

  const cartCount = cart.reduce((sum: number, i: any) => sum + i.qty, 0)

  useEffect(() => {
    fetch(`/api/products?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  return (
    <main className="min-h-screen bg-[#111111] text-[#f5f0e8]">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2a2a2a] sticky top-0 bg-[#111111] z-10">
        <Link href="/home" className="text-2xl font-bold tracking-widest text-[#f5f0e8]">FIT DROP</Link>
        <div className="flex gap-6 text-sm text-[#6b6b6b] items-center">
          <Link href="/home" className="hover:text-[#f5f0e8] transition">Stores</Link>
          <Link href="/new-drops" className="hover:text-[#f5f0e8] transition">New Drops</Link>
          <Link href="/cart" className="text-[#f5f0e8] flex items-center gap-1 hover:text-[#c9a96e] transition">
            Cart {cartCount > 0 && (
              <span className="bg-[#c9a96e] text-[#111111] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div className="px-8 py-8">
        <Link href="/home" className="text-[#6b6b6b] text-sm hover:text-[#c9a96e] mb-6 inline-block transition">
          ← Back to Stores
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-[#f5f0e8] rounded-full flex items-center justify-center">
            <span className="text-[#111111] font-bold text-xl">{store.name[0]}</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#f5f0e8]">{store.name}</h2>
            <p className="text-[#6b6b6b]">{store.category}</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-6 text-[#f5f0e8]">Available Now</h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 animate-pulse">
                <div className="w-full h-32 bg-[#222222] rounded-xl mb-4" />
                <div className="h-4 bg-[#222222] rounded mb-2 w-3/4" />
                <div className="h-3 bg-[#222222] rounded mb-4 w-1/4" />
                <div className="h-8 bg-[#222222] rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#c9a96e] transition"
              >
                <div className="w-full h-32 bg-[#222222] rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-[#3a3a3a] text-sm">📦</span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-[#f5f0e8]">{product.name}</h4>
                  {product.tag && (
                    <span className="text-xs bg-[#c9a96e] text-[#111111] px-2 py-1 rounded-full font-semibold">
                      {product.tag}
                    </span>
                  )}
                </div>
                <p className="text-[#c9a96e] text-sm mb-4 font-medium">{product.price}</p>
                <button
                  onClick={() => addToCart({ ...product, id: product._id, store: store.name })}
                  className="w-full bg-[#c9a96e] text-[#111111] py-2 rounded-full text-sm font-bold hover:bg-[#b8924a] transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}