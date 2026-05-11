import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema({
  store: { type: String, required: true },
  slug: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: String, required: true },
  tag: { type: String, default: "" },
  inStock: { type: Boolean, default: true },
  category: { type: String, default: "" },
}, { timestamps: true })

export default mongoose.models.Product || mongoose.model("Product", ProductSchema)