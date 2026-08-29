// Seeds the "Marlow" demo store only. Safe to re-run: it only ever
// touches products where slug === "marlow", never the real store data.
import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

const ProductSchema = new mongoose.Schema({
  store: String, slug: String, name: String,
  price: String, tag: String, inStock: Boolean,
  category: String, description: String,
  sizes: [String], colors: [String], images: [String],
  gender: String, subcategory: String,
})

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema)

const products = [
  // MARLOW WOMEN
  { store: "Marlow", slug: "marlow", gender: "Women", subcategory: "Tops", name: "Studio Rib Tank", price: "$38.00", tag: "New", inStock: true, category: "Elevated Everyday", description: "Second-skin ribbed tank in a soft modal blend, cut for movement.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Ecru", "Clay"] },
  { store: "Marlow", slug: "marlow", gender: "Women", subcategory: "Trousers", name: "Fluid Tailored Pant", price: "$98.00", tag: "Bestseller", inStock: true, category: "Elevated Everyday", description: "A wide-leg trouser with a fluid drape that moves from desk to dinner.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Black", "Stone", "Espresso"] },
  { store: "Marlow", slug: "marlow", gender: "Women", subcategory: "Jackets & Coats", name: "Cloud Wool Overcoat", price: "$228.00", tag: "New", inStock: true, category: "Elevated Everyday", description: "An oversized wool coat with a soft shoulder and interior belt.", sizes: ["XS", "S", "M", "L"], colors: ["Camel", "Black", "Grey Melange"] },
  { store: "Marlow", slug: "marlow", gender: "Women", subcategory: "Dresses", name: "Column Slip Dress", price: "$88.00", tag: "Trending", inStock: true, category: "Elevated Everyday", description: "A bias-cut slip dress in a heavyweight satin that skims the body.", sizes: ["XS", "S", "M", "L"], colors: ["Black", "Champagne", "Ink"] },
  { store: "Marlow", slug: "marlow", gender: "Women", subcategory: "Tops", name: "Featherweight Knit", price: "$68.00", tag: "", inStock: true, category: "Elevated Everyday", description: "An ultrafine merino crewneck knit that layers without bulk.", sizes: ["XS", "S", "M", "L", "XL"], colors: ["Oatmeal", "Black", "Sage"] },
  { store: "Marlow", slug: "marlow", gender: "Women", subcategory: "Bags", name: "Structured Day Tote", price: "$148.00", tag: "New", inStock: true, category: "Elevated Everyday", description: "A clean-lined leather tote sized for a laptop and everyday essentials.", sizes: ["One Size"], colors: ["Black", "Cognac"] },
  // MARLOW MEN
  { store: "Marlow", slug: "marlow", gender: "Men", subcategory: "Tops", name: "Pima Crew Tee", price: "$42.00", tag: "Bestseller", inStock: true, category: "Elevated Everyday", description: "A heavyweight Pima cotton tee with a boxier, modern block.", sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black", "White", "Olive"] },
  { store: "Marlow", slug: "marlow", gender: "Men", subcategory: "Trousers", name: "Relaxed Wool Trouser", price: "$118.00", tag: "New", inStock: true, category: "Elevated Everyday", description: "A tapered wool trouser with a soft, relaxed seat and clean front.", sizes: ["28", "30", "32", "34", "36"], colors: ["Charcoal", "Black", "Stone"] },
  { store: "Marlow", slug: "marlow", gender: "Men", subcategory: "Jackets & Coats", name: "Waxed Field Jacket", price: "$188.00", tag: "Trending", inStock: true, category: "Elevated Everyday", description: "A waxed-cotton field jacket built for city weather.", sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Olive", "Black"] },
  { store: "Marlow", slug: "marlow", gender: "Men", subcategory: "Tops", name: "Merino Half-Zip", price: "$98.00", tag: "New", inStock: true, category: "Elevated Everyday", description: "A fine-gauge merino half-zip that layers cleanly under a jacket.", sizes: ["S", "M", "L", "XL"], colors: ["Navy", "Black", "Oatmeal"] },
  { store: "Marlow", slug: "marlow", gender: "Men", subcategory: "Shoes", name: "Court Leather Sneaker", price: "$128.00", tag: "", inStock: true, category: "Elevated Everyday", description: "A minimal leather sneaker with a cupsole built for all-day wear.", sizes: ["8", "9", "10", "11", "12"], colors: ["White", "Black"] },
  { store: "Marlow", slug: "marlow", gender: "Men", subcategory: "Accessories", name: "Full-Grain Belt", price: "$58.00", tag: "", inStock: true, category: "Elevated Everyday", description: "A full-grain leather belt with a matte brushed buckle.", sizes: ["S", "M", "L", "XL"], colors: ["Black", "Cognac"] },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  await Product.deleteMany({ slug: "marlow" })
  await Product.insertMany(products)
  console.log("DONE - seeded " + products.length + " Marlow products")
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.log("ERROR: " + err.message)
  process.exit(1)
})
