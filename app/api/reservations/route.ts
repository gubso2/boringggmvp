import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { currentPriceCentsFromCost } from "@/lib/pricing";
import { INVITES_REQUIRED } from "@/lib/invites";
import type { Batch, Product } from "@/lib/types";

const Body = z.object({
  items: z
    .array(
      z.object({
        batch_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(20),
  pay_double: z.boolean().default(false),
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

  // Invite gate — bypassed only when paying double
  const { count: invites } = await admin
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("inviter_id", user.id);
  const hasInvited = (invites ?? 0) >= INVITES_REQUIRED;
  if (!hasInvited && !body.pay_double) {
    return NextResponse.json(
      {
        error: `Invite ${INVITES_REQUIRED - (invites ?? 0)} more friend(s) — or check 'Pay double' to skip.`,
      },
      { status: 403 },
    );
  }

  // Fetch all batches in a single query
  const batchIds = body.items.map((i) => i.batch_id);
  const { data: batches, error: batchErr } = await admin
    .from("batches")
    .select("*, product:products(*)")
    .in("id", batchIds);
  if (batchErr || !batches) {
    return NextResponse.json(
      { error: batchErr?.message ?? "Could not load batches" },
      { status: 500 },
    );
  }

  type BatchWithProduct = Batch & { product: Product };
  const batchById = new Map<string, BatchWithProduct>();
  for (const b of batches as BatchWithProduct[]) batchById.set(b.id, b);

  // Validate every line: batch exists, active, and has stock for the quantity
  const now = Date.now();
  const multiplier = !hasInvited && body.pay_double ? 2 : 1;
  const lines: Array<{
    batch_id: string;
    quantity: number;
    unit_price_cents: number;
    total_cents: number;
  }> = [];

  for (const item of body.items) {
    const batch = batchById.get(item.batch_id);
    if (!batch) {
      return NextResponse.json(
        { error: `Batch ${item.batch_id} not found` },
        { status: 404 },
      );
    }
    if (batch.status !== "active" || new Date(batch.end_at).getTime() < now) {
      return NextResponse.json(
        { error: `${batch.product.name} batch has closed` },
        { status: 409 },
      );
    }
    if (batch.units_reserved + item.quantity > batch.product.moq) {
      return NextResponse.json(
        { error: `Not enough units left in ${batch.product.name}` },
        { status: 409 },
      );
    }
    const basePrice = currentPriceCentsFromCost(
      batch.units_reserved,
      batch.product.moq,
      batch.product.est_production_cost_cents,
    );
    const unitPrice = basePrice * multiplier;
    lines.push({
      batch_id: batch.id,
      quantity: item.quantity,
      unit_price_cents: unitPrice,
      total_cents: unitPrice * item.quantity,
    });
  }

  const grandTotal = lines.reduce((s, l) => s + l.total_cents, 0);

  // Insert pending reservations
  const { data: reservations, error: insertErr } = await admin
    .from("reservations")
    .insert(
      lines.map((l) => ({
        user_id: user.id,
        batch_id: l.batch_id,
        quantity: l.quantity,
        unit_price_cents: l.unit_price_cents,
        total_paid_cents: l.total_cents,
        status: "pending",
      })),
    )
    .select("id");

  if (insertErr || !reservations) {
    return NextResponse.json(
      { error: insertErr?.message ?? "Could not create reservations" },
      { status: 500 },
    );
  }

  const reservationIds = reservations.map((r) => r.id);

  let intent;
  try {
    intent = await getStripe().paymentIntents.create({
      amount: grandTotal,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        // comma-separated UUIDs; Stripe metadata values must be strings ≤500 chars
        reservation_ids: reservationIds.join(","),
        user_id: user.id,
        pay_double: String(multiplier === 2),
      },
    });
  } catch (e) {
    await admin.from("reservations").delete().in("id", reservationIds);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Stripe error" },
      { status: 502 },
    );
  }

  await admin
    .from("reservations")
    .update({ stripe_payment_intent_id: intent.id })
    .in("id", reservationIds);

  return NextResponse.json({
    client_secret: intent.client_secret,
    reservation_ids: reservationIds,
    amount: grandTotal,
  });
}
