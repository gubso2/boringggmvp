import type { PriceTier } from "./types";

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
