"use client"
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useCart } from "../../../CartContext"

export default function ProductPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = React.use(params)
  const { addToCart, cart } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [added, setAdded] = useState(false)

  const cartCount = cart.reduce((sum: number, i: any) => sum + i.qty, 0)

  useEffect(() => {
    fetch(`/api/products?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        const found = data.products?.find((p: any) => p._id === id)
        setProduct(found)
        if (found?.sizes?.length > 0) setSelectedSize(found.sizes[0])
        if (found?.colors?.length > 0) setSelectedColor(found.colors[0])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug, id])

  const handleAddToCart = () => {
    if (!selectedSize) return
    addToCart({
      ...product,
      id: product._id,
      store: product.store,
      selectedSize,
      selectedColor,
      name: `${product.name} (${selectedSize}${selectedColor ? ` / ${selectedColor}` : ""})`,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const colorMap: Record<string, string> = {
    "Black": "#1a1a1a",
    "White": "#f5f5f5",
    "Navy": "#1a2744",
    "Grey": "#808080",
    "Gray": "#808080",
    "Camel": "#c19a6b",
    "Beige": "#f5f0e8",
    "Cream": "#fffdd0",
    "Ivory": "#fffff0",
    "Red": "#cc0000",
    "Burgundy": "#800020",
    "Pink": "#ffb6c1",
    "Blue": "#4169e1",
    "Light Blue": "#add8e6",
    "Dark Blue": "#00008b",
    "Olive": "#808000",
    "Khaki": "#c3b091",
    "Sage Green": "#b2ac88",
    "Forest Green": "#228b22",
    "Brown": "#8b4513",
    "Tan": "#d2b48c",
    "Champagne": "#f7e7ce",
    "Nude": "#e8c9a0",
    "Dusty Rose": "#dcb8a8",
    "Dusty Blue": "#8ba7b8",
    "Oatmeal": "#e8dcc8",
    "Ecru": "#f5f0e1",
    "Slate Grey": "#708090",
    "Natural": "#f5e6c8",
    "Triple Black": "#0a0a0a",
    "Triple White": "#ffffff",
  }

  const getColor = (color: string) => {
    const base = color.split("/")[0].trim()
    return colorMap[base] || "#6b6b6b"
  }

  if (loading) return (
    <main className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
      <div className="text-[#7EC8B8] text-sm uppercase tracking-widest animate-pulse">Loading...</div>
    </main>
  )

  if (!product) return (
    <main className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#E8E8EA] text-lg mb-4">Product not found</p>
        <Link href={`/stores/${slug}`} className="text-[#7EC8B8] hover:underline">← Back to store</Link>
      </div>
    </main>
  )

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

      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6b6b6b] mb-8">
          <Link href="/home" className="hover:text-[#E8E8EA] transition">Stores</Link>
          <span>/</span>
          <Link href={`/stores/${slug}`} className="hover:text-[#E8E8EA] transition">{product.store}</Link>
          <span>/</span>
          <span className="text-[#E8E8EA]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Left: Image */}
          <div>
            <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl aspect-square flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-[#6b6b6b] text-sm">Product Image</p>
                <p className="text-[#2B2B2E] text-xs mt-1">Coming with brand sync</p>
              </div>
            </div>
            {/* Thumbnail row */}
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`bg-[#1C1C1E] border rounded-xl aspect-square flex items-center justify-center cursor-pointer transition ${i === 0 ? "border-[#7EC8B8]" : "border-[#2B2B2E] hover:border-[#6b6b6b]"}`}>
                  <span className="text-[#2B2B2E] text-lg">📦</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div>
            {/* Store + tag */}
            <div className="flex items-center justify-between mb-3">
              <Link href={`/stores/${slug}`} className="text-[#7EC8B8] text-sm font-medium hover:underline">
                {product.store}
              </Link>
              {product.tag && (
                <span className="text-xs bg-[#7EC8B8] text-[#0D0D0F] px-3 py-1 rounded-full font-bold">
                  {product.tag}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl font-bold text-[#E8E8EA] mb-2">{product.name}</h1>

            {/* Price */}
            <p className="text-2xl text-[#7EC8B8] font-bold mb-4">{product.price}</p>

            {/* Description */}
            <p className="text-[#6b6b6b] text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Delivery badge */}
            <div className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
              <span className="text-xl">🛵</span>
              <div>
                <p className="text-[#E8E8EA] text-sm font-semibold">Same-day delivery</p>
                <p className="text-[#6b6b6b] text-xs">Order now — delivered in 30-45 min</p>
              </div>
            </div>

            {/* Color selector */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-[#E8E8EA]">Color</p>
                  <p className="text-sm text-[#6b6b6b]">{selectedColor}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        selectedColor === color
                          ? "border-[#7EC8B8] scale-110"
                          : "border-[#2B2B2E] hover:border-[#6b6b6b]"
                      }`}
                      style={{ backgroundColor: getColor(color) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-[#E8E8EA]">Size</p>
                  <button className="text-xs text-[#7EC8B8] hover:underline">Size guide</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                        selectedSize === size
                          ? "bg-[#7EC8B8] text-[#0D0D0F] border-[#7EC8B8] font-bold"
                          : "bg-transparent text-[#E8E8EA] border-[#2B2B2E] hover:border-[#6b6b6b]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize && product.sizes?.length > 0}
              className={`w-full py-4 rounded-full font-bold text-lg transition ${
                added
                  ? "bg-[#1C1C1E] text-[#7EC8B8] border border-[#7EC8B8]"
                  : "bg-[#7EC8B8] text-[#0D0D0F] hover:bg-[#22b8a4]"
              } disabled:opacity-40`}
            >
              {added ? "✓ Added to Cart" : "Add to Cart"}
            </button>

            {!selectedSize && product.sizes?.length > 0 && (
              <p className="text-red-400 text-xs mt-2 text-center">Please select a size</p>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}