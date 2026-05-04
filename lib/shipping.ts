/** Free shipping unlocks at $75 subtotal. Pre-multiplier (uses real cart price). */
export const FREE_SHIPPING_THRESHOLD_CENTS = 7500;

export function freeShippingProgress(subtotalCents: number) {
  const qualifies = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  return {
    threshold: FREE_SHIPPING_THRESHOLD_CENTS,
    subtotal: subtotalCents,
    qualifies,
    awayCents: qualifies
      ? 0
      : FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents,
    progress: Math.max(
      0,
      Math.min(1, subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS),
    ),
  };
}
