-- =====================================================================
-- Boringgg — product variants (e.g. colors, sizes).
--
-- A product MAY have variants. The batch + MOQ live at the product level
-- (we still produce one shared bulk run); variants only determine what
-- ships to each buyer. Reservations gain a nullable variant_id so the
-- supplier order knows how many of each variant to produce.
-- =====================================================================

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  /** Hex like "#FFFFFF" for color variants. Null for non-color variants. */
  swatch_hex text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_variants_product_idx
  on public.product_variants (product_id, sort_order);

alter table public.reservations
  add column if not exists variant_id uuid
    references public.product_variants(id);

-- Variants are public-read so anonymous landing pages can list them.
alter table public.product_variants enable row level security;

drop policy if exists "variants public read" on public.product_variants;
create policy "variants public read"
  on public.product_variants for select
  using (true);
