"use client"
// Dark-themed Google Map showing the store (pickup), the customer (drop-off)
// and, when available, the driver's live position.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react"
import { loadGoogleMaps, hasMapsKey, DARK_MAP_STYLE, type LatLng } from "@/lib/googleMaps"

type Props = {
  pickup?: LatLng | null
  dropoff?: LatLng | null
  driver?: LatLng | null
  pickupLabel?: string
  className?: string
}

const dot = (maps: any, color: string, scale = 8) => ({
  path: maps.SymbolPath.CIRCLE,
  scale,
  fillColor: color,
  fillOpacity: 1,
  strokeColor: "#0D0D0F",
  strokeWeight: 3,
})

export default function DeliveryMap({ pickup, dropoff, driver, pickupLabel = "Store", className = "h-64" }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markers = useRef<Record<string, any>>({})
  const lineRef = useRef<any>(null)
  const fittedRef = useRef(false)
  const [failed, setFailed] = useState(!hasMapsKey())

  // Create the map once
  useEffect(() => {
    if (!hasMapsKey() || !el.current) return
    let cancelled = false
    loadGoogleMaps()
      .then(async maps => {
        await maps.importLibrary("maps")
        if (cancelled || !el.current) return
        mapRef.current = new maps.Map(el.current, {
          center: pickup || dropoff || { lat: 40.758, lng: -73.9855 },
          zoom: 13,
          styles: DARK_MAP_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          backgroundColor: "#0D0D0F",
        })
        draw()
      })
      .catch(() => setFailed(true))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Redraw markers whenever positions change
  useEffect(() => { draw() })

  function place(key: string, pos: LatLng | null | undefined, icon: any, title: string) {
    const maps = window.google?.maps
    const map = mapRef.current
    if (!maps || !map) return
    if (!pos) {
      markers.current[key]?.setMap(null)
      delete markers.current[key]
      return
    }
    if (markers.current[key]) markers.current[key].setPosition(pos)
    else markers.current[key] = new maps.Marker({ map, position: pos, icon, title, zIndex: key === "driver" ? 10 : 1 })
  }

  function draw() {
    const maps = window.google?.maps
    const map = mapRef.current
    if (!maps || !map) return

    place("pickup", pickup, dot(maps, "#7EC8B8", 9), pickupLabel)
    place("dropoff", dropoff, dot(maps, "#E8E8EA", 9), "Delivery address")
    place("driver", driver, dot(maps, "#F5C542", 10), "Your driver")

    // Dashed line store → customer
    if (pickup && dropoff) {
      const path = [pickup, dropoff]
      if (lineRef.current) lineRef.current.setPath(path)
      else lineRef.current = new maps.Polyline({
        map, path, strokeOpacity: 0,
        icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 0.8, strokeColor: "#7EC8B8", scale: 3 }, offset: "0", repeat: "14px" }],
      })
    }

    // Fit all points the first time (don't fight the user's zoom afterwards)
    const points = [pickup, dropoff, driver].filter(Boolean) as LatLng[]
    if (!fittedRef.current && points.length > 0) {
      if (points.length === 1) { map.setCenter(points[0]); map.setZoom(15) }
      else {
        const bounds = new maps.LatLngBounds()
        points.forEach(p => bounds.extend(p))
        map.fitBounds(bounds, 48)
      }
      fittedRef.current = true
    }
  }

  if (failed) return null

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-[#2B2B2E] bg-[#1C1C1E] ${className}`}>
      <div ref={el} className="absolute inset-0" />
      <div className="absolute bottom-2 left-2 flex gap-3 bg-[#0D0D0F]/85 rounded-full px-3 py-1.5 text-[11px] text-[#b5b5b8]">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7EC8B8]" />{pickupLabel}</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E8E8EA]" />Drop-off</span>
        {driver && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F5C542]" />Driver</span>}
      </div>
    </div>
  )
}
