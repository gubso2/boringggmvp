import { ProductCard } from "./ProductCard";
import type { ProductWithBatch } from "@/lib/types";

export function ProductGrid({ products }: { products: ProductWithBatch[] }) {
  return (
    <section id="drops" className="scroll-mt-24">
      <div className="px-3 py-12 sm:px-4 sm:py-16 lg:px-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
