"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useCart } from "../../../CartContext"

export default function ShopPage({ params }: { params: Promise<{ gender: string; subcategory: string }> }) {
  const { gender, subcategory } = React.use(params)
  const { addToCart, cart } = useCart()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState("All")

  const cartCount = cart.reduce((sum: number, i: any) => sum + i.qty, 0)

  const genderLabel = gender.charAt(0).toUpperCase() + gender.slice(1)
  const subcategoryLabel = subcategory === "all"
    ? "All"
    : subcategory.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace("Jackets And Coats", "Jackets & Coats")

  useEffect(() => {
    fetch(`/api/products`)
      .then(res => res.json())
      .then(data => {
        let filtered = (data.products || []).filter((p: any) =>
          p.gender?.toLowerCase() === gender.toLowerCase()
        )
        if (subcategory !== "all") {
          filtered = filtered.filter((p: any) =>
            p.subcategory?.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-") === subcategory.toLowerCase()
          )
        }
        setProducts(filtered)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [gender, subcategory])

  const brands = ["All", ...Array.from(new Set(products.map((p: any) => p.store)))]
  const filteredProducts = selectedBrand === "All" ? products : products.filter(p => p.store === selectedBrand)

  const getColor = (color: string) => {
    const base = color.split("/")[0].trim()
    const colorMap: Record<string, string> = {
      "Black": "#1a1a1a", "White": "#f5f5f5", "Navy": "#1a2744",
      "Grey": "#808080", "Camel": "#c19a6b", "Beige": "#f5f0e8",
      "Red": "#cc0000", "Burgundy": "#800020", "Pink": "#ffb6c1",
      "Blue": "#4169e1", "Light Blue": "#add8e6", "Dark Blue": "#00008b",
      "Olive": "#808000", "Khaki": "#c3b091", "Sage Green": "#b2ac88",
      "Forest Green": "#228b22", "Brown": "#8b4513", "Tan": "#d2b48c",
      "Oatmeal": "#e8dcc8", "Ecru": "#f5f0e1", "Natural": "#f5e6c8",
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

      <div className="px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6b6b6b] mb-6">
          <Link href="/home" className="hover:text-[#E8E8EA] transition">Home</Link>
          <span>/</span>
          <span className="text-[#E8E8EA]">{genderLabel}</span>
          {subcategoryLabel !== "All" && (
            <>
              <span>/</span>
              <span className="text-[#E8E8EA]">{subcategoryLabel}</span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-[#7EC8B8] text-xs uppercase tracking-widest mb-1 font-medium">{genderLabel}'s</p>
            <h1 className="text-4xl font-bold text-[#E8E8EA]">{subcategoryLabel === "All" ? `All ${genderLabel}'s` : subcategoryLabel}</h1>
            {!loading && <p className="text-[#6b6b6b] text-sm mt-1">{filteredProducts.length} items</p>}
          </div>
        </div>

        {/* Brand filter */}
        {!loading && brands.length > 2 && (
          <div className="flex gap-2 flex-wrap mb-8">
            {brands.map(brand => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                  selectedBrand === brand
                    ? "bg-[#7EC8B8] text-[#0D0D0F] font-bold"
                    : "bg-[#1C1C1E] text-[#6b6b6b] border border-[#2B2B2E] hover:text-[#E8E8EA]"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 animate-pulse">
                <div className="w-full h-48 bg-[#2B2B2E] rounded-xl mb-4" />
                <div className="h-4 bg-[#2B2B2E] rounded mb-2 w-3/4" />
                <div className="h-3 bg-[#2B2B2E] rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6b6b6b] text-lg mb-4">No products found</p>
            <Link href="/home" className="text-[#7EC8B8] hover:underline text-sm">Back to stores</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Link
                key={product._id}
                href={`/stores/${product.slug}/${product._id}`}
                className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-5 hover:border-[#7EC8B8] transition block group"
              >
                <div className="w-full h-44 bg-[#2B2B2E] rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-3xl">📦</span>
                </div>

                {/* Store badge */}
                <span className="text-xs text-[#7EC8B8] font-medium">{product.store}</span>

                <div className="flex justify-between items-start mt-1 mb-1">
                  <h4 className="font-semibold text-[#E8E8EA] text-sm group-hover:text-[#7EC8B8] transition leading-tight">{product.name}</h4>
                  {product.tag && (
                    <span className="text-xs bg-[#7EC8B8] text-[#0D0D0F] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0">
                      {product.tag}
                    </span>
                  )}
                </div>

                {product.colors?.length > 0 && (
                  <div className="flex gap-1 mb-2 mt-1">
                    {product.colors.slice(0, 4).map((color: string) => (
                      <div
                        key={color}
                        title={color}
                        className="w-3 h-3 rounded-full border border-[#2B2B2E]"
                        style={{ backgroundColor: getColor(color) }}
                      />
                    ))}
                    {product.colors.length > 4 && (
                      <span className="text-xs text-[#6b6b6b]">+{product.colors.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <p className="text-[#7EC8B8] font-bold text-sm">{product.price}</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      addToCart({ ...product, id: product._id, store: product.store })
                    }}
                    className="bg-[#7EC8B8] text-[#0D0D0F] px-3 py-1 rounded-full text-xs font-bold hover:bg-[#6ab5a5] transition"
                  >
                    Add
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