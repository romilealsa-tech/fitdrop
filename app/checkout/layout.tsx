import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Checkout",
  description: "Securely check out your FitDrop order and get it delivered in Manhattan today.",
  path: "/checkout",
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
