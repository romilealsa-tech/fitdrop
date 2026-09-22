import Link from "next/link"
import ProductImage from "../components/ProductImage"
import StoreLogo from "../components/StoreLogo"
import { DROP_IMAGES } from "../../lib/images"
import { pageMeta } from "../../lib/seo"

export const metadata = pageMeta({
  title: "New Drops",
  description:
    "The newest arrivals from Zara, Nike, Uniqlo, H&M, COS, Mango and Marlow — shop this week's drops and get them delivered in Manhattan today.",
  path: "/new-drops",
  og: { title: "New Drops", subtitle: "This week's newest arrivals — delivered in Manhattan the same day." },
})

const drops = [
  { store: "Zara", slug: "zara", item: "Spring Collection 2026", tag: "Just Dropped", desc: "Fresh minimalist pieces for the new season" },
  { store: "Nike", slug: "nike", item: "Air Max Pulse", tag: "Limited", desc: "New colorway dropping this week only" },
  { store: "Uniqlo", slug: "uniqlo", item: "Linen Summer Line", tag: "New", desc: "Lightweight essentials for warmer days" },
  { store: "H&M", slug: "hm", item: "Y2K Revival Edit", tag: "Trending", desc: "The 2000s are back and we're here for it" },
  { store: "COS", slug: "cos", item: "Monochrome Series", tag: "Just Dropped", desc: "Clean, architectural pieces in neutral tones" },
  { store: "Mango", slug: "mango", item: "Mediterranean Summer", tag: "New", desc: "Sun-soaked styles from the coast" },
  { store: "Marlow", slug: "marlow", item: "Studio Essentials", tag: "Just Dropped", desc: "Elevated basics designed for everyday movement" },
]

const tagColor = (tag: string) => {
  if (tag === "Limited") return "bg-red-500 text-white"
  if (tag === "Trending") return "bg-[#E8E8EA] text-[#0D0D0F]"
  return "bg-[#7EC8B8] text-[#0D0D0F]"
}

export default function NewDrops() {
  return (
    <main className="bg-[#0D0D0F] text-[#E8E8EA]">
      <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
        <p className="text-[#7EC8B8] uppercase tracking-widest text-sm mb-2 font-medium">What&apos;s hot right now</p>
        <h1 className="text-4xl font-bold mb-8 text-[#E8E8EA]">New Drops</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drops.map((drop, i) => (
            <Link
              key={drop.item}
              href={`/stores/${drop.slug}`}
              className="bg-[#1C1C1E] border border-[#2B2B2E] rounded-2xl overflow-hidden hover:border-[#7EC8B8] transition block group"
            >
              <div className="relative">
                <ProductImage
                  src={DROP_IMAGES[drop.slug]}
                  alt={`${drop.item} — ${drop.store}`}
                  aspect="aspect-[4/5]"
                  priority={i === 0}
                  imgClassName="group-hover:scale-105 transition duration-500"
                />
                <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-bold ${tagColor(drop.tag)}`}>
                  {drop.tag}
                </span>
              </div>
              <div className="p-5 flex items-start gap-3">
                <StoreLogo slug={drop.slug} name={drop.store} size="sm" />
                <div className="min-w-0">
                  <h2 className="font-semibold text-[#E8E8EA]">{drop.item}</h2>
                  <p className="text-[#8a8a8e] text-sm mt-0.5">{drop.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
