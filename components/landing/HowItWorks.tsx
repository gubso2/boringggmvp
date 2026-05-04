const steps = [
  {
    n: "01",
    title: "Join early.",
    body: "Reserve your units while the batch is fresh — early tiers are the cheapest.",
  },
  {
    n: "02",
    title: "Invite two friends.",
    body: "Drop in two phone numbers. We don't text them. We just need to know you brought people.",
  },
  {
    n: "03",
    title: "Batch closes in 7 days.",
    body: "We bulk-order with the factory and ship to you. Refund anytime before close.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-ink-50">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
          Three steps. Seven days. Factory price.
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
