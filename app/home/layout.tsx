import { pageMeta } from "../../lib/seo"

export const metadata = pageMeta({
  title: "Same-Day Fashion Delivery in Manhattan",
  description:
    "Shop Zara, Uniqlo, H&M, Nike, COS, Mango and Marlow on FitDrop and get your order delivered in Manhattan the same day. Delivery from $1.99.",
  path: "/home",
  og: {
    title: "Because Waiting Isn't Fashionable",
    subtitle: "Shop your favorite Manhattan stores — delivered the same day.",
  },
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
