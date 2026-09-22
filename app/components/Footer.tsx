"use client"
// Site-wide footer, rendered once in app/layout.tsx.
import Link from "next/link"
import { usePathname } from "next/navigation"
import { STORES } from "../../lib/stores"
import StoreLogo from "./StoreLogo"
import { HIDE_CHROME } from "./Navbar"

const HELP = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/returns", label: "Returns" },
  { href: "/contact", label: "Contact" },
]

export default function Footer() {
  const pathname = usePathname() || "/"
  if (HIDE_CHROME(pathname)) return null

  return (
    <footer className="border-t border-[#2B2B2E] bg-[#0D0D0F] text-[#E8E8EA] mt-16">
      {/* Store strip */}
      <div className="px-4 sm:px-8 py-8 border-b border-[#2B2B2E]">
        <p className="text-xs text-[#6b6b6b] uppercase tracking-widest mb-4">Shop our stores</p>
        <div className="flex flex-wrap gap-3">
          {STORES.map(s => (
            <Link key={s.slug} href={`/stores/${s.slug}`} className="hover:opacity-80 transition" aria-label={s.name}>
              <StoreLogo slug={s.slug} name={s.name} size="md" />
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-3 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link href="/home" className="text-2xl font-bold tracking-widest">FitDrop</Link>
          <p className="text-[#6b6b6b] text-sm mt-3 max-w-xs">
            Same-day fashion delivery from your favorite Manhattan stores.
          </p>
        </div>

        <div>
          <p className="text-xs text-[#6b6b6b] uppercase tracking-widest mb-4">Help</p>
          <ul className="space-y-2 text-sm">
            {HELP.map(l => (
              <li key={l.href}><Link href={l.href} className="text-[#b5b5b8] hover:text-[#7EC8B8] transition">{l.label}</Link></li>
            ))}
          </ul>
        </div>


        <div>
          <p className="text-xs text-[#6b6b6b] uppercase tracking-widest mb-4">Work with us</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/drive" className="text-[#7EC8B8] hover:underline">Drive with FitDrop</Link></li>
            <li><Link href="/contact" className="text-[#b5b5b8] hover:text-[#7EC8B8] transition">Partner your store</Link></li>
          </ul>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6 border-t border-[#2B2B2E] flex flex-col sm:flex-row justify-between gap-2 text-xs text-[#6b6b6b]">
        <p>© {new Date().getFullYear()} FitDrop. Fashion. Delivered.</p>
        <p>Store names are trademarks of their respective owners.</p>
      </div>
    </footer>
  )
}
