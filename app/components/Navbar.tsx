"use client"
// The ONE header used across the whole customer site (rendered once in app/layout.tsx).
// Do not add page-specific <nav> blocks — change this file instead.
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth, SignOutButton } from "@clerk/nextjs"
import MegaMenu from "./MegaMenu"
import SearchBar from "./SearchBar"
import { useCart } from "../CartContext"
import { useWishlist } from "../WishlistContext"
import { StoreIcon, SparkIcon, HeartIcon, BagIcon, ReceiptIcon, UserIcon } from "./Icons"

/** Routes that have their own chrome (auth screen, admin, driver app). */
export const HIDE_CHROME = (path: string) =>
  path === "/" || path.startsWith("/admin") || path.startsWith("/driver")

const linkBase = "flex items-center gap-1.5 transition hover:text-[#E8E8EA]"

function Badge({ n, tone = "teal" }: { n: number; tone?: "teal" | "red" }) {
  if (n <= 0) return null
  const color = tone === "red" ? "bg-red-400 text-white" : "bg-[#7EC8B8] text-[#0D0D0F]"
  return (
    <span className={`${color} rounded-full min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-bold`}>
      {n}
    </span>
  )
}

export default function Navbar() {
  const pathname = usePathname() || "/"
  const { isLoaded, isSignedIn } = useAuth()
  const { cart } = useCart()
  const { wishlist, setOpen } = useWishlist()

  if (HIDE_CHROME(pathname)) return null

  const cartCount = cart.reduce((sum: number, i: any) => sum + i.qty, 0)
  const active = (prefix: string) =>
    pathname === prefix || pathname.startsWith(prefix + "/") ? "text-[#7EC8B8]" : ""
  const storesActive = pathname === "/home" || pathname.startsWith("/stores") ? "text-[#7EC8B8]" : ""

  return (
    <nav className="flex justify-between items-center gap-4 px-4 sm:px-8 py-4 border-b border-[#2B2B2E] sticky top-0 bg-[#0D0D0F]/95 backdrop-blur z-40">
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <MegaMenu />
        <Link href="/home" className="text-xl sm:text-2xl font-bold tracking-widest text-[#E8E8EA]" aria-label="FitDrop home">
          FitDrop
        </Link>
      </div>

      <div className="flex gap-4 lg:gap-6 text-sm text-[#8a8a8e] items-center">
        <div className="hidden lg:block"><SearchBar /></div>
        <Link href="/home#stores" className={`${linkBase} ${storesActive}`} aria-label="Stores">
          <StoreIcon /><span className="hidden md:inline">Stores</span>
        </Link>
        <Link href="/new-drops" className={`${linkBase} ${active("/new-drops")}`} aria-label="New Drops">
          <SparkIcon /><span className="hidden md:inline">New Drops</span>
        </Link>
        <button onClick={() => setOpen(true)} className={linkBase} aria-label="Wishlist">
          <HeartIcon /><span className="hidden md:inline">Wishlist</span><Badge n={wishlist.length} tone="red" />
        </button>
        <Link href="/cart" className={`${linkBase} ${active("/cart")}`} aria-label="Cart">
          <BagIcon /><span className="hidden md:inline">Cart</span><Badge n={cartCount} />
        </Link>
        <Link href="/orders" className={`${linkBase} ${active("/orders")}`} aria-label="Orders">
          <ReceiptIcon /><span className="hidden md:inline">Orders</span>
        </Link>
        {isLoaded && (isSignedIn ? (
          <SignOutButton redirectUrl="/">
            <button className={linkBase} aria-label="Sign out">
              <UserIcon /><span className="hidden md:inline">Sign Out</span>
            </button>
          </SignOutButton>
        ) : (
          <Link href="/" className={`${linkBase} text-[#7EC8B8]`} aria-label="Sign in">
            <UserIcon /><span className="hidden md:inline">Sign In</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
