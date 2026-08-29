import mongoose from "mongoose"

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: { type: Array, default: [] },
}, { timestamps: true })

export default mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema)
