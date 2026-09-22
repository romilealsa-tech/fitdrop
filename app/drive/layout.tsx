import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Become a Delivery Driver in Manhattan",
  description: "Become a FitDrop delivery driver in Manhattan. Flexible hours, same-day fashion deliveries — apply in minutes.",
  path: "/drive",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
