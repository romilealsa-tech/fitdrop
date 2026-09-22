import Link from "next/link"
import { InfoPage, Section } from "../components/InfoPage"
import { StoreIcon, BagIcon, ScooterIcon } from "../components/Icons"
import { pageMeta } from "@/lib/seo"
import { MIN_DELIVERY_FEE } from "@/lib/stores"

export const metadata = pageMeta({
  title: "How It Works",
  description:
    "How FitDrop works: pick a Manhattan store, build your order, and a FitDrop driver brings it to your door the same day — often in 30 to 45 minutes.",
  path: "/how-it-works",
  og: { title: "How FitDrop Works", subtitle: "Pick a store. Build your order. Get it the same day." },
})

const STEPS = [
  {
    icon: StoreIcon,
    title: "Pick a store",
    text: "Browse Zara, Uniqlo, H&M, Nike, COS, Mango and Marlow. Use “Near Me” to see which stores are closest to you.",
  },
  {
    icon: BagIcon,
    title: "Build your order",
    text: "Choose sizes and colors, save favorites to your wishlist, and check out securely by card through Stripe.",
  },
  {
    icon: ScooterIcon,
    title: "Get it the same day",
    text: "A FitDrop driver picks your items up at the store and brings them straight to your door — typically in 20 to 50 minutes depending on the store and distance.",
  },
]

export default function HowItWorksPage() {
  return (
    <InfoPage
      eyebrow="How it works"
      title="Fashion, delivered today"
      intro="FitDrop connects you with the stores you already love in Manhattan and delivers your order the same day — no waiting a week for shipping."
    >
      <div className="grid sm:grid-cols-3 gap-4">
        {STEPS.map((s, i) => (
          <div key={s.title} className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-5">
            <div className="w-11 h-11 rounded-full bg-[#7EC8B8]/10 text-[#7EC8B8] flex items-center justify-center mb-4">
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-[#7EC8B8] font-bold mb-1">STEP {i + 1}</p>
            <h2 className="font-semibold mb-2">{s.title}</h2>
            <p className="text-sm text-[#8a8a8e] leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>

      <Section title="What does it cost?">
        <p>
          Each store shows its delivery fee before you order — starting at {MIN_DELIVERY_FEE}. Item prices are the
          store&apos;s prices. NYC sales tax is added at checkout.
        </p>
      </Section>

      <Section title="Where do you deliver?">
        <p>FitDrop currently delivers within Manhattan. More neighborhoods are coming soon.</p>
      </Section>

      <Section title="Questions?">
        <p>
          See <Link href="/shipping" className="text-[#7EC8B8] hover:underline">Shipping &amp; Delivery</Link>,{" "}
          <Link href="/returns" className="text-[#7EC8B8] hover:underline">Returns</Link>, or{" "}
          <Link href="/contact" className="text-[#7EC8B8] hover:underline">contact us</Link>.
        </p>
      </Section>

      <div className="pt-2">
        <Link href="/home#stores" className="bg-[#7EC8B8] text-[#0D0D0F] px-8 py-3 rounded-full font-bold hover:bg-[#6ab5a5] transition inline-block">
          Start shopping
        </Link>
      </div>
    </InfoPage>
  )
}
