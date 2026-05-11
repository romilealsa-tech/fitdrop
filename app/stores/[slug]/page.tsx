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

const subcategoryIcons: Record<string, string> = {
  "Tops": "👕",
  "Trousers": "👖",
  "Jeans": "👖",
  "Dresses": "👗",
  "Skirts": "🩱",
  "Shorts": "🩳",
  "Blazers": "🧥",
  "Jackets & Coats": "🧥",
  "Shoes": "👟",
  "Bags": "👜",
  "Accessories": "🎩",
}

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { addToCart, cart } = useCart()
  const { slug } = React.use(params)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGender, setSelectedGender] = useState<"Women" | "Men">("Women")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All")

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

  const genderProducts = products.filter(p => p.gender === selectedGender)
  const subcategories = ["All", ...Array.from(new Set(genderProducts.map((p: any) => p.subcategory).filter(Boolean)))]
  const filteredProducts = selectedSubcategory === "All"
    ? genderProducts
    : genderProducts.filter(p => p.subcategory === selectedSubcategory)

  const getColor = (color: string) => {
    const base = color.split("/")[0].trim()
    const colorMap: Record<string, string> = {
      "Black": "#1a1a1a", "White": "#f5f5f5", "Navy": "#1a2744",
      "Grey": "#808080", "Gray": "#808080", "Camel": "#c19a6b",
      "Beige": "#f5f0e8", "Cream": "#fffdd0", "Ivory": "#fffff0",
      "Red": "#cc0000", "Burgundy": "#800020", "Pink": "#ffb6c1",
      "Blue": "#4169e1", "Light Blue": "#add8e6", "Dark Blue": "#00008b",
      "Olive": "#808000", "Khaki": "#c3b091", "Sage Green": "#b2ac88",
      "Forest Green": "#228b22", "Brown": "#8b4513", "Tan": "#d2b48c",
      "Oatmeal": "#e8dcc8", "Ecru": "#f5f0e1", "Slate Grey": "#708090",
      "Natural": "#f5e6c8", "Dusty Rose": "#dcb8a8",
    }
    return colorMap[base] || "#6b6b6b"
  }

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA]">

      {/* Nav */}
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

      {/* Store header */}
      <div className="px-8 pt-8 pb-0">
        <Link href="/home" className="text-[#6b6b6b] text-sm hover:text-[#7EC8B8] mb-6 inline-block transition">
          ← Back to Stores
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-[#2B2B2E] rounded-full flex items-center justify-center">
            <span className="text-[#7EC8B8] font-bold text-lg">{store.name[0]}</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#E8E8EA]">{store.name}</h2>
            <p className="text-[#6b6b6b] text-sm">{store.category}</p>
          </div>
        </div>

        {/* Gender tabs */}
        <div className="flex gap-0 border-b border-[#2B2B2E] mb-0">
          {(["Women", "Men"] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => { setSelectedGender(gender); setSelectedSubcategory("All") }}
              className={`px-8 py-3 text-sm font-bold tracking-wide transition border-b-2 -mb-px ${
                selectedGender === gender
                  ? "text-[#E8E8EA] border-[#7EC8B8]"
                  : "text-[#6b6b6b] border-transparent hover:text-[#E8E8EA]"
              }`}
            >
              {gender.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory nav */}
      <div className="sticky top-[65px] bg-[#0D0D0F] z-10 border-b border-[#2B2B2E]">
        <div className="px-8 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedSubcategory === sub
                  ? "bg-[#7EC8B8] text-[#0D0D0F] font-bold"
                  : "bg-[#1C1C1E] text-[#6b6b6b] hover:text-[#E8E8EA] border border-[#2B2B2E]"
              }`}
            >
              {sub !== "All" && subcategoryIcons[sub] ? `${subcategoryIcons[sub]} ` : ""}{sub}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="px-8 py-8">
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
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6b6b6b] text-lg">No products found</p>
            <button onClick={() => setSelectedSubcategory("All")} className="text-[#7EC8B8] text-sm mt-2 hover:underline">
              View all {selectedGender}'s
            </button>
          </div>
        ) : (
          <>
            <p className="text-[#6b6b6b] text-sm mb-6">{filteredProducts.length} items</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/stores/${slug}/${product._id}`}
                  className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 hover:border-[#7EC8B8] transition block group"
                >
                  <div className="w-full h-48 bg-[#2B2B2E] rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-[#6b6b6b] text-3xl">📦</span>
                  </div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-[#E8E8EA] group-hover:text-[#7EC8B8] transition text-sm">{product.name}</h4>
                    {product.tag && (
                      <span className="text-xs bg-[#7EC8B8] text-[#0D0D0F] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0">
                        {product.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[#6b6b6b] text-xs mb-2">{product.subcategory}</p>
                  {product.colors?.length > 0 && (
                    <div className="flex gap-1 mb-3">
                      {product.colors.slice(0, 4).map((color: string) => (
                        <div
                          key={color}
                          title={color}
                          className="w-3.5 h-3.5 rounded-full border border-[#2B2B2E]"
                          style={{ backgroundColor: getColor(color) }}
                        />
                      ))}
                      {product.colors.length > 4 && (
                        <span className="text-xs text-[#6b6b6b]">+{product.colors.length - 4}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-[#7EC8B8] font-bold text-sm">{product.price}</p>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        addToCart({ ...product, id: product._id, store: store.name })
                      }}
                      className="bg-[#7EC8B8] text-[#0D0D0F] px-3 py-1.5 rounded-full text-xs font-bold hover:bg-[#6ab5a5] transition"
                    >
                      Add
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}