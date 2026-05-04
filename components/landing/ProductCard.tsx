"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { PriceGraph } from "@/components/landing/PriceGraph";
import { useApp } from "@/components/AppProvider";
import { useBatchRealtime } from "@/lib/realtime";
import { currentPriceCents } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import type { ProductWithBatch } from "@/lib/types";
import { Info, Minus, Plus } from "lucide-react";

export function ProductCard({ product }: { product: ProductWithBatch }) {
  const { setModal, cartItems, setCartQuantity, incrementCart, decrementCart } =
    useApp();
  const batch = useBatchRealtime(product.batch);
  const [imgFailed, setImgFailed] = useState(false);

  const productWithLatestBatch: ProductWithBatch = { ...product, batch };
  const inCart =
    cartItems.find((i) => i.product.id === product.id)?.quantity ?? 0;

  // Keep the cart entry's batch state in sync with realtime so the cart total
  // is always computed from the latest units_reserved.
  useEffect(() => {
    if (inCart > 0) {
      setCartQuantity(productWithLatestBatch, inCart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch.units_reserved]);

  const filled = Math.max(0, Math.min(1, batch.units_reserved / product.moq));
  const price = currentPriceCents(
    batch.units_reserved,
    product.moq,
    product.price_curve,
  );
  const closed =
    batch.status !== "active" || new Date(batch.end_at) < new Date();
  const remaining = Math.max(0, product.moq - batch.units_reserved);
  const soldOut = remaining === 0;
  const disabled = closed || soldOut;
  const atMax = inCart >= Math.min(10, remaining);

  return (
    <article className="group flex flex-col gap-4 rounded-3xl bg-white p-3 hairline transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.18)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100">
        {!imgFailed ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-ink-400">
            {product.name}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setModal({ kind: "info", product: productWithLatestBatch })
          }
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-ink-700 backdrop-blur transition hover:bg-white hover:text-ink-950"
          aria-label="More information"
        >
          <Info size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-1.5 pb-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-medium tracking-tight text-ink-950">
            {product.name}
          </h3>
          <div className="text-right">
            <div className="text-[15px] font-semibold tabular-nums text-ink-950">
              {formatPrice(price)}
            </div>
            <div className="text-[10px] text-ink-400 line-through tabular-nums">
              {formatPrice(product.comparable_brand_price_cents)}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="text-ink-600">
              <span className="font-medium text-ink-950">
                {batch.units_reserved}
              </span>{" "}
              / {product.moq} units
            </span>
            <CountdownTimer endAt={batch.end_at} compact />
          </div>
          <ProgressBar value={filled} />
        </div>

        <PriceGraph
          curve={product.price_curve}
          moq={product.moq}
          unitsReserved={batch.units_reserved}
        />

        {/* Quantity stepper — minus left, plus right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => decrementCart(productWithLatestBatch)}
            disabled={disabled || inCart === 0}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white hairline text-ink-700 transition hover:bg-ink-50 disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            <Minus size={16} strokeWidth={2} />
          </button>
          <div className="flex h-10 flex-1 items-center justify-center rounded-full bg-ink-50 text-sm font-medium tabular-nums text-ink-950">
            {disabled ? (
              <span className="text-xs uppercase tracking-wide text-ink-500">
                {closed ? "Closed" : "Sold out"}
              </span>
            ) : inCart > 0 ? (
              <>
                {inCart} <span className="ml-1.5 text-ink-500">in cart</span>
              </>
            ) : (
              <span className="text-ink-500">Add to cart</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => incrementCart(productWithLatestBatch)}
            disabled={disabled || atMax}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-950 text-white transition hover:bg-ink-800 disabled:opacity-30"
            aria-label="Increase quantity"
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </article>
  );
}
