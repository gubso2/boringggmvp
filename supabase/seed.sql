-- =====================================================================
-- Boringgg — seed data: 12 products + 12 active batches
-- All prices are USD cents. Curves use cumulative thresholds.
-- =====================================================================

truncate table public.reservations restart identity cascade;
truncate table public.batches restart identity cascade;
truncate table public.products restart identity cascade;

with seeded as (
  insert into public.products
    (id, name, image_url, description, moq, base_price_cents, price_curve,
     manufacturer, manufacturer_clients, est_production_cost_cents,
     comparable_brand_name, comparable_brand_price_cents)
  values
    (gen_random_uuid(),
     'Wireless ANC Earbuds',
     'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=900&q=80&auto=format&fit=crop',
     'Hybrid active-noise-cancelling earbuds with 30-hr case battery and graphene drivers.',
     200, 4200,
     '[{"threshold":0.2,"price_cents":4200},{"threshold":0.5,"price_cents":4900},{"threshold":1.0,"price_cents":5800}]'::jsonb,
     'Shenzhen Audink Acoustics',
     ARRAY['Sony','Anker','Soundpeats'],
     1900, 'Bose QuietComfort', 24900),

    (gen_random_uuid(),
     '75% Mechanical Keyboard',
     'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=900&q=80&auto=format&fit=crop',
     'Hot-swap PCB, gasket-mounted, doubleshot PBT, USB-C and 2.4 GHz wireless.',
     100, 8900,
     '[{"threshold":0.2,"price_cents":8900},{"threshold":0.5,"price_cents":10500},{"threshold":1.0,"price_cents":12500}]'::jsonb,
     'Dongguan KBDFans Manufactory',
     ARRAY['Keychron','NuPhy','Glorious'],
     3800, 'Keychron Q2 Pro', 22900),

    (gen_random_uuid(),
     'Heavyweight Cotton Hoodie',
     'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80&auto=format&fit=crop',
     '500 GSM brushed loopback cotton, garment dyed, oversized fit. Ten colors.',
     300, 3400,
     '[{"threshold":0.2,"price_cents":3400},{"threshold":0.5,"price_cents":4200},{"threshold":1.0,"price_cents":4900}]'::jsonb,
     'Porto Knitwear Co.',
     ARRAY['Reigning Champ','Wings + Horns','John Elliott'],
     1600, 'Reigning Champ Midweight', 18000),

    (gen_random_uuid(),
     'Knit Runner Sneakers',
     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&auto=format&fit=crop',
     'Recycled polyester knit upper, EVA midsole, removable insole. Whole sizes 6–13.',
     250, 4800,
     '[{"threshold":0.2,"price_cents":4800},{"threshold":0.5,"price_cents":5800},{"threshold":1.0,"price_cents":6900}]'::jsonb,
     'Jinjiang Stride Footwear',
     ARRAY['Allbirds','Cariuma','Nobull'],
     2100, 'Allbirds Tree Runners', 11000),

    (gen_random_uuid(),
     'French Press 1L',
     'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80&auto=format&fit=crop',
     'Borosilicate glass, 18/10 stainless steel mesh, walnut handle.',
     150, 2400,
     '[{"threshold":0.2,"price_cents":2400},{"threshold":0.5,"price_cents":2900},{"threshold":1.0,"price_cents":3400}]'::jsonb,
     'Yongkang Houseware Group',
     ARRAY['Bodum','Fellow','Espro'],
     900, 'Fellow Clara', 9900),

    (gen_random_uuid(),
     'Stonewashed Linen Sheet Set',
     'https://images.unsplash.com/photo-1592229505726-ca121723b8ef?w=900&q=80&auto=format&fit=crop',
     '100% French flax linen, OEKO-TEX 100. Queen — fitted, flat, two cases.',
     100, 7900,
     '[{"threshold":0.2,"price_cents":7900},{"threshold":0.5,"price_cents":9500},{"threshold":1.0,"price_cents":11500}]'::jsonb,
     'Vilnius Textile Mills',
     ARRAY['Brooklinen','Quince','Cultiver'],
     3600, 'Brooklinen Linen Core', 27900),

    (gen_random_uuid(),
     'Smart Hydration Bottle',
     'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&q=80&auto=format&fit=crop',
     'Tracks intake via capacitive sensor, glows hourly, 18-oz vacuum insulated.',
     400, 1900,
     '[{"threshold":0.2,"price_cents":1900},{"threshold":0.5,"price_cents":2400},{"threshold":1.0,"price_cents":2900}]'::jsonb,
     'Ningbo Aquasense Tech',
     ARRAY['Hidrate','LARQ','Owala'],
     800, 'HidrateSpark PRO', 7995),

    (gen_random_uuid(),
     'Slim Bifold Leather Wallet',
     'https://images.unsplash.com/photo-1627123424574-724758594e93?w=900&q=80&auto=format&fit=crop',
     'Full-grain pull-up leather, RFID-blocking, 6 cards + cash. Ages beautifully.',
     200, 2800,
     '[{"threshold":0.2,"price_cents":2800},{"threshold":0.5,"price_cents":3400},{"threshold":1.0,"price_cents":3900}]'::jsonb,
     'Florence Cuoio Workshop',
     ARRAY['Bellroy','Ridge','Saddleback'],
     1100, 'Bellroy Hide & Seek', 9900),

    (gen_random_uuid(),
     'Bluetooth Item Tracker (4-pack)',
     'https://images.unsplash.com/photo-1606830733744-0ad778449a26?w=900&q=80&auto=format&fit=crop',
     'UWB precision finding, 1-yr replaceable battery, IP67. Works with Find My.',
     500, 3200,
     '[{"threshold":0.2,"price_cents":3200},{"threshold":0.5,"price_cents":3800},{"threshold":1.0,"price_cents":4500}]'::jsonb,
     'Suzhou Tracewave Electronics',
     ARRAY['Tile','Chipolo','Pebblebee'],
     1400, 'Apple AirTag 4-pack', 9900),

    (gen_random_uuid(),
     'Adjustable Dumbbell Pair (5–50 lb)',
     'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop',
     'Dial-a-weight, replaces 15 sets. Pair includes weight stand.',
     50, 18900,
     '[{"threshold":0.2,"price_cents":18900},{"threshold":0.5,"price_cents":22500},{"threshold":1.0,"price_cents":26900}]'::jsonb,
     'Qingdao Ironform Industries',
     ARRAY['Bowflex','PowerBlock','NordicTrack'],
     8500, 'Bowflex SelectTech 552', 42900),

    (gen_random_uuid(),
     'Ceramic Knife 5-piece Set',
     'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=900&q=80&auto=format&fit=crop',
     'Zirconia ceramic blades, ergonomic Pakkawood handles, magnetic block.',
     120, 4400,
     '[{"threshold":0.2,"price_cents":4400},{"threshold":0.5,"price_cents":5400},{"threshold":1.0,"price_cents":6400}]'::jsonb,
     'Seki Edge Cutlery',
     ARRAY['Kyocera','Shun','Cuisinart'],
     1900, 'Kyocera Revolution 4pc', 13900),

    (gen_random_uuid(),
     'Weighted Blanket 15 lb',
     'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=900&q=80&auto=format&fit=crop',
     'Glass-bead fill, removable bamboo-rayon cover, 60×80".',
     150, 5400,
     '[{"threshold":0.2,"price_cents":5400},{"threshold":0.5,"price_cents":6400},{"threshold":1.0,"price_cents":7900}]'::jsonb,
     'Chengdu Comfortlayer Textiles',
     ARRAY['Gravity','Bearaby','YnM'],
     2400, 'Gravity Blanket Original', 19500)
  returning id, moq
)
insert into public.batches (product_id, end_at, units_reserved)
select
  id,
  now() + interval '7 days',
  -- Pre-fill demo progress so the UI shows movement: 8–55% of MOQ
  greatest(1, (moq * (0.08 + random() * 0.47))::int)
from seeded;
