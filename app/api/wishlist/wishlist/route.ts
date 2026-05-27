import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import mongoose from "mongoose"

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: { type: Array, default: [] },
}, { timestamps: true })

const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema)

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const userId = req.nextUrl.searchParams.get("userId")
    if (!userId) return NextResponse.json({ items: [] })
    const wishlist = await Wishlist.findOne({ userId })
    return NextResponse.json({ items: wishlist?.items || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { userId, items } = await req.json()
    if (!userId) return NextResponse.json({ error: "No userId" }, { status: 400 })
    await Wishlist.findOneAndUpdate(
      { userId },
      { items },
      { upsert: true, new: true }
    )
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}