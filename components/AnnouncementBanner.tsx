"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Slide = {
  text: string;
  cta?: { label: string; href: string };
};

/**
 * Edit this array to change what the banner cycles through.
 * Keep messages short — the bar is one line tall.
 */
const SLIDES: Slide[] = [
  { text: "Same factories. No brand tax." },
  {
    text: "Direct from the manufacturer.",
    cta: { label: "SHOP NOW", href: "#drops" },
  },
  { text: "Free shipping on orders over $75." },
  {
    text: "Invite 2 friends to unlock manufacturer pricing.",
    cta: { label: "HOW IT WORKS", href: "#how-it-works" },
  },
];

const ROTATION_MS = 4500;

export function AnnouncementBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (SLIDES.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      ROTATION_MS,
    );
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[index];

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: "#700142", color: "#cfd68d" }}
    >
      <div className="mx-auto flex h-9 max-w-screen-2xl items-center justify-center px-4 text-[11px] font-medium uppercase tracking-[0.12em] sm:text-xs">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 truncate text-center"
          >
            <span className="truncate">{slide.text}</span>
            {slide.cta && (
              <>
                <span className="opacity-60">|</span>
                <a
                  href={slide.cta.href}
                  className="shrink-0 underline-offset-2 hover:underline"
                >
                  {slide.cta.label}
                </a>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
