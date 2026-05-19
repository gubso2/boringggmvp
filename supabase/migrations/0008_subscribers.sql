-- =====================================================================
-- Boringgg — email newsletter subscribers (footer signup).
-- Public anonymous insert only; no read policy. Email is unique.
-- =====================================================================

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- Reads stay private; the API uses the service-role key when it needs
-- to list/export. Anyone can subscribe.
drop policy if exists "subscribers anon insert" on public.subscribers;
create policy "subscribers anon insert"
  on public.subscribers for insert
  with check (true);
