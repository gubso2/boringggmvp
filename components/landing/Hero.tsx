import { ArrowDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-28 lg:pt-36">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-ink-500 animate-fade-up [animation-delay:50ms] opacity-0">
          Group-buy at factory prices
        </p>
        <h1 className="font-display text-[44px] font-semibold leading-[1.02] tracking-tight text-ink-950 sm:text-6xl lg:text-7xl animate-fade-up [animation-delay:120ms] opacity-0">
          Buy smarter.
          <br />
          <span className="text-ink-400">Pay less together.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-600 animate-fade-up [animation-delay:240ms] opacity-0">
          Boringgg is a 7-day group-buy. Join early to lock in the lowest tier
          — when the batch fills, we place the order with the factory and ship
          to everyone. No middlemen, no markup.
        </p>
        <div className="mt-10 flex items-center gap-3 animate-fade-up [animation-delay:340ms] opacity-0">
          <a
            href="#drops"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink-950 px-6 text-sm font-medium text-white transition hover:bg-ink-800"
          >
            Browse drops
            <ArrowDown size={16} strokeWidth={2.25} />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-medium text-ink-700 transition hover:text-ink-950"
          >
            How it works
          </a>
        </div>
      </div>
    </section>
  );
}
