import type { Metadata } from "next"
import { cache } from "react"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import { pageMeta } from "@/lib/seo"
import { STORE_BY_SLUG } from "@/lib/stores"
import { getProductImage } from "@/lib/images"

const getProduct = cache(async (id: string) => {
  if (!mongoose.isValidObjectId(id)) return null
  try {
    await connectDB()
    return (await Product.findById(id).lean()) as any
  } catch {
    return null
  }
})

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; id: string }> }
): Promise<Metadata> {
  const { slug, id } = await params
  const storeName = STORE_BY_SLUG[slug]?.name || slug
  const product = await getProduct(id)

  if (!product) {
    return pageMeta({
      title: `${storeName} — Same-Day Fashion Delivery`,
      description: `Shop ${storeName} on FitDrop with same-day delivery in Manhattan.`,
      path: `/stores/${slug}/${id}`,
    })
  }

  const desc = (product.description || "").trim()
  const description =
    `${product.name} from ${storeName}, ${product.price}. ` +
    (desc ? `${desc.replace(/\.$/, "")}. ` : "") +
    "Delivered in Manhattan the same day with FitDrop."

  return pageMeta({
    title: `${product.name} — ${storeName}`,
    description: description.slice(0, 160),
    path: `/stores/${slug}/${id}`,
    og: {
      title: product.name,
      subtitle: `${storeName} · ${product.price} · Delivered today`,
      image: getProductImage({ ...product, _id: String(product._id), slug }),
    },
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
