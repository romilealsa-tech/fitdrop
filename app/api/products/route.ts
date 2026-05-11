import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const slug = req.nextUrl.searchParams.get("slug")
    const query = slug ? { slug, inStock: true } : { inStock: true }
    const products = await Product.find(query).lean()
    return NextResponse.json({ products })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}