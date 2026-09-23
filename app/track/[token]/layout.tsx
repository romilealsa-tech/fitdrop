import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Track Your Delivery",
  description: "Follow your FitDrop order from the store to your door.",
  path: "/track",
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
