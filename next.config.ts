import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Placeholder editorial photos (lib/images.ts) until real catalogs are synced
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      // Real product photos coming from brands' Shopify stores
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
