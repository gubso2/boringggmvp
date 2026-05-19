"use client";

import { useState } from "react";
import { Instagram } from "lucide-react";
import { ExternalLink } from "@/components/shared/ExternalLink";

const TIKTOK_URL = "https://www.tiktok.com/@tryboringgg";
const INSTAGRAM_URL = "https://www.instagram.com/tryboringgg/";

export function Footer() {
  return (
    <footer className="border-t border-black/5">
      <div className="mx-auto max-w-screen-2xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_auto]">
          {/* Subscribe */}
          <div className="max-w-md">
            <div className="font-display text-xl font-semibold tracking-tight text-ink-950">
              Stay boring.
            </div>
            <p className="mt-1 text-sm text-ink-500">
              Get a heads-up the moment a new drop opens. No spam.
            </p>
            <SubscribeForm />
          </div>

          {/* Socials + copy */}
          <div className="flex flex-col gap-4 sm:items-end">
            <div className="flex items-center gap-2">
              <ExternalLink
                href={TIKTOK_URL}
                className="grid h-9 w-9 place-items-center rounded-full bg-ink-50 text-ink-700 transition hover:bg-ink-100 hover:text-ink-950"
                aria-label="Boringgg on TikTok"
              >
                <TikTokIcon />
              </ExternalLink>
              <ExternalLink
                href={INSTAGRAM_URL}
                className="grid h-9 w-9 place-items-center rounded-full bg-ink-50 text-ink-700 transition hover:bg-ink-100 hover:text-ink-950"
                aria-label="Boringgg on Instagram"
              >
                <Instagram size={16} strokeWidth={2} />
              </ExternalLink>
            </div>
            <div className="flex flex-col gap-1 text-xs text-ink-500 sm:items-end">
              <span className="font-display font-semibold tracking-tight text-ink-950">
                boringgg<span className="text-ink-300">.</span>
              </span>
              <span>© {new Date().getFullYear()} Boringgg. Buy smarter.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
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
      <p className="mt-4 text-sm text-emerald-700">
        ✓ You&rsquo;re on the list. See you on the next drop.
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 flex w-full max-w-md items-stretch gap-2"
    >
      <input
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 min-w-0 flex-1 rounded-full bg-white px-4 text-[15px] text-ink-950 placeholder:text-ink-400 hairline focus:border-ink-950/30 focus:outline-none focus:ring-2 focus:ring-ink-950/10"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-ink-950 px-5 text-sm font-medium text-white transition hover:bg-ink-800 disabled:opacity-60"
      >
        {status === "submitting" ? "Joining…" : "Subscribe"}
      </button>
      {status === "error" && error && (
        <span className="basis-full text-xs text-red-600">{error}</span>
      )}
    </form>
  );
}

function TikTokIcon() {
  // lucide-react doesn't ship a TikTok mark; this is the simplified
  // official brand glyph at 16×16.
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.07-2.79V9.42a6.33 6.33 0 1 0 5.52 6.27V8.41a8.16 8.16 0 0 0 4.77 1.53V6.69a4.85 4.85 0 0 1-1-.25Z" />
    </svg>
  );
}
