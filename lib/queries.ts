import { createSupabaseServerClient } from "./supabase/server";
import { marginCurve } from "./pricing";
import type {
  Batch,
  Product,
  ProductWithBatch,
  Reservation,
} from "./types";

/**
 * The DB stores a `price_curve` per product, but at runtime we always derive
 * the curve from `est_production_cost_cents` so that MARGIN_TIERS in code is
 * the single source of truth.
 */
function withDerivedCurve<P extends Product>(product: P): P {
  return {
    ...product,
    price_curve: marginCurve(product.est_production_cost_cents),
  };
}

export async function getProductsWithBatches(): Promise<ProductWithBatch[]> {
  const supabase = await createSupabaseServerClient();
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (pErr) throw pErr;

  const { data: batches, error: bErr } = await supabase
    .from("batches")
    .select("*")
    .eq("status", "active");
  if (bErr) throw bErr;

  const byProduct = new Map<string, Batch>();
  for (const b of batches as Batch[]) byProduct.set(b.product_id, b);

  return (products as Product[])
    .map((p) => {
      const batch = byProduct.get(p.id);
      return batch ? { ...withDerivedCurve(p), batch } : null;
    })
    .filter((x): x is ProductWithBatch => x !== null);
}

export async function getCurrentUserReservations(): Promise<
  Array<Reservation & { product: Product; batch: Batch }>
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("reservations")
    .select("*, batch:batches(*, product:products(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  type Row = Reservation & { batch: Batch & { product: Product } };
  return (data as Row[]).map((r) => ({
    ...r,
    batch: r.batch,
    product: withDerivedCurve(r.batch.product),
  }));
}

export async function getInviteCount(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("inviter_id", user.id);
  if (error) throw error;
  return count ?? 0;
}
