import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"

// Map Shopify store domains to FIT DROP slugs
const STORE_MAP: Record<string, string> = {
  "zara-fitdrop.myshopify.com":   "zara",
  "uniqlo-fitdrop.myshopify.com": "uniqlo",
  "hm-fitdrop.myshopify.com":     "hm",
  "nike-fitdrop.myshopify.com":   "nike",
  "cos-fitdrop.myshopify.com":    "cos",
  "mango-fitdrop.myshopify.com":  "mango",
}

/**
 * Verifies a Shopify webhook actually came from Shopify by checking the
 * X-Shopify-Hmac-SHA256 header against an HMAC of the raw request body,
 * signed with SHOPIFY_WEBHOOK_SECRET (set this in Shopify's webhook config
 * and in Vercel's environment variables — same secret in both places).
 *
 * Must be computed against the raw, unparsed body — Shopify signs the exact
 * bytes it sent, so parsing to JSON first (which can reorder/reformat)
 * would make the signature never match.
 */
function isValidShopifyWebhook(rawBody: string, hmacHeader: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret || !hmacHeader) return false

  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64")

  const digestBuffer = Buffer.from(digest)
  const headerBuffer = Buffer.from(hmacHeader)
  if (digestBuffer.length !== headerBuffer.length) return false

  // timingSafeEqual instead of === to avoid leaking timing info that could
  // help an attacker guess a valid signature byte-by-byte.
  return crypto.timingSafeEqual(digestBuffer, headerBuffer)
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256")

    if (!isValidShopifyWebhook(rawBody, hmacHeader)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
    }

    await connectDB()

    const shop = req.headers.get("x-shopify-shop-domain") || ""
    const topic = req.headers.get("x-shopify-topic") || ""
    const slug = STORE_MAP[shop]

    if (!slug) {
      return NextResponse.json({ error: "Unknown store" }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    // Handle inventory level updates
    if (topic === "inventory_levels/update") {
      const { inventory_item_id, available } = body
      await Product.findOneAndUpdate(
        { shopify_inventory_id: inventory_item_id, slug },
        { inStock: available > 0 }
      )
    }

    // Handle product updates (price, title changes)
    if (topic === "products/update") {
      const { title, variants } = body
      const price = variants?.[0]?.price
      if (price) {
        await Product.findOneAndUpdate(
          { name: title, slug },
          { price: `$${price}`, inStock: variants[0].inventory_quantity > 0 }
        )
      }
    }

    // Handle product creation
    if (topic === "products/create") {
      const { title, variants, product_type } = body
      const price = variants?.[0]?.price
      await Product.create({
        name: title,
        price: `$${price}`,
        slug,
        store: slug.charAt(0).toUpperCase() + slug.slice(1),
        category: product_type || "Fashion",
        tag: "",
        inStock: variants?.[0]?.inventory_quantity > 0,
      })
    }

    // Handle product deletion
    if (topic === "products/delete") {
      await Product.findOneAndDelete({ shopify_product_id: body.id, slug })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
