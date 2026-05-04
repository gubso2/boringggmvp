import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boringgg — Buy smarter. Pay less together.",
  description:
    "Group-buy drops at factory prices. Join a batch, invite two friends, pay less.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
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
