"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }

    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
        setOpen(true)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false)
      setQuery("")
    }
    if (e.key === "Enter" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-64">
      {/* Input */}
      <div className="flex items-center gap-2 bg-[#1C1C1E] border border-[#2B2B2E] rounded-full px-4 py-2 focus-within:border-[#7EC8B8] transition">
        <svg className="w-3.5 h-3.5 text-[#6b6b6b] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-[#E8E8EA] text-sm placeholder-[#6b6b6b] focus:outline-none w-full"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); setOpen(false) }}
            className="text-[#6b6b6b] hover:text-[#E8E8EA] transition text-xs">✕</button>
        )}
      </div>

      {/* Dropdown results */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">

          {loading ? (
            <div className="px-4 py-6 text-center">
              <p className="text-[#6b6b6b] text-sm animate-pulse">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-[#6b6b6b] text-sm">No results for "{query}"</p>
            </div>
          ) : (
            <div>
              <p className="px-4 pt-3 pb-2 text-xs text-[#6b6b6b] uppercase tracking-widest">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              {results.map((product) => (
                <Link
                  key={product._id}
                  href={`/stores/${product.slug}/${product._id}`}
                  onClick={() => { setOpen(false); setQuery("") }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#2B2B2E] transition"
                >
                  {/* Placeholder image */}
                  <div className="w-10 h-10 bg-[#2B2B2E] rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-sm">📦</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#E8E8EA] truncate">{product.name}</p>
                    <p className="text-xs text-[#6b6b6b]">{product.store} · {product.subcategory}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#7EC8B8]">{product.price}</p>
                    {product.tag && (
                      <span className="text-xs bg-[#7EC8B8] text-[#0D0D0F] px-1.5 py-0.5 rounded-full font-bold">
                        {product.tag}
                      </span>
                    )}
                  </div>
                </Link>
              ))}

              {/* View all results */}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center px-4 py-3 border-t border-[#2B2B2E] text-xs text-[#7EC8B8] hover:bg-[#2B2B2E] transition font-medium"
              >
                View all results for "{query}" →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}