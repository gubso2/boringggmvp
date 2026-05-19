const steps = [
  {
    n: "01",
    title: "Find a product you love.",
    body: "Every drop names the exact factory and lists the brands they already manufacture for.",
  },
  {
    n: "02",
    title: "Invite two friends to unlock.",
    body: "Direct factory pricing only opens when you bring two new people. Drop in their numbers — we don't text them.",
  },
  {
    n: "03",
    title: "Ships from the factory.",
    body: "Two-to-four week lead time. You pay what the factory charges its biggest brand customers, not the retail markup.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-ink-50">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
          Three steps. Manufacturer direct.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-ink-200 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-ink-50 p-8 sm:p-10">
              <span className="font-mono text-xs text-ink-400">{s.n}</span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink-950">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
