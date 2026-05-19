-- =====================================================================
-- Boringgg — store the comparable brand's website URL so the InfoModal
-- can link out to it for shopper comparison.
-- =====================================================================

alter table public.products
  add column if not exists comparable_brand_url text;
