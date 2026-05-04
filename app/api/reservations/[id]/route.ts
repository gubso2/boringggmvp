import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import type { Batch, Reservation } from "@/lib/types";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  const { data: row, error } = await admin
    .from("reservations")
    .select("*, batch:batches(*)")
    .eq("id", id)
    .single<Reservation & { batch: Batch }>();
  if (error || !row) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  if (row.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (row.status !== "paid") {
    return NextResponse.json(
      { error: "Only paid reservations can be refunded" },
      { status: 409 },
    );
  }
  if (
    row.batch.status !== "active" ||
    new Date(row.batch.end_at) < new Date()
  ) {
    return NextResponse.json(
      { error: "Batch has closed — refunds are no longer available" },
      { status: 409 },
    );
  }
  if (!row.stripe_payment_intent_id) {
    return NextResponse.json(
      { error: "Missing payment intent on reservation" },
      { status: 500 },
    );
  }

  try {
    await getStripe().refunds.create({
      payment_intent: row.stripe_payment_intent_id,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Stripe refund failed" },
      { status: 502 },
    );
  }

  // Trigger decrements batch.units_reserved on this status transition
  const { error: updateErr } = await admin
    .from("reservations")
    .update({ status: "refunded", refunded_at: new Date().toISOString() })
    .eq("id", id);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
