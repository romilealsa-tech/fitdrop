import type { Metadata } from "next"
import { pageMeta } from "@/lib/seo"

const label = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()).replace("Jackets And Coats", "Jackets & Coats")

export async function generateMetadata(
  { params }: { params: Promise<{ gender: string; subcategory: string }> }
): Promise<Metadata> {
  const { gender, subcategory } = await params
  const g = label(gender)
  const what = subcategory === "all" ? `All ${g}'s Fashion` : `${g}'s ${label(subcategory)}`

  return pageMeta({
    title: `${what} — Same-Day Delivery`,
    description: `Shop ${what.toLowerCase()} from Zara, Uniqlo, H&M, Nike, COS, Mango and more, delivered in Manhattan the same day with FitDrop.`,
    path: `/shop/${gender}/${subcategory}`,
    og: { title: what, subtitle: "From Manhattan's favorite stores — delivered today." },
  })
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
