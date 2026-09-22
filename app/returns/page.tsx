import { InfoPage, Section, CONTACT_EMAIL } from "../components/InfoPage"
import { pageMeta } from "@/lib/seo"

export const metadata = pageMeta({
  title: "Returns & Exchanges",
  description: "How returns and exchanges work for FitDrop orders — follow each store's return policy, and contact FitDrop if something went wrong.",
  path: "/returns",
})

const mail = <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#7EC8B8] hover:underline">{CONTACT_EMAIL}</a>

// NOTE: intentionally general until the official return policy is reviewed legally.
export default function ReturnsPage() {
  return (
    <InfoPage
      eyebrow="Help"
      title="Returns & Exchanges"
      intro="Everything you order on FitDrop is bought from the store itself, so returns follow that store's own policy."
    >
      <Section title="Returning an item">
        <p>Returns and exchanges follow the policy of the store you bought from. Keep your FitDrop order confirmation as proof of purchase.</p>
      </Section>

      <Section title="Something wrong with your order?">
        <p>If an item arrives wrong, damaged or missing, write to {mail} with your order details and we&apos;ll help you sort it out with the store.</p>
      </Section>
    </InfoPage>
  )
}
