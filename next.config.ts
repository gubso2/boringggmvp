import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  // No ESLint config in repo; skip lint at build time so Vercel doesn't hang
  // on the interactive setup prompt. TypeScript still runs.
  eslint: { ignoreDuringBuilds: true },
  // Strip the Referer header from every outbound click so destination sites
  // never see boringgg.com as the traffic source. Applied to all paths.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;
