import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { requireAdmin } from "@/lib/adminAuth"
import { STORE_CONFIGS } from "@/lib/storeConfig"

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await connectDB()
    const { slug, accessToken } = await req.json()

    if (!slug || !accessToken) {
      return NextResponse.json({ error: "Slug and access token required" }, { status: 400 })
    }

    const config = STORE_CONFIGS[slug]
    if (!config) {
      return NextResponse.json({ error: "Unknown store" }, { status: 400 })
    }

    // Fetch products from Shopify
    const res = await fetch(
      `https://${config.domain}/admin/api/2024-01/products.json?limit=250`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from Shopify" }, { status: 400 })
    }

    const data = await res.json()
    const shopifyProducts = data.products || []

    // Delete existing products for this store
    await Product.deleteMany({ slug })

    // Insert synced products
    const products = shopifyProducts.map((p: any) => ({
      name: p.title,
      price: `$${p.variants[0]?.price || "0.00"}`,
      slug,
      store: config.storeName,
      category: p.product_type || "Fashion",
      tag: p.tags?.split(",")[0]?.trim() || "",
      inStock: p.variants[0]?.inventory_quantity > 0,
      shopify_product_id: p.id,
    }))

    await Product.insertMany(products)

    return NextResponse.json({
      success: true,
      synced: products.length,
      store: config.storeName,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}