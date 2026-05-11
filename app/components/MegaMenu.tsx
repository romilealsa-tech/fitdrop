"use client"
import { useState, useRef } from "react"
import Link from "next/link"

const categories = {
  Women: [
    { label: "Tops", icon: "👕" },
    { label: "Trousers", icon: "👖" },
    { label: "Jeans", icon: "👖" },
    { label: "Dresses", icon: "👗" },
    { label: "Skirts", icon: "🩱" },
    { label: "Shorts", icon: "🩳" },
    { label: "Blazers", icon: "🧥" },
    { label: "Jackets & Coats", icon: "🧥" },
    { label: "Shoes", icon: "👟" },
    { label: "Bags", icon: "👜" },
    { label: "Accessories", icon: "🎩" },
  ],
  Men: [
    { label: "Tops", icon: "👕" },
    { label: "Trousers", icon: "👖" },
    { label: "Jeans", icon: "👖" },
    { label: "Shorts", icon: "🩳" },
    { label: "Blazers", icon: "🧥" },
    { label: "Jackets & Coats", icon: "🧥" },
    { label: "Shoes", icon: "👟" },
    { label: "Accessories", icon: "🎩" },
  ],
}

export default function MegaMenu() {
  const [open, setOpen] = useState(false)
  const [activeGender, setActiveGender] = useState<"Women" | "Men">("Women")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>

      {/* Hamburger button */}
      <button className="flex flex-col gap-1.5 p-2 hover:opacity-70 transition">
        <span className="w-5 h-0.5 bg-[#E8E8EA] block" />
        <span className="w-5 h-0.5 bg-[#E8E8EA] block" />
        <span className="w-5 h-0.5 bg-[#E8E8EA] block" />
      </button>

      {/* Mega menu dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-[520px] bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl shadow-2xl z-50 overflow-hidden">

          {/* Gender tabs */}
          <div className="flex border-b border-[#2B2B2E]">
            {(["Women", "Men"] as const).map((gender) => (
              <button
                key={gender}
                onMouseEnter={() => setActiveGender(gender)}
                onClick={() => setActiveGender(gender)}
                className={`flex-1 py-4 text-sm font-bold tracking-widest uppercase transition ${
                  activeGender === gender
                    ? "text-[#E8E8EA] bg-[#2B2B2E]"
                    : "text-[#6b6b6b] hover:text-[#E8E8EA]"
                }`}
              >
                {gender}
              </button>
            ))}
          </div>

          {/* Categories grid */}
          <div className="p-6">
            <p className="text-xs text-[#6b6b6b] uppercase tracking-widest mb-4">Shop by Category</p>
            <div className="grid grid-cols-3 gap-2">
              {categories[activeGender].map((cat) => (
                <Link
                  key={cat.label}
                  href={`/shop/${activeGender.toLowerCase()}/${cat.label.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-[#2B2B2E] transition group"
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="text-sm text-[#E8E8EA] group-hover:text-[#7EC8B8] transition font-medium">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* View all link */}
            <div className="border-t border-[#2B2B2E] mt-4 pt-4">
              <Link
                href={`/shop/${activeGender.toLowerCase()}/all`}
                onClick={() => setOpen(false)}
                className="text-xs text-[#7EC8B8] hover:underline font-medium"
              >
                View all {activeGender}'s →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}