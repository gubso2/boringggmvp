"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";

let promise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!promise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      // Without a publishable key Stripe.js throws synchronously. Resolve to
      // null so callers can detect "Stripe not configured" without taking
      // the rest of the page down.
      // eslint-disable-next-line no-console
      console.warn(
        "[stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set — checkout disabled.",
      );
      promise = Promise.resolve(null);
    } else {
      promise = loadStripe(key);
    }
  }
  return promise;
}
