// Google Maps JavaScript API loader (client-side only).
// Needs NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local and in Vercel.
// APIs enabled on the key: "Maps JavaScript API" + "Places API (New)".
// Every map feature degrades gracefully when the key is missing.

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: any
    __fitdropMapsReady?: () => void
    gm_authFailure?: () => void
  }
}

export const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
export const hasMapsKey = () => MAPS_KEY.length > 0

let loader: Promise<any> | null = null

/** Loads the Maps JS API once and resolves with `window.google.maps`. */
export function loadGoogleMaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("Maps can only load in the browser"))
  if (!MAPS_KEY) return Promise.reject(new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"))
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps)

  if (!loader) {
    loader = new Promise((resolve, reject) => {
      window.__fitdropMapsReady = () => resolve(window.google.maps)
      // Google calls this when the key is invalid / not allowed on this domain
      window.gm_authFailure = () => console.error("Google Maps: API key rejected (check key restrictions).")
      const script = document.createElement("script")
      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_KEY)}` +
        `&v=weekly&loading=async&callback=__fitdropMapsReady`
      script.async = true
      script.onerror = () => {
        loader = null
        reject(new Error("Google Maps failed to load"))
      }
      document.head.appendChild(script)
    })
  }
  return loader
}

export type LatLng = { lat: number; lng: number }

/** Dark map style matching FitDrop's theme (#0D0D0F / teal #7EC8B8). */
export const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1C1C1E" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0D0D0F" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2B2B2E" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#333336" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a3a3e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0D0D0F" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
]

/** Free Google Maps deep link for turn-by-turn navigation (no API key needed). */
export function navigationUrl(destination: string | LatLng, origin?: string | LatLng) {
  const fmt = (p: string | LatLng) => (typeof p === "string" ? p : `${p.lat},${p.lng}`)
  const params = new URLSearchParams({ api: "1", destination: fmt(destination), travelmode: "driving" })
  if (origin) params.set("origin", fmt(origin))
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

/** Manhattan ZIP codes are 10001–10282 (plus a few PO-box-only codes). */
export function isManhattanZip(zip: string) {
  const n = parseInt((zip || "").slice(0, 5), 10)
  return n >= 10001 && n <= 10282
}
