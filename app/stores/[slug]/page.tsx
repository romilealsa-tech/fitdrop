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
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA]">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2B2B2E] sticky top-0 bg-[#0D0D0F] z-10">
        <Link href="/home" className="text-2xl font-bold tracking-widest text-[#E8E8EA]">FIT DROP</Link>
        <div className="flex gap-6 text-sm text-[#6b6b6b] items-center">
          <Link href="/home" className="hover:text-[#E8E8EA] transition">Stores</Link>
          <Link href="/new-drops" className="hover:text-[#E8E8EA] transition">New Drops</Link>
          <Link href="/cart" className="text-[#E8E8EA] flex items-center gap-1 hover:text-[#2DD4BF] transition">
            Cart {cartCount > 0 && (
              <span className="bg-[#2DD4BF] text-[#0D0D0F] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div className="px-8 py-8">
        <Link href="/home" className="text-[#6b6b6b] text-sm hover:text-[#2DD4BF] mb-6 inline-block transition">
          ← Back to Stores
        </Link>

        {/* Store header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-[#2B2B2E] rounded-full flex items-center justify-center">
            <span className="text-[#2DD4BF] font-bold text-xl">{store.name[0]}</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#E8E8EA]">{store.name}</h2>
            <p className="text-[#6b6b6b]">{store.category}</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-6 text-[#E8E8EA]">Available Now</h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 animate-pulse">
                <div className="w-full h-48 bg-[#2B2B2E] rounded-xl mb-4" />
                <div className="h-4 bg-[#2B2B2E] rounded mb-2 w-3/4" />
                <div className="h-3 bg-[#2B2B2E] rounded mb-4 w-1/4" />
                <div className="h-8 bg-[#2B2B2E] rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`/stores/${slug}/${product._id}`}
                className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 hover:border-[#2DD4BF] transition block group"
              >
                {/* Image */}
                <div className="w-full h-48 bg-[#2B2B2E] rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-[#6b6b6b] text-3xl">📦</span>
                </div>

                {/* Tag + Name */}
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-[#E8E8EA] group-hover:text-[#2DD4BF] transition">{product.name}</h4>
                  {product.tag && (
                    <span className="text-xs bg-[#2DD4BF] text-[#0D0D0F] px-2 py-1 rounded-full font-bold ml-2 shrink-0">
                      {product.tag}
                    </span>
                  )}
                </div>

                {/* Category */}
                <p className="text-[#6b6b6b] text-xs mb-2">{product.category}</p>

                {/* Colors preview */}
                {product.colors?.length > 0 && (
                  <div className="flex gap-1 mb-3">
                    {product.colors.slice(0, 4).map((color: string) => (
                      <div
                        key={color}
                        title={color}
                        className="w-4 h-4 rounded-full border border-[#2B2B2E]"
                        style={{ backgroundColor: color === "White" || color === "Ivory" || color === "Cream" ? "#f5f5f5" :
                          color === "Black" || color === "Triple Black" ? "#1a1a1a" :
                          color === "Navy" || color === "Dark Blue" ? "#1a2744" :
                          color === "Grey" || color === "Gray" || color === "Slate Grey" ? "#808080" :
                          color === "Camel" || color === "Tan" ? "#c19a6b" :
                          color === "Beige" || color === "Oatmeal" || color === "Ecru" ? "#f5f0e8" :
                          color === "Red" || color === "Burgundy" ? "#cc0000" :
                          color === "Pink" || color === "Dusty Rose" ? "#ffb6c1" :
                          color === "Blue" || color === "Light Blue" ? "#4169e1" :
                          color === "Olive" || color === "Khaki" ? "#808000" :
                          color === "Sage Green" || color === "Forest Green" ? "#4a7c59" :
                          "#6b6b6b"
                        }}
                      />
                    ))}
                    {product.colors.length > 4 && (
                      <span className="text-xs text-[#6b6b6b]">+{product.colors.length - 4}</span>
                    )}
                  </div>
                )}

                {/* Price + Add to cart */}
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-[#2DD4BF] font-bold">{product.price}</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      addToCart({ ...product, id: product._id, store: store.name })
                    }}
                    className="bg-[#2DD4BF] text-[#0D0D0F] px-4 py-2 rounded-full text-xs font-bold hover:bg-[#22b8a4] transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}