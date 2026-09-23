"use client"
// Street-address input with Google Places (New) autocomplete, limited to Manhattan.
// Without an API key it behaves like a normal text input.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react"
import { loadGoogleMaps, hasMapsKey, type LatLng } from "@/lib/googleMaps"

export type ResolvedAddress = {
  street: string
  city: string
  state: string
  zip: string
  location: LatLng
  formatted: string
}

// Rough bounding box around Manhattan — suggestions outside it are not shown
const MANHATTAN_BOUNDS = { north: 40.882, south: 40.698, east: -73.907, west: -74.02 }

type Suggestion = { id: string; main: string; secondary: string; prediction: any }

type Props = {
  value: string
  onChange: (value: string) => void
  onResolved: (address: ResolvedAddress) => void
  className?: string
  placeholder?: string
}

export default function AddressAutocomplete({ value, onChange, onResolved, className = "", placeholder = "Street address" }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const placesRef = useRef<any>(null)
  const tokenRef = useRef<any>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipNextFetch = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load the Places library once
  useEffect(() => {
    if (!hasMapsKey()) return
    loadGoogleMaps()
      .then(maps => maps.importLibrary("places"))
      .then(lib => {
        placesRef.current = lib
        tokenRef.current = new lib.AutocompleteSessionToken()
      })
      .catch(err => console.warn(err.message))
  }, [])

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  // Fetch suggestions (debounced)
  useEffect(() => {
    if (skipNextFetch.current) { skipNextFetch.current = false; return }
    const lib = placesRef.current
    if (!lib || value.trim().length < 3) { setSuggestions([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const { suggestions: results } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: value,
          sessionToken: tokenRef.current,
          includedRegionCodes: ["us"],
          locationRestriction: MANHATTAN_BOUNDS,
        })
        const list: Suggestion[] = (results || [])
          .filter((s: any) => s.placePrediction)
          .slice(0, 5)
          .map((s: any) => ({
            id: s.placePrediction.placeId,
            main: s.placePrediction.mainText?.toString() || s.placePrediction.text.toString(),
            secondary: s.placePrediction.secondaryText?.toString() || "",
            prediction: s.placePrediction,
          }))
        setSuggestions(list)
        setOpen(list.length > 0)
        setActive(-1)
      } catch (err: any) {
        console.warn("Places autocomplete failed:", err?.message)
      }
    }, 250)
  }, [value])

  async function select(s: Suggestion) {
    setOpen(false)
    try {
      const place = s.prediction.toPlace()
      await place.fetchFields({ fields: ["addressComponents", "location", "formattedAddress"] })
      const get = (type: string, short = false) => {
        const c = (place.addressComponents || []).find((c: any) => c.types.includes(type))
        return c ? (short ? c.shortText : c.longText) : ""
      }
      const street = [get("street_number"), get("route")].filter(Boolean).join(" ") || s.main
      skipNextFetch.current = true
      onChange(street)
      onResolved({
        street,
        city: get("locality") || get("sublocality_level_1") || "New York",
        state: get("administrative_area_level_1", true) || "NY",
        zip: get("postal_code"),
        location: { lat: place.location.lat(), lng: place.location.lng() },
        formatted: place.formattedAddress || "",
      })
      // A session ends when a place is selected — start a new one for billing
      if (placesRef.current) tokenRef.current = new placesRef.current.AutocompleteSessionToken()
    } catch (err: any) {
      console.warn("Could not load place details:", err?.message)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        className={className}
        placeholder={placeholder}
        value={value}
        autoComplete="street-address"
        onChange={e => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={e => {
          if (!open) return
          if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, suggestions.length - 1)) }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
          if (e.key === "Enter" && active >= 0) { e.preventDefault(); select(suggestions[active]) }
          if (e.key === "Escape") setOpen(false)
        }}
      />
      {open && (
        <ul className="absolute z-30 left-0 right-0 mt-2 bg-[#1C1C1E] border border-[#2B2B2E] rounded-xl overflow-hidden shadow-2xl">
          {suggestions.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => select(s)}
                className={`w-full text-left px-4 py-3 text-sm transition ${i === active ? "bg-[#2B2B2E]" : "hover:bg-[#2B2B2E]"}`}
              >
                <span className="text-[#E8E8EA]">{s.main}</span>
                {s.secondary && <span className="text-[#6b6b6b] ml-2">{s.secondary}</span>}
              </button>
            </li>
          ))}
          <li className="px-4 py-1.5 text-[10px] text-[#6b6b6b] text-right border-t border-[#2B2B2E]">powered by Google</li>
        </ul>
      )}
    </div>
  )
}
