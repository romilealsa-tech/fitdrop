// Shared layout for the footer's info pages (How it works, Shipping, Returns, Privacy, Terms, Contact).
import Link from "next/link"

export const CONTACT_EMAIL = "hello@shopfitdrop.com"

export function InfoPage({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string
  title: string
  intro?: string
  updated?: string
  children: React.ReactNode
}) {
  return (
    <main className="bg-[#0D0D0F] text-[#E8E8EA]">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
        <Link href="/home" className="text-[#6b6b6b] text-sm hover:text-[#E8E8EA] transition">← Back to FitDrop</Link>
        <p className="text-[#7EC8B8] uppercase tracking-widest text-xs mt-6 mb-2 font-medium">{eyebrow}</p>
        <h1 className="text-4xl font-bold mb-3">{title}</h1>
        {intro && <p className="text-[#b5b5b8] text-lg leading-relaxed">{intro}</p>}
        {updated && <p className="text-[#6b6b6b] text-xs mt-3">Last updated {updated}</p>}
        <div className="mt-10 space-y-8">{children}</div>
      </div>
    </main>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 text-[#E8E8EA]">{title}</h2>
      <div className="text-[#b5b5b8] text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  )
}
