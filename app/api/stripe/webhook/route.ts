import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reservationIdsFromMetadata(meta: Stripe.Metadata | null): string[] {
  const raw = meta?.reservation_ids;
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json(
      { error: "Webhook misconfigured" },
      { status: 400 },
    );
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid signature" },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdminClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const ids = reservationIdsFromMetadata(intent.metadata);
      if (ids.length === 0) break;

      // Idempotent flip: only pending → paid. Trigger increments
      // batches.units_reserved per row.
      await admin
        .from("reservations")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .in("id", ids)
        .eq("status", "pending");
      break;
    }
    case "payment_intent.payment_failed":
    case "payment_intent.canceled": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const ids = reservationIdsFromMetadata(intent.metadata);
      if (ids.length === 0) break;
      await admin
        .from("reservations")
        .delete()
        .in("id", ids)
        .eq("status", "pending");
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
