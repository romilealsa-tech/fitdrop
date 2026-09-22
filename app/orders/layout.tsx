import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Your Orders",
  description: "Track your FitDrop orders and see your same-day delivery history.",
  path: "/orders",
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
