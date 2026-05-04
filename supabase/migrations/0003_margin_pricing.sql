-- =====================================================================
-- Boringgg — margin-based pricing curve
--
-- Each product's price now derives from its production cost via four
-- equal MOQ tiers, with markup ramping 20% → 30% → 40% → 50% as the
-- batch fills. The runtime app overrides DB price_curve from cost on
-- read; this migration keeps the DB self-consistent and provides a
-- helper for SQL consumers.
-- =====================================================================

create or replace function public.margin_curve(cost_cents int)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_array(
    jsonb_build_object('threshold', 0.25,
                       'price_cents', round(cost_cents * 1.20)::int),
    jsonb_build_object('threshold', 0.50,
                       'price_cents', round(cost_cents * 1.30)::int),
    jsonb_build_object('threshold', 0.75,
                       'price_cents', round(cost_cents * 1.40)::int),
    jsonb_build_object('threshold', 1.00,
                       'price_cents', round(cost_cents * 1.50)::int)
  );
$$;

-- Backfill any existing rows so the DB matches what the app derives.
update public.products
   set price_curve = public.margin_curve(est_production_cost_cents);
