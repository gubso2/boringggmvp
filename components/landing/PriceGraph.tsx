"use client";

import { priceCurvePoints } from "@/lib/pricing";
import type { PriceTier } from "@/lib/types";
import { estimateShippingDays, formatPriceCompact } from "@/lib/utils";

type Props = {
  curve: PriceTier[];
  moq: number;
  unitsReserved: number;
};

/**
 * Mini SVG showing:
 *   - Step price curve over fill %
 *   - Current fill marker + price label
 *   - Inline ETA badge that decreases as fill grows
 */
export function PriceGraph({ curve, moq, unitsReserved }: Props) {
  const W = 280;
  const H = 80;
  const PAD = 8;

  const points = priceCurvePoints(curve);
  const minP = Math.min(...curve.map((c) => c.price_cents));
  const maxP = Math.max(...curve.map((c) => c.price_cents));
  const span = Math.max(1, maxP - minP);

  const x = (fill: number) => PAD + fill * (W - PAD * 2);
  const y = (priceCents: number) =>
    H - PAD - ((priceCents - minP) / span) * (H - PAD * 2);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.fill)} ${y(p.price_cents)}`)
    .join(" ");

  const fill = Math.max(0, Math.min(1, unitsReserved / moq));

  // current price = highest threshold ≤ fill
  const sorted = [...curve].sort((a, b) => a.threshold - b.threshold);
  const current =
    sorted.find((t) => fill <= t.threshold) ?? sorted[sorted.length - 1];

  // next price = next tier above current, if any
  const idx = sorted.indexOf(current);
  const next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;

  const eta = estimateShippingDays(unitsReserved, moq);

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-ink-500">
        <span>Price as batch fills</span>
        <span className="rounded-full bg-ink-100 px-2 py-0.5 font-medium text-ink-700">
          ~{eta}d shipping
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-16 w-full"
        preserveAspectRatio="none"
      >
        {/* gridline at min and max */}
        <line
          x1={PAD}
          x2={W - PAD}
          y1={y(minP)}
          y2={y(minP)}
          stroke="rgba(0,0,0,0.06)"
        />
        <line
          x1={PAD}
          x2={W - PAD}
          y1={y(maxP)}
          y2={y(maxP)}
          stroke="rgba(0,0,0,0.06)"
        />

        {/* shaded area beneath path */}
        <path
          d={`${path} L ${x(1)} ${H - PAD} L ${PAD} ${H - PAD} Z`}
          fill="rgba(9,9,11,0.06)"
        />

        {/* curve */}
        <path
          d={path}
          fill="none"
          stroke="#09090b"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* current marker */}
        <line
          x1={x(fill)}
          x2={x(fill)}
          y1={PAD}
          y2={H - PAD}
          stroke="#09090b"
          strokeDasharray="2 3"
          strokeWidth={1}
        />
        <circle cx={x(fill)} cy={y(current.price_cents)} r={3.5} fill="#09090b" />
      </svg>
      <div className="mt-1 flex items-center justify-between text-[11px]">
        <span className="text-ink-700">
          Now{" "}
          <span className="font-semibold text-ink-950">
            {formatPriceCompact(current.price_cents)}
          </span>
        </span>
        {next ? (
          (() => {
            // Next tier kicks in once filled > current.threshold,
            // i.e. one unit past floor(threshold * moq).
            const unitsLeft = Math.max(
              1,
              Math.floor(current.threshold * moq) - unitsReserved + 1,
            );
            return (
              <span className="text-ink-400">
                → {formatPriceCompact(next.price_cents)} in {unitsLeft}{" "}
                {unitsLeft === 1 ? "unit" : "units"}
              </span>
            );
          })()
        ) : (
          <span className="text-ink-400">Top tier</span>
        )}
      </div>
    </div>
  );
}
