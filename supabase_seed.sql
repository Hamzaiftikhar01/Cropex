-- =============================================
-- CROPEX: Full Database Seed Script
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. CROPS TABLE
CREATE TABLE IF NOT EXISTS public.crops (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_ur text,
  name_pa text,
  emoji text,
  sort_order int DEFAULT 0
);
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read crops" ON public.crops FOR SELECT USING (true);

INSERT INTO public.crops (id, name, name_ur, name_pa, emoji, sort_order) VALUES
  ('wheat',     'Wheat',     'گندم',   'کنک',    '🌾', 1),
  ('rice',      'Rice',      'چاول',   'چاول',   '🌾', 2),
  ('cotton',    'Cotton',    'کپاس',   'کپاس',   '🌿', 3),
  ('sugarcane', 'Sugarcane', 'گنا',    'گنا',    '🎋', 4),
  ('maize',     'Maize',     'مکئی',   'مکئی',   '🌽', 5),
  ('potato',    'Potato',    'آلو',    'آلو',    '🥔', 6),
  ('tomato',    'Tomato',    'ٹماٹر',  'ٹماٹر',  '🍅', 7),
  ('onion',     'Onion',     'پیاز',   'پیاز',   '🧅', 8),
  ('chili',     'Chili',     'مرچ',    'مرچ',    '🌶️', 9)
ON CONFLICT (id) DO NOTHING;

-- 2. DISTRICTS TABLE
CREATE TABLE IF NOT EXISTS public.districts (
  id text PRIMARY KEY,
  name text NOT NULL,
  
  name_ur text,
  latitude numeric,
  longitude numeric,
  sort_order int DEFAULT 0
);
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read districts" ON public.districts FOR SELECT USING (true);

INSERT INTO public.districts (id, name, name_ur, latitude, longitude, sort_order) VALUES
  ('faisalabad', 'Faisalabad', 'فیصل آباد', 31.4504, 73.1350, 1),
  ('bahawalpur', 'Bahawalpur', 'بہاولپور',  29.3544, 71.6911, 2),
  ('multan',     'Multan',     'ملتان',     30.1575, 71.5249, 3),
  ('sargodha',   'Sargodha',   'سرگودھا',   32.0836, 72.6711, 4),
  ('hyderabad',  'Hyderabad',  'حیدرآباد',  25.3960, 68.3578, 5)
ON CONFLICT (id) DO NOTHING;

-- 3. SOIL TYPES TABLE
CREATE TABLE IF NOT EXISTS public.soil_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_ur text,
  sort_order int DEFAULT 0
);
ALTER TABLE public.soil_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read soil_types" ON public.soil_types FOR SELECT USING (true);

INSERT INTO public.soil_types (id, name, name_ur, sort_order) VALUES
  ('sandy', 'Sandy', 'ریتیلی',       1),
  ('loamy', 'Loamy', 'میرا (لوامی)', 2),
  ('clay',  'Clay',  'چکنی مٹی',     3)
ON CONFLICT (id) DO NOTHING;

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  company text,
  product_type text,
  active_ingredient text,
  target_diseases jsonb,
  target_crops jsonb,
  official_url text,
  description text
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

INSERT INTO public.products (id, name, company, product_type, active_ingredient, target_diseases, target_crops, official_url, description) VALUES
  ('syngenta_amistar_top', 'Amistar Top', 'Syngenta Pakistan', 'Fungicide', 'Azoxystrobin 200g/L + Difenoconazole 125g/L', '["Leaf Rust","Early Blight","Blast","Purple Blotch","Powdery Mildew"]', '["Wheat","Tomato","Potato","Rice","Onion","Chili"]', 'https://www.syngenta.com.pk/product/amistar-top', 'A systemic broad-spectrum fungicide with preventative and curative activity, highly effective against rust, early blight, and leaf spot diseases.'),
  ('syngenta_ridomil_gold', 'Ridomil Gold', 'Syngenta Pakistan', 'Fungicide', 'Metalaxyl-M 4% + Mancozeb 64% WP', '["Late Blight","Downy Mildew"]', '["Potato","Tomato","Onion"]', 'https://www.syngenta.com.pk/product/ridomil-gold-wg', 'Excellent root and foliage systemic action providing dual protective and curative suppression of oomycetes.'),
  ('fmc_cabrio_top', 'Cabrio Top', 'FMC Pakistan', 'Fungicide', 'Pyraclostrobin 5% + Metiram 55%', '["Early Blight","Late Blight","Anthracnose","Powdery Mildew"]', '["Tomato","Potato","Chili"]', 'https://ag.fmc.com/pk/en/products/fungicides/cabrio-top', 'A high-performance fungicide offering superior protective and curative control against early blight, late blight, and powdery mildew on vegetable crops.'),
  ('bayer_nativo', 'Nativo 75 WG', 'Bayer Crop Science Pakistan', 'Fungicide', 'Tebuconazole 50% + Trifloxystrobin 25%', '["Blast","Leaf Rust","Powdery Mildew","Purple Blotch","Late Blight"]', '["Rice","Wheat","Chili","Onion","Tomato"]', 'https://www.cropscience.bayer.com.pk/en-pk/products/fungicides/nativo-75-wg.html', 'Dual-action protective and curative systemic fungicide delivering broad-spectrum control and prolonged green foliage retention.'),
  ('bayer_infinito', 'Infinito', 'Bayer Crop Science Pakistan', 'Fungicide', 'Fluopicolide + Propamocarb Hydrochloride', '["Late Blight","Downy Mildew"]', '["Potato","Tomato","Onion"]', 'https://www.cropscience.bayer.com.pk/en-pk/products/fungicides/infinito.html', 'Excellent weather resistance and translaminar mobility. Prevents spore germination and suppresses mycelial expansion.'),
  ('suncrop_sun_cop', 'Sun-Cop', 'Suncrop Group', 'Fungicide', 'Copper Oxychloride 50% WP', '["Bacterial Leaf Blight","Bacterial Blight","Anthracnose","Red Rot","Leaf Spot"]', '["Rice","Cotton","Chili","Sugarcane","Wheat"]', 'https://www.suncropgroup.com/', 'Contact protective broad-spectrum fungicide and bactericide useful for suppressing severe fungal and bacterial outbreaks.'),
  ('bayer_confidor', 'Confidor', 'Bayer Crop Science Pakistan', 'Insecticide', 'Imidacloprid 200 SL', '["Cotton Leaf Curl Virus vector control (Whiteflies)","Thrips control","Aphids control"]', '["Cotton","Chili","Onion"]', 'https://www.cropscience.bayer.com.pk/en-pk/products/insecticides/confidor-200-sl.html', 'Systemic insecticide targeting sucking pests. Primarily used to control whiteflies that transmit leaf curl virus.'),
  ('fmc_steward', 'Steward', 'FMC Pakistan', 'Insecticide', 'Indoxacarb 150 SC', '["Armyworm control","Bollworm control"]', '["Cotton","Maize"]', 'https://ag.fmc.com/pk/en/products/insecticides/steward', 'Broad-spectrum larvicide with contact and stomach action, causing rapid feeding cessation in chewing pests.'),
  ('syngenta_match', 'Match', 'Syngenta Pakistan', 'Insecticide', 'Lufenuron 50 EC', '["Armyworm control","Helicoverpa control"]', '["Cotton","Maize","Tomato"]', 'https://www.syngenta.com.pk/product/match-050-ec', 'Insect growth regulator (IGR) that inhibits chitin synthesis in lepidopteran larvae preventing foliar damage.')
ON CONFLICT (id) DO NOTHING;

-- 5. DISEASES TABLE
CREATE TABLE IF NOT EXISTS public.diseases (
  id text PRIMARY KEY,
  crop_id text REFERENCES public.crops(id),
  disease_name text NOT NULL,
  confidence int DEFAULT 90,
  severity text DEFAULT 'Moderate',
  description text,
  symptoms jsonb,
  causes jsonb,
  recommended_actions jsonb,
  prevention jsonb,
  best_practices jsonb
);
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read diseases" ON public.diseases FOR SELECT USING (true);

INSERT INTO public.diseases (id, crop_id, disease_name, confidence, severity, description, symptoms, causes, recommended_actions, prevention, best_practices) VALUES
  ('wheat_leaf_rust', 'wheat', 'Leaf Rust', 94, 'Moderate',
   'A fungal disease caused by Puccinia triticina, resulting in small orange-brown pustules on leaves, reducing grain yield.',
   '["Small, round orange-brown pustules on leaf blades.","Pustules rub off on fingers, leaving a dusty rust-colored residue.","Premature leaf drying and shriveling."]',
   '["Fungus Puccinia triticina.","Mild temperatures (15-22°C) combined with high moisture or dew.","Wind-blown spores traveling long distances."]',
   '["Apply systemic triazole fungicide (Amistar Top or Nativo 75 WG) immediately.","Ensure balanced nitrogen levels to avoid overly dense, moisture-trapping foliage.","Sanitize agricultural tools before working in neighboring fields."]',
   '["Cultivate rust-resistant wheat cultivars.","Adjust sowing dates to avoid peak rust periods.","Manage nitrogen fertilization to avoid excessive vegetative growth."]',
   '["Destroy volunteer green plants that serve as host bridges.","Perform field monitoring during the boot and heading stages."]'),

  ('wheat_loose_smut', 'wheat', 'Loose Smut', 88, 'Low',
   'A seed-borne fungal disease caused by Ustilago nuda, where healthy grain heads are replaced by black spore masses.',
   '["Heads emerge from boot covered in black, dusty spore masses.","Grains are completely replaced by fungal spores.","Spores are blown away by wind, leaving only the bare central stalk."]',
   '["Seed-borne fungus Ustilago nuda.","Infection of flowers in the previous season.","Planting untreated, infected seeds."]',
   '["Treat seeds with systemic fungicides before sowing.","Use certified disease-free seeds.","Remove and destroy affected heads."]',
   '["Use certified disease-free seeds.","Treat seeds with systemic fungicides before sowing.","Grow resistant wheat varieties."]',
   '["Perform hot-water seed treatment for organic farming.","Sanitize sowing equipment between fields."]'),

  ('rice_blast', 'rice', 'Rice Blast', 95, 'High',
   'A devastating fungal disease caused by Magnaporthe oryzae, affecting leaves, nodes, and panicles.',
   '["Spindle-shaped lesions on leaves with gray centers and brown borders.","Rotting of nodes, causing stems to break.","Neck rot, where the base of the panicle rots, causing grains to shrivel."]',
   '["Fungus Magnaporthe oryzae.","High relative humidity (over 85-90%) and cool night temperatures.","Excessive nitrogen application."]',
   '["Apply systemic fungicide (Nativo 75 WG or Amistar Top) immediately.","Split nitrogen fertilizer applications rather than large single doses.","Maintain shallow standing water to buffer canopy temperatures."]',
   '["Plant blast-resistant rice cultivars.","Avoid excessive nitrogen fertilization; apply in split doses.","Maintain appropriate water depth in fields."]',
   '["Avoid overhead irrigation.","Destroy infected straw and stubble after harvest."]'),

  ('rice_bacterial_leaf_blight', 'rice', 'Bacterial Leaf Blight', 90, 'Moderate',
   'A highly destructive bacterial disease caused by Xanthomonas oryzae, causing wilting of seedlings and leaf yellowing.',
   '["Water-soaked stripes on leaf blades that turn yellow or white.","Wavy margin lesions starting from leaf tips and moving down.","Bacterial droplets (ooze) on leaves in high humidity."]',
   '["Bacterium Xanthomonas oryzae pv. oryzae.","Warm temperatures, high humidity, and rain splash.","Wind and water carrying bacteria between plants."]',
   '["Spray copper-based bactericides.","Improve field drainage.","Remove infected plants."]',
   '["Cultivate resistant varieties.","Ensure field drainage to avoid submerging seedlings.","Avoid clipping seedling tips before transplanting."]',
   '["Keep fields free of weeds that act as bacterial hosts.","Allow fields to dry completely between crop cycles."]'),

  ('cotton_leaf_curl_virus', 'cotton', 'Cotton Leaf Curl Virus', 91, 'High',
   'A viral disease transmitted by whiteflies (Bemisia tabaci), causing leaf crinkling and stunt growth.',
   '["Upward or downward curling of leaf margins.","Thickening of leaf veins.","Enation (leaf-like growth) on the underside of leaves."]',
   '["Cotton leaf curl geminivirus.","Vector transmission by whiteflies.","Presence of weed hosts and alternative host crops."]',
   '["Control whitefly population with Confidor.","Uproot and destroy severely infected plants.","Apply neem-based sprays as a supplementary measure."]',
   '["Plant CLCuV-resistant cotton varieties.","Implement effective weed management to destroy hosts.","Avoid planting cotton near alternative host plants like okra."]',
   '["Monitor whitefly populations regularly.","Apply insecticides targeted at whitefly vectors to prevent virus spread."]'),

  ('cotton_bacterial_blight', 'cotton', 'Bacterial Blight', 91, 'Moderate',
   'A bacterial disease caused by Xanthomonas citri, leading to leaf spots, boll rot, and stem blackening.',
   '["Angular, water-soaked lesions on leaves (angular leaf spot).","Lesions turning brown or black as leaf tissue dies.","Water-soaked spots on bolls that cause lint staining and rot."]',
   '["Bacterium Xanthomonas citri pv. malvacearum.","Humid conditions and heavy wind-driven rains.","Infected seed or plant debris."]',
   '["Spray copper-based bactericides/fungicides (Sun-Cop 50% WP) immediately.","Prune lower canopy leaves to improve air circulation.","Incorporate post-harvest stubble deep into soil."]',
   '["Use acid-delinted, certified disease-free seed.","Plant resistant cotton varieties.","Incorporate infected crop residue deep into the soil after harvest."]',
   '["Avoid sprinkler irrigation.","Rotate cotton crops with non-hosts like maize or wheat."]'),

  ('maize_maydis_leaf_blight', 'maize', 'Maydis Leaf Blight', 93, 'Moderate',
   'A fungal disease caused by Bipolaris maydis, causing elongated tan lesions on leaves, reducing yield.',
   '["Elongated, rectangular tan lesions between leaf veins.","Lesions with reddish-brown borders.","Premature leaf drying and death in severe cases."]',
   '["Fungus Bipolaris maydis (Cochliobolus heterostrophus).","Warm temperatures (20-30°C) and high humidity.","Spores overwintering on crop residues."]',
   '["Apply fungicide (Match or Amistar Top).","Remove infected plant debris.","Improve field drainage."]',
   '["Grow resistant maize hybrids.","Rotate maize with legume crops.","Perform deep tillage to bury crop debris."]',
   '["Ensure balanced nitrogen and potassium fertilization.","Monitor fields starting from the mid-vegetative stage."]'),

  ('maize_common_rust', 'maize', 'Common Rust', 90, 'Moderate',
   'A fungal disease caused by Puccinia sorghi, characterized by powdery cinnamon-brown pustules on both leaf surfaces.',
   '["Oval, golden-brown to cinnamon-brown pustules on leaves.","Pustules rupture to release powdery spores.","Leaves turning yellow and drying under severe infection."]',
   '["Fungus Puccinia sorghi.","Cool temperatures (16-23°C) and high relative humidity.","Spores carried by wind from southern regions."]',
   '["Apply Amistar Top fungicide.","Remove and destroy affected foliage.","Improve air circulation in the field."]',
   '["Plant rust-resistant maize varieties.","Use early planting dates to escape late-season spore influx.","Rotate crop sections."]',
   '["Avoid overhead irrigation in late afternoon.","Remove host plants like wood sorrel."]'),

  ('tomato_early_blight', 'tomato', 'Early Blight', 92, 'Moderate',
   'Fungal infection by Alternaria solani causing target-like leaf spots on tomatoes.',
   '["Concentric target-board rings on older foliage.","Yellowing surrounding leaf spot margins.","Premature leaf loss starting from bottom foliage."]',
   '["Fungus Alternaria solani.","Warm, humid weather and frequent dew.","Spores overwintering in soil or debris."]',
   '["Prune lower branches to improve air circulation and prevent soil-splash contact.","Apply protective copper-based or systemic fungicides immediately.","Remove and safely discard heavily infected crop foliage."]',
   '["Plant disease-resistant tomato cultivars.","Apply mulch to prevent soil splashing onto foliage.","Rotate crops every 2-3 years."]',
   '["Prune the lower 12 inches of foliage to prevent soil contact.","Water at base using drip lines to keep leaves dry."]'),

  ('tomato_late_blight', 'tomato', 'Late Blight', 96, 'High',
   'A highly destructive disease caused by Phytophthora infestans, causing rapid leaf wilting and fruit rot.',
   '["Large, irregular water-soaked lesions on leaves and stems.","Fuzzy white mold on leaf undersides in wet conditions.","Firm, brown leathery lesions on green and ripe tomato fruit."]',
   '["Water mold Phytophthora infestans.","Cool, wet, and humid conditions.","Wind-blown spores from infected potatoes or tomatoes."]',
   '["Apply systemic fungicide (Ridomil Gold or Infinito) immediately.","Remove and destroy infected plants.","Avoid overhead watering."]',
   '["Plant resistant tomato cultivars.","Destroy volunteer plants and cull piles.","Keep foliage dry and space plants adequately."]',
   '["Remove and destroy infected plants immediately.","Avoid overhead watering."]'),

  ('potato_early_blight', 'potato', 'Early Blight', 90, 'Moderate',
   'A fungal disease caused by Alternaria solani, producing target-like concentric rings on potato leaves.',
   '["Dark, angular leaf spots with concentric target-like rings.","Leaves turning yellow and falling off prematurely.","Dry, leathery, sunken lesions on potato tubers."]',
   '["Fungus Alternaria solani.","Alternating wet and dry periods on leaf surfaces.","Nutrient-deficient or stressed plants."]',
   '["Apply Cabrio Top or Amistar Top fungicide.","Improve plant nutrition.","Remove infected foliage."]',
   '["Maintain crop nutrition (adequate nitrogen and potassium).","Plant certified, disease-free seed tubers.","Practice crop rotation."]',
   '["Avoid physical injury to tubers during harvest.","Store tubers in cool, dry conditions."]'),

  ('potato_late_blight', 'potato', 'Late Blight', 96, 'High',
   'A devastating disease caused by Phytophthora infestans, responsible for the historical Irish Potato Famine.',
   '["Water-soaked lesions on leaf margins that quickly turn black.","White fungal growth on the underside of leaf lesions.","Rotting of potato tubers, leading to complete crop decay."]',
   '["Water mold Phytophthora infestans.","High relative humidity (>90%) and mild temperatures (10-24°C).","Planting infected seed tubers."]',
   '["Apply systemic fungicide (Ridomil Gold or Infinito) immediately.","Remove and burn or deeply bury heavily blighted plant stems.","Avoid overhead sprinkler irrigation to keep leaves dry."]',
   '["Plant certified disease-free potato seeds.","Eliminate volunteer potato plants in surrounding fields.","Monitor disease forecasts during wet weather."]',
   '["Harvest only when potato vines are dead for at least 14 days.","Store potatoes in ventilated bins with humidity controls."]'),

  ('onion_purple_blotch', 'onion', 'Purple Blotch', 90, 'Moderate',
   'A common fungal disease caused by Alternaria porri, forming purple lesions on onion leaves and flower stalks.',
   '["Small, water-soaked spots on leaves that turn brown to purple.","Zonate banding on spots, bordered by a yellow zone.","Bulb decay starting at the neck of the onion."]',
   '["Fungus Alternaria porri.","Warm temperatures (21-30°C) and persistent dew or leaf wetness.","Overwintering in crop debris."]',
   '["Apply Amistar Top or Nativo fungicide.","Improve field drainage.","Remove infected leaves."]',
   '["Use healthy transplants and certified seeds.","Rotate onion crops with non-allium species.","Provide excellent field drainage."]',
   '["Allow onion necks to dry completely before topping.","Apply balanced nitrogen to prevent weak leaves."]'),

  ('onion_downy_mildew', 'onion', 'Downy Mildew', 88, 'Moderate',
   'A fungal-like disease caused by Peronospora destructor, producing violet-gray downy mold on onion foliage.',
   '["Violet-gray downy growth on leaf surfaces during humid mornings.","Pale green or yellow lesions on leaves.","Leaves collapse and die, reducing bulb size."]',
   '["Oomycete pathogen Peronospora destructor.","Cool, moist weather conditions.","Spores surviving in soil, wild onions, or set bulbs."]',
   '["Apply Ridomil Gold or Infinito.","Improve air circulation.","Remove infected plants."]',
   '["Avoid planting sets or bulbs showing signs of rot.","Space rows widely to facilitate air movement.","Implement crop rotation of 3-4 years."]',
   '["Water crops in the morning to allow leaves to dry during the day.","Remove weed hosts that retain field moisture."]'),

  ('chili_anthracnose', 'chili', 'Anthracnose / Fruit Rot', 91, 'High',
   'A major fungal disease caused by Colletotrichum species, resulting in sunken lesions on chili pods.',
   '["Sunken, circular lesions on chili fruit (pods).","Concentric rings of orange to black spore masses on pods.","Small, dark, water-soaked leaf spots."]',
   '["Fungi Colletotrichum capsici / Colletotrichum gloeosporioides.","Warm, humid weather, heavy rains, and dew.","Spores splashing from infected debris or soil."]',
   '["Apply Cabrio Top or Sun-Cop fungicide.","Remove and destroy infected fruit.","Improve field sanitation."]',
   '["Use disease-free seed or treat seeds with fungicide.","Remove all crop debris from fields after harvest.","Practice crop rotation."]',
   '["Avoid overhead irrigation during fruiting.","Harvest fruit regularly and remove rotten pods."]'),

  ('chili_powdery_mildew', 'chili', 'Powdery Mildew', 89, 'Moderate',
   'A fungal disease caused by Leveillula taurica, characterized by white powdery growth on leaf undersides.',
   '["White powdery fungal patches on the underside of leaves.","Yellow spots on the upper leaf surfaces.","Severe leaf dropping, exposing fruit to sunscald."]',
   '["Fungus Leveillula taurica.","Warm, dry daytime temperatures combined with humid nights.","Wind-blown spores."]',
   '["Apply Amistar Top or Nativo fungicide.","Prune congested branches.","Improve air circulation."]',
   '["Grow resistant chili cultivars.","Avoid dense planting configurations.","Ensure plants have adequate irrigation and nutrition."]',
   '["Inspect leaves starting from the lower canopy.","Prune congested center branches to let light penetrate."]'),

  ('sugarcane_smut', 'sugarcane', 'Sugarcane Smut', 90, 'High',
   'A fungal disease caused by Sporisorium scitamineum, producing characteristic black whip-like structures from plant terminals.',
   '["A black, dusty, whip-like structure emerging from the shoot apex.","Stunted stalks with narrow, erect leaves.","Excessive tillering with thin, grassy shoots."]',
   '["Fungus Sporisorium scitamineum.","Wind dispersion of spores.","Planting infected seed cane (setts)."]',
   '["Uproot and destroy infected stools.","Bag infected whips before cutting.","Apply hot-water treatment to seed setts."]',
   '["Plant smut-resistant sugarcane varieties.","Use hot-water treated seed setts.","Eradicate infected stools at first detection."]',
   '["Bag infected whips before cutting to prevent spore dispersal.","Rotate sugarcane fields with non-grass crops."]'),

  ('sugarcane_red_rot', 'sugarcane', 'Red Rot', 92, 'High',
   'A highly destructive disease caused by Colletotrichum falcatum, causing stalk decay and red internal tissue discoloration.',
   '["Red discoloration of internal pith with white transverse patches.","Yellowing and drying of leaf canopies, starting from third or fourth leaves.","Hollowing out of stalks, causing a characteristic alcoholic smell."]',
   '["Fungus Colletotrichum falcatum.","Poor drainage and waterlogging.","Planting infected setts or using contaminated water."]',
   '["Uproot and destroy infected cane stools immediately.","Improve furrow drainage to prevent standing water.","Spray copper-based fungicide to prevent secondary spore spread."]',
   '["Plant resistant sugarcane cultivars.","Use healthy, disease-free seed setts.","Ensure proper soil drainage and avoid waterlogging."]',
   '["Uproot and destroy infected clumps.","Apply bio-fungicides or seed treatments prior to planting."]')
ON CONFLICT (id) DO NOTHING;


-- 6. DISEASE_PRODUCTS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.disease_products (
  disease_id text REFERENCES public.diseases(id),
  product_id text REFERENCES public.products(id),
  PRIMARY KEY (disease_id, product_id)
);
ALTER TABLE public.disease_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read disease_products" ON public.disease_products FOR SELECT USING (true);

INSERT INTO public.disease_products (disease_id, product_id) VALUES
  ('wheat_leaf_rust', 'syngenta_amistar_top'),
  ('wheat_leaf_rust', 'bayer_nativo'),
  ('rice_blast', 'bayer_nativo'),
  ('rice_blast', 'syngenta_amistar_top'),
  ('rice_bacterial_leaf_blight', 'suncrop_sun_cop'),
  ('cotton_leaf_curl_virus', 'bayer_confidor'),
  ('cotton_bacterial_blight', 'suncrop_sun_cop'),
  ('maize_maydis_leaf_blight', 'syngenta_match'),
  ('maize_common_rust', 'syngenta_amistar_top'),
  ('tomato_early_blight', 'fmc_cabrio_top'),
  ('tomato_early_blight', 'syngenta_amistar_top'),
  ('tomato_late_blight', 'bayer_infinito'),
  ('tomato_late_blight', 'syngenta_ridomil_gold'),
  ('tomato_late_blight', 'fmc_cabrio_top'),
  ('potato_early_blight', 'fmc_cabrio_top'),
  ('potato_early_blight', 'syngenta_amistar_top'),
  ('potato_late_blight', 'bayer_infinito'),
  ('potato_late_blight', 'syngenta_ridomil_gold'),
  ('onion_purple_blotch', 'syngenta_amistar_top'),
  ('onion_purple_blotch', 'bayer_nativo'),
  ('onion_downy_mildew', 'syngenta_ridomil_gold'),
  ('onion_downy_mildew', 'bayer_infinito'),
  ('chili_anthracnose', 'fmc_cabrio_top'),
  ('chili_anthracnose', 'suncrop_sun_cop'),
  ('chili_powdery_mildew', 'syngenta_amistar_top'),
  ('chili_powdery_mildew', 'bayer_nativo'),
  ('sugarcane_red_rot', 'suncrop_sun_cop')
ON CONFLICT (disease_id, product_id) DO NOTHING;

-- 7. DEMO PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.demo_profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_ur text,
  name_pa text,
  crop_type text,
  district text,
  soil_type text,
  days_since_sowing int DEFAULT 60,
  last_irrigated_days_ago int DEFAULT 3,
  description text,
  description_ur text,
  description_pa text,
  sort_order int DEFAULT 0
);
ALTER TABLE public.demo_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read demo_profiles" ON public.demo_profiles FOR SELECT USING (true);

INSERT INTO public.demo_profiles (id, name, name_ur, name_pa, crop_type, district, soil_type, days_since_sowing, last_irrigated_days_ago, description, description_ur, description_pa, sort_order) VALUES
  ('wheat-faisalabad', '🌾 Profile A: Faisalabad Wheat', '🌾 گندم: فیصل آباد فارم', '🌾 کنک: فیصل آباد فارم',
   'Wheat', 'Faisalabad', 'Loamy', 75, 4,
   'Optimal sowing window, loamy soil. Yield potential is high.',
   'کاشت کا مناسب ترین وقت اور میرا مٹی۔ پیداوار کا بہترین امکان۔',
   'کاشت دا ٹھیک ویلا تے میرا مٹی۔ چنگی پیداوار دی امید اے۔', 1),
  ('tomato-bahawalpur', '🍅 Profile B: Bahawalpur Tomato', '🍅 ٹماٹر: بہاولپور فارم', '🍅 ٹماٹر: بہاولپور فارم',
   'Tomato', 'Bahawalpur', 'Clay', 60, 7,
   'Humid & cool weather triggering Late Blight Risk.',
   'نمی سے بھرا معتدل موسم جس کی وجہ سے جھلساؤ کا خطرہ زیادہ ہے۔',
   'نمی والا معتدل موسم جس دی وجہ توں جھلساؤ دا خطرہ زیادہ اے۔', 2),
  ('cotton-multan', '🌿 Profile C: Multan Cotton', '🌿 کپاس: ملتان فارم', '🌿 کپاس: ملتان فارم',
   'Cotton', 'Multan', 'Sandy', 45, 3,
   'Extreme dry heat, sandy soil. Requires frequent irrigation.',
   'شدید خشک گرمی اور ریتیلی مٹی۔ پانی کی فوری ضرورت۔',
   'شدید خشک گرمی تے ریتلی مٹی۔ پانی دی فوری لوڑ اے۔', 3)
ON CONFLICT (id) DO NOTHING;

-- DONE!
