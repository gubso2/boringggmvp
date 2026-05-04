# Boringgg

Group-buy eCommerce MVP. Users join 7-day batches at dynamic prices that increase as MOQ fills, must invite 2 new phone numbers to unlock purchase, pay upfront via Stripe, and can self-refund anytime before the batch closes.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · Supabase (Postgres, Auth, Realtime) · Stripe · Vercel.

---

## Project layout

```
app/
  layout.tsx                 root layout
  page.tsx                   landing (hero, drops, how-it-works, about)
  dashboard/page.tsx         user reservations
  api/
    invites/route.ts         POST – record phone-based invite
    reservations/route.ts    POST – pending reservation + Stripe PaymentIntent
    reservations/[id]/route.ts  DELETE – refund flow
    stripe/webhook/route.ts  Stripe webhook → flips reservation to paid

components/
  AppProvider.tsx            auth + invite + modal state
  ModalManager.tsx           mounts every modal once
  nav/StickyNav.tsx
  landing/{Hero,ProductGrid,ProductCard,PriceGraph,HowItWorks,About,Footer}.tsx
  modals/{Auth,Info,Invite,BatchJoin,RefundConfirm}Modal.tsx
  dashboard/DashboardView.tsx
  shared/{Modal,Button,Input,ProgressBar,CountdownTimer}.tsx

lib/
  supabase/{client,server,admin,middleware}.ts
  stripe/{server,client}.ts
  pricing.ts                 single source of truth for tier math
  realtime.ts                useBatchRealtime hook
  invites.ts                 E.164 validate + normalize
  queries.ts                 server-side data loaders
  types.ts utils.ts

supabase/
  migrations/0001_init.sql   schema, RLS, triggers, pg_cron, realtime
  seed.sql                   12 products + 12 active batches

middleware.ts                refreshes Supabase session
```

---

## Local setup

### 1. Install dependencies

```bash
pnpm install        # or: npm install / yarn
```

### 2. Provision Supabase

Either use a hosted project (recommended) or `supabase start` locally.

In the Supabase dashboard:

- **Auth → Phone Auth** → enable. Provider: **Twilio**. Add your Twilio Account SID, Auth Token, and a Twilio phone number. Free Twilio trial works fine.
- **Database → SQL Editor** → run `supabase/migrations/0001_init.sql`, then run `supabase/seed.sql`.
- **Database → Replication** → confirm the `batches` table is part of the `supabase_realtime` publication (the migration adds it).

Copy your project's URL, `anon` key, and `service_role` key.

### 3. Set up Stripe

1. Create a Stripe account in test mode.
2. Grab `pk_test_*` and `sk_test_*`.
3. In a separate terminal, forward webhooks to local:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the `whsec_*` it prints — that's your `STRIPE_WEBHOOK_SECRET`.

### 4. Environment variables

```bash
cp .env.example .env.local
```

Fill `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run

```bash
pnpm dev
```

Open <http://localhost:3000>.

---

## End-to-end test

1. Click **Sign in** → enter your phone in international format (`+15551230123`) → enter the SMS code Twilio sends. You're authenticated.
2. On any product card click **Join batch**. The modal shows `0 / 2 invited` and the **Pay & reserve** button is disabled.
3. Click **Invite to unlock**, paste two new phone numbers (must NOT belong to existing accounts), submit. The counter flips to `2 / 2`.
4. Pick a quantity, click **Pay & reserve**. Stripe Elements appear in the same modal — pay with `4242 4242 4242 4242`, any future date, any CVC, any ZIP.
5. The Stripe webhook flips the reservation to `paid` and the batch progress increments live (Realtime). The success state shows in the modal.
6. Open `/dashboard` → your reservation is listed with a **Refund** button.
7. Click **Refund** → confirm. Stripe issues the refund, the batch units decrement.

---

## Deploying to Vercel

1. Push the project to GitHub.
2. **Vercel → New Project** → import the repo. Root directory is the project root.
3. Set the same env vars as `.env.local`, but with **production** Stripe and Supabase keys.
4. After the first deploy:
   - In Stripe, create a webhook endpoint pointed at `https://<your-domain>/api/stripe/webhook` (events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`). Copy the signing secret into Vercel env.
   - In Supabase **Auth → URL Configuration**, add `https://<your-domain>` to the allowed redirect list.
5. Re-deploy if you changed env vars.

The hourly `pg_cron` job in the migration auto-closes expired batches.

---

## How the pieces fit

- **Pricing**. `lib/pricing.ts → currentPriceCents(units, moq, curve)` is the only source of truth. Used by the card display, the join modal, and the API route that creates the PaymentIntent. Curve is JSONB on `products`, e.g. `[{threshold:0.2,price_cents:4200},{threshold:0.5,price_cents:4900},{threshold:1.0,price_cents:5800}]`.
- **Price lock**. Locked at payment time. The PaymentIntent is created with the exact `amount = unit_price * quantity`, and the `unit_price_cents` is stored on the reservation row.
- **Realtime**. The `batches` table is in the `supabase_realtime` publication. Each `<ProductCard>` and the `BatchJoinModal` use `useBatchRealtime(batch)` to subscribe to UPDATEs of their own batch row. When a webhook flips a reservation to `paid`, the trigger increments `batches.units_reserved`, every connected client sees the new value, and the price/progress/ETA refresh.
- **Invite gate**. The API route `/api/reservations` (server-side) re-checks `count(referrals where inviter_id = user.id) >= 2` regardless of UI state.
- **Refund safety**. The DELETE handler verifies the reservation belongs to the user, the batch is still active, and the row is in `paid` status before calling Stripe.
- **Batch closure**. Two layers: API mutations reject when `now() >= end_at`, and `pg_cron` flips status to `closed` hourly so reads stay accurate even without traffic.

---

## Type-checking

```bash
pnpm typecheck
pnpm build
```
