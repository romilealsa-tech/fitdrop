import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

const ProductSchema = new mongoose.Schema({
  store: String, slug: String, name: String,
  price: String, tag: String, inStock: Boolean, category: String,
})

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema)

const products = [
  { store: "Zara", slug: "zara", name: "Oversized Blazer", price: "$89.99", tag: "New", inStock: true, category: "Fashion & Basics" },
  { store: "Zara", slug: "zara", name: "Wide Leg Trousers", price: "$49.99", tag: "Trending", inStock: true, category: "Fashion & Basics" },
  { store: "Zara", slug: "zara", name: "Ribbed Knit Top", price: "$29.99", tag: "", inStock: true, category: "Fashion & Basics" },
  { store: "Zara", slug: "zara", name: "Leather Mini Skirt", price: "$69.99", tag: "New", inStock: true, category: "Fashion & Basics" },
  { store: "Zara", slug: "zara", name: "Trench Coat", price: "$129.99", tag: "Trending", inStock: true, category: "Fashion & Basics" },
  { store: "Zara", slug: "zara", name: "Satin Slip Dress", price: "$59.99", tag: "", inStock: true, category: "Fashion & Basics" },
  { store: "Uniqlo", slug: "uniqlo", name: "Heattech Turtleneck", price: "$34.99", tag: "Bestseller", inStock: true, category: "Essentials & Comfort" },
  { store: "Uniqlo", slug: "uniqlo", name: "Ultra Light Down Jacket", price: "$79.99", tag: "New", inStock: true, category: "Essentials & Comfort" },
  { store: "Uniqlo", slug: "uniqlo", name: "Relaxed Fit Chinos", price: "$44.99", tag: "", inStock: true, category: "Essentials & Comfort" },
  { store: "Uniqlo", slug: "uniqlo", name: "Fleece Pullover", price: "$39.99", tag: "Trending", inStock: true, category: "Essentials & Comfort" },
  { store: "Uniqlo", slug: "uniqlo", name: "Cotton Crew T-Shirt", price: "$14.99", tag: "", inStock: true, category: "Essentials & Comfort" },
  { store: "Uniqlo", slug: "uniqlo", name: "Wide Fit Jeans", price: "$49.99", tag: "New", inStock: true, category: "Essentials & Comfort" },
  { store: "H&M", slug: "hm", name: "Cargo Pants", price: "$39.99", tag: "Trending", inStock: true, category: "Trends & Streetwear" },
  { store: "H&M", slug: "hm", name: "Graphic Hoodie", price: "$34.99", tag: "New", inStock: true, category: "Trends & Streetwear" },
  { store: "H&M", slug: "hm", name: "Denim Jacket", price: "$49.99", tag: "", inStock: true, category: "Trends & Streetwear" },
  { store: "H&M", slug: "hm", name: "Bodycon Dress", price: "$29.99", tag: "Trending", inStock: true, category: "Trends & Streetwear" },
  { store: "H&M", slug: "hm", name: "Oversized Tee", price: "$19.99", tag: "", inStock: true, category: "Trends & Streetwear" },
  { store: "H&M", slug: "hm", name: "Pleated Midi Skirt", price: "$34.99", tag: "New", inStock: true, category: "Trends & Streetwear" },
  { store: "Nike", slug: "nike", name: "Air Max Pulse", price: "$149.99", tag: "New", inStock: true, category: "Sport & Lifestyle" },
  { store: "Nike", slug: "nike", name: "Tech Fleece Hoodie", price: "$109.99", tag: "Trending", inStock: true, category: "Sport & Lifestyle" },
  { store: "Nike", slug: "nike", name: "Dri-FIT T-Shirt", price: "$34.99", tag: "", inStock: true, category: "Sport & Lifestyle" },
  { store: "Nike", slug: "nike", name: "Running Shorts", price: "$44.99", tag: "", inStock: true, category: "Sport & Lifestyle" },
  { store: "Nike", slug: "nike", name: "Air Force 1", price: "$109.99", tag: "Bestseller", inStock: true, category: "Sport & Lifestyle" },
  { store: "Nike", slug: "nike", name: "Windrunner Jacket", price: "$129.99", tag: "New", inStock: true, category: "Sport & Lifestyle" },
  { store: "COS", slug: "cos", name: "Structured Blazer", price: "$179.99", tag: "New", inStock: true, category: "Minimal & Modern" },
  { store: "COS", slug: "cos", name: "Wide Leg Pants", price: "$89.99", tag: "", inStock: true, category: "Minimal & Modern" },
  { store: "COS", slug: "cos", name: "Merino Knit", price: "$99.99", tag: "Trending", inStock: true, category: "Minimal & Modern" },
  { store: "COS", slug: "cos", name: "Oversized Coat", price: "$249.99", tag: "New", inStock: true, category: "Minimal & Modern" },
  { store: "COS", slug: "cos", name: "Silk Blouse", price: "$119.99", tag: "", inStock: true, category: "Minimal & Modern" },
  { store: "COS", slug: "cos", name: "Tailored Shorts", price: "$79.99", tag: "", inStock: true, category: "Minimal & Modern" },
  { store: "Mango", slug: "mango", name: "Linen Blazer", price: "$99.99", tag: "New", inStock: true, category: "Mediterranean Style" },
  { store: "Mango", slug: "mango", name: "Floral Midi Dress", price: "$69.99", tag: "Trending", inStock: true, category: "Mediterranean Style" },
  { store: "Mango", slug: "mango", name: "Leather Tote", price: "$79.99", tag: "", inStock: true, category: "Mediterranean Style" },
  { store: "Mango", slug: "mango", name: "Striped Knit", price: "$49.99", tag: "", inStock: true, category: "Mediterranean Style" },
  { store: "Mango", slug: "mango", name: "Wide Brim Hat", price: "$39.99", tag: "New", inStock: true, category: "Mediterranean Style" },
  { store: "Mango", slug: "mango", name: "Linen Trousers", price: "$59.99", tag: "Trending", inStock: true, category: "Mediterranean Style" },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  await Product.deleteMany({})
  await Product.insertMany(products)
  console.log("DONE - seeded " + products.length + " products")
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.log("ERROR: " + err.message)
  process.exit(1)
})