import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boringgg — Buy smarter. Pay less together.",
  description:
    "Group-buy drops at factory prices. Join a batch, invite two friends, pay less.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  // Belt-and-suspenders with the `Referrer-Policy` header in next.config.ts:
  // emits `<meta name="referrer" content="no-referrer">` so even if a future
  // host strips the header, outbound clicks still don't leak the source URL.
  referrer: "no-referrer",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-ink-950 antialiased">
        {children}
      </body>
    </html>
  );
}
