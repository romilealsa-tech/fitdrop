import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Your Cart",
  description: "Review the items in your FitDrop cart before checking out for same-day delivery in Manhattan.",
  path: "/cart",
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
