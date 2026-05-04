-- =====================================================================
-- Boringgg — richer product detail for InfoModal:
--   - in-use lifestyle image
--   - what's-in-the-box list
--   - comparison spec rows (ours vs comparable brand)
--   - one-sentence headline health/wellness benefit
-- All columns are nullable / default empty so existing seed data still works.
-- =====================================================================

alter table public.products
  add column if not exists in_use_image_url text,
  add column if not exists in_box text[] not null default '{}',
  add column if not exists specs jsonb not null default '[]'::jsonb,
  add column if not exists health_benefit text;
