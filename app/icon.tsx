// Site icon (browser tab / bookmarks) + PWA icons for the driver app.
// URLs: /icon/32, /icon/192, /icon/512
import { ImageResponse } from "next/og"
import { BrandIcon } from "@/lib/brandIcon"

const SIZES = [32, 192, 512]

export function generateImageMetadata() {
  return SIZES.map(s => ({ id: String(s), size: { width: s, height: s }, contentType: "image/png" }))
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const size = Number(await id) || 32
  return new ImageResponse(<BrandIcon size={size} />, { width: size, height: size })
}
