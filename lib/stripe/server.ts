import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Returns the Stripe SDK client. Lazy-initialized so that builds without
 * STRIPE_SECRET_KEY don't fail at module load (during "Collecting page data"
 * Next.js evaluates each route file's top-level imports).
 */
export function getStripe(): Stripe {
  if (!cached) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    cached = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return cached;
}
