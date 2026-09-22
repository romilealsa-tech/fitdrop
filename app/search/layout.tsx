import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Search",
  description: "Search products across Zara, Uniqlo, H&M, Nike, COS, Mango and Marlow — delivered in Manhattan the same day.",
  path: "/search",
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
