import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

const ProductSchema = new mongoose.Schema({
  store: String, slug: String, name: String,
  price: String, tag: String, inStock: Boolean,
  category: String, description: String,
  sizes: [String], colors: [String], images: [String],
})

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema)

const products = [
  // ZARA
  { store: "Zara", slug: "zara", name: "Oversized Blazer", price: "$89.99", tag: "New", inStock: true, category: "Fashion & Basics", description: "A sophisticated oversized blazer crafted from a premium blend fabric. Features a relaxed silhouette with structured shoulders for an effortlessly chic look.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Camel", "White"] },
  { store: "Zara", slug: "zara", name: "Wide Leg Trousers", price: "$49.99", tag: "Trending", inStock: true, category: "Fashion & Basics", description: "High-waisted wide leg trousers with a fluid drape. Perfect for both office and evening wear.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Cream", "Navy"] },
  { store: "Zara", slug: "zara", name: "Ribbed Knit Top", price: "$29.99", tag: "", inStock: true, category: "Fashion & Basics", description: "A fitted ribbed knit top with a crew neck. Versatile wardrobe essential that pairs with everything.", sizes: ["XS", "S", "M", "L"], colors: ["Black", "White", "Brown", "Grey"] },
  { store: "Zara", slug: "zara", name: "Leather Mini Skirt", price: "$69.99", tag: "New", inStock: true, category: "Fashion & Basics", description: "Faux leather mini skirt with a sleek finish. A bold statement piece for any occasion.", sizes: ["XS", "S", "M", "L"], colors: ["Black", "Burgundy"] },
  { store: "Zara", slug: "zara", name: "Trench Coat", price: "$129.99", tag: "Trending", inStock: true, category: "Fashion & Basics", description: "Classic double-breasted trench coat with a belted waist. Timeless outerwear crafted for modern wardrobes.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Camel", "Black", "Beige"] },
  { store: "Zara", slug: "zara", name: "Satin Slip Dress", price: "$59.99", tag: "", inStock: true, category: "Fashion & Basics", description: "Elegant satin slip dress with adjustable straps and a bias cut for a luxurious drape.", sizes: ["XS", "S", "M", "L"], colors: ["Black", "Champagne", "Dusty Rose"] },
  // UNIQLO
  { store: "Uniqlo", slug: "uniqlo", name: "Heattech Turtleneck", price: "$34.99", tag: "Bestseller", inStock: true, category: "Essentials & Comfort", description: "Uniqlo's iconic Heattech technology in a slim turtleneck silhouette. Retains body heat while staying lightweight and breathable.", sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["Black", "White", "Navy", "Grey", "Red"] },
  { store: "Uniqlo", slug: "uniqlo", name: "Ultra Light Down Jacket", price: "$79.99", tag: "New", inStock: true, category: "Essentials & Comfort", description: "Packable down jacket that folds into its own pocket. Exceptional warmth without the bulk.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Navy", "Olive", "Red"] },
  { store: "Uniqlo", slug: "uniqlo", name: "Relaxed Fit Chinos", price: "$44.99", tag: "", inStock: true, category: "Essentials & Comfort", description: "Comfortable relaxed fit chinos made from soft cotton blend. Versatile enough for work or weekend.", sizes: ["28", "30", "32", "34", "36"], colors: ["Beige", "Navy", "Olive", "Black"] },
  { store: "Uniqlo", slug: "uniqlo", name: "Fleece Pullover", price: "$39.99", tag: "Trending", inStock: true, category: "Essentials & Comfort", description: "Cozy fleece pullover with a classic fit. Perfect layering piece for cooler days.", sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["Grey", "Navy", "Black", "Brown"] },
  { store: "Uniqlo", slug: "uniqlo", name: "Cotton Crew T-Shirt", price: "$14.99", tag: "", inStock: true, category: "Essentials & Comfort", description: "100% premium cotton crew neck tee. The ultimate wardrobe basic in a relaxed fit.", sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["White", "Black", "Grey", "Navy", "Beige"] },
  { store: "Uniqlo", slug: "uniqlo", name: "Wide Fit Jeans", price: "$49.99", tag: "New", inStock: true, category: "Essentials & Comfort", description: "Wide leg jeans with a high rise waist. Made from soft stretch denim for all-day comfort.", sizes: ["24", "26", "28", "30", "32"], colors: ["Light Blue", "Dark Blue", "Black"] },
  // H&M
  { store: "H&M", slug: "hm", name: "Cargo Pants", price: "$39.99", tag: "Trending", inStock: true, category: "Trends & Streetwear", description: "Relaxed fit cargo pants with multiple pockets. Street-ready style with practical utility.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Khaki", "Black", "Grey", "Olive"] },
  { store: "H&M", slug: "hm", name: "Graphic Hoodie", price: "$34.99", tag: "New", inStock: true, category: "Trends & Streetwear", description: "Oversized graphic hoodie in soft fleece fabric. Bold print with a relaxed streetwear aesthetic.", sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["Black", "White", "Grey"] },
  { store: "H&M", slug: "hm", name: "Denim Jacket", price: "$49.99", tag: "", inStock: true, category: "Trends & Streetwear", description: "Classic denim jacket with a slightly oversized fit. A timeless layer for any casual outfit.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Light Blue", "Dark Blue", "Black"] },
  { store: "H&M", slug: "hm", name: "Bodycon Dress", price: "$29.99", tag: "Trending", inStock: true, category: "Trends & Streetwear", description: "Stretchy bodycon dress with a figure-hugging silhouette. Perfect for a night out.", sizes: ["XS", "S", "M", "L"], colors: ["Black", "Red", "Nude"] },
  { store: "H&M", slug: "hm", name: "Oversized Tee", price: "$19.99", tag: "", inStock: true, category: "Trends & Streetwear", description: "Dropped shoulder oversized tee in cotton jersey. The ultimate relaxed everyday essential.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["White", "Black", "Grey", "Beige"] },
  { store: "H&M", slug: "hm", name: "Pleated Midi Skirt", price: "$34.99", tag: "New", inStock: true, category: "Trends & Streetwear", description: "Flowy pleated midi skirt with an elastic waistband. Feminine and effortless for any occasion.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Pink", "Sage Green"] },
  // NIKE
  { store: "Nike", slug: "nike", name: "Air Max Pulse", price: "$149.99", tag: "New", inStock: true, category: "Sport & Lifestyle", description: "The Air Max Pulse draws inspiration from the London music scene. Textile upper with visible Air cushioning for all-day comfort.", sizes: ["6", "7", "8", "9", "10", "11", "12"], colors: ["White/Black", "Black/Grey", "Triple Black"] },
  { store: "Nike", slug: "nike", name: "Tech Fleece Hoodie", price: "$109.99", tag: "Trending", inStock: true, category: "Sport & Lifestyle", description: "Nike Tech Fleece provides lightweight warmth with a modern athletic look. Tapered fit with zip pockets.", sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["Black", "Grey", "Navy", "Dark Red"] },
  { store: "Nike", slug: "nike", name: "Dri-FIT T-Shirt", price: "$34.99", tag: "", inStock: true, category: "Sport & Lifestyle", description: "Nike Dri-FIT technology moves sweat away from skin for quicker evaporation. Lightweight and breathable.", sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["Black", "White", "Grey", "Blue"] },
  { store: "Nike", slug: "nike", name: "Running Shorts", price: "$44.99", tag: "", inStock: true, category: "Sport & Lifestyle", description: "Lightweight running shorts with built-in briefs and side pockets. Designed for high-performance movement.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Navy", "Grey"] },
  { store: "Nike", slug: "nike", name: "Air Force 1", price: "$109.99", tag: "Bestseller", inStock: true, category: "Sport & Lifestyle", description: "The radiance lives on in the Nike Air Force 1. A hoops icon turned street essential with premium leather upper.", sizes: ["6", "7", "8", "9", "10", "11", "12"], colors: ["White", "Black", "Triple White"] },
  { store: "Nike", slug: "nike", name: "Windrunner Jacket", price: "$129.99", tag: "New", inStock: true, category: "Sport & Lifestyle", description: "The iconic Windrunner design updated with modern fabrication. Wind-resistant with a packable hood.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black/White", "Navy/Red", "Grey"] },
  // COS
  { store: "COS", slug: "cos", name: "Structured Blazer", price: "$179.99", tag: "New", inStock: true, category: "Minimal & Modern", description: "Precisely tailored blazer with clean lines and a structured silhouette. Crafted from a premium wool blend.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Ivory", "Camel"] },
  { store: "COS", slug: "cos", name: "Wide Leg Pants", price: "$89.99", tag: "", inStock: true, category: "Minimal & Modern", description: "Fluid wide leg trousers with a high waist and clean front. Minimalist design in premium fabric.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Ecru", "Slate Grey"] },
  { store: "COS", slug: "cos", name: "Merino Knit", price: "$99.99", tag: "Trending", inStock: true, category: "Minimal & Modern", description: "Fine merino wool knit with a relaxed boxy fit. Naturally temperature-regulating and incredibly soft.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Oatmeal", "Black", "Forest Green", "Burgundy"] },
  { store: "COS", slug: "cos", name: "Oversized Coat", price: "$249.99", tag: "New", inStock: true, category: "Minimal & Modern", description: "Voluminous oversized coat in a premium wool blend. Architectural silhouette with minimal detailing.", sizes: ["XS", "S", "M", "L"], colors: ["Camel", "Black", "Grey"] },
  { store: "COS", slug: "cos", name: "Silk Blouse", price: "$119.99", tag: "", inStock: true, category: "Minimal & Modern", description: "Relaxed silk blouse with a fluid drape and subtle sheen. Effortless elegance for any occasion.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["White", "Black", "Dusty Blue"] },
  { store: "COS", slug: "cos", name: "Tailored Shorts", price: "$79.99", tag: "", inStock: true, category: "Minimal & Modern", description: "Precisely cut tailored shorts with a mid-thigh length. Clean minimal aesthetic in premium fabric.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Ecru", "Navy"] },
  // MANGO
  { store: "Mango", slug: "mango", name: "Linen Blazer", price: "$99.99", tag: "New", inStock: true, category: "Mediterranean Style", description: "Relaxed linen blazer perfect for warm weather. Breathable fabric with a sophisticated unstructured fit.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["White", "Beige", "Navy", "Black"] },
  { store: "Mango", slug: "mango", name: "Floral Midi Dress", price: "$69.99", tag: "Trending", inStock: true, category: "Mediterranean Style", description: "Romantic floral print midi dress with a wrap silhouette. Perfect for summer occasions.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Blue Floral", "Pink Floral", "Black Floral"] },
  { store: "Mango", slug: "mango", name: "Leather Tote", price: "$79.99", tag: "", inStock: true, category: "Mediterranean Style", description: "Spacious leather tote with interior pockets and magnetic closure. Effortlessly stylish everyday bag.", sizes: ["One Size"], colors: ["Black", "Tan", "White"] },
  { store: "Mango", slug: "mango", name: "Striped Knit", price: "$49.99", tag: "", inStock: true, category: "Mediterranean Style", description: "Classic striped knit top with a relaxed fit. Coastal-inspired style for everyday wear.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Navy/White", "Black/White", "Red/White"] },
  { store: "Mango", slug: "mango", name: "Wide Brim Hat", price: "$39.99", tag: "New", inStock: true, category: "Mediterranean Style", description: "Woven wide brim hat with UV protection. The ultimate summer accessory.", sizes: ["One Size"], colors: ["Natural", "Black", "Camel"] },
  { store: "Mango", slug: "mango", name: "Linen Trousers", price: "$59.99", tag: "Trending", inStock: true, category: "Mediterranean Style", description: "Breathable linen trousers with a relaxed straight leg. Easy Mediterranean style for warm days.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["White", "Beige", "Black", "Sage"] },
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