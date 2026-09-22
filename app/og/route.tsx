// Generates the 1200x630 share-preview image used by og:image / twitter:image.
// Usage: /og?title=Zara&subtitle=Same-day%20delivery&image=<unsplash or shopify url>
import { ImageResponse } from "next/og"

const ALLOWED_IMAGE_HOSTS = ["images.unsplash.com", "cdn.shopify.com"]

function safeImage(raw: string | null) {
  if (!raw) return null
  try {
    const url = new URL(raw)
    return url.protocol === "https:" && ALLOWED_IMAGE_HOSTS.includes(url.hostname) ? url.toString() : null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = (searchParams.get("title") || "FitDrop").slice(0, 80)
  const subtitle = (searchParams.get("subtitle") || "Same-day fashion delivery in Manhattan").slice(0, 140)
  const image = safeImage(searchParams.get("image"))

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0D0D0F", color: "#E8E8EA" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 64px" }}>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, letterSpacing: 6 }}>FitDrop</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 22, color: "#7EC8B8", letterSpacing: 4, textTransform: "uppercase", marginBottom: 20 }}>
              Fashion. Delivered.
            </div>
            <div style={{ display: "flex", fontSize: image ? 64 : 76, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
            <div style={{ display: "flex", fontSize: 28, color: "#9a9a9e", marginTop: 24, lineHeight: 1.3 }}>{subtitle}</div>
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#6b6b6b" }}>shopfitdrop.com</div>
        </div>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} width={480} height={630} style={{ width: 480, height: 630, objectFit: "cover" }} alt="" />
        )}
        <div style={{ position: "absolute", left: 0, bottom: 0, width: image ? 720 : 1200, height: 8, background: "#7EC8B8", display: "flex" }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" },
    }
  )
}
