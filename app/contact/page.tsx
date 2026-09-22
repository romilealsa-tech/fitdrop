import Link from "next/link"
import { InfoPage, Section, CONTACT_EMAIL } from "../components/InfoPage"
import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Contact Us",
  description: "Get in touch with FitDrop for order help, store partnerships, press or driver questions.",
  path: "/contact",
})

const CARDS = [
  { title: "Order help", text: "Questions about an order, a delivery or a return.", subject: "Order help" },
  { title: "Partner your store", text: "Want your brand on FitDrop? Let's talk about same-day delivery for your store.", subject: "Store partnership" },
  { title: "Press & everything else", text: "Media, collaborations or general questions.", subject: "Hello FitDrop" },
]

export default function ContactPage() {
  return (
    <InfoPage eyebrow="Help" title="Contact Us" intro="We're a small team and we read every message.">
      <div className="grid sm:grid-cols-3 gap-4">
        {CARDS.map(c => (
          <a
            key={c.title}
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(c.subject)}`}
            className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl p-5 hover:border-[#7EC8B8] transition block"
          >
            <h2 className="font-semibold mb-2">{c.title}</h2>
            <p className="text-sm text-[#8a8a8e] leading-relaxed mb-4">{c.text}</p>
            <span className="text-sm text-[#7EC8B8]">Email us →</span>
          </a>
        ))}
      </div>

      <Section title="Email">
        <p><a href={`mailto:${CONTACT_EMAIL}`} className="text-[#7EC8B8] hover:underline">{CONTACT_EMAIL}</a></p>
      </Section>

      <Section title="Want to drive?">
        <p>Apply on our <Link href="/drive" className="text-[#7EC8B8] hover:underline">driver page</Link>.</p>
      </Section>
    </InfoPage>
  )
}
