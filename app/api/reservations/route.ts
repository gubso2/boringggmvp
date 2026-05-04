import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { currentPriceCents } from "@/lib/pricing";
import { INVITES_REQUIRED } from "@/lib/invites";
import type { Batch, Product } from "@/lib/types";

const Body = z.object({
  batch_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof z.ZodError ? e.issues[0]?.message : "Bad request" },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  // Invite gate
  const { count: invites } = await admin
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("inviter_id", user.id);
  if ((invites ?? 0) < INVITES_REQUIRED) {
    return NextResponse.json(
      {
        error: `Invite ${INVITES_REQUIRED - (invites ?? 0)} more friend(s) to unlock.`,
      },
      { status: 403 },
    );
  }

  // Fetch batch + product
  const { data: batch, error: batchErr } = await admin
    .from("batches")
    .select("*, product:products(*)")
    .eq("id", body.batch_id)
    .single<Batch & { product: Product }>();
  if (batchErr || !batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  if (batch.status !== "active" || new Date(batch.end_at) < new Date()) {
    return NextResponse.json({ error: "Batch is closed" }, { status: 409 });
  }
  if (batch.units_reserved + body.quantity > batch.product.moq) {
    return NextResponse.json(
      { error: "Not enough units left in this batch" },
      { status: 409 },
    );
  }

  const unitPrice = currentPriceCents(
    batch.units_reserved,
    batch.product.moq,
    batch.product.price_curve,
  );
  const total = unitPrice * body.quantity;

  // Insert pending reservation FIRST so we have an id to attach to PaymentIntent
  const { data: reservation, error: resErr } = await admin
    .from("reservations")
    .insert({
      user_id: user.id,
      batch_id: batch.id,
      quantity: body.quantity,
      unit_price_cents: unitPrice,
      total_paid_cents: total,
      status: "pending",
    })
    .select("*")
    .single();
  if (resErr || !reservation) {
    return NextResponse.json(
      { error: resErr?.message ?? "Could not create reservation" },
      { status: 500 },
    );
  }

  let intent;
  try {
    intent = await getStripe().paymentIntents.create({
      amount: total,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        reservation_id: reservation.id,
        batch_id: batch.id,
        product_id: batch.product.id,
        user_id: user.id,
      },
    });
  } catch (e) {
    // Clean up the pending row if Stripe failed
    await admin.from("reservations").delete().eq("id", reservation.id);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Stripe error" },
      { status: 502 },
    );
  }

  await admin
    .from("reservations")
    .update({ stripe_payment_intent_id: intent.id })
    .eq("id", reservation.id);

  return NextResponse.json({
    client_secret: intent.client_secret,
    reservation_id: reservation.id,
  });
}
