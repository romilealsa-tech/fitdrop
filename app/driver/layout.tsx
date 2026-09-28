import type { Metadata, Viewport } from "next"

// Makes /driver installable as a Home Screen app ("FitDrop Driver").
// On iPhone this is REQUIRED for push notifications (iOS 16.4+).
export const metadata: Metadata = {
  title: { absolute: "FitDrop Driver" },
  description: "Get and deliver FitDrop orders in Manhattan.",
  manifest: "/driver.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: "FitDrop Driver",
    statusBarStyle: "black-translucent",
  },
  icons: { apple: "/icon-192.png" },
}

export const viewport: Viewport = {
  themeColor: "#0D0D0F",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
