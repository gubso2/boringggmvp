"use client";

import Image from "next/image";
import { Modal } from "@/components/shared/Modal";
import { useApp } from "@/components/AppProvider";
import { formatPrice } from "@/lib/utils";

export function InfoModal() {
  const { modal, setModal } = useApp();
  if (modal.kind !== "info") {
    return <Modal open={false} onClose={() => setModal({ kind: "none" })} />;
  }
  const { product } = modal;

  const savingsPct = Math.round(
    (1 - product.base_price_cents / product.comparable_brand_price_cents) * 100,
  );

  return (
    <Modal
      open
      onClose={() => setModal({ kind: "none" })}
      title={product.name}
      size="lg"
    >
      <div className="space-y-5">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-ink-100">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 640px, 100vw"
          />
        </div>

        {product.description && (
          <p className="text-[15px] leading-relaxed text-ink-700">
            {product.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Manufacturer" value={product.manufacturer} />
          <Stat
            label="Est. production cost"
            value={formatPrice(product.est_production_cost_cents)}
          />
          <Stat label="Comparable brand" value={product.comparable_brand_name} />
          <Stat
            label="Brand retail"
            value={`${formatPrice(
              product.comparable_brand_price_cents,
            )} (${savingsPct}% saved)`}
          />
        </div>

        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-500">
            Manufactured for
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.manufacturer_clients.map((c) => (
              <span
                key={c}
                className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 px-3 py-2.5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-ink-950">{value}</div>
    </div>
  );
}
