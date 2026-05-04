import { createSupabaseServerClient } from "./supabase/server";
import { marginCurve } from "./pricing";
import type {
  Batch,
  Product,
  ProductWithBatch,
  Reservation,
} from "./types";

/**
 * Apply runtime defaults + derived price curve.
 *
 * Defaults guard against rows from older schemas (before migrations 0002 and
 * 0004 are applied) — `in_box`, `specs`, `category`, etc. may simply not be
 * present, which would otherwise crash any `.length`/`.map` call downstream.
 */
function normalizeProduct(p: Partial<Product> & Pick<Product, "id" | "est_production_cost_cents">): Product {
  return {
    id: p.id,
    name: p.name ?? "",
    image_url: p.image_url ?? "",
    description: p.description ?? null,
    moq: p.moq ?? 1,
    base_price_cents: p.base_price_cents ?? 0,
    manufacturer: p.manufacturer ?? "",
    manufacturer_clients: p.manufacturer_clients ?? [],
    est_production_cost_cents: p.est_production_cost_cents,
    comparable_brand_name: p.comparable_brand_name ?? "",
    comparable_brand_price_cents: p.comparable_brand_price_cents ?? 0,
    in_use_image_url: p.in_use_image_url ?? null,
    in_box: p.in_box ?? [],
    specs: p.specs ?? [],
    health_benefit: p.health_benefit ?? null,
    category: p.category ?? "general",
    created_at: p.created_at ?? "",
    price_curve: marginCurve(p.est_production_cost_cents),
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
      return batch ? { ...normalizeProduct(p), batch } : null;
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
    product: normalizeProduct(r.batch.product),
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
