-- =====================================================================
-- Boringgg — seed data: 12 products + 12 active batches
-- All prices are USD cents. Curves use cumulative thresholds.
-- Run AFTER 0001_init.sql, 0002_product_details.sql, and 0003_margin_pricing.sql
--
-- NB: the inline price_curve JSON in each row is overwritten at the bottom
-- of this file with a derived margin_curve(cost) — we keep the literal as
-- a placeholder so existing inserts still satisfy NOT NULL.
-- =====================================================================

truncate table public.reservations restart identity cascade;
truncate table public.batches restart identity cascade;
truncate table public.products restart identity cascade;

with seeded as (
  insert into public.products
    (id, name, image_url, in_use_image_url, description, moq, base_price_cents,
     price_curve, manufacturer, manufacturer_clients, est_production_cost_cents,
     comparable_brand_name, comparable_brand_price_cents, in_box, specs, health_benefit)
  values
    -- 1. Wireless ANC Earbuds
    (gen_random_uuid(),
     'Wireless ANC Earbuds',
     'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?w=900&q=80&auto=format&fit=crop',
     'Hybrid active-noise-cancelling earbuds with 30-hr case battery and graphene drivers.',
     200, 4200,
     '[{"threshold":0.2,"price_cents":4200},{"threshold":0.5,"price_cents":4900},{"threshold":1.0,"price_cents":5800}]'::jsonb,
     'Shenzhen Audink Acoustics',
     ARRAY['Sony','Anker','Soundpeats'],
     1900, 'Bose QuietComfort', 24900,
     ARRAY['Earbuds (L+R)','Charging case','USB-C cable','3 silicone tip sizes','Travel pouch'],
     '[{"label":"Driver","ours":"11 mm graphene","theirs":"10 mm dynamic"},
       {"label":"ANC depth","ours":"-42 dB","theirs":"-38 dB"},
       {"label":"Battery (case)","ours":"30 hr","theirs":"24 hr"},
       {"label":"IP rating","ours":"IPX5","theirs":"IPX4"},
       {"label":"Codec","ours":"aptX Adaptive + AAC","theirs":"AAC only"}]'::jsonb,
     'Active noise cancellation reduces cumulative noise exposure by ~95%, protecting long-term hearing in commutes and offices.'),

    -- 2. 75% Mechanical Keyboard
    (gen_random_uuid(),
     '75% Mechanical Keyboard',
     'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1561112078-7d24e04c3407?w=900&q=80&auto=format&fit=crop',
     'Hot-swap PCB, gasket-mounted, doubleshot PBT, USB-C and 2.4 GHz wireless.',
     100, 8900,
     '[{"threshold":0.2,"price_cents":8900},{"threshold":0.5,"price_cents":10500},{"threshold":1.0,"price_cents":12500}]'::jsonb,
     'Dongguan KBDFans Manufactory',
     ARRAY['Keychron','NuPhy','Glorious'],
     3800, 'Keychron Q2 Pro', 22900,
     ARRAY['Keyboard','Braided USB-C cable','Keycap puller','Switch puller','2 spare hot-swap switches'],
     '[{"label":"Switches","ours":"Hot-swap MX","theirs":"Soldered"},
       {"label":"Layout","ours":"75% (84 keys)","theirs":"65%"},
       {"label":"Plate","ours":"Aluminum gasket-mount","theirs":"Plastic tray-mount"},
       {"label":"Backlight","ours":"Per-key RGB","theirs":"Zone RGB"},
       {"label":"Wireless polling","ours":"8000 Hz","theirs":"1000 Hz"}]'::jsonb,
     'Promotes a more neutral wrist angle than membrane keyboards — meaningfully lowers RSI risk over long typing days.'),

    -- 3. Heavyweight Cotton Hoodie
    (gen_random_uuid(),
     'Heavyweight Cotton Hoodie',
     'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80&auto=format&fit=crop',
     '500 GSM brushed loopback cotton, garment dyed, oversized fit. Ten colors.',
     300, 3400,
     '[{"threshold":0.2,"price_cents":3400},{"threshold":0.5,"price_cents":4200},{"threshold":1.0,"price_cents":4900}]'::jsonb,
     'Porto Knitwear Co.',
     ARRAY['Reigning Champ','Wings + Horns','John Elliott'],
     1600, 'Reigning Champ Midweight', 18000,
     ARRAY['Hoodie','Care card'],
     '[{"label":"Fabric weight","ours":"500 GSM","theirs":"320 GSM"},
       {"label":"Composition","ours":"100% organic cotton","theirs":"80/20 cotton-poly"},
       {"label":"Dyeing","ours":"Garment dyed","theirs":"Piece dyed"},
       {"label":"Cuffs","ours":"Ribbed loopback","theirs":"Flat hem"},
       {"label":"Sizes","ours":"XS – XXL","theirs":"S – XL"}]'::jsonb,
     'Naturally breathable and hypoallergenic — gentler on sensitive skin than synthetic blends, no microplastic shedding.'),

    -- 4. Knit Runner Sneakers
    (gen_random_uuid(),
     'Knit Runner Sneakers',
     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=900&q=80&auto=format&fit=crop',
     'Recycled polyester knit upper, EVA midsole, removable insole. Whole sizes 6–13.',
     250, 4800,
     '[{"threshold":0.2,"price_cents":4800},{"threshold":0.5,"price_cents":5800},{"threshold":1.0,"price_cents":6900}]'::jsonb,
     'Jinjiang Stride Footwear',
     ARRAY['Allbirds','Cariuma','Nobull'],
     2100, 'Allbirds Tree Runners', 11000,
     ARRAY['Sneakers','Spare flat laces','Spare insole','Cotton dust bag'],
     '[{"label":"Upper","ours":"Recycled poly knit","theirs":"Eucalyptus tree fiber"},
       {"label":"Midsole","ours":"EVA + cork insole","theirs":"SweetFoam"},
       {"label":"Drop","ours":"8 mm","theirs":"7 mm"},
       {"label":"Weight (per shoe)","ours":"260 g","theirs":"290 g"},
       {"label":"Machine washable","ours":"Yes","theirs":"Yes"}]'::jsonb,
     'Anatomically shaped wide toe box reduces forefoot pressure — meaningfully lowers risk of bunions on long walks.'),

    -- 5. French Press 1L
    (gen_random_uuid(),
     'French Press 1L',
     'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=900&q=80&auto=format&fit=crop',
     'Borosilicate glass, 18/10 stainless steel mesh, walnut handle.',
     150, 2400,
     '[{"threshold":0.2,"price_cents":2400},{"threshold":0.5,"price_cents":2900},{"threshold":1.0,"price_cents":3400}]'::jsonb,
     'Yongkang Houseware Group',
     ARRAY['Bodum','Fellow','Espro'],
     900, 'Fellow Clara', 9900,
     ARRAY['Glass beaker','Stainless plunger assembly','Walnut handle','Spare mesh filter','Cleaning brush'],
     '[{"label":"Capacity","ours":"1.0 L (4 cups)","theirs":"0.95 L"},
       {"label":"Glass","ours":"Borosilicate 3.3","theirs":"SCHOTT borosilicate"},
       {"label":"Filter","ours":"Dual stainless mesh","theirs":"Single mesh"},
       {"label":"Frame","ours":"Brushed 18/10 + walnut","theirs":"Polished steel"},
       {"label":"Dishwasher safe","ours":"Yes","theirs":"No"}]'::jsonb,
     'Paper-free brewing preserves coffee oils (kahweol, cafestol) shown to support healthy liver markers.'),

    -- 6. Stonewashed Linen Sheet Set
    (gen_random_uuid(),
     'Stonewashed Linen Sheet Set',
     'https://images.unsplash.com/photo-1592229505726-ca121723b8ef?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1580494767412-b2762dd9c5dc?w=900&q=80&auto=format&fit=crop',
     '100% French flax linen, OEKO-TEX 100. Queen — fitted, flat, two cases.',
     100, 7900,
     '[{"threshold":0.2,"price_cents":7900},{"threshold":0.5,"price_cents":9500},{"threshold":1.0,"price_cents":11500}]'::jsonb,
     'Vilnius Textile Mills',
     ARRAY['Brooklinen','Quince','Cultiver'],
     3600, 'Brooklinen Linen Core', 27900,
     ARRAY['Fitted sheet','Flat sheet','2 standard pillowcases','Linen wash bag'],
     '[{"label":"Fiber origin","ours":"Normandy flax","theirs":"European flax"},
       {"label":"Weave","ours":"Stonewashed plain","theirs":"Pre-softened"},
       {"label":"GSM","ours":"170","theirs":"165"},
       {"label":"Thread count","ours":"80","theirs":"90"},
       {"label":"OEKO-TEX","ours":"Certified","theirs":"Certified"}]'::jsonb,
     'Linen wicks moisture roughly 4× faster than cotton — sleep cooler and reduce night-sweat-driven wakeups.'),

    -- 7. Smart Hydration Bottle
    (gen_random_uuid(),
     'Smart Hydration Bottle',
     'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1523362289600-a70b4a0e09aa?w=900&q=80&auto=format&fit=crop',
     'Tracks intake via capacitive sensor, glows hourly, 18-oz vacuum insulated.',
     400, 1900,
     '[{"threshold":0.2,"price_cents":1900},{"threshold":0.5,"price_cents":2400},{"threshold":1.0,"price_cents":2900}]'::jsonb,
     'Ningbo Aquasense Tech',
     ARRAY['Hidrate','LARQ','Owala'],
     800, 'HidrateSpark PRO', 7995,
     ARRAY['Bottle','USB-C charging puck','Cleaning brush','Quick-start card'],
     '[{"label":"Capacity","ours":"18 oz","theirs":"20 oz"},
       {"label":"Insulation","ours":"Vacuum copper-lined","theirs":"Single-wall"},
       {"label":"Battery life","ours":"14 days","theirs":"7 days"},
       {"label":"Sensor","ours":"Capacitive","theirs":"IMU"},
       {"label":"Glow modes","ours":"4","theirs":"2"}]'::jsonb,
     'Hourly nudges help meet daily intake targets — chronic mild dehydration affects ~75% of adults and impairs cognition.'),

    -- 8. Slim Bifold Leather Wallet
    (gen_random_uuid(),
     'Slim Bifold Leather Wallet',
     'https://images.unsplash.com/photo-1627123424574-724758594e93?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=900&q=80&auto=format&fit=crop',
     'Full-grain pull-up leather, RFID-blocking, 6 cards + cash. Ages beautifully.',
     200, 2800,
     '[{"threshold":0.2,"price_cents":2800},{"threshold":0.5,"price_cents":3400},{"threshold":1.0,"price_cents":3900}]'::jsonb,
     'Florence Cuoio Workshop',
     ARRAY['Bellroy','Ridge','Saddleback'],
     1100, 'Bellroy Hide & Seek', 9900,
     ARRAY['Wallet','Cotton dust bag','Care card'],
     '[{"label":"Leather","ours":"Full-grain veg-tanned","theirs":"Chrome-tanned"},
       {"label":"Card slots","ours":"6 + 1 quick","theirs":"4"},
       {"label":"Cash slot","ours":"Yes","theirs":"Yes"},
       {"label":"RFID blocking","ours":"Yes","theirs":"No"},
       {"label":"Dimensions","ours":"4.0 × 3.0 in","theirs":"4.3 × 3.2 in"}]'::jsonb,
     'Slim profile (8 mm folded) prevents the lopsided pelvis and lower-back pain caused by sitting on a thick wallet.'),

    -- 9. Bluetooth Item Tracker (4-pack)
    (gen_random_uuid(),
     'Bluetooth Item Tracker (4-pack)',
     'https://images.unsplash.com/photo-1606830733744-0ad778449a26?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1582539509978-9d9a92e5e62e?w=900&q=80&auto=format&fit=crop',
     'UWB precision finding, 1-yr replaceable battery, IP67. Works with Find My.',
     500, 3200,
     '[{"threshold":0.2,"price_cents":3200},{"threshold":0.5,"price_cents":3800},{"threshold":1.0,"price_cents":4500}]'::jsonb,
     'Suzhou Tracewave Electronics',
     ARRAY['Tile','Chipolo','Pebblebee'],
     1400, 'Apple AirTag 4-pack', 9900,
     ARRAY['4 × tracker','4 × keyring loop','4 × CR2032 cell','Adhesive sticker tape','Quick-start card'],
     '[{"label":"Range (open air)","ours":"250 ft","theirs":"400 ft"},
       {"label":"Network","ours":"Apple Find My","theirs":"Tile network"},
       {"label":"UWB precision finding","ours":"Yes","theirs":"No"},
       {"label":"Battery life","ours":"12 months","theirs":"12 months"},
       {"label":"IP rating","ours":"IP67","theirs":"IP67"}]'::jsonb,
     'Reduces the daily anxiety spikes from misplacing keys, phone, or wallet — a small but compounding mental-load win.'),

    -- 10. Adjustable Dumbbell Pair
    (gen_random_uuid(),
     'Adjustable Dumbbell Pair (5–50 lb)',
     'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&q=80&auto=format&fit=crop',
     'Dial-a-weight, replaces 15 sets. Pair includes weight stand.',
     50, 18900,
     '[{"threshold":0.2,"price_cents":18900},{"threshold":0.5,"price_cents":22500},{"threshold":1.0,"price_cents":26900}]'::jsonb,
     'Qingdao Ironform Industries',
     ARRAY['Bowflex','PowerBlock','NordicTrack'],
     8500, 'Bowflex SelectTech 552', 42900,
     ARRAY['2 × dumbbell handle','2 × weight cradle','Storage tray','Quick-start guide'],
     '[{"label":"Weight range","ours":"5 – 50 lb","theirs":"5 – 50 lb"},
       {"label":"Increment","ours":"2.5 lb","theirs":"5 lb"},
       {"label":"Plates","ours":"Cast iron","theirs":"Zinc-coated"},
       {"label":"Footprint (each)","ours":"16 × 8 in","theirs":"16 × 8 in"},
       {"label":"Warranty","ours":"3 yr","theirs":"2 yr"}]'::jsonb,
     'Resistance training 2× per week is associated with a ~15% drop in all-cause mortality in adults over 30.'),

    -- 11. Ceramic Knife Set
    (gen_random_uuid(),
     'Ceramic Knife 5-piece Set',
     'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=900&q=80&auto=format&fit=crop',
     'Zirconia ceramic blades, ergonomic Pakkawood handles, magnetic block.',
     120, 4400,
     '[{"threshold":0.2,"price_cents":4400},{"threshold":0.5,"price_cents":5400},{"threshold":1.0,"price_cents":6400}]'::jsonb,
     'Seki Edge Cutlery',
     ARRAY['Kyocera','Shun','Cuisinart'],
     1900, 'Kyocera Revolution 4pc', 13900,
     ARRAY['Chef 6 in','Santoku 5.5 in','Utility 4.5 in','Paring 3 in','Magnetic block'],
     '[{"label":"Blade","ours":"Zirconia ceramic","theirs":"Zirconia ceramic"},
       {"label":"Handle","ours":"Pakkawood","theirs":"SAN polymer"},
       {"label":"Hardness","ours":"HRC 8.5","theirs":"HRC 8.0"},
       {"label":"Rust-proof","ours":"Yes","theirs":"Yes"},
       {"label":"Care","ours":"Hand wash","theirs":"Hand wash"}]'::jsonb,
     'Chemically inert blade — won''t transfer metallic flavor or leach iron into acidic foods like citrus or tomato.'),

    -- 12. Weighted Blanket
    (gen_random_uuid(),
     'Weighted Blanket 15 lb',
     'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=900&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=900&q=80&auto=format&fit=crop',
     'Glass-bead fill, removable bamboo-rayon cover, 60×80".',
     150, 5400,
     '[{"threshold":0.2,"price_cents":5400},{"threshold":0.5,"price_cents":6400},{"threshold":1.0,"price_cents":7900}]'::jsonb,
     'Chengdu Comfortlayer Textiles',
     ARRAY['Gravity','Bearaby','YnM'],
     2400, 'Gravity Blanket Original', 19500,
     ARRAY['Inner weighted layer','Bamboo-rayon removable cover','Storage bag'],
     '[{"label":"Weight","ours":"15 lb","theirs":"15 lb"},
       {"label":"Fill","ours":"Micro glass beads","theirs":"Glass beads"},
       {"label":"Cover","ours":"Bamboo rayon","theirs":"Minky polyester"},
       {"label":"Stitch grid","ours":"4 in","theirs":"6 in"},
       {"label":"Sizes","ours":"Throw / Queen / King","theirs":"Throw / Queen"}]'::jsonb,
     'Deep-pressure stimulation lowers cortisol and increases melatonin — improves sleep continuity in clinical trials.')
  returning id, moq
)
insert into public.batches (product_id, end_at, units_reserved)
select
  id,
  now() + interval '7 days',
  greatest(1, (moq * (0.08 + random() * 0.47))::int)
from seeded;

-- Override the placeholder price_curve on every product with the derived
-- margin curve (20% / 30% / 40% / 50% markup at 25/50/75/100% MOQ).
update public.products
   set price_curve = public.margin_curve(est_production_cost_cents);
