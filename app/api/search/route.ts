import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const q = req.nextUrl.searchParams.get("q") || ""

    if (!q.trim()) return NextResponse.json({ results: [] })

    const results = await Product.find({
      inStock: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { store: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { subcategory: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tag: { $regex: q, $options: "i" } },
      ]
    }).limit(10).lean()

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}