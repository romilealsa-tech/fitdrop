"use client"
import { useEffect, useState } from "react"
import React from "react"
import Link from "next/link"
import ProductImage from "../../components/ProductImage"
import StoreLogo from "../../components/StoreLogo"
import { getProductImage, getStoreCover } from "../../../lib/images"
import { STORE_BY_SLUG } from "../../../lib/stores"

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  const info = STORE_BY_SLUG[slug]
  const storeName = info?.name || slug

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
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <Link href="/home#stores" className="text-[#6b6b6b] text-sm hover:text-[#E8E8EA] transition">← All Stores</Link>

        {/* Store header */}
        <div className="relative mt-3 mb-8 rounded-2xl overflow-hidden border border-[#2B2B2E]">
          <ProductImage
            src={getStoreCover(slug)}
            alt={`${storeName} storefront`}
            aspect="aspect-[16/7] sm:aspect-[16/5]"
            sizes="(max-width: 1152px) 100vw, 1152px"
            priority
            imgClassName="brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F] via-[#0D0D0F]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5 sm:p-6 flex items-end gap-4">
            <StoreLogo slug={slug} name={storeName} size="lg" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#E8E8EA]">{storeName}</h1>
              <p className="text-[#b5b5b8] text-sm mt-1">
                {info ? `${info.category} · ${info.time} · ${info.fee} delivery · ` : ""}{products.length} items
              </p>
            </div>
          </div>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl overflow-hidden animate-pulse">
                <div className="w-full aspect-[4/5] bg-[#2B2B2E]" />
                <div className="p-4">
                  <div className="h-4 bg-[#2B2B2E] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#2B2B2E] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6b6b6b]">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((product: any) => (
              <Link
                key={product._id}
                href={`/stores/${slug}/${product._id}`}
                className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl overflow-hidden hover:border-[#7EC8B8] transition block group"
              >
                <ProductImage
                  src={getProductImage({ ...product, slug })}
                  alt={`${product.name} — ${storeName}`}
                  aspect="aspect-[4/5]"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  imgClassName="group-hover:scale-105 transition duration-500"
                />
                <div className="p-4 flex items-start justify-between gap-2">
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