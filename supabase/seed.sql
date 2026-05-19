-- =====================================================================
-- Boringgg — seed data: 4 products + 4 active batches
-- All prices are USD cents. Pricing is flat per product (PRICE_MARKUP in
-- lib/pricing.ts) — DB price_curve is kept current via the trailing
-- margin_curve() update for any SQL-side consumers.
-- =====================================================================

truncate table public.reservations restart identity cascade;
truncate table public.batches restart identity cascade;
truncate table public.products restart identity cascade;

with seeded as (
  insert into public.products
    (id, name, image_url, image_benefits_url, image_in_box_url, description,
     moq, base_price_cents, price_curve,
     manufacturer, manufacturer_clients, est_production_cost_cents,
     comparable_brand_name, comparable_brand_price_cents, comparable_brand_url,
     category, in_box, specs, health_benefit)
  values
    -- 1. Nanobubble Filtered Showerhead
    (gen_random_uuid(),
     'Nanobubble Filtered Showerhead',
     'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1556228720-da4c5d6c52d8?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1604918867842-d5b95ebed3a8?w=900&q=80&auto=format&fit=crop',
     'Nanobubble + ionic showerhead with a KDF/activated-carbon filter. Removes 99% of chlorine and chloramines and infuses water with negative ions.',
     100, 4550,
     '[{"threshold":1.0,"price_cents":4550}]'::jsonb,
     'Foshan Hydrosphere Industries',
     ARRAY['Hello Klean','Canopy','Aquasana'],
     3500, 'Jolie Filtered Showerhead', 16500, 'https://jolieskinco.com',
     'bath',
     ARRAY['Showerhead','Flexible hose','KDF + activated carbon cartridge','Teflon tape','Install tool'],
     '[{"label":"Filter media","ours":"KDF-55 + activated carbon","theirs":"KDF-55 + calcium sulfite"},
       {"label":"Chlorine removal","ours":"99%","theirs":"95%"},
       {"label":"Cartridge life","ours":"6 months","theirs":"3 months"},
       {"label":"Spray modes","ours":"3 (rain / mist / massage)","theirs":"1"},
       {"label":"Nanobubble tech","ours":"Yes","theirs":"No"}]'::jsonb,
     'Filters chlorine and heavy metals out of tap water — protects skin barrier, hair cuticle, and scalp microbiome.'),

    -- 2. Mulberry Silk Pillowcase
    (gen_random_uuid(),
     'Mulberry Silk Pillowcase',
     'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1532413992378-f169ac26fff0?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=900&q=80&auto=format&fit=crop',
     '22-momme grade-6A mulberry silk with hidden zipper closure. Hand-finished, OEKO-TEX certified.',
     200, 2340,
     '[{"threshold":1.0,"price_cents":2340}]'::jsonb,
     'Hangzhou Wanshili Silk Mill',
     ARRAY['Slip','Kitsch','Lunya'],
     1800, 'Slip Silk Pillowcase', 8900, 'https://slip.com',
     'bedroom',
     ARRAY['Silk pillowcase','Silk dust bag','Care card'],
     '[{"label":"Momme","ours":"22","theirs":"22"},
       {"label":"Grade","ours":"6A mulberry","theirs":"6A mulberry"},
       {"label":"Closure","ours":"Hidden zipper","theirs":"Envelope"},
       {"label":"Certification","ours":"OEKO-TEX 100","theirs":"OEKO-TEX 100"},
       {"label":"Sizes","ours":"Standard / Queen / King","theirs":"Standard / Queen / King"}]'::jsonb,
     'Reduces friction on skin and hair — fewer sleep creases, less morning frizz, and noticeably less hair breakage.'),

    -- 3. Mulberry Silk Eyemask
    (gen_random_uuid(),
     'Mulberry Silk Eyemask',
     'https://images.unsplash.com/photo-1606922395891-2db8cea59c8d?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&q=80&auto=format&fit=crop',
     '22-momme silk with a contoured cotton shell. Adjustable hook-and-loop strap fits 21–25 in.',
     250, 1040,
     '[{"threshold":1.0,"price_cents":1040}]'::jsonb,
     'Hangzhou Wanshili Silk Mill',
     ARRAY['Slip','Drowsy','Lunya'],
     800, 'Slip Silk Eyemask', 5500, 'https://slip.com',
     'sleep',
     ARRAY['Eyemask','Silk dust bag','Care card'],
     '[{"label":"Material","ours":"22 momme mulberry silk","theirs":"22 momme mulberry silk"},
       {"label":"Shell","ours":"Contoured cotton","theirs":"Flat silk"},
       {"label":"Strap","ours":"Hook-and-loop","theirs":"Elastic"},
       {"label":"Light block","ours":"100%","theirs":"~95%"},
       {"label":"Hand washable","ours":"Yes","theirs":"Yes"}]'::jsonb,
     'Blocks 100% of ambient light — supports natural melatonin production and deeper REM sleep cycles.'),

    -- 4. Cold Plunge Ice Bath
    (gen_random_uuid(),
     'Cold Plunge Ice Bath',
     'https://images.unsplash.com/photo-1648044820842-3b40a3cbe92e?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1635776063643-8f5c3c0a8a47?w=900&q=80&auto=format&fit=crop',
     'Insulated 100-gallon cold-plunge tub. Drop-in chiller compatible, holds 39°F overnight, fits in a standard doorway.',
     30, 52000,
     '[{"threshold":1.0,"price_cents":52000}]'::jsonb,
     'Shenzhen Plungewerks',
     ARRAY['The Plunge','Ice Barrel','Inergize'],
     40000, 'Plunge Cold Plunge', 399000, 'https://thecoldplunge.com',
     'recovery',
     ARRAY['Insulated tub','Vinyl thermal cover','Drain plug + hose','Inflation pump','Owner''s manual'],
     '[{"label":"Capacity","ours":"100 gal","theirs":"107 gal"},
       {"label":"Insulation","ours":"3-layer EVA + closed-cell foam","theirs":"Polyurethane shell"},
       {"label":"Chiller","ours":"Compatible (¼ HP +)","theirs":"Included ½ HP"},
       {"label":"Hold temp (39°F)","ours":"24 hr","theirs":"24 hr"},
       {"label":"Setup","ours":"15 min, no plumbing","theirs":"Plumbing required"}]'::jsonb,
     'Cold immersion increases norepinephrine ~2.5×, activates brown fat, and accelerates post-workout recovery.')
  returning id, moq
)
insert into public.batches (product_id, end_at, units_reserved)
select
  id,
  now() + interval '7 days',
  -- Pre-fill 10–55% of MOQ so the cards show movement on a fresh seed.
  greatest(1, (moq * (0.10 + random() * 0.45))::int)
from seeded;

-- Keep the DB price_curve consistent with the runtime margin curve helper.
update public.products
   set price_curve = public.margin_curve(est_production_cost_cents);

-- Variants — currently only the Pillowcase has them (3 colors).
delete from public.product_variants
 where product_id in (select id from public.products);

insert into public.product_variants (product_id, name, swatch_hex, sort_order)
select p.id, v.name, v.swatch_hex, v.sort_order
  from public.products p
  cross join (values
    ('White', '#F4F1ED', 1),
    ('Pink',  '#E8B4B8', 2),
    ('Navy',  '#1E2A44', 3)
  ) as v(name, swatch_hex, sort_order)
 where p.name = 'Mulberry Silk Pillowcase';

-- Sample customer reviews. Re-seedable; deleted first so the seed is idempotent.
delete from public.product_reviews
 where product_id in (select id from public.products);

insert into public.product_reviews
  (product_id, reviewer_name, rating, title, body, created_at)
select p.id, r.reviewer_name, r.rating, r.title, r.body, r.created_at
  from public.products p
  join (values
    ('Nanobubble Filtered Showerhead', 'Sarah K.',  5, 'Skin is glowing',     'Two weeks in and my skin feels noticeably less tight after a shower. The chlorine smell is gone.', now() - interval '14 days'),
    ('Nanobubble Filtered Showerhead', 'Marcus T.', 5, 'Worth it',            'Softer hair, no more itchy scalp. Install was 10 minutes with the included tape.', now() - interval '21 days'),
    ('Nanobubble Filtered Showerhead', 'Priya R.',  4, 'Great but not magic', 'Definitely better than my old head. Water pressure stayed strong.', now() - interval '7 days'),
    ('Nanobubble Filtered Showerhead', 'Anna W.',   5, 'My partner notices',  'Both of us see the difference. Already ordered a backup cartridge.', now() - interval '5 days'),
    ('Nanobubble Filtered Showerhead', 'Diego A.',  4, 'Cartridge price',     'Filter works great — hope refills don''t blow the budget.', now() - interval '1 days'),

    ('Mulberry Silk Pillowcase', 'Emma R.',   5, 'No more breakouts',    'Less friction = fewer chin breakouts. Wish I''d bought sooner.', now() - interval '7 days'),
    ('Mulberry Silk Pillowcase', 'Jess M.',   5, 'Zero sleep creases',   'Hair stays soft, no morning crease lines. Quality matches Slip.', now() - interval '14 days'),
    ('Mulberry Silk Pillowcase', 'Sophia L.', 4, 'Slips on cotton',      'I have to readjust at night, but the silk feels incredible.',     now() - interval '21 days'),
    ('Mulberry Silk Pillowcase', 'Maya N.',   5, 'Best birthday gift',   'Gave to my sister — she''s already asked for two more.',          now() - interval '30 days'),
    ('Mulberry Silk Pillowcase', 'Olivia P.', 5, 'Better than Slip',     'Same momme weight at half the cost. The hidden zipper is a nice touch.', now() - interval '4 days'),
    ('Mulberry Silk Pillowcase', 'Lucas T.',  5, 'Husband stole it',     'He swore he''d never use silk. Now I''m buying a second.',         now() - interval '5 days'),

    ('Mulberry Silk Eyemask', 'David S.', 5, 'Saved my red-eyes',  'I travel weekly — this and earplugs have been game-changing.',    now() - interval '14 days'),
    ('Mulberry Silk Eyemask', 'Hannah B.', 5, 'Total darkness',    'Blocks even my partner''s reading light at 11pm.',                 now() - interval '21 days'),
    ('Mulberry Silk Eyemask', 'Aman J.',   4, 'Strap loosens',     'Have to tighten it about once a month, otherwise perfect.',        now() - interval '7 days'),
    ('Mulberry Silk Eyemask', 'Sofia G.',  5, 'Bought with the pillowcase', 'Both were worth it. Sleep score up 12 points.',          now() - interval '4 days'),
    ('Mulberry Silk Eyemask', 'Liam H.',   5, 'Best stocking stuffer',     'Two friends already asked where I got it.',                now() - interval '2 days'),

    ('Cold Plunge Ice Bath', 'Tom K.',    5, 'Daily routine now',    '20-minute setup, holds 39°F overnight with the cover. Recovery is real.', now() - interval '21 days'),
    ('Cold Plunge Ice Bath', 'Jordan F.', 5, 'Cheaper than Plunge',  'Same chiller compatibility, fraction of the cost.',                     now() - interval '14 days'),
    ('Cold Plunge Ice Bath', 'Carlos D.', 4, 'Bigger than expected', 'Fits in the garage but barely. Build quality is excellent.',           now() - interval '7 days'),
    ('Cold Plunge Ice Bath', 'Ben L.',    5, 'First plunge I could afford', 'Took the leap on this drop — no regrets.',                      now() - interval '4 days'),
    ('Cold Plunge Ice Bath', 'Rachel S.', 5, 'Solid build',          'Insulation does what it says. I leave the cover on, temp barely drifts.', now() - interval '1 days')
  ) as r(product_name, reviewer_name, rating, title, body, created_at)
  on p.name = r.product_name;
