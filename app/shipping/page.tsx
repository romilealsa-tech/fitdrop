import Link from "next/link"
import { InfoPage, Section, CONTACT_EMAIL } from "../components/InfoPage"
import { pageMeta } from "@/lib/seo"
import { STORES } from "@/lib/stores"

export const metadata = pageMeta({
  title: "Shipping & Delivery",
  description:
    "FitDrop delivery times, fees and coverage: same-day delivery across Manhattan, fees shown per store before you order.",
  path: "/shipping",
})

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="Help"
      title="Shipping & Delivery"
      intro="Every FitDrop order is delivered the same day by a local driver — no carriers, no tracking numbers, no waiting."
      updated="September 22, 2026"
    >
      <Section title="Delivery area">
        <p>We currently deliver to addresses in Manhattan. More neighborhoods are coming soon.</p>
      </Section>

      <Section title="Delivery times and fees by store">
        <div className="overflow-hidden rounded-xl border border-[#2B2B2E]">
          <table className="w-full text-sm">
            <thead className="bg-[#1C1C1E] text-[#8a8a8e] text-left">
              <tr><th className="px-4 py-2 font-medium">Store</th><th className="px-4 py-2 font-medium">Estimated time</th><th className="px-4 py-2 font-medium">Delivery fee</th></tr>
            </thead>
            <tbody>
              {STORES.map(s => (
                <tr key={s.slug} className="border-t border-[#2B2B2E]">
                  <td className="px-4 py-2 text-[#E8E8EA]">{s.name}</td>
                  <td className="px-4 py-2">{s.time}</td>
                  <td className="px-4 py-2 text-[#7EC8B8]">{s.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Times are estimates and can vary with traffic, weather and store preparation time.</p>
      </Section>

      <Section title="Tracking your order">
        <p>You can see your orders anytime on the <Link href="/orders" className="text-[#7EC8B8] hover:underline">Orders</Link> page.</p>
      </Section>

      <Section title="Missed deliveries">
        <p>Our driver will try to reach you on arrival. If we can&apos;t complete the delivery, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#7EC8B8] hover:underline">{CONTACT_EMAIL}</a> and we&apos;ll arrange next steps.
        </p>
      </Section>
    </InfoPage>
  )
}
