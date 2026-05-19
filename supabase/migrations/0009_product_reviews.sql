-- =====================================================================
-- Boringgg — customer reviews per product. Public read; writes are
-- expected to come from a future review-submission flow or seed.
-- =====================================================================

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  reviewer_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists product_reviews_product_idx
  on public.product_reviews (product_id, created_at desc);

alter table public.product_reviews enable row level security;

drop policy if exists "reviews public read" on public.product_reviews;
create policy "reviews public read"
  on public.product_reviews for select
  using (true);
