"use client";

import { useState } from "react";
import { Instagram } from "lucide-react";
import { ExternalLink } from "@/components/shared/ExternalLink";

const TIKTOK_URL = "https://www.tiktok.com/@tryboringgg";
const INSTAGRAM_URL = "https://www.instagram.com/tryboringgg/";

const SHOP_LINKS = [
  { label: "Drops", href: "#drops" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Dashboard", href: "/dashboard" },
];

const DISCOVER_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "About", href: "#about" },
  { label: "Instagram", href: INSTAGRAM_URL, external: true },
  { label: "TikTok", href: TIKTOK_URL, external: true },
];

const HELP_LINKS = [
  { label: "Contact us", href: "mailto:hello@boringgg.com" },
  { label: "Refunds", href: "/dashboard" },
  { label: "Privacy", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-10">
        {/* Top — link grid + newsletter */}
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-20">
          <div className="grid w-full grid-cols-2 gap-x-8 gap-y-10 py-10 text-ink-950 sm:grid-cols-3 sm:gap-12 lg:py-16">
            <FooterColumn title="Shop" links={SHOP_LINKS} />
            <FooterColumn title="Discover" links={DISCOVER_LINKS} />
            <FooterColumn title="Help" links={HELP_LINKS} />
          </div>

          {/* Newsletter + socials column */}
          <div className="flex w-full flex-col gap-5 pb-10 lg:max-w-md lg:py-16 lg:pl-10">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink-950">
              Newsletter
            </p>
            <SubscribeForm />
            <div className="flex gap-3">
              <ExternalLink
                href={TIKTOK_URL}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-950 transition hover:bg-black/5"
                aria-label="Boringgg on TikTok"
              >
                <TikTokIcon />
              </ExternalLink>
              <ExternalLink
                href={INSTAGRAM_URL}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-950 transition hover:bg-black/5"
                aria-label="Boringgg on Instagram"
              >
                <Instagram size={18} strokeWidth={1.75} />
              </ExternalLink>
            </div>
          </div>
        </div>

        {/* Wordmark + legal */}
        <div className="border-t border-black/10 py-8">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-700">
              <a href="#" className="hover:text-ink-950">
                Terms
              </a>
              <span aria-hidden>·</span>
              <a href="#" className="hover:text-ink-950">
                Privacy
              </a>
            </div>

            <div className="font-display text-5xl font-semibold tracking-tight text-ink-950 sm:text-6xl lg:text-7xl">
              boringgg<span className="text-ink-300">.</span>
            </div>

            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
              © {new Date().getFullYear()} Boringgg, inc.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink-950 sm:mb-6">
        {title}
      </p>
      <ul className="flex flex-col gap-3 text-sm text-ink-700">
        {links.map((link) =>
          link.external ? (
            <li key={link.label}>
              <ExternalLink
                href={link.href}
                className="hover:text-ink-950"
              >
                {link.label}
              </ExternalLink>
            </li>
          ) : (
            <li key={link.label}>
              <a href={link.href} className="hover:text-ink-950">
                {link.label}
              </a>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "done" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("done");
      setEmail("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="border-b border-ink-950/30 pb-3 font-mono text-xs uppercase tracking-[0.16em] text-emerald-700">
        ✓ You&rsquo;re on the list.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="w-full">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex items-center gap-4 border-b border-ink-950 pb-3 font-mono text-xs uppercase tracking-[0.16em] text-ink-950">
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="EMAIL ADDRESS"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border-none bg-transparent uppercase tracking-[0.16em] outline-none placeholder:text-ink-500"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="whitespace-nowrap transition-opacity hover:opacity-70 disabled:opacity-40"
        >
          {status === "submitting" ? "…" : "Submit"}
        </button>
      </div>
      {status === "error" && error && (
        <p className="mt-2 text-xs text-red-600 normal-case tracking-normal">
          {error}
        </p>
      )}
    </form>
  );
}

function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.07-2.79V9.42a6.33 6.33 0 1 0 5.52 6.27V8.41a8.16 8.16 0 0 0 4.77 1.53V6.69a4.85 4.85 0 0 1-1-.25Z" />
    </svg>
  );
}
