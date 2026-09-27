// Clerk session detection for every request (Next.js 16 "proxy", formerly middleware).
// It must live at the project root — inside app/ it is ignored, which broke every
// server-side auth() call (admin APIs returned errors and admin lists came back empty).
//
// It intentionally does NOT force sign-in anywhere: the store, product pages, info
// pages, share images and order tracking stay public. Admin API routes enforce access
// themselves with requireAdmin() (lib/adminAuth.ts).
import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
