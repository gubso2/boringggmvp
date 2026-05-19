import type { PriceTier } from "./types";

/**
 * Flat markup applied to every product's production cost.
 * Change this single constant to reprice the entire catalog.
 *
 *   price = round(cost × (1 + PRICE_MARKUP))
 *
 * Default 0.30 (30% markup) — the midpoint of the previous 20–50% tier ramp.
 */
export const PRICE_MARKUP = 0.3;

/**
 * Degenerate single-tier curve. We keep the curve shape so downstream code
 * (DB column, API, cart math) still works, but every threshold maps to the
 * same fixed price.
 */
export const MARGIN_TIERS: ReadonlyArray<{ threshold: number; markup: number }> =
  [{ threshold: 1.0, markup: PRICE_MARKUP }];

/**
 * Build the price curve for a product. Always a single tier now — the price
 * does not change as the batch fills.
 */
export function marginCurve(costCents: number): PriceTier[] {
  return [
    {
      threshold: 1.0,
      price_cents: Math.round(costCents * (1 + PRICE_MARKUP)),
    },
  ];
}

/**
 * Returns the price (cents) for a unit reserved RIGHT NOW.
 *
 * `unitsReserved` / `moq` are kept in the signature for backward compatibility
 * with callers, but the curve is single-tier so the values are ignored.
 */
export function currentPriceCents(
  unitsReserved: number,
  moq: number,
  curve: PriceTier[],
): number {
  void unitsReserved;
  void moq;
  if (curve.length === 0) {
    throw new Error("price_curve must contain at least one tier");
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
