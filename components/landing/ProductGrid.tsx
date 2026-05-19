import { ProductCard } from "./ProductCard";
import type { ProductWithBatch } from "@/lib/types";

export function ProductGrid({ products }: { products: ProductWithBatch[] }) {
  return (
    <section id="drops" className="scroll-mt-24">
      <div className="mx-auto max-w-screen-2xl px-6 py-12 sm:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
              This week&rsquo;s drops
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              Each closes in 7 days. Earlier you&rsquo;re in, less you pay.
            </p>
          </div>
          <span className="hidden font-mono text-xs text-ink-400 sm:block">
            {products.length} live
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
