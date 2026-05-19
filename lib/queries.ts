import { createSupabaseServerClient } from "./supabase/server";
import { marginCurve } from "./pricing";
import type {
  Batch,
  Product,
  ProductReview,
  ProductVariant,
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
    comparable_brand_url: p.comparable_brand_url ?? null,
    in_use_image_url: p.in_use_image_url ?? null,
    image_benefits_url: p.image_benefits_url ?? null,
    image_in_box_url: p.image_in_box_url ?? null,
    in_box: p.in_box ?? [],
    specs: p.specs ?? [],
    health_benefit: p.health_benefit ?? null,
    category: p.category ?? "general",
    variants: p.variants ?? [],
    reviews: p.reviews ?? [],
    avg_rating: p.avg_rating ?? 0,
    review_count: p.review_count ?? 0,
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

  const { data: variants, error: vErr } = await supabase
    .from("product_variants")
    .select("*")
    .order("sort_order", { ascending: true });
  if (vErr) throw vErr;

  const { data: reviews, error: rErr } = await supabase
    .from("product_reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (rErr) throw rErr;

  const batchByProduct = new Map<string, Batch>();
  for (const b of batches as Batch[]) batchByProduct.set(b.product_id, b);

  const variantsByProduct = new Map<string, ProductVariant[]>();
  for (const v of (variants ?? []) as ProductVariant[]) {
    const arr = variantsByProduct.get(v.product_id) ?? [];
    arr.push(v);
    variantsByProduct.set(v.product_id, arr);
  }

  const reviewsByProduct = new Map<string, ProductReview[]>();
  for (const r of (reviews ?? []) as ProductReview[]) {
    const arr = reviewsByProduct.get(r.product_id) ?? [];
    arr.push(r);
    reviewsByProduct.set(r.product_id, arr);
  }

  return (products as Product[])
    .map((p) => {
      const batch = batchByProduct.get(p.id);
      if (!batch) return null;
      const productReviews = reviewsByProduct.get(p.id) ?? [];
      const avg =
        productReviews.length === 0
          ? 0
          : productReviews.reduce((s, r) => s + r.rating, 0) /
            productReviews.length;
      const normalized = normalizeProduct(p);
      return {
        ...normalized,
        variants: variantsByProduct.get(p.id) ?? [],
        reviews: productReviews,
        avg_rating: avg,
        review_count: productReviews.length,
        batch,
      };
    })
    .filter((x): x is ProductWithBatch => x !== null);
}

export async function getCurrentUserReservations(): Promise<
  Array<
    Reservation & {
      product: Product;
      batch: Batch;
      variant: ProductVariant | null;
    }
  >
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "*, batch:batches(*, product:products(*)), variant:product_variants(*)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  type Row = Reservation & {
    batch: Batch & { product: Product };
    variant: ProductVariant | null;
  };
  return (data as Row[]).map((r) => ({
    ...r,
    batch: r.batch,
    product: normalizeProduct(r.batch.product),
    variant: r.variant ?? null,
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
