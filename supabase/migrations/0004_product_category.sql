-- =====================================================================
-- Boringgg — product category tag for icons / filtering
-- =====================================================================

alter table public.products
  add column if not exists category text not null default 'general';
