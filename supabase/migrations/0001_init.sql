-- =====================================================================
-- Boringgg — initial schema
-- =====================================================================

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_cron";

-- ---------------------------------------------------------------------
-- profiles : 1:1 with auth.users, mirrors phone for FK + invite checks
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text unique not null,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a user signs up via auth.
-- Supabase stores auth.users.phone as digits-only (no leading '+');
-- we store E.164 in profiles so it matches what the app passes around.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.phone is null then
    return new;
  end if;
  insert into public.profiles (id, phone)
  values (
    new.id,
    case when new.phone like '+%' then new.phone else '+' || new.phone end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- products : catalog
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text not null,
  description text,
  moq int not null check (moq > 0),
  base_price_cents int not null check (base_price_cents > 0),
  price_curve jsonb not null,
  manufacturer text not null,
  manufacturer_clients text[] not null default '{}',
  est_production_cost_cents int not null check (est_production_cost_cents > 0),
  comparable_brand_name text not null,
  comparable_brand_price_cents int not null check (comparable_brand_price_cents > 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- batches : one active batch per product
-- ---------------------------------------------------------------------
create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  start_at timestamptz not null default now(),
  end_at timestamptz not null,
  units_reserved int not null default 0 check (units_reserved >= 0),
  status text not null default 'active'
    check (status in ('active', 'closed', 'fulfilled')),
  created_at timestamptz not null default now()
);
create index if not exists batches_product_status_idx on public.batches (product_id, status);
create index if not exists batches_end_at_idx on public.batches (end_at);

-- ---------------------------------------------------------------------
-- reservations : a user's stake in a batch
-- ---------------------------------------------------------------------
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  batch_id uuid not null references public.batches (id) on delete cascade,
  quantity int not null check (quantity > 0),
  unit_price_cents int not null check (unit_price_cents > 0),
  total_paid_cents int not null check (total_paid_cents > 0),
  stripe_payment_intent_id text unique,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  refunded_at timestamptz
);
create index if not exists reservations_user_status_idx on public.reservations (user_id, status);
create index if not exists reservations_batch_status_idx on public.reservations (batch_id, status);

-- Adjust batch.units_reserved on reservation status transitions
create or replace function public.adjust_batch_units()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- pending -> paid : add quantity
  if (tg_op = 'UPDATE' and old.status <> 'paid' and new.status = 'paid') then
    update public.batches
       set units_reserved = units_reserved + new.quantity
     where id = new.batch_id;
  end if;

  -- paid -> refunded : subtract quantity
  if (tg_op = 'UPDATE' and old.status = 'paid' and new.status = 'refunded') then
    update public.batches
       set units_reserved = greatest(0, units_reserved - old.quantity)
     where id = old.batch_id;
  end if;

  return new;
end;
$$;

drop trigger if exists reservations_adjust_units on public.reservations;
create trigger reservations_adjust_units
  after update on public.reservations
  for each row execute function public.adjust_batch_units();

-- ---------------------------------------------------------------------
-- referrals : phone-based invites (only "sent" required)
-- ---------------------------------------------------------------------
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.profiles (id) on delete cascade,
  invited_phone text not null,
  created_at timestamptz not null default now(),
  unique (inviter_id, invited_phone)
);
create index if not exists referrals_inviter_idx on public.referrals (inviter_id);

-- ---------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.batches     enable row level security;
alter table public.reservations enable row level security;
alter table public.referrals   enable row level security;

-- profiles: user reads own
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update"
  on public.profiles for update
  using (auth.uid() = id);

-- products: public read
drop policy if exists "products public read" on public.products;
create policy "products public read"
  on public.products for select
  using (true);

-- batches: public read
drop policy if exists "batches public read" on public.batches;
create policy "batches public read"
  on public.batches for select
  using (true);

-- reservations: user reads own
drop policy if exists "reservations self read" on public.reservations;
create policy "reservations self read"
  on public.reservations for select
  using (auth.uid() = user_id);

-- referrals: user reads & inserts own
drop policy if exists "referrals self read" on public.referrals;
create policy "referrals self read"
  on public.referrals for select
  using (auth.uid() = inviter_id);

drop policy if exists "referrals self insert" on public.referrals;
create policy "referrals self insert"
  on public.referrals for insert
  with check (auth.uid() = inviter_id);

-- Note: writes to reservations/batches happen via API routes using the
-- service-role key, which bypasses RLS. No write policies needed for
-- authenticated users on those tables.

-- ---------------------------------------------------------------------
-- Realtime: publish batches table for live progress updates
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'batches'
  ) then
    alter publication supabase_realtime add table public.batches;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Cron: hourly close-expired-batches job (idempotent)
-- ---------------------------------------------------------------------
do $cron$
begin
  if not exists (
    select 1 from cron.job where jobname = 'close-expired-batches'
  ) then
    perform cron.schedule(
      'close-expired-batches',
      '0 * * * *',
      $sql$
        update public.batches
           set status = 'closed'
         where status = 'active' and end_at < now();
      $sql$
    );
  end if;
end
$cron$;
