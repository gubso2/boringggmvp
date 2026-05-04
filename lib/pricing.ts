import type { PriceTier } from "./types";

/**
 * Pricing tiers expressed as { fill threshold, markup over production cost }.
 * Each tier covers 25% of the MOQ; markup ramps from 20% → 50% as the batch fills.
 *
 *  0–25% of MOQ → cost × 1.20
 * 25–50%        → cost × 1.30
 * 50–75%        → cost × 1.40
 * 75–100%       → cost × 1.50
 */
export const MARGIN_TIERS: ReadonlyArray<{ threshold: number; markup: number }> =
  [
    { threshold: 0.25, markup: 0.2 },
    { threshold: 0.5, markup: 0.3 },
    { threshold: 0.75, markup: 0.4 },
    { threshold: 1.0, markup: 0.5 },
  ];

/**
 * Build the live price curve for a product from its production cost. Always
 * use this — DB-stored price_curve is kept for backward compat but ignored at
 * runtime so changing MARGIN_TIERS in code propagates everywhere.
 */
export function marginCurve(costCents: number): PriceTier[] {
  return MARGIN_TIERS.map((t) => ({
    threshold: t.threshold,
    price_cents: Math.round(costCents * (1 + t.markup)),
  }));
}

/**
 * Returns the price (cents) for a unit reserved RIGHT NOW given current fill.
 *
 * Curve is interpreted as: price tier applies while cumulative fill ≤ threshold.
 * Tiers must be sorted ascending by threshold and the last threshold should be 1.0.
 */
export function currentPriceCents(
  unitsReserved: number,
  moq: number,
  curve: PriceTier[],
): number {
  if (curve.length === 0) {
    throw new Error("price_curve must contain at least one tier");
  }
  const filled = moq <= 0 ? 1 : unitsReserved / moq;
  for (const tier of curve) {
    if (filled <= tier.threshold) return tier.price_cents;
  }
  return curve[curve.length - 1].price_cents;
}

/**
 * Convenience: compute current price directly from production cost.
 */
export function currentPriceCentsFromCost(
  unitsReserved: number,
  moq: number,
  costCents: number,
): number {
  return currentPriceCents(unitsReserved, moq, marginCurve(costCents));
}

/**
 * Returns price-vs-fill points for the mini graph. Includes one point at the
 * left edge (0 fill) for each tier and one at the right edge (1.0).
 */
export function priceCurvePoints(curve: PriceTier[]) {
  const sorted = [...curve].sort((a, b) => a.threshold - b.threshold);
  const points: { fill: number; price_cents: number }[] = [];
  let prevThreshold = 0;
  for (const tier of sorted) {
    points.push({ fill: prevThreshold, price_cents: tier.price_cents });
    points.push({ fill: tier.threshold, price_cents: tier.price_cents });
    prevThreshold = tier.threshold;
  }
  return points;
}
