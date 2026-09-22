import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Order Confirmed",
  description: "Your FitDrop order is confirmed and on its way.",
  path: "/order",
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
