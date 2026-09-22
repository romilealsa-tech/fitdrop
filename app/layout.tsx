import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { CartProvider } from "./CartContext"
import { WishlistProvider } from "./WishlistContext"
import { ClerkProvider } from "@clerk/nextjs"
import WishlistDrawer from "./components/WishlistDrawer"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, ogImageUrl } from "../lib/seo"

const DEFAULT_OG = ogImageUrl({
  title: "Because Waiting Isn't Fashionable",
  subtitle: "Same-day fashion delivery from Manhattan's favorite stores.",
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FitDrop — Same-Day Fashion Delivery in Manhattan",
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
    title: "FitDrop — Same-Day Fashion Delivery in Manhattan",
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: "FitDrop — Same-day fashion delivery" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FitDrop — Same-Day Fashion Delivery in Manhattan",
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0D0D0F]`}>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              {children}
              <Footer />
              <WishlistDrawer />
            </WishlistProvider>
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
