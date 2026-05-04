import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Pin to the version the installed SDK was generated against.
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});
