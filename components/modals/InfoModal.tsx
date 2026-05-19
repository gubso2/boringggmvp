"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { ExternalLink } from "@/components/shared/ExternalLink";
import { useApp } from "@/components/AppProvider";
import { formatPrice } from "@/lib/utils";
import { ArrowUpRight, Heart, Package, Sparkles } from "lucide-react";

export function InfoModal() {
  const { modal, setModal } = useApp();
  const [hero, setHero] = useState<"product" | "in-use">("product");

  if (modal.kind !== "info") {
    return <Modal open={false} onClose={() => setModal({ kind: "none" })} />;
  }
  const { product } = modal;

  const savingsPct = Math.round(
    (1 - product.base_price_cents / product.comparable_brand_price_cents) * 100,
  );

  const heroSrc =
    hero === "in-use" && product.in_use_image_url
      ? product.in_use_image_url
      : product.image_url;
  const hasInUse = !!product.in_use_image_url;

  return (
    <Modal
      open
      onClose={() => {
        setHero("product");
        setModal({ kind: "none" });
      }}
      title={product.name}
      size="lg"
    >
      <div className="space-y-6">
        {/* Hero gallery: tap to swap between product + in-use shots */}
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-ink-100">
            <Image
              key={heroSrc}
              src={heroSrc}
              alt={product.name}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(min-width: 768px) 640px, 100vw"
            />
          </div>
          {hasInUse && (
            <div className="mt-2 flex justify-center gap-1.5">
              <button
                type="button"
                onClick={() => setHero("product")}
                className={`h-1.5 w-8 rounded-full transition ${
                  hero === "product" ? "bg-ink-950" : "bg-ink-200"
                }`}
                aria-label="Product shot"
              />
              <button
                type="button"
                onClick={() => setHero("in-use")}
                className={`h-1.5 w-8 rounded-full transition ${
                  hero === "in-use" ? "bg-ink-950" : "bg-ink-200"
                }`}
                aria-label="In-use shot"
              />
            </div>
          )}
        </div>

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
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-px bg-ink-200/60 text-[13px]">
                <div className="bg-ink-50 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-ink-500">
                  Spec
                </div>
                <div className="bg-ink-50 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-ink-950">
                  Boringgg
                </div>
                <div className="bg-ink-50 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-ink-500">
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
      </div>
    </Modal>
  );
}

function SpecRow({
  row,
}: {
  row: { label: string; ours: string; theirs: string };
}) {
  const same = row.ours.trim().toLowerCase() === row.theirs.trim().toLowerCase();
  return (
    <>
      <div className="bg-white px-3 py-2 text-ink-500">{row.label}</div>
      <div
        className={`bg-white px-3 py-2 font-medium ${
          same ? "text-ink-700" : "text-ink-950"
        }`}
      >
        {row.ours}
      </div>
      <div className="bg-white px-3 py-2 text-ink-500">{row.theirs}</div>
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
