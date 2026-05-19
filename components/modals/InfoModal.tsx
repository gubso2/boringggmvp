"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { ExternalLink } from "@/components/shared/ExternalLink";
import { useApp } from "@/components/AppProvider";
import { formatPrice } from "@/lib/utils";
import {
  ArrowUpRight,
  ChevronDown,
  Heart,
  Package,
  Sparkles,
  Star,
} from "lucide-react";
import type { ProductReview } from "@/lib/types";

type GalleryKey = "in-use" | "benefits" | "in-box";

export function InfoModal() {
  const { modal, setModal } = useApp();
  const [active, setActive] = useState<GalleryKey>("in-use");
  const [reviewsOpen, setReviewsOpen] = useState(false);

  if (modal.kind !== "info") {
    return <Modal open={false} onClose={() => setModal({ kind: "none" })} />;
  }
  const { product } = modal;

  const savingsPct = Math.round(
    (1 - product.base_price_cents / product.comparable_brand_price_cents) * 100,
  );

  // Build the gallery: main image is always present (the "in use" shot);
  // benefits + in-box only appear when their URL is populated.
  const slides: { key: GalleryKey; label: string; src: string }[] = [
    { key: "in-use", label: "In use", src: product.image_url },
    ...(product.image_benefits_url
      ? [
          {
            key: "benefits" as const,
            label: "Benefits",
            src: product.image_benefits_url,
          },
        ]
      : []),
    ...(product.image_in_box_url
      ? [
          {
            key: "in-box" as const,
            label: "In the box",
            src: product.image_in_box_url,
          },
        ]
      : []),
  ];
  const current = slides.find((s) => s.key === active) ?? slides[0];

  function close() {
    setActive("in-use");
    setReviewsOpen(false);
    setModal({ kind: "none" });
  }

  return (
    <Modal
      open
      onClose={close}
      title={product.name}
      size="lg"
    >
      <div className="space-y-6">
        {/* 3-image gallery: in-use / benefits / in-box, tab navigation below */}
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-ink-100">
            <Image
              key={current.src}
              src={current.src}
              alt={`${product.name} — ${current.label}`}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(min-width: 768px) 640px, 100vw"
            />
          </div>
          {slides.length > 1 && (
            <div className="mt-2 flex justify-center gap-1.5">
              {slides.map((s) => {
                const isActive = s.key === current.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActive(s.key)}
                    className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                      isActive
                        ? "bg-ink-950 text-white"
                        : "bg-ink-100 text-ink-600 hover:bg-ink-200"
                    }`}
                    aria-label={s.label}
                    aria-pressed={isActive}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Rating row — jumps the user to the expandable reviews section below */}
        {product.review_count > 0 && (
          <button
            type="button"
            onClick={() => {
              setReviewsOpen(true);
              setTimeout(() => {
                document
                  .getElementById("info-modal-reviews")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 30);
            }}
            className="-mt-1 flex items-center gap-2 text-sm text-ink-700 transition hover:text-ink-950"
          >
            <span className="inline-flex items-center gap-1">
              <Star size={14} fill="currentColor" strokeWidth={0} />
              <span className="font-semibold tabular-nums text-ink-950">
                {product.avg_rating.toFixed(1)}
              </span>
            </span>
            <span className="text-ink-500">
              ({product.review_count} review
              {product.review_count === 1 ? "" : "s"}) — read all
            </span>
          </button>
        )}

        {product.description && (
          <p className="text-[15px] leading-relaxed text-ink-700">
            {product.description}
          </p>
        )}

        {/* Health benefit callout */}
        {product.health_benefit && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
            <Heart
              size={16}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-emerald-700"
            />
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-emerald-700">
                Why it&rsquo;s good for you
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ink-800">
                {product.health_benefit}
              </p>
            </div>
          </div>
        )}

        {/* What's in the box */}
        {product.in_box.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Package
                size={14}
                strokeWidth={2}
                className="text-ink-700"
              />
              <span className="text-[11px] font-medium uppercase tracking-wider text-ink-700">
                In the box
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-1.5 text-sm text-ink-700">
              {product.in_box.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 rounded-xl bg-ink-50 px-3 py-2"
                >
                  <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-ink-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Comparison spec table */}
        {product.specs.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={14} strokeWidth={2} className="text-ink-700" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-ink-700">
                  vs. {product.comparable_brand_name}
                </span>
              </div>
              {product.comparable_brand_url && (
                <ExternalLink
                  href={product.comparable_brand_url}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-ink-600 transition hover:bg-black/5 hover:text-ink-950"
                >
                  Visit website
                  <ArrowUpRight size={11} strokeWidth={2.25} />
                </ExternalLink>
              )}
            </div>
            <div className="overflow-hidden rounded-2xl bg-ink-50">
              <div className="grid grid-cols-[minmax(80px,1fr)_1fr_1fr] gap-px bg-ink-200/60 text-[12px] sm:text-[13px]">
                <div className="bg-ink-50 px-2.5 py-2 text-[10px] font-medium uppercase tracking-wider text-ink-500 sm:text-[11px] sm:px-3">
                  Spec
                </div>
                <div className="bg-ink-50 px-2.5 py-2 text-[10px] font-medium uppercase tracking-wider text-ink-950 sm:text-[11px] sm:px-3">
                  Boringgg
                </div>
                <div className="bg-ink-50 px-2.5 py-2 text-[10px] font-medium uppercase tracking-wider text-ink-500 sm:text-[11px] sm:px-3">
                  {product.comparable_brand_name}
                </div>
                {product.specs.map((row) => (
                  <SpecRow key={row.label} row={row} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Price & manufacturer summary */}
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Manufacturer" value={product.manufacturer} />
          <Stat
            label="Est. production cost"
            value={formatPrice(product.est_production_cost_cents)}
          />
          <Stat
            label="Comparable brand"
            value={product.comparable_brand_name}
          />
          <Stat
            label="Brand retail"
            value={`${formatPrice(product.comparable_brand_price_cents)} (save ${savingsPct}%)`}
          />
        </div>

        <div>
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-500">
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

        {/* Expandable reviews */}
        {product.review_count > 0 && (
          <div id="info-modal-reviews" className="scroll-mt-4">
            <button
              type="button"
              onClick={() => setReviewsOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl bg-ink-50 px-4 py-3 text-left transition hover:bg-ink-100"
              aria-expanded={reviewsOpen}
              aria-controls="info-modal-reviews-list"
            >
              <span className="flex items-center gap-2 text-sm text-ink-950">
                <Star size={14} fill="currentColor" strokeWidth={0} />
                <span className="font-semibold tabular-nums">
                  {product.avg_rating.toFixed(1)}
                </span>
                <span className="text-ink-500">
                  · {product.review_count} review
                  {product.review_count === 1 ? "" : "s"}
                </span>
              </span>
              <ChevronDown
                size={16}
                className={`text-ink-600 transition-transform ${
                  reviewsOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {reviewsOpen && (
              <ul
                id="info-modal-reviews-list"
                className="mt-3 space-y-3"
              >
                {product.reviews.map((r) => (
                  <ReviewItem key={r.id} review={r} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function ReviewItem({ review }: { review: ProductReview }) {
  return (
    <li className="rounded-2xl bg-white p-4 hairline">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink-950">
          {review.reviewer_name}
        </span>
        <span className="text-[11px] text-ink-400">
          {relativeDate(review.created_at)}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            fill={i < review.rating ? "currentColor" : "none"}
            strokeWidth={1.5}
            className={i < review.rating ? "text-ink-950" : "text-ink-300"}
          />
        ))}
      </div>
      {review.title && (
        <div className="mt-2 text-sm font-semibold text-ink-950">
          {review.title}
        </div>
      )}
      <p className="mt-1 text-sm leading-relaxed text-ink-700">
        {review.body}
      </p>
    </li>
  );
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86_400_000;
  const days = Math.floor(diff / day);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

function SpecRow({
  row,
}: {
  row: { label: string; ours: string; theirs: string };
}) {
  const same = row.ours.trim().toLowerCase() === row.theirs.trim().toLowerCase();
  return (
    <>
      <div className="bg-white px-2.5 py-2 text-ink-500 sm:px-3">
        {row.label}
      </div>
      <div
        className={`bg-white px-2.5 py-2 font-medium sm:px-3 ${
          same ? "text-ink-700" : "text-ink-950"
        }`}
      >
        {row.ours}
      </div>
      <div className="bg-white px-2.5 py-2 text-ink-500 sm:px-3">
        {row.theirs}
      </div>
    </>
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
