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
