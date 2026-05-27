"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@clerk/nextjs"
import MegaMenu from "../components/MegaMenu"
import SearchBar from "../components/SearchBar"

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.results || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [query])

  // Group results by store
  const grouped = results.reduce((acc: Record<string, any[]>, product) => {
    if (!acc[product.store]) acc[product.store] = []
    acc[product.store].push(product)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-[#0D0D0F] text-[#E8E8EA]">

      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[#2B2B2E] sticky top-0 bg-[#0D0D0F] z-10">
        <div className="flex items-center gap-3">
          <MegaMenu />
          <Link href="/home">
            <h1 className="text-2xl font-bold tracking-widest text-[#E8E8EA]">FIT DROP</h1>
          </Link>
        </div>
        <div className="flex gap-6 text-sm text-[#6b6b6b] items-center">
          <SearchBar />
          <Link href="/home#stores" className="hover:text-[#E8E8EA] transition">Stores</Link>
          <Link href="/new-drops" className="hover:text-[#E8E8EA] transition">New Drops</Link>
          <Link href="/cart" className="hover:text-[#E8E8EA] transition">Cart</Link>
          <SignOutButton>
            <button className="text-[#6b6b6b] hover:text-[#E8E8EA] transition">Sign Out</button>
          </SignOutButton>
        </div>
      </nav>

      <div className="px-8 py-12 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[#7EC8B8] uppercase tracking-widest text-xs mb-2 font-medium">Search Results</p>
          <h2 className="text-4xl font-bold text-[#E8E8EA]">
            {loading ? "Searching..." : `"${query}"`}
          </h2>
          {!loading && (
            <p className="text-[#6b6b6b] mt-2 text-sm">
              {results.length === 0
                ? "No results found"
                : `${results.length} item${results.length !== 1 ? "s" : ""} found`}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-6 animate-pulse">
                <div className="w-full h-40 bg-[#2B2B2E] rounded-xl mb-4" />
                <div className="h-4 bg-[#2B2B2E] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#2B2B2E] rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-6xl mb-6">🔍</p>
            <h3 className="text-xl font-semibold text-[#E8E8EA] mb-2">Nothing found for "{query}"</h3>
            <p className="text-[#6b6b6b] text-sm mb-8">Try searching for a brand, category, or item name</p>
            <Link
              href="/home"
              className="bg-[#7EC8B8] text-[#0D0D0F] px-6 py-3 rounded-full font-bold hover:bg-[#6ab5a5] transition text-sm"
            >
              Browse All Stores
            </Link>
          </div>
        )}

        {/* Results grouped by store */}
        {!loading && results.length > 0 && (
          <div className="space-y-12">
            {Object.entries(grouped).map(([store, products]) => (
              <div key={store}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2B2B2E] rounded-full flex items-center justify-center">
                      <span className="text-[#7EC8B8] font-bold text-xs">{store[0]}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#E8E8EA]">{store}</h3>
                    <span className="text-xs text-[#6b6b6b]">{products.length} item{products.length !== 1 ? "s" : ""}</span>
                  </div>
                  <Link
                    href={`/stores/${products[0].slug}`}
                    className="text-xs text-[#7EC8B8] hover:underline"
                  >
                    Visit store →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Link
                      key={product._id}
                      href={`/stores/${product.slug}/${product._id}`}
                      className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-5 hover:border-[#7EC8B8] transition block group"
                    >
                      {/* Image or placeholder */}
                      <div className="w-full h-40 bg-[#2B2B2E] rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <span className="text-4xl">📦</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#E8E8EA] truncate">{product.name}</p>
                          <p className="text-xs text-[#6b6b6b] mt-0.5">{product.subcategory || product.category}</p>
                          {product.description && (
                            <p className="text-xs text-[#6b6b6b] mt-1 line-clamp-2">{product.description}</p>
                          )}
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

                      {/* Sizes preview */}
                      {product.sizes?.length > 0 && (
                        <div className="flex gap-1 mt-3 flex-wrap">
                          {product.sizes.slice(0, 4).map((size: string) => (
                            <span key={size} className="text-xs border border-[#2B2B2E] text-[#6b6b6b] px-2 py-0.5 rounded-full">
                              {size}
                            </span>
                          ))}
                          {product.sizes.length > 4 && (
                            <span className="text-xs text-[#6b6b6b]">+{product.sizes.length - 4}</span>
                          )}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
        <p className="text-[#6b6b6b] animate-pulse">Loading...</p>
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}