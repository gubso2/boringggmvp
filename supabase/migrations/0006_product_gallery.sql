-- =====================================================================
-- Boringgg — every product now has a 3-image gallery in the InfoModal:
--   1. The product in use      ← repurposes `image_url`
--   2. Benefits / lifestyle     ← new `image_benefits_url`
--   3. What's in the box        ← new `image_in_box_url`
--
-- The legacy `in_use_image_url` column is left in place for backward compat
-- but is no longer read by the app. The seed.sql update at the bottom
-- shifts existing image data into the new arrangement.
-- =====================================================================

alter table public.products
  add column if not exists image_benefits_url text,
  add column if not exists image_in_box_url text;
