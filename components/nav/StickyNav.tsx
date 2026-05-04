"use client";

import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { useApp } from "@/components/AppProvider";

export function StickyNav() {
  const { user, setModal, signOut } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full">
      <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6">
        <nav className="glass mx-auto flex h-12 items-center justify-between rounded-full px-3 sm:px-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2 font-display text-[15px] font-semibold tracking-tight text-ink-950"
          >
            boringgg<span className="text-ink-300">.</span>
          </Link>

          <div className="hidden items-center gap-1 text-xs sm:flex">
            <a
              href="#drops"
              className="rounded-full px-3 py-1.5 text-ink-600 transition hover:text-ink-950"
            >
              Drops
            </a>
            <a
              href="#how-it-works"
              className="rounded-full px-3 py-1.5 text-ink-600 transition hover:text-ink-950"
            >
              How it works
            </a>
            <a
              href="#about"
              className="rounded-full px-3 py-1.5 text-ink-600 transition hover:text-ink-950"
            >
              About
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Account
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setModal({ kind: "auth" })}
              >
                Sign in
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
