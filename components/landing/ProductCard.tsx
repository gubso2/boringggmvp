"use client";

import Image from "next/image";
import { useState } from "react";
import { CountdownTimer } from "@/components/shared/CountdownTimer";
import { useApp } from "@/components/AppProvider";
import { useBatchRealtime } from "@/lib/realtime";
import { currentPriceCents } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import type { ProductVariant, ProductWithBatch } from "@/lib/types";
import { Info, Minus, Plus, Star } from "lucide-react";

export function ProductCard({ product }: { product: ProductWithBatch }) {
  const { setModal, getCartQuantity, incrementCart, decrementCart } = useApp();
  const batch = useBatchRealtime(product.batch);
  const [imgFailed, setImgFailed] = useState(false);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );
  const selectedVariant: ProductVariant | null =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0] ??
    null;

  const productWithLatestBatch: ProductWithBatch = { ...product, batch };
  const inCart = getCartQuantity(productWithLatestBatch, selectedVariant);

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

  function openInfo() {
    setModal({ kind: "info", product: productWithLatestBatch });
  }

  return (
    <article className="group flex flex-col gap-4 rounded-3xl bg-white p-3 hairline transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.18)]">
      {/* The whole hero is a button into the InfoModal */}
      <button
        type="button"
        onClick={openInfo}
        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100 text-left"
        aria-label={`More about ${product.name}`}
      >
        {!imgFailed ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-ink-400">
            {product.name}
          </div>
        )}

        {/* top-right: info chip */}
        <span className="pointer-events-none absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-ink-700 backdrop-blur">
          <Info size={14} strokeWidth={2} />
        </span>

        {/* top-left: rating badge (also opens info) — fallback hides when no reviews */}
        {product.review_count > 0 && (
          <span
            className="absolute left-2 top-2 inline-flex h-8 items-center gap-1 rounded-full bg-white/85 px-2.5 text-ink-950 backdrop-blur"
            title={`${product.review_count} review${product.review_count === 1 ? "" : "s"}`}
          >
            <Star size={12} fill="currentColor" strokeWidth={0} />
            <span className="text-xs font-semibold tabular-nums">
              {product.avg_rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-ink-500">
              ({product.review_count})
            </span>
          </span>
        )}
      </button>

      <div className="flex flex-col gap-3 px-1.5 pb-1.5">
        {/* Clicking the title also opens the info modal */}
        <button
          type="button"
          onClick={openInfo}
          className="flex items-start justify-between gap-2 text-left"
        >
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
        </button>

        {/* Variant swatches */}
        {product.variants.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {product.variants.map((v) => {
                const active = v.id === selectedVariant?.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`relative h-6 w-6 rounded-full border-2 transition ${
                      active
                        ? "border-ink-950 scale-110"
                        : "border-white ring-1 ring-black/10 hover:ring-black/30"
                    }`}
                    style={{ background: v.swatch_hex ?? "#e5e7eb" }}
                    aria-label={v.name}
                    aria-pressed={active}
                    title={v.name}
                  />
                );
              })}
            </div>
            <span className="text-[11px] text-ink-500">
              {selectedVariant?.name}
            </span>
          </div>
        )}

        {/* Countdown only — unit tracker is gone */}
        <div className="flex justify-end">
          <CountdownTimer endAt={batch.end_at} compact />
        </div>

        {/* Quantity stepper — minus left, plus right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              decrementCart(productWithLatestBatch, selectedVariant)
            }
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
            onClick={() =>
              incrementCart(productWithLatestBatch, selectedVariant)
            }
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
