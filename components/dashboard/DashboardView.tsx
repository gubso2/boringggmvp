"use client";

import Image from "next/image";
import { useApp } from "@/components/AppProvider";
import { Button } from "@/components/shared/Button";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { formatPrice } from "@/lib/utils";
import type {
  Batch,
  Product,
  ProductVariant,
  Reservation,
} from "@/lib/types";

type Row = Reservation & {
  product: Product;
  batch: Batch;
  variant: ProductVariant | null;
};

const STATUS_LABEL: Record<Reservation["status"], string> = {
  pending: "Pending payment",
  paid: "Active",
  refunded: "Refunded",
};

export function DashboardView({ reservations }: { reservations: Row[] }) {
  const { setModal } = useApp();

  if (reservations.length === 0) {
    return (
      <div className="rounded-3xl bg-ink-50 p-10 text-center">
        <p className="text-sm text-ink-500">
          You haven&rsquo;t joined a batch yet. Browse the drops to get started.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reservations.map((r) => {
        const batch = r.batch;
        const closed =
          batch.status !== "active" || new Date(batch.end_at) < new Date();
        const canRefund = r.status === "paid" && !closed;
        const batchLabel = closed
          ? "Batch closed"
          : r.status === "refunded"
            ? "Refunded"
            : STATUS_LABEL[r.status];

        return (
          <li
            key={r.id}
            className="flex flex-col gap-4 rounded-3xl bg-white p-3 hairline sm:flex-row sm:items-center sm:p-4"
          >
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-2xl bg-ink-100 sm:aspect-auto sm:h-24 sm:w-32">
              <Image
                src={r.product.image_url}
                alt={r.product.name}
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col gap-2 px-1 sm:px-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[15px] font-medium tracking-tight text-ink-950">
                    {r.variant?.swatch_hex && (
                      <span
                        className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-black/15"
                        style={{ background: r.variant.swatch_hex }}
                        aria-hidden
                      />
                    )}
                    <span>
                      {r.product.name}
                      {r.variant && (
                        <span className="text-ink-500"> · {r.variant.name}</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-ink-500">
                    {r.quantity} × {formatPrice(r.unit_price_cents)} ={" "}
                    <span className="font-medium text-ink-700">
                      {formatPrice(r.total_paid_cents)}
                    </span>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    r.status === "refunded"
                      ? "bg-ink-100 text-ink-500"
                      : closed
                        ? "bg-ink-100 text-ink-700"
                        : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {batchLabel}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-ink-500">
                <span>
                  {batch.units_reserved} / {r.product.moq} units
                </span>
                <CountdownTimer endAt={batch.end_at} compact />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 sm:flex-col sm:items-stretch sm:justify-center">
              {canRefund && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    setModal({
                      kind: "refund",
                      reservationId: r.id,
                      productName: r.product.name,
                    })
                  }
                >
                  Refund
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
