-- =============================================================================
-- Cropex Phase 3: Supabase pgvector Knowledge Base Migration & Seed Script
-- =============================================================================
-- Enables vector search, full-text search, and stores curated agricultural knowledge
-- chunks from PARC/NARC, DPP Pakistan, and provincial advisories.
-- =============================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create knowledge_chunks table
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id TEXT PRIMARY KEY,
  crop_id TEXT,
  disease_id TEXT,
  category TEXT NOT NULL CHECK (category IN ('disease_mgmt', 'pesticide', 'agronomy', 'advisory', 'general')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_ur TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  language TEXT DEFAULT 'en',
  tags TEXT[] DEFAULT '{}',
  embedding vector(1536), -- Compatible with OpenAI text-embedding-3-small or Gemini text-embedding-004
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on knowledge_chunks" ON public.knowledge_chunks;
CREATE POLICY "Allow public read access on knowledge_chunks"
  ON public.knowledge_chunks
  FOR SELECT
  USING (true);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_crop_id ON public.knowledge_chunks(crop_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_disease_id ON public.knowledge_chunks(disease_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_category ON public.knowledge_chunks(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_fts ON public.knowledge_chunks USING GIN (
  to_tsvector('english', title || ' ' || content)
);

-- HNSW Vector Cosine Distance Index (for pgvector semantic similarity)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding_hnsw
  ON public.knowledge_chunks
  USING hnsw (embedding vector_cosine_ops);

-- 5. RPC Function: match_knowledge_chunks
CREATE OR REPLACE FUNCTION match_knowledge_chunks (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 5,
  filter_crop_id text DEFAULT NULL
)
RETURNS TABLE (
  id text,
  crop_id text,
  disease_id text,
  category text,
  title text,
  content text,
  content_ur text,
  source text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.crop_id,
    kc.disease_id,
    kc.category,
    kc.title,
    kc.content,
    kc.content_ur,
    kc.source,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE
    (filter_crop_id IS NULL OR kc.crop_id = filter_crop_id OR kc.crop_id IS NULL)
    AND (kc.embedding IS NOT NULL)
    AND (1 - (kc.embedding <=> query_embedding) > match_threshold)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. Seed Data (Curated Knowledge Chunks)
INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'wheat_yellow_rust_mgmt',
  'wheat',
  'wheat_yellow_rust',
  'disease_mgmt',
  'Yellow Rust (Stripe Rust) — Management in Pakistan',
  'Yellow rust (Puccinia striiformis f.sp. tritici) is the most destructive wheat disease in Pakistan, especially in Punjab and KPK. It appears as yellow-orange pustules arranged in stripes along leaf veins. Favorable conditions: 10–15°C with high humidity (>70%) and dew. Management: (1) Grow resistant varieties — Galaxy-2013, Faisalabad-2008, and Zincol-2016 are moderately resistant. (2) Seed treatment with Raxil (Tebuconazole 60 FS) at 120ml per 100kg seed. (3) Foliar spray with Amistar Top (Azoxystrobin 200g/L + Difenoconazole 125g/L) at 200ml per acre OR Nativo 75 WG (Trifloxystrobin + Tebuconazole) at 80g per acre at first symptom appearance. (4) Repeat spray after 15 days if conditions persist. Early detection is critical — monitor fields from December through February.',
  'پیلی کنگی (زرد زنگ) پاکستان میں گندم کی سب سے تباہ کن بیماری ہے۔ پتوں پر زرد نارنجی دانے پتوں کی رگوں کے ساتھ قطاروں میں نظر آتے ہیں۔ انتظام: (1) مزاحم اقسام اگائیں (2) بیج کا علاج ریکسل سے کریں (3) ایمسٹار ٹاپ 200 ملی لیٹر فی ایکڑ یا نیٹیوو 80 گرام فی ایکڑ سپرے کریں۔',
  'NARC Wheat Program Advisory 2024; Syngenta Pakistan Label',
  'https://www.parc.gov.pk',
  'en',
  '{"yellow rust","stripe rust","wheat","fungicide","amistar","nativo","puccinia"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'wheat_leaf_rust_mgmt',
  'wheat',
  'wheat_leaf_rust',
  'disease_mgmt',
  'Leaf Rust (Brown Rust) — Management in Pakistan',
  'Leaf rust (Puccinia triticina) produces round orange-brown pustules scattered on the upper leaf surface, distinguishable from yellow rust by lacking a stripe pattern. Favorable conditions: 15–22°C with >60% humidity. In Pakistan it typically intensifies from February to April. Management: (1) Use resistant varieties — Akbar-2019, NARC-2009 show good resistance. (2) Apply Amistar Top (Azoxystrobin + Difenoconazole) at 200ml per acre or Tilt 250 EC (Propiconazole) at 200ml per acre when pustules first appear. (3) Do not delay spraying beyond early heading stage; late applications have minimal effect. (4) Avoid excessive nitrogen fertilizer — it increases susceptibility.',
  NULL,
  'UAF Wheat Disease Guide 2023; DPP Pakistan Registered Pesticides',
  '',
  'en',
  '{"leaf rust","brown rust","wheat","fungicide","tilt","propiconazole","puccinia"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'wheat_loose_smut_mgmt',
  'wheat',
  'wheat_loose_smut',
  'disease_mgmt',
  'Loose Smut — Management in Pakistan',
  'Loose smut (Ustilago tritici) replaces the grain head with a mass of black powdery spores. The fungus is seed-borne and infects during flowering. Once heads emerge, it is too late to treat — prevention is key. Management: (1) Use certified, disease-free seed from FSC&RD. (2) Seed treatment with Raxil 060 FS (Tebuconazole) at 120ml per 100kg seed OR Vitavax (Carboxin + Thiram 75% WP) at 250g per 100kg seed — this is the single most effective measure. (3) Remove and burn smutted heads before spores disperse. (4) Avoid saving seed from infected fields.',
  NULL,
  'NARC Plant Pathology Division; FSC&RD Seed Treatment Guidelines',
  '',
  'en',
  '{"loose smut","wheat","seed treatment","vitavax","raxil","ustilago"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'wheat_aphid_mgmt',
  'wheat',
  'wheat_aphid',
  'disease_mgmt',
  'Wheat Aphid — Management in Pakistan',
  'Wheat aphids (primarily Sitobion avenae and Rhopalosiphum padi) suck sap from leaves and developing heads, causing yellowing and reduced grain filling. They also transmit Barley Yellow Dwarf Virus (BYDV). Peak infestation: February–March. Economic threshold: 10–15 aphids per tiller. Management: (1) Encourage natural predators — ladybird beetles and lacewings. (2) If threshold is exceeded, spray Imidacloprid 200 SL (Confidor) at 250ml per acre OR Acetamiprid 20 SP (Mospilan) at 60g per acre. (3) Avoid broad-spectrum insecticides early in the season — they destroy beneficial insects. (4) Avoid overhead irrigation which creates favorable microclimate for aphids.',
  NULL,
  'Punjab Agriculture Department Pest Advisory 2024; Bayer CropScience Pakistan',
  '',
  'en',
  '{"aphid","wheat","insecticide","confidor","imidacloprid","pest"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'wheat_karnal_bunt_mgmt',
  'wheat',
  'wheat_karnal_bunt',
  'disease_mgmt',
  'Karnal Bunt — Management in Pakistan',
  'Karnal bunt (Tilletia indica) produces partial bunting of wheat grains — infected kernels have a black powdery mass with a fishy smell. It is a quarantine disease restricting wheat exports. Favorable conditions: cool (18–22°C), humid weather during heading. Management: (1) Use certified seed only — this is the primary control measure. (2) Seed treatment with Raxil 060 FS at 150ml per 100kg seed. (3) Deep plowing to bury surface inoculum. (4) Avoid excessive irrigation during heading and flowering stages. (5) Grow moderately resistant varieties. Detection: If >3% kernels are infected, grain is classified as bunted and cannot be exported.',
  NULL,
  'DPP Pakistan Quarantine Advisory; NARC Wheat Pathology',
  '',
  'en',
  '{"karnal bunt","wheat","tilletia","quarantine","seed treatment","export"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'wheat_sowing_guide',
  'wheat',
  NULL,
  'agronomy',
  'Wheat Sowing Guide — Pakistan (Punjab & Sindh)',
  'Optimal sowing window for wheat in Punjab: November 1–25. Late sowing (after November 25) reduces yield by 30–40kg per acre per day of delay. Recommended seed rate: 50kg per acre for irrigated areas, 60kg for rainfed (barani). Sowing depth: 2–3 inches. Row spacing: 22.5cm (9 inches). Recommended varieties for Punjab: Galaxy-2013, Akbar-2019, Zincol-2016, NARC-2011. For Sindh: sow October 15 – November 15; varieties include Benazir-2013 and TD-1. Fertilizer: Apply 1.5 bags DAP (23kg N + 46kg P2O5) + half bag SOP at sowing. First nitrogen top-dress (1 bag Urea) with first irrigation (21 days after sowing). Second top-dress (0.5 bag Urea) at second irrigation.',
  NULL,
  'Punjab Agriculture Extension Service; PARC Wheat Production Technology',
  '',
  'en',
  '{"wheat","sowing","seed rate","variety","fertilizer","punjab","sindh"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'wheat_irrigation_guide',
  'wheat',
  NULL,
  'agronomy',
  'Wheat Irrigation Schedule — Pakistan',
  'Wheat requires 4–6 irrigations depending on soil type and rainfall. Critical irrigation stages: (1) Crown root initiation (21 days after sowing) — most critical, skip this and yield drops 20–30%. (2) Tillering (45–50 DAS). (3) Booting/heading (70–80 DAS). (4) Grain filling (100–110 DAS). For clay soils: irrigate every 20–25 days. For sandy loam: every 15–18 days. Light, frequent irrigations are better than heavy flooding. Avoid irrigation during strong winds (increases lodging risk). Last irrigation: 15 days before harvest to facilitate harvesting.',
  NULL,
  'PARC Water Management Guide; Punjab Irrigation Department',
  '',
  'en',
  '{"wheat","irrigation","water","schedule","crown root","tillering"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'rice_blast_mgmt',
  'rice',
  'rice_blast',
  'disease_mgmt',
  'Rice Blast — Management in Pakistan',
  'Rice blast (Magnaporthe oryzae) is the most devastating rice disease worldwide. It causes diamond-shaped lesions with grey centers on leaves, and neck rot that breaks panicles. In Pakistan, blast is especially severe in basmati-growing areas of Punjab during Kharif season. Favorable conditions: 20–25°C, >90% humidity, prolonged leaf wetness. Management: (1) Grow resistant varieties — Super Basmati shows moderate resistance; PK-386 is more susceptible. (2) Avoid excessive nitrogen — use no more than 60kg N per acre for basmati. (3) Foliar spray with Beam 75 WP (Tricyclazole) at 120g per acre OR Amistar Top at 200ml per acre at first lesion appearance. Repeat after 10–14 days. (4) Maintain shallow standing water (2–3 inches) — dry fields increase blast risk.',
  NULL,
  'IRRI Pakistan Advisory; Rice Research Institute Kala Shah Kaku',
  '',
  'en',
  '{"rice blast","magnaporthe","tricyclazole","beam","basmati","fungicide"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'rice_blight_mgmt',
  'rice',
  'rice_bacterial_blight',
  'disease_mgmt',
  'Bacterial Leaf Blight (BLB) — Rice Management in Pakistan',
  'Bacterial leaf blight (Xanthomonas oryzae pv. oryzae) causes water-soaked lesions that elongate along leaf margins, turning white to yellow. In severe cases, entire leaves dry out ("kresek" phase). BLB is especially damaging during monsoon season in Punjab and Sindh. There is NO effective chemical control once infection occurs. Management: (1) Use resistant varieties — IRRI-6 and KSK-133 show moderate resistance. (2) Drain fields for 3–4 days to reduce bacterial spread. (3) Avoid excessive nitrogen — BLB severity increases with high N. (4) Remove and destroy crop debris after harvest. (5) Balanced potassium application (50kg MOP per acre) strengthens cell walls. (6) Copper-based bactericides (Copper oxychloride 50% WP at 500g per acre) provide partial suppression only.',
  NULL,
  'NARC Rice Program; Pakistan Journal of Phytopathology',
  '',
  'en',
  '{"bacterial leaf blight","BLB","rice","xanthomonas","copper","drainage"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'rice_brown_spot_mgmt',
  'rice',
  'rice_brown_spot',
  'disease_mgmt',
  'Brown Spot — Rice Management in Pakistan',
  'Brown spot (Bipolaris oryzae) produces oval, dark brown lesions with grey centers on leaves. It is associated with nutrient-deficient soils, particularly low potassium and zinc. Favorable conditions: 25–30°C, high humidity, water stress. Management: (1) Apply balanced fertilizer — especially zinc sulfate 5kg per acre and potash 25kg MOP per acre. (2) Seed treatment with Mancozeb 75 WP (Dithane M-45) at 3g per kg seed. (3) Foliar spray with Dithane M-45 (Mancozeb) at 500g per acre if lesions appear on >5% of leaves. (4) Maintain consistent water depth — alternate wetting-drying worsens brown spot. (5) Avoid silicon-deficient soils; silica application improves resistance.',
  NULL,
  'Rice Research Institute Dokri, Sindh; UAF Plant Pathology Dept',
  '',
  'en',
  '{"brown spot","rice","bipolaris","mancozeb","zinc","potassium"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'rice_sheath_blight_mgmt',
  'rice',
  'rice_sheath_blight',
  'disease_mgmt',
  'Sheath Blight — Rice Management in Pakistan',
  'Sheath blight (Rhizoctonia solani) appears as oval, greenish-grey lesions with dark borders on the leaf sheath near the waterline. In severe cases, it spreads to upper leaves and panicles. Dense planting and high nitrogen increase severity. Management: (1) Reduce seeding rate — use 15–20kg per acre for transplanted rice. (2) Wider row spacing (25cm × 25cm). (3) Spray Amistar Top (Azoxystrobin + Difenoconazole) 200ml per acre or Nativo 75 WG 80g per acre at early symptom onset. (4) Apply Validamycin (Validacin 3L) at 300ml per acre as preventive on dense-canopy fields. (5) Burn stubble and straw after harvest — the fungus overwinters in crop debris.',
  NULL,
  'IRRI Sheath Blight Factsheet; Syngenta Pakistan Advisory',
  '',
  'en',
  '{"sheath blight","rice","rhizoctonia","validamycin","amistar"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'rice_stem_borer_mgmt',
  'rice',
  'rice_stem_borer',
  'disease_mgmt',
  'Rice Stem Borer — Management in Pakistan',
  'Rice stem borers (Scirpophaga incertulas — yellow stem borer, and Chilo suppressalis — striped stem borer) cause "dead heart" in vegetative stage and "white head" at panicle stage. They are the most economically damaging rice pests in Pakistan. Management: (1) Light traps — install 1 light trap per 5 acres during July–August to monitor moth emergence. (2) Clip leaf tips at transplanting to remove egg masses. (3) Apply Cartap hydrochloride (Padan 50 SP) at 600g per acre OR Fipronil 5 SC (Regent) at 200ml per acre when dead heart exceeds 5%. (4) Release Trichogramma japonicum egg parasitoids (1 card per acre, 3 releases at weekly intervals) as biological control. (5) Harvest at ground level and destroy stubble to kill overwintering larvae.',
  NULL,
  'NARC Entomology Division; FMC Pakistan Label',
  '',
  'en',
  '{"stem borer","rice","dead heart","white head","cartap","fipronil","trichogramma"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'rice_nursery_guide',
  'rice',
  NULL,
  'agronomy',
  'Rice Nursery & Transplanting Guide — Pakistan',
  'Nursery sowing for basmati rice: May 20 – June 10 in Punjab. For IRRI varieties: June 1–15. Seed rate for nursery: 15–20kg per acre of transplanted area. Nursery bed preparation: fine puddle, level bed 4 feet wide, apply 1 bag DAP per kanal of nursery. Seedling age at transplanting: 25–30 days for basmati, 20–25 days for coarse varieties. Transplanting window: June 20 – July 15 (basmati), July 1–20 (IRRI). Plant 2–3 seedlings per hill at 22.5cm × 22.5cm spacing. Avoid deep transplanting — crown should be 2cm below soil surface. Late transplanting (after July 20) reduces basmati yield by 10% per week.',
  NULL,
  'Rice Research Institute Kala Shah Kaku; Punjab Agriculture Extension',
  '',
  'en',
  '{"rice","nursery","transplanting","basmati","seedling","spacing"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'cotton_clcuv_mgmt',
  'cotton',
  'cotton_clcuv',
  'disease_mgmt',
  'Cotton Leaf Curl Virus (CLCuV) — Management in Pakistan',
  'Cotton leaf curl virus (CLCuV), transmitted by whitefly (Bemisia tabaci), is the most devastating cotton disease in Pakistan, responsible for billions of rupees in losses since the 1990s. Symptoms: upward leaf curling, thickened veins, enations (leaf-like outgrowths) on undersurface, stunted growth. There is NO chemical cure once infected. Management: (1) Grow tolerant Bt varieties — FH-Lalazar, IUB-222, and MNH-1026 show field tolerance. (2) Whitefly control is key: spray Imidacloprid 200 SL (200ml per acre) OR Spiromesifen (Oberon 240 SC) at 160ml per acre when whitefly count exceeds 5 adults per leaf. (3) Avoid ratoon cotton — it harbors virus between seasons. (4) Uproot and destroy infected plants early. (5) Sow within recommended window (April 15 – May 15) to avoid peak whitefly pressure.',
  NULL,
  'CCRI Multan Advisory; Pakistan Central Cotton Committee',
  '',
  'en',
  '{"CLCuV","cotton","leaf curl","whitefly","virus","imidacloprid","oberon"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'cotton_bollworm_mgmt',
  'cotton',
  'cotton_bollworm',
  'disease_mgmt',
  'Cotton Bollworm Complex — Management in Pakistan',
  'The cotton bollworm complex (Helicoverpa armigera — American bollworm, Earias spp. — spotted bollworm, and Pectinophora gossypiella — pink bollworm) causes 20–40% yield losses in Pakistan. Larvae bore into squares, flowers, and bolls. Management: (1) Bt cotton varieties provide partial protection against H. armigera but NOT against pink bollworm. (2) Pheromone traps: install 5 per acre for monitoring; treat when moth catch exceeds 8 per trap per night. (3) Spray Emamectin benzoate 1.9 EC (Proclaim) at 200ml per acre OR Chlorantraniliprole 18.5 SC (Coragen) at 60ml per acre at 50% squaring when damage exceeds 10%. (4) Avoid pyrethroid sprays early in season — they destroy natural enemies. (5) Destroy crop residue by December to break pink bollworm diapause cycle.',
  NULL,
  'CCRI Multan; FMC Pakistan Coragen Label; DPP Pakistan',
  '',
  'en',
  '{"bollworm","cotton","helicoverpa","pink bollworm","emamectin","coragen"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'cotton_whitefly_mgmt',
  'cotton',
  'cotton_whitefly',
  'disease_mgmt',
  'Whitefly — Cotton Management in Pakistan',
  'Whitefly (Bemisia tabaci) is the number one cotton pest in Pakistan — it damages directly (sap sucking, honeydew/sooty mold) and indirectly by transmitting CLCuV. Economic threshold: 5–8 adults per upper-surface leaf. Peak season: July–September. Management: (1) Neem-based products (Azadirachtin 1500 ppm) at 400ml per acre as first line — low toxicity to beneficials. (2) Spiromesifen (Oberon 240 SC) at 160ml per acre — effective against nymphs and eggs. (3) Pyriproxyfen (Admiral 10 EC) at 250ml per acre — insect growth regulator. (4) Diafenthiuron (Polo 500 SC) at 200ml per acre for severe outbreaks. (5) Rotate chemical groups — whitefly develops resistance rapidly. (6) Yellow sticky traps (8 per acre) for monitoring. (7) Conserve natural predators: Encarsia formosa, Chrysoperla carnea.',
  NULL,
  'IPM Lab CCRI Multan; Bayer Pakistan Advisory',
  '',
  'en',
  '{"whitefly","cotton","bemisia","oberon","spiromesifen","CLCuV","IPM"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'cotton_alternaria_mgmt',
  'cotton',
  'cotton_alternaria_leaf_spot',
  'disease_mgmt',
  'Alternaria Leaf Spot — Cotton Management in Pakistan',
  'Alternaria leaf spot (Alternaria macrospora/alternata) produces round to irregular brown lesions with concentric rings ("target spot") on cotton leaves. Severe cases cause premature defoliation. Favorable conditions: warm (25–30°C) and humid weather, potassium deficiency. Management: (1) Apply potash fertilizer — 50kg MOP per acre reduces severity significantly. (2) Spray Mancozeb 75 WP (Dithane M-45) at 500g per acre OR Copper oxychloride 50 WP at 500g per acre at first symptom. (3) Nativo 75 WG (Trifloxystrobin + Tebuconazole) at 100g per acre for severe cases. (4) Avoid water stress — drought-stressed plants are more susceptible. (5) Remove lower defoliated leaves and destroy.',
  NULL,
  'CCRI Multan Plant Pathology; Sindh Agriculture University',
  '',
  'en',
  '{"alternaria","cotton","leaf spot","target spot","mancozeb","potassium"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'cotton_pink_bollworm_mgmt',
  'cotton',
  'cotton_pink_bollworm',
  'disease_mgmt',
  'Pink Bollworm — Cotton Management in Pakistan',
  'Pink bollworm (Pectinophora gossypiella) is a major late-season cotton pest in Pakistan. Larvae feed inside bolls, causing rosette flowers and stained, reduced-quality lint. Bt cotton does NOT fully control pink bollworm due to resistance development. Management: (1) Early sowing (April 15 – May 15) and early picking reduce exposure. (2) Pheromone traps (Gossyplure lures) — 5 per acre; treat when catch exceeds 8 moths per trap per night. (3) Spray Chlorantraniliprole (Coragen 18.5 SC) at 60ml per acre or Profenofos 50 EC (Curacron) at 800ml per acre at peak adult emergence. (4) Mandatory stubble destruction by December 31 (Punjab ordinance). (5) Heat treatment of ginning waste. (6) Do NOT keep ratoon cotton.',
  NULL,
  'Pakistan Central Cotton Committee; Punjab Cotton Zone Advisory 2024',
  '',
  'en',
  '{"pink bollworm","cotton","pectinophora","coragen","pheromone trap"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'cotton_sowing_guide',
  'cotton',
  NULL,
  'agronomy',
  'Cotton Sowing Guide — Pakistan',
  'Optimal sowing: April 15 – May 15 in Punjab; March 15 – April 15 in Sindh. Use Bt varieties from approved list (FH-Lalazar, IUB-222, MNH-1026, CIM-598). Seed rate: 8–10kg per acre for delinted seed, 15–20kg for fuzzy seed. Row spacing: 75cm (2.5 feet), plant spacing: 22–30cm. Apply 1.5 bags DAP at sowing + 2 bags Urea in 2–3 splits. First irrigation at 25–30 days after sowing. Total irrigations: 8–10 in Punjab. Picking: start when 60% bolls open; pick every 10–15 days. Average yield target: 30–40 maunds per acre for irrigated Bt cotton.',
  NULL,
  'CCRI Multan Production Technology; Punjab Agriculture Extension',
  '',
  'en',
  '{"cotton","sowing","seed rate","Bt cotton","fertilizer","picking"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'sugarcane_red_rot_mgmt',
  'sugarcane',
  'sugarcane_red_rot',
  'disease_mgmt',
  'Red Rot — Sugarcane Management in Pakistan',
  'Red rot (Colletotrichum falcatum) is the most destructive sugarcane disease in Pakistan, called the "cancer of sugarcane." Internal stalk shows reddened pith with transverse white spots. Juice turns sour and non-crystallizable. There is NO effective chemical control for established infections. Management: (1) Use disease-free seed cane from approved nurseries — this is THE key control measure. (2) Grow resistant varieties — CPF-246, CPF-248, HSF-240, and NSG-555 show good resistance. (3) Hot water treatment of sett: soak in water at 54°C for 30 minutes before planting. (4) Remove and burn infected canes immediately. (5) Avoid ratoon cropping from infected fields. (6) Ensure proper drainage — waterlogged fields increase red rot.',
  NULL,
  'Sugarcane Research Institute Faisalabad; NARC Sugarcane Program',
  '',
  'en',
  '{"red rot","sugarcane","colletotrichum","seed cane","hot water treatment"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'sugarcane_smut_mgmt',
  'sugarcane',
  'sugarcane_smut',
  'disease_mgmt',
  'Sugarcane Smut — Management in Pakistan',
  'Sugarcane smut (Sporisorium scitamineum) produces a black, whip-like structure from the growing point of infected stools. It is soil-borne and sett-borne. Ratooning increases disease pressure. Management: (1) Use smut-free seed cane. (2) Treat setts with Triadimefon (Bayleton 25 WP) at 100g in 100 liters water (soak for 30 minutes). (3) Remove and destroy whips before they release spores. (4) Avoid more than 2 ratoon crops. (5) Resistant varieties: CPF-246, CP-77-400. (6) Deep plowing and crop rotation with wheat or berseem for one season breaks the cycle.',
  NULL,
  'SRI Faisalabad; Pakistan Sugar Journal',
  '',
  'en',
  '{"smut","sugarcane","sporisorium","whip","sett treatment","triadimefon"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'sugarcane_borers_mgmt',
  'sugarcane',
  'sugarcane_borers',
  'disease_mgmt',
  'Sugarcane Borers — Management in Pakistan',
  'Three borer species attack sugarcane in Pakistan: top borer (Scirpophaga excerptalis), stem borer (Chilo infuscatellus), and gurdaspur borer (Acigona steniellus). Top borer causes "dead heart" in young cane; stem borer tunnels inside stalks reducing sugar recovery. Combined losses: 15–25% yield reduction. Management: (1) Release Trichogramma chilonis parasitoid — 8 cards per acre (50,000 eggs per card), 6 releases at fortnightly intervals starting June. (2) For stem borer: apply Carbofuran 3G (Furadan) at 12kg per acre in the leaf whorl at 45 days after planting. (3) For top borer: spray Chlorantraniliprole (Coragen) at 60ml per acre. (4) Trash mulching after harvest reduces borer pupation. (5) Light traps for adult monitoring.',
  NULL,
  'SRI Faisalabad Entomology Section; DPP Pakistan',
  '',
  'en',
  '{"borer","sugarcane","top borer","stem borer","trichogramma","coragen","furadan"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'sugarcane_wilt_mgmt',
  'sugarcane',
  'sugarcane_wilt',
  'disease_mgmt',
  'Sugarcane Wilt — Management in Pakistan',
  'Sugarcane wilt (Fusarium sacchari) causes progressive yellowing and drying of leaves, starting from the lower canopy. Internal stalk tissue shows brown to red-brown discoloration in the vascular bundles. Severely affected canes are hollow and have a sour, alcoholic smell. Management: (1) Use wilt-resistant varieties — CPF-248, HSF-240. (2) Plant disease-free setts only. (3) Sett treatment: dip in Carbendazim (Bavistin 50 WP) solution at 2g per liter for 30 minutes. (4) Ensure proper field drainage — waterlogging significantly increases wilt incidence. (5) Balanced fertilization — excessive nitrogen without potash promotes wilt. (6) Rotate with a non-host crop for 1–2 seasons in severely infected fields.',
  NULL,
  'NARC Sugarcane Pathology; SRI Faisalabad',
  '',
  'en',
  '{"wilt","sugarcane","fusarium","carbendazim","bavistin","drainage"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'sugarcane_grassy_shoot_mgmt',
  'sugarcane',
  'sugarcane_grassy_shoot',
  'disease_mgmt',
  'Grassy Shoot Disease — Sugarcane Management in Pakistan',
  'Grassy shoot disease (GSD) is caused by a phytoplasma and produces profuse tillering of thin, grassy shoots from infected stools — no millable canes develop. It is spread by infected setts and leafhopper vectors (Pyrilla perpusilla). There is NO chemical cure. Management: (1) ONLY use disease-free seed cane from certified nurseries — this is 90% of the battle. (2) Hot water treatment of setts at 54°C for 30 minutes kills the phytoplasma. (3) Rogue out and destroy infected stools immediately — do not allow them to produce seed. (4) Control leafhopper vectors with Imidacloprid 200 SL at 200ml per acre. (5) Avoid purchasing seed from unknown sources.',
  NULL,
  'SRI Faisalabad; NARC Sugarcane Program Advisory',
  '',
  'en',
  '{"grassy shoot","sugarcane","phytoplasma","leafhopper","seed cane","hot water"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'sugarcane_planting_guide',
  'sugarcane',
  NULL,
  'agronomy',
  'Sugarcane Planting Guide — Pakistan',
  'Spring planting: February 15 – March 15. Autumn planting: September – October (gives 15–20% higher yield but needs frost protection). Seed rate: 25,000–30,000 three-budded setts per acre (approximately 100 maunds of seed cane). Planting method: furrow planting at 4-foot row spacing, setts placed end-to-end. Fertilizer: 2 bags DAP + 1 bag SOP at planting; 3 bags Urea in 3 splits (at 30, 60, 90 DAS). Total NPK requirement: 120-60-60 kg per acre. First irrigation immediately after planting; subsequent every 10–15 days in summer, 20–25 days in winter. Earthing up: two times — at 90 and 120 DAS. Harvest: December – March at 10–12 months maturity.',
  NULL,
  'SRI Faisalabad Production Technology; Punjab Cane Commissioner',
  '',
  'en',
  '{"sugarcane","planting","setts","fertilizer","irrigation","earthing up"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'maize_fall_armyworm_mgmt',
  'maize',
  'maize_fall_armyworm',
  'disease_mgmt',
  'Fall Armyworm — Maize Management in Pakistan',
  'Fall armyworm (Spodoptera frugiperda) is an invasive pest first confirmed in Pakistan in 2019. Larvae feed on whorls, producing ragged holes and large amounts of frass (sawdust-like excrement). It can devastate a maize field in days. Management: (1) Early detection: scout fields weekly, check 20 plants — treat if >5% show whorl damage. (2) Spray Emamectin benzoate 1.9 EC (Proclaim) at 200ml per acre OR Chlorantraniliprole (Coragen 18.5 SC) at 60ml per acre — direct into the whorl. (3) Spinosad (Tracer 240 SC) at 60ml per acre is effective and safer for beneficials. (4) Neem oil 1500 ppm at 500ml per acre as early intervention. (5) Trichogramma pretiosum releases at 50,000 eggs per acre. (6) Avoid late planting — spring maize (February–March) suffers less than late Kharif.',
  NULL,
  'FAO Pakistan FAW Advisory; DPP Pakistan Emergency Guidelines 2019',
  '',
  'en',
  '{"fall armyworm","maize","spodoptera","emamectin","coragen","FAW","whorl"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'maize_stem_borer_mgmt',
  'maize',
  'maize_stem_borer',
  'disease_mgmt',
  'Maize Stem Borer — Management in Pakistan',
  'Maize stem borer (Chilo partellus) causes "dead heart" in young plants and stem tunneling in older ones, reducing structural strength and yield. It is the most damaging maize pest after fall armyworm in Pakistan. Economic threshold: 5% dead hearts. Management: (1) Apply Carbofuran 3G (Furadan) granules at 8kg per acre in the leaf whorl at 20–25 DAS. (2) Spray Chlorantraniliprole (Coragen) at 60ml per acre. (3) Release Cotesia flavipes parasitoid wasps where available. (4) Remove and destroy dead hearts to prevent larval spread. (5) Intercropping with beans or cowpea reduces stem borer infestation by 30–40%.',
  NULL,
  'NARC Maize Program; CIMMYT Pakistan Advisory',
  '',
  'en',
  '{"stem borer","maize","chilo","dead heart","furadan","coragen"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'maize_nlb_mgmt',
  'maize',
  'maize_northern_leaf_blight',
  'disease_mgmt',
  'Northern Leaf Blight (NLB/TLB) — Maize Management in Pakistan',
  'Northern leaf blight (Exserohilum turcicum) produces long, elliptical, grey-green to tan lesions (3–15cm) on maize leaves. Severe infections cause premature leaf death and 30–50% yield loss. Favorable conditions: 18–27°C with high humidity and heavy dew. Common in spring maize in KPK and northern Punjab. Management: (1) Grow resistant hybrids — check NARC approved hybrid list. (2) Spray Amistar Top (Azoxystrobin + Difenoconazole) at 200ml per acre or Tilt 250 EC (Propiconazole) at 200ml per acre at first lesion appearance. (3) Two sprays at 10–14 day intervals provide good control. (4) Crop rotation — avoid maize-after-maize. (5) Remove and destroy infected debris.',
  NULL,
  'NARC Maize Pathology; Cereal Disease Lab Advisory',
  '',
  'en',
  '{"northern leaf blight","NLB","TLB","maize","exserohilum","amistar","tilt"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'maize_ear_rot_mgmt',
  'maize',
  'maize_ear_rot',
  'disease_mgmt',
  'Maize Ear Rot — Management in Pakistan',
  'Maize ear rot is caused by Fusarium and Aspergillus species, producing pink/white/green moldy kernels. Aspergillus flavus is especially concerning as it produces aflatoxins — a carcinogenic mycotoxin dangerous for human and animal consumption. Favorable conditions: 28–35°C, insect damage to ears (borers create entry points). Management: (1) Control ear-boring insects (fall armyworm, stem borers) to prevent fungal entry. (2) Harvest promptly at 20–22% grain moisture — do not leave mature ears in field. (3) Dry grain to <13% moisture within 48 hours of harvest. (4) Store in clean, airtight containers with Aluminium phosphide fumigation if needed. (5) Do NOT feed visibly moldy grain to livestock — aflatoxin risk. (6) Pre-harvest application of Atoxigenic Aspergillus (AflaSafe) where available.',
  NULL,
  'NARC Food Safety Division; CIMMYT Mycotoxin Advisory',
  '',
  'en',
  '{"ear rot","maize","fusarium","aspergillus","aflatoxin","mycotoxin","storage"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'maize_shoot_fly_mgmt',
  'maize',
  'maize_shoot_fly',
  'disease_mgmt',
  'Shoot Fly — Maize Management in Pakistan',
  'Shoot fly (Atherigona soccata) attacks maize seedlings in the first 3 weeks, causing "dead heart" by cutting the growing point. Most damaging in late-sown Kharif maize. Management: (1) Early sowing (spring: Feb 1–15; Kharif: July 1–10) avoids peak fly populations. (2) Seed treatment with Imidacloprid 70 WS at 5g per kg seed provides 2–3 weeks protection. (3) Higher seed rate (12–15kg per acre) compensates for seedling loss. (4) Fish meal traps attract and kill adult flies. (5) If dead hearts exceed 10%, replanting may be more economical than treatment.',
  NULL,
  'NARC Entomology; Punjab Maize Advisory',
  '',
  'en',
  '{"shoot fly","maize","atherigona","dead heart","seed treatment","imidacloprid"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'maize_production_guide',
  'maize',
  NULL,
  'agronomy',
  'Maize Production Guide — Pakistan',
  'Two seasons: Spring (February – June) and Kharif/Autumn (July – November). Spring sowing: Feb 1–15 for irrigated areas. Kharif sowing: July 1–15. Use approved hybrids (Pioneer 30Y87, Syngenta NK-8441, DK-6789). Seed rate: 8–10kg per acre. Row spacing: 75cm, plant-to-plant: 20–25cm (target: 26,000–30,000 plants per acre). Fertilizer: 1.5 bags DAP at sowing; Urea 2–2.5 bags in 3 splits (at 4-leaf, 8-leaf, and tassel stages). Zinc sulfate 5kg per acre at sowing. First irrigation at 25 DAS, then every 8–10 days in summer. Most critical water stages: tasseling and silking — 2 days of stress at silking reduces yield by 22%.',
  NULL,
  'NARC Maize Production Technology; CIMMYT Pakistan',
  '',
  'en',
  '{"maize","production","hybrid","sowing","fertilizer","irrigation","silking"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'tomato_early_blight_mgmt',
  'tomato',
  'tomato_early_blight',
  'disease_mgmt',
  'Early Blight — Tomato Management in Pakistan',
  'Early blight (Alternaria solani) produces dark brown circular lesions with concentric rings ("target spot") on lower leaves first, progressing upward. In severe cases, plants defoliate and fruits develop leathery black spots at the stem end. Favorable conditions: 24–29°C, alternating wet-dry periods. Management: (1) Spray Mancozeb 75 WP (Dithane M-45) at 500g per acre as preventive every 7–10 days starting at first fruit set. (2) For active infection: Amistar Top (Azoxystrobin + Difenoconazole) at 200ml per acre or Score 250 EC (Difenoconazole) at 120ml per acre. (3) Stake and prune lower branches for air circulation. (4) Mulch with black plastic or straw to prevent soil splash. (5) 3-year rotation away from solanaceous crops. (6) Remove and destroy infected plant debris.',
  NULL,
  'NARC Vegetable Program; Syngenta Pakistan Advisory',
  '',
  'en',
  '{"early blight","tomato","alternaria","target spot","mancozeb","amistar","score"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'tomato_late_blight_mgmt',
  'tomato',
  'tomato_late_blight',
  'disease_mgmt',
  'Late Blight — Tomato Management in Pakistan',
  'Late blight (Phytophthora infestans) causes water-soaked, dark lesions on leaves and stems with white fuzzy sporulation on undersides. Fruits develop firm, dark, greasy-looking rot. This disease can destroy a crop in days under favorable conditions (15–22°C, >90% humidity, persistent rain). Management: (1) Spray Ridomil Gold MZ (Metalaxyl-M 4% + Mancozeb 64%) at 500g per acre every 7 days during rainy weather. (2) Alternate with Cabrio Top (Pyraclostrobin + Metiram) at 500g per acre. (3) NEVER use metalaxyl alone — resistance develops rapidly; always use with a protectant. (4) Remove and bag (do not compost) infected plants. (5) Avoid overhead irrigation. (6) Grow in raised beds for better drainage. (7) Resistant varieties where available.',
  NULL,
  'NARC Plant Pathology; FMC Pakistan Cabrio Top Label',
  '',
  'en',
  '{"late blight","tomato","phytophthora","ridomil","cabrio","metalaxyl"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'tomato_leaf_curl_mgmt',
  'tomato',
  'tomato_leaf_curl',
  'disease_mgmt',
  'Tomato Leaf Curl Virus (ToLCV) — Management in Pakistan',
  'Tomato leaf curl virus (ToLCV), transmitted by whitefly (Bemisia tabaci), causes severe upward curling, yellowing, and stunting of tomato plants. Infected plants produce few or no fruits. It is the most damaging tomato virus in Pakistan, especially in Sindh and southern Punjab. There is NO cure for infected plants. Management: (1) Use resistant/tolerant varieties — Sahel F1, Naqeeb F1. (2) Whitefly management is critical: yellow sticky traps (10 per kanal), spray Imidacloprid 200 SL at 200ml per acre at transplanting and 15 days after. (3) Use 40-mesh nylon net nurseries to raise virus-free seedlings. (4) Remove and destroy infected plants immediately. (5) Intercrop with coriander or marigold to repel whitefly. (6) Apply reflective mulch (silver/aluminium) to repel whitefly.',
  NULL,
  'NARC Virology Lab; AVRDC/WorldVeg Advisory Pakistan',
  '',
  'en',
  '{"leaf curl","tomato","ToLCV","virus","whitefly","imidacloprid","net nursery"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'tomato_fusarium_wilt_mgmt',
  'tomato',
  'tomato_fusarium_wilt',
  'disease_mgmt',
  'Fusarium Wilt — Tomato Management in Pakistan',
  'Fusarium wilt (Fusarium oxysporum f.sp. lycopersici) causes progressive yellowing and wilting, usually starting on one side of the plant. Cutting the stem shows brown discoloration of vascular tissue. The fungus persists in soil for years. Management: (1) Resistant varieties are the primary control — look for "F" or "F1" designation. (2) Soil solarization: cover moist soil with clear plastic for 4–6 weeks in summer (June–July) before transplanting. (3) Trichoderma viride soil application at 2kg per acre mixed with 50kg FYM. (4) Raise pH to 6.5–7.0 — Fusarium thrives in acidic soils. (5) Crop rotation: 4–5 years without solanaceous crops. (6) Drip irrigation reduces splash spread. (7) Carbendazim (Bavistin 50 WP) soil drench at 2g per liter around plant base — provides partial control only.',
  NULL,
  'UAF Vegetable Pathology; NARC Biological Control Lab',
  '',
  'en',
  '{"fusarium","wilt","tomato","trichoderma","solarization","carbendazim"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'tomato_fruit_borer_mgmt',
  'tomato',
  'tomato_fruit_borer',
  'disease_mgmt',
  'Tomato Fruit Borer — Management in Pakistan',
  'Tomato fruit borer (Helicoverpa armigera) is the most damaging insect pest of tomatoes in Pakistan. Larvae bore into green and ripening fruits, causing entry holes with frass and internal feeding damage. One larva can damage 5–8 fruits. Economic threshold: 1–2 larvae per plant or 5% fruit damage. Management: (1) Pheromone traps (Helilure) — 5 per acre for monitoring and mass trapping. (2) Spray Emamectin benzoate 1.9 EC (Proclaim) at 200ml per acre at first fruit set when threshold is reached. (3) Bacillus thuringiensis (Bt) sprays (Dipel 2X) at 200g per acre — safe for beneficial insects. (4) Spinosad (Tracer 240 SC) at 60ml per acre. (5) NPV (Nuclear Polyhedrosis Virus) at 250 LE per acre. (6) Hand-pick and destroy larvae in small plots. (7) Neem kernel extract 5% as early deterrent.',
  NULL,
  'NARC IPM Lab; Syngenta Pakistan Proclaim Label',
  '',
  'en',
  '{"fruit borer","tomato","helicoverpa","emamectin","Bt","pheromone trap"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'tomato_production_guide',
  'tomato',
  NULL,
  'agronomy',
  'Tomato Production Guide — Pakistan',
  'Two main seasons: Spring (nursery: December–January, transplant: February–March) and Autumn (nursery: June–July, transplant: August). Popular varieties: Roma, Rio Grande, Sahel F1, Naqeeb F1, Advanta 1185. Nursery: raise in raised beds or 40-mesh net house to prevent virus. Transplant 4–5 week old seedlings at 60cm × 45cm spacing. Fertilizer: 2 bags DAP + 1 bag SOP at transplanting; 2 bags Urea in 3 splits. Total NPK: 120-90-60 kg per acre. Stake or trellis indeterminate types. First picking at 70–80 days after transplanting. Yield target: 400–600 maunds per acre (improved varieties). Key: start disease prevention sprays at first flower — do not wait for symptoms.',
  NULL,
  'NARC Vegetable Program; Punjab Horticulture Extension',
  '',
  'en',
  '{"tomato","production","nursery","transplanting","variety","fertilizer"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'pesticide_amistar_top',
  NULL,
  NULL,
  'pesticide',
  'Amistar Top — Registered Fungicide (Syngenta Pakistan)',
  'Product: Amistar Top 325 SC. Manufacturer: Syngenta Pakistan. Active ingredients: Azoxystrobin 200g/L + Difenoconazole 125g/L. Registration: DPP Pakistan registered for wheat, rice, tomato, chili, potato, onion. Mode of action: Strobilurin (QoI, Group 11) + Triazole (DMI, Group 3). Dose: 200ml per acre (400ml per hectare). Application: Foliar spray with 100–120 liters water per acre. PHI (Pre-Harvest Interval): 14 days. Target diseases: Leaf rust, yellow rust (wheat); Blast, sheath blight (rice); Early blight, powdery mildew (tomato); Purple blotch (onion). WARNING: Do not apply more than 2 consecutive applications — rotate with non-QoI fungicide. Do not mix with alkaline pesticides.',
  NULL,
  'DPP Pakistan Registered Pesticide List 2024; Syngenta Label',
  'https://www.syngenta.com.pk/product/amistar-top',
  'en',
  '{"amistar top","azoxystrobin","difenoconazole","fungicide","syngenta","registered"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'pesticide_nativo',
  NULL,
  NULL,
  'pesticide',
  'Nativo 75 WG — Registered Fungicide (Bayer Pakistan)',
  'Product: Nativo 75 WG. Manufacturer: Bayer CropScience Pakistan. Active ingredients: Trifloxystrobin 25% + Tebuconazole 50%. Registration: DPP Pakistan registered for wheat, rice, cotton. Mode of action: Strobilurin (Group 11) + Triazole (Group 3). Dose: 80–100g per acre. Application: Foliar spray with 100 liters water per acre. PHI: 14 days. Target diseases: Yellow rust, leaf rust (wheat); Sheath blight (rice); Alternaria leaf spot (cotton). Maximum 2 applications per season. Store below 30°C. Toxicity class: III (slightly hazardous). Harmful to fish — do not contaminate waterways.',
  NULL,
  'DPP Pakistan; Bayer CropScience Label',
  '',
  'en',
  '{"nativo","trifloxystrobin","tebuconazole","fungicide","bayer","registered"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'pesticide_ridomil_gold',
  NULL,
  NULL,
  'pesticide',
  'Ridomil Gold MZ — Registered Fungicide (Syngenta Pakistan)',
  'Product: Ridomil Gold MZ 68 WG. Manufacturer: Syngenta Pakistan. Active ingredients: Metalaxyl-M 4% + Mancozeb 64%. Registration: DPP Pakistan registered for tomato, potato, onion. Mode of action: Phenylamide (Group 4) + Multi-site protectant (Group M3). Dose: 500g per acre. Application: Foliar spray with 100–120 liters water per acre. PHI: 14 days. Target diseases: Late blight (tomato, potato); Downy mildew (onion). CRITICAL: NEVER use metalaxyl alone — always in mixture with a protectant fungicide. Metalaxyl resistance in Phytophthora develops rapidly with solo use. Maximum 3 applications per season, alternate with non-metalaxyl products.',
  NULL,
  'DPP Pakistan; Syngenta Pakistan Label',
  'https://www.syngenta.com.pk/product/ridomil-gold-wg',
  'en',
  '{"ridomil","metalaxyl","mancozeb","fungicide","syngenta","late blight","registered"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'pesticide_coragen',
  NULL,
  NULL,
  'pesticide',
  'Coragen 18.5 SC — Registered Insecticide (FMC Pakistan)',
  'Product: Coragen 18.5 SC. Manufacturer: FMC Pakistan. Active ingredient: Chlorantraniliprole 18.5%. Registration: DPP Pakistan registered for rice, cotton, maize, sugarcane, tomato, vegetables. Mode of action: Diamide (Group 28) — activates ryanodine receptors causing muscle paralysis. Dose: 60ml per acre. Application: Foliar spray with 100 liters water per acre. PHI: 3 days (tomato), 14 days (rice). Target pests: Stem borers (rice, sugarcane, maize), bollworms (cotton), fruit borer (tomato), fall armyworm (maize). Very low mammalian toxicity. Safe for honeybees at label rates. IPM-compatible — does not disrupt natural enemy populations. Do not apply more than 2 times per crop cycle.',
  NULL,
  'DPP Pakistan; FMC Pakistan Coragen Label',
  '',
  'en',
  '{"coragen","chlorantraniliprole","insecticide","FMC","stem borer","bollworm","registered"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'pesticide_confidor',
  NULL,
  NULL,
  'pesticide',
  'Confidor 200 SL — Registered Insecticide (Bayer Pakistan)',
  'Product: Confidor 200 SL. Manufacturer: Bayer CropScience Pakistan. Active ingredient: Imidacloprid 200g/L. Registration: DPP Pakistan registered for wheat, cotton, rice, sugarcane, vegetables. Mode of action: Neonicotinoid (Group 4A) — systemic, absorbed by plant. Dose: 200–250ml per acre. Application: Foliar spray or soil drench. PHI: 14 days. Target pests: Aphids (wheat), whitefly (cotton, tomato), brown planthopper (rice), leafhoppers. WARNING: Toxic to bees — do not spray during flowering. Avoid use on flowering crops. Do not apply near water bodies — toxic to aquatic organisms. Maximum 2 applications per season. Seed treatment formulation (Gaucho) available separately.',
  NULL,
  'DPP Pakistan; Bayer Pakistan Label',
  '',
  'en',
  '{"confidor","imidacloprid","insecticide","bayer","neonicotinoid","whitefly","aphid","registered"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'pesticide_emamectin',
  NULL,
  NULL,
  'pesticide',
  'Proclaim / Emamectin Benzoate — Registered Insecticide',
  'Product: Proclaim 1.9 EC / generic Emamectin benzoate 1.9 EC. Active ingredient: Emamectin benzoate 1.9%. Registration: DPP Pakistan registered for cotton, tomato, maize, vegetables. Mode of action: Avermectin (Group 6) — paralyzes insect nervous system. Dose: 200ml per acre. Application: Foliar spray, target pest directly. PHI: 7 days. Target pests: Bollworm complex (cotton), fruit borer (tomato), fall armyworm and stem borer (maize), caterpillars. Highly effective against Lepidoptera larvae. Moderate toxicity to aquatic organisms. Compatible with IPM — relatively safe for parasitoids. Do not tank-mix with alkaline products.',
  NULL,
  'DPP Pakistan; Syngenta Proclaim Label',
  '',
  'en',
  '{"emamectin","proclaim","insecticide","bollworm","armyworm","registered"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'pesticide_mancozeb',
  NULL,
  NULL,
  'pesticide',
  'Dithane M-45 / Mancozeb — Registered Fungicide',
  'Product: Dithane M-45 (75% Mancozeb WP). Multiple manufacturers. Registration: DPP Pakistan registered for tomato, potato, onion, rice, cotton. Mode of action: Multi-site protectant (Group M3) — contact activity only, does not move inside plant. Dose: 500g per acre (1kg per hectare). Application: Foliar spray every 7–10 days. PHI: 7 days. Target diseases: Early blight (tomato), late blight (potato — in mixture), brown spot (rice), Alternaria leaf spot (cotton), purple blotch (onion). MUST be applied BEFORE infection — has no curative activity. Re-apply after rain. Low resistance risk. Can be tank-mixed with most systemic fungicides. Low mammalian toxicity. Skin sensitizer — use gloves.',
  NULL,
  'DPP Pakistan; Dow AgroSciences Label',
  '',
  'en',
  '{"mancozeb","dithane","fungicide","protectant","early blight","registered"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'advisory_ipm_principles',
  NULL,
  NULL,
  'advisory',
  'Integrated Pest Management (IPM) Principles for Pakistan',
  'Integrated Pest Management (IPM) is the cornerstone of sustainable agriculture in Pakistan. Key principles: (1) Prevention: use resistant varieties, certified seed, crop rotation, and field sanitation. (2) Monitoring: regular field scouting — do not spray blindly. Use economic thresholds before deciding to treat. (3) Biological control first: encourage natural predators (ladybirds, lacewings, Trichogramma), use Bt sprays, and Trichoderma for soil diseases. (4) Cultural practices: proper spacing, timely sowing, balanced fertilizer, good drainage. (5) Chemical control as last resort: use selective pesticides, rotate chemical groups to prevent resistance, respect PHI, and follow label doses exactly. (6) Record-keeping: maintain a spray diary. Punjab Agriculture Department provides free IPM training through Farmer Field Schools.',
  NULL,
  'FAO Pakistan IPM Programme; Punjab Agriculture Department',
  '',
  'en',
  '{"IPM","integrated pest management","biological control","spray diary","threshold"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'advisory_pesticide_safety',
  NULL,
  NULL,
  'advisory',
  'Pesticide Safety Guidelines for Pakistani Farmers',
  'Pesticide safety is critical — Pakistan has high pesticide poisoning rates due to improper handling. Safety rules: (1) Read the label before every use — it is the law. (2) Wear PPE: long sleeves, gloves, face mask, and eye protection. Minimum: rubber gloves and face mask. (3) Never eat, drink, or smoke while handling pesticides. (4) Mix outdoors or in well-ventilated areas. (5) Do not blow blocked nozzles with your mouth. (6) Spray with wind, not against it. (7) Respect PHI (Pre-Harvest Interval) — the minimum days between last spray and harvest. (8) Triple-rinse empty containers and puncture them — never reuse for food or water. (9) Store pesticides locked away from children and food. (10) If poisoned: remove contaminated clothing, wash skin with soap, go to nearest hospital with the pesticide label. Helpline: Punjab Agriculture Emergency 0800-22444.',
  NULL,
  'DPP Pakistan Pesticide Ordinance 1971; WHO Pesticide Safety Guide',
  '',
  'en',
  '{"pesticide safety","PPE","poisoning","PHI","label","storage","emergency"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'advisory_soil_health',
  NULL,
  NULL,
  'advisory',
  'Soil Health Management — Pakistan',
  'Pakistan''s soils face serious degradation: salinity, low organic matter (<1% in most Punjab soils), and micronutrient deficiency. Recommendations: (1) Soil testing: get your soil tested every 2 years — NARC and provincial labs offer this for Rs. 200–500. (2) Organic matter: apply 2–3 tonnes FYM or compost per acre annually. Green manuring with guar, jantar (Sesbania), or berseem adds 50–80kg nitrogen per acre. (3) Zinc deficiency: widespread in Pakistan — apply Zinc sulfate 5kg per acre at sowing for wheat, rice, maize. (4) Boron: apply Borax 2–3kg per acre for cotton and sugarcane. (5) Salt-affected soils: apply Gypsum at 1–2 tonnes per acre, followed by leaching irrigation. (6) Avoid burning crop residue — it destroys organic matter and beneficial soil organisms. (7) Practice minimum tillage where feasible.',
  NULL,
  'NARC Land Resources Division; Punjab Soil Fertility Institute',
  '',
  'en',
  '{"soil","organic matter","zinc","salinity","gypsum","soil testing","FYM"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'advisory_water_conservation',
  NULL,
  NULL,
  'advisory',
  'Water Conservation Practices — Pakistan Agriculture',
  'Pakistan is a water-stressed country — agriculture uses 90% of available water, much of it inefficiently. Water conservation practices: (1) Laser land leveling: reduces water use by 25–30% and improves yield — cost Rs. 3,000–4,000 per acre, pays back in one season. (2) Raised bed planting: for wheat and vegetables, saves 30–40% water. (3) Alternate wetting and drying (AWD) for rice: saves 25% water without yield loss — flood to 5cm, let dry until cracks appear, then re-flood. (4) Drip irrigation for vegetables: 50–60% water saving, also reduces disease by keeping foliage dry. (5) Mulching: straw or plastic mulch reduces evaporation by 25–30%. (6) Canal lining and watercourse improvement: contact your local Water Users Association. Government subsidy available for drip/sprinkler systems through Punjab Agriculture Department.',
  NULL,
  'IWMI Pakistan; PARC Water Management Division',
  '',
  'en',
  '{"water","conservation","laser leveling","drip irrigation","AWD","mulch"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'advisory_climate_adaptation',
  NULL,
  NULL,
  'advisory',
  'Climate Change Adaptation for Pakistani Farmers',
  'Pakistan is among the top 10 countries most affected by climate change. Agricultural impacts: higher temperatures, erratic rainfall, increased pest/disease pressure, more frequent floods and droughts. Adaptation strategies: (1) Shift to heat-tolerant varieties — NARC releases heat-tolerant wheat (Faisalabad-2008) and short-duration rice. (2) Adjust sowing dates — sow wheat earlier (late October) to escape terminal heat. (3) Diversify crops — don''t rely on a single crop. (4) Crop insurance: Punjab Crop Insurance Scheme covers major crops. (5) Early warning systems: subscribe to PMD weather alerts and Punjab Agriculture SMS service. (6) Build on-farm water storage (ponds) for supplementary irrigation. (7) Agroforestry: plant trees on field borders for windbreaks and shade — Moringa, Poplar, and Shisham are suitable.',
  NULL,
  'Pakistan Climate Change Council; GCISC Islamabad',
  '',
  'en',
  '{"climate change","heat stress","adaptation","insurance","agroforestry","drought"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'advisory_seed_quality',
  NULL,
  NULL,
  'advisory',
  'Seed Quality & Certification in Pakistan',
  'Using certified seed is the single most cost-effective investment a farmer can make — it improves yields by 15–25% compared to farm-saved seed. In Pakistan, FSC&RD (Federal Seed Certification and Registration Department) certifies seed. Seed classes: Breeder → Foundation → Registered → Certified. Always look for the FSC&RD blue tag on the bag. Key points: (1) Buy certified seed from registered dealers — check the dealer''s license. (2) Check the seed lot number and test certificate. (3) Germination rate should be >85% for cereals, >70% for vegetables. (4) Seed treatment: treat all seed with recommended fungicide before sowing — cost is Rs. 100–200 per acre but prevents thousands in losses. (5) For vegetable seed: prefer F1 hybrids from reputable companies (Syngenta, Bayer, East-West Seed). (6) Never save seed from hybrid crops — it does not breed true.',
  NULL,
  'FSC&RD Pakistan; Punjab Seed Corporation',
  '',
  'en',
  '{"seed","certified","FSC&RD","germination","hybrid","seed treatment"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'advisory_fertilizer_use',
  NULL,
  NULL,
  'advisory',
  'Balanced Fertilizer Use — Pakistan',
  'Pakistan''s farmers overuse nitrogen (Urea) and underuse phosphorus, potassium, and micronutrients — the NPK use ratio is 4.3:1:0.1 against the ideal 2:1:0.5. This leads to declining yields and soil degradation. Recommendations: (1) Always apply phosphorus (DAP or SSP) at sowing — it cannot be top-dressed effectively. (2) Split nitrogen (Urea) into 2–3 applications — at sowing, first irrigation, and 2nd irrigation. (3) Potassium (SOP or MOP) is critical for disease resistance and fruit quality — apply 1 bag SOP per acre for cotton, sugarcane, vegetables. (4) Zinc sulfate 5kg per acre at sowing for wheat, rice, maize. (5) Use NP compound fertilizers (DAP, NP) for convenience. (6) Foliar feeding: Zinc + Boron foliar spray at flowering improves grain set. (7) Get soil tested to know exactly what your field needs — avoid guessing.',
  NULL,
  'NFDC Pakistan; PARC Soil Science Division',
  '',
  'en',
  '{"fertilizer","urea","DAP","potassium","zinc","NPK","soil testing"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'advisory_extension_services',
  NULL,
  NULL,
  'advisory',
  'Agricultural Extension Services — Pakistan',
  'Pakistan''s agricultural extension services provide free advice and support to farmers. Key contacts: (1) Punjab: Agriculture Extension Department — visit your nearest Agriculture Officer at the Tehsil level. Helpline: 0800-22444 (free). SMS service: send crop name to 8070. (2) Sindh: Agriculture Extension Wing, call 021-99211241. (3) KPK: Directorate of Agriculture Extension, call 091-9212067. (4) NARC (National Agricultural Research Centre, Islamabad): 051-9255000 — for technical queries about varieties, diseases, and research. (5) Farmer Field Schools (FFS): season-long learning programs — ask your local Agriculture Officer about enrollment. (6) Pakistan Agricultural Research Council (PARC): publishes technology bulletins in Urdu — available free at district offices. (7) Khushhal Pakistan Program: provides subsidized inputs — check eligibility with your Agriculture Officer.',
  NULL,
  'Punjab Agriculture Department; PARC Pakistan',
  '',
  'en',
  '{"extension","helpline","agriculture officer","NARC","farmer field school"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'general_when_unsure',
  NULL,
  NULL,
  'general',
  'What to Do When Disease Identification Is Uncertain',
  'If you cannot confidently identify a crop disease from a photo, follow these steps: (1) Take multiple clear photographs: close-up of the affected area (leaf, stem, fruit), the whole plant, and a healthy plant for comparison. Photograph both upper and lower leaf surfaces. (2) Note the field conditions: temperature, recent rainfall, irrigation history, and last spray applied. (3) Check neighboring fields — is the same problem appearing there? (4) Contact your local Agriculture Extension Officer — they provide FREE field visits for disease diagnosis. (5) Send samples to the Plant Pathology laboratory at your nearest agricultural research institute. (6) Until identified, avoid broad-spectrum pesticide sprays — they often make things worse by killing beneficial organisms. (7) If the problem is spreading rapidly, isolate affected areas by removing severely infected plants.',
  NULL,
  'General agronomic best practice; NARC Advisory',
  '',
  'en',
  '{"uncertain","identification","extension officer","laboratory","sample","photograph"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'general_harvest_storage',
  NULL,
  NULL,
  'general',
  'Grain Harvest & Storage Best Practices — Pakistan',
  'Post-harvest losses in Pakistan range from 15–30% — proper harvest timing and storage can dramatically reduce this. Guidelines: (1) Wheat: harvest at 12–14% grain moisture — test by biting a grain, it should crack cleanly. (2) Rice: harvest when 80% of panicles turn golden. (3) Dry grain to <12% moisture before storage. (4) Clean and fumigate storage bins before filling. (5) Use Aluminium phosphide (Phostoxin/Celphos) tablets for fumigation — 1 tablet per tonne of grain in airtight storage for 7 days. EXTREME CAUTION: phosphine gas is lethal — never sleep in a room with fumigating grain, ventilate for 48 hours after opening. (6) Store in metallic bins or hermetic (PICS) bags — they prevent insect re-infestation. (7) Check stored grain monthly for heating, insects, and moisture. (8) Do not store near walls — maintain 2-foot gap for inspection.',
  NULL,
  'PARC Post-Harvest Technology Division; FAO Pakistan',
  '',
  'en',
  '{"harvest","storage","moisture","fumigation","phosphine","PICS bags","post-harvest"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'general_organic_alternatives',
  NULL,
  NULL,
  'advisory',
  'Organic & Low-Cost Pest Control Alternatives — Pakistan',
  'For farmers who cannot afford or prefer to avoid synthetic pesticides, several effective organic alternatives exist: (1) Neem extract (Azadirachtin): soak 1kg neem leaves in 5L water for 24 hours, strain, add 2ml liquid soap — spray for aphids, whitefly, caterpillars. (2) Tobacco extract: soak 100g tobacco waste in 1L water for 24 hours — effective against soft-bodied insects. CAUTION: toxic, do not use on food crops near harvest. (3) Garlic-chili spray: blend 50g garlic + 50g hot chili in 1L water, add soap — repels many insects. (4) Trichoderma viride: mix 2kg with 50kg FYM, apply to soil — prevents Fusarium, Rhizoctonia, Pythium. Available from NARC Biological Control Lab. (5) Beauveria bassiana: fungal insecticide effective against whitefly, aphids — available commercially. (6) Cow urine spray (10% dilution): antifungal properties. (7) Marigold border planting: repels whitefly and nematodes.',
  NULL,
  'NARC Biological Control Lab; FAO Farmer Field School Curriculum',
  '',
  'en',
  '{"organic","neem","trichoderma","biological control","low cost","garlic","beauveria"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'general_disease_resistance',
  NULL,
  NULL,
  'advisory',
  'Understanding Disease Resistance in Crop Varieties',
  'Choosing disease-resistant varieties is the most economical and environmentally friendly disease control method. In Pakistan, NARC and provincial research institutes release approved variety lists annually. Key concepts: (1) Resistance vs Tolerance: Resistant varieties prevent pathogen multiplication; tolerant varieties produce acceptable yields despite infection. (2) Resistance can break down — pathogens evolve. The yellow rust race change in 2005 devastated previously resistant wheat varieties in Pakistan. (3) Varietal diversification: plant 2–3 different varieties — if one fails, others may survive. (4) Check the Provincial Seed Council''s approved variety list before buying. (5) "R" rating means resistant, "MR" moderately resistant, "S" susceptible in trial data. (6) No variety is resistant to everything — combine varietal resistance with good agronomic practices for best results.',
  NULL,
  'NARC Crop Sciences Division; Punjab Seed Council',
  '',
  'en',
  '{"resistance","variety","NARC","seed council","diversification","breeding"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'rice_false_smut_mgmt',
  'rice',
  'rice_false_smut',
  'disease_mgmt',
  'False Smut (Green Smut) — Rice Management in Pakistan',
  'False smut (Ustilaginoidea virens) transforms individual grains in the rice panicle into velvety greenish-yellow to orange-black spore balls. Favorable conditions: 25–35°C with high relative humidity (>85%) during panicle emergence and flowering. Management: (1) Spray Amistar Top (Azoxystrobin + Difenoconazole) at 200ml per acre OR Nativo 75 WG at 80g per acre during the boot leaf stage (prior to panicle emergence). (2) Avoid excessive nitrogen fertilization during booting. (3) Destroy infected panicles after harvest to prevent sclerotia over-wintering in soil. (4) Use certified disease-free seeds.',
  NULL,
  'Rice Research Institute Kala Shah Kaku; DPP Pakistan Registered Fungicides',
  '',
  'en',
  '{"false smut","green smut","rice","panicle","amistar","nativo","ustilaginoidea"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'cotton_bacterial_blight_mgmt',
  'cotton',
  'cotton_bacterial_blight',
  'disease_mgmt',
  'Bacterial Blight (Angular Leaf Spot / Blackarm) — Cotton Management in Pakistan',
  'Bacterial blight (Xanthomonas axonopodis pv. malvacearum) produces angular water-soaked spots bounded by leaf veins, turning dark brown/black with yellow halos. It also causes blackarm lesions on stems and boll rot. Favorable conditions: warm (24–32°C) wet weather. Management: (1) Acid delinting of cotton seed with concentrated sulfuric acid (100ml/kg seed) to eliminate seed-borne bacteria. (2) Seed treatment with Sun-Cop (copper hydroxide) or carboxin. (3) Foliar application of copper-based bactericides (Sun-Cop / Copper oxychloride 50% WP at 500g per acre) at first symptom appearance. (4) Grow resistant varieties and avoid excessive flood irrigation.',
  NULL,
  'CCRI Multan Advisory; DPP Pakistan Approved Bactericides',
  '',
  'en',
  '{"bacterial blight","angular leaf spot","blackarm","cotton","xanthomonas","copper","sun-cop"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'cotton_fusarium_wilt_mgmt',
  'cotton',
  'cotton_fusarium_wilt',
  'disease_mgmt',
  'Fusarium Wilt — Cotton Management in Pakistan',
  'Fusarium wilt (Fusarium oxysporum f.sp. vasinfectum) causes yellowing of lower leaves progressing upward, followed by sudden wilting. Stem cross-sections reveal a distinct dark brown or black vascular discoloration ring. Management: (1) Use certified wilt-resistant cotton varieties approved by CCRI Multan. (2) Seed dressing with Topsin-M (Thiophanate-methyl 70 WP) at 2.5g per kg seed. (3) Soil application of Trichoderma harzianum bio-fungicide during sowing. (4) Practice crop rotation with non-host crops (wheat, maize, sorghum); avoid planting continuous cotton in infested soils.',
  NULL,
  'CCRI Multan; Pakistan Central Cotton Committee',
  '',
  'en',
  '{"fusarium wilt","cotton","vascular wilt","topsin-m","seed treatment","rotation"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'sugarcane_yellow_leaf_mgmt',
  'sugarcane',
  'sugarcane_yellow_leaf',
  'disease_mgmt',
  'Yellow Leaf Disease (ScYLV) — Sugarcane Management in Pakistan',
  'Sugarcane yellow leaf disease is caused by Sugarcane yellow leaf virus (ScYLV) transmitted primarily by the sugarcane aphid (Melanaphis sacchari). Symptoms begin with prominent yellowing of the midrib on upper leaves, which gradually spreads to the leaf blade and leads to midrib necrosis. Management: (1) Plant certified disease-free tissue-cultured or nursery setts. (2) Control aphid vectors using Imidacloprid (Confidor 200 SL at 200ml per acre) or systemic aphicides. (3) Promptly rogue and eradicate infected stools. (4) Avoid taking multiple ratoon crops from infected fields.',
  NULL,
  'Sugarcane Research Institute Faisalabad; NARC Plant Virology',
  '',
  'en',
  '{"yellow leaf","scylv","sugarcane","aphid","confidor","virus","setts"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'sugarcane_pokkah_boeng_mgmt',
  'sugarcane',
  'sugarcane_pokkah_boeng',
  'disease_mgmt',
  'Pokkah Boeng (Twisted Top) — Sugarcane Management in Pakistan',
  'Pokkah boeng (Fusarium moniliforme) is a fungal disease that causes chlorotic deformities, wrinkles, and knife-cut like lesions at the base of young sugarcane leaves. In severe cases, the terminal shoot twists into a deformed knot (''twisted top'') and terminal rot develops. Favorable conditions: hot (25–32°C) humid rainy periods. Management: (1) Foliar spray with Amistar Top (Azoxystrobin + Difenoconazole) at 200ml per acre or Bavistin (Carbendazim) at 500g per acre. (2) Avoid excessive nitrogen fertilization during monsoon. (3) Eradicate severely infected canes before rot enters the stalk.',
  NULL,
  'Sugarcane Research Institute Faisalabad; DPP Pakistan Fungicide Registry',
  '',
  'en',
  '{"pokkah boeng","twisted top","sugarcane","knife-cut","amistar","fusarium"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'maize_grey_leaf_spot_mgmt',
  'maize',
  'maize_grey_leaf_spot',
  'disease_mgmt',
  'Grey Leaf Spot — Maize Management in Pakistan',
  'Grey leaf spot (Cercospora zeae-maydis) produces distinct rectangular tan-to-grey lesions with straight parallel edges bounded by leaf veins. Under warm (25–30°C) and humid weather with prolonged dew, lesions coalesce and cause premature blighting of the entire canopy. Management: (1) Plant resistant or tolerant hybrid varieties. (2) Foliar spray with Cabrio Top (Metiram + Pyraclostrobin) at 400g per acre or Amistar Top at 200ml per acre upon detection. (3) Deep plowing of crop residues to reduce fungal inoculum. (4) Rotate with legumes or non-host crops.',
  NULL,
  'Yousafwala Maize Research Institute Sahiwal; FMC Pakistan Cabrio Top Label',
  '',
  'en',
  '{"grey leaf spot","cercospora","maize","corn","cabrio top","amistar"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'maize_common_rust_mgmt',
  'maize',
  'maize_common_rust',
  'disease_mgmt',
  'Common Rust — Maize Management in Pakistan',
  'Common rust (Puccinia sorghi) produces brick-red to dark brown oval-to-elongated pustules scattered randomly on both upper and lower corn leaf surfaces. Favorable conditions: 16–23°C with high relative humidity and dewy nights. Management: (1) Plant approved resistant hybrids. (2) Apply Nativo 75 WG (Trifloxystrobin + Tebuconazole) at 80g per acre or Amistar Top at 200ml per acre if pustules appear prior to tasseling. (3) Early planting to avoid peak fungal spore showers. (4) Avoid excessive crop density.',
  NULL,
  'Yousafwala Maize Research Institute Sahiwal; Bayer Nativo Label',
  '',
  'en',
  '{"common rust","puccinia sorghi","maize","corn","rust","nativo","amistar"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'tomato_bacterial_wilt_mgmt',
  'tomato',
  'tomato_bacterial_wilt',
  'disease_mgmt',
  'Bacterial Wilt — Tomato Management in Pakistan',
  'Bacterial wilt (Ralstonia solanacearum) is a destructive soil-borne bacterial pathogen causing rapid, irreversible wilting of the whole tomato plant while leaves often remain green. A cut stem immersed in clear water releases diagnostic milky bacterial streaming. There is NO chemical cure. Management: (1) Strictly remove and burn infected plants along with the surrounding root ball. (2) Use resistant rootstocks or varieties. (3) Long-term crop rotation with non-solanaceous crops (maize, sorghum, rice). (4) Avoid flood irrigation from infected areas and disinfect tools.',
  NULL,
  'NARC Vegetable Program; Vegetable Research Institute Faisalabad',
  '',
  'en',
  '{"bacterial wilt","ralstonia","tomato","wilting","no chemical cure","crop rotation"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'tomato_leaf_miner_mgmt',
  'tomato',
  'tomato_leaf_miner',
  'disease_mgmt',
  'Tomato Leaf Miner (Tuta Absoluta) — Management in Pakistan',
  'Tomato leaf miner (Tuta absoluta) larvae bore into leaves, stems, and fruits, creating irregular silvery serpentine blotch mines packed with dark frass. Severe infestations defoliate entire fields. Management: (1) Install delta pheromone traps (8–10 per acre) for early monitoring and mass trapping. (2) Spray Coragen (Chlorantraniliprole 20 SC) at 60ml per acre OR Voliam Targo (Chlorantraniliprole + Abamectin) at 100ml per acre. (3) Alternate insecticide modes of action to prevent resistance. (4) Remove and destroy mined leaves and cull infested fruit.',
  NULL,
  'DPP Pakistan Pest Management Advisory; FMC Coragen Label',
  '',
  'en',
  '{"tomato leaf miner","tuta absoluta","tomato","pheromone","coragen","voliam targo"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'tomato_blossom_end_rot_mgmt',
  'tomato',
  'tomato_blossom_end_rot',
  'disease_mgmt',
  'Blossom End Rot — Tomato Physiological Disorder Management in Pakistan',
  'Blossom end rot is a physiological disorder (not a pathogen) triggered by localized calcium deficiency in developing fruits, compounded by irregular irrigation, water stress, or excess ammonium-based nitrogen. Symptoms start as water-soaked spots at the blossom end that flatten and turn into sunken, dry, leathery black spots. Management: (1) Maintain uniform soil moisture through consistent drip or ridge irrigation; never let the root zone dry out during fruit set. (2) Apply foliar calcium nitrate (Ca(NO3)2) at 5g per liter of water weekly during early fruit development. (3) Avoid root pruning during weeding. (4) Balance fertilizer applications.',
  NULL,
  'Vegetable Research Institute Faisalabad; NARC Horticulture Advisory',
  '',
  'en',
  '{"blossom end rot","calcium","tomato","irrigation","water stress","physiological"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'ur_wheat_rust_advisory',
  'wheat',
  'wheat_yellow_rust',
  'disease_mgmt',
  'گندم کی زنگ — مشورے',
  'گندم کی زنگ (پیلی زنگ / زرد زنگ) پاکستان میں سب سے خطرناک بیماری ہے۔ علامات: پتوں پر زرد نارنجی دھبے قطاروں میں نظر آتے ہیں۔ مناسب حالات: درجہ حرارت 10-15 ڈگری، نمی 70 فیصد سے زیادہ۔ علاج: (1) ایمسٹار ٹاپ 200 ملی لیٹر فی ایکڑ سپرے کریں۔ (2) نیٹیوو 75 ڈبلیو جی 80 گرام فی ایکڑ۔ (3) مزاحم اقسام جیسے گلیکسی 2013 اور زنکول 2016 کاشت کریں۔ (4) بیمار پودوں کو فوری طور پر نکالیں۔ (5) بیج کا علاج ریکسل سے کاشت سے پہلے ضرور کریں۔ فوری مدد کے لیے: زرعی ہیلپ لائن 0800-22444 پر کال کریں۔',
  NULL,
  'NARC Wheat Advisory Urdu',
  '',
  'en',
  '{"گندم","زنگ","پیلی زنگ","wheat","rust","urdu"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'ur_cotton_whitefly_advisory',
  'cotton',
  'cotton_whitefly',
  'disease_mgmt',
  'کپاس میں سفید مکھی — مشورے',
  'سفید مکھی (بیمیسیا ٹبیسی) کپاس کا سب سے خطرناک کیڑا ہے — یہ پتوں کا رس چوستی ہے اور لیف کرل وائرس پھیلاتی ہے۔ اقتصادی حد: 5-8 بالغ مکھیاں فی پتا۔ علاج: (1) نیم کا عرق 400 ملی لیٹر فی ایکڑ — پہلے استعمال کریں۔ (2) اوبیرون 240 ایس سی 160 ملی لیٹر فی ایکڑ۔ (3) ایڈمرل 10 ای سی 250 ملی لیٹر فی ایکڑ۔ (4) پیلے چپکنے والے ٹریپ 8 فی ایکڑ لگائیں۔ (5) قدرتی دشمنوں (مثلاً: کرائسوپرلا) کو بچائیں — وسیع الاثر زہریں نہ استعمال کریں۔ (6) وائرس زدہ پودوں کو فوری اکھاڑ کر تلف کریں۔',
  NULL,
  'CCRI Multan Urdu Advisory',
  '',
  'en',
  '{"کپاس","سفید مکھی","cotton","whitefly","urdu"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

INSERT INTO public.knowledge_chunks (
  id, crop_id, disease_id, category, title, content, content_ur, source, source_url, language, tags
) VALUES (
  'ur_general_safety',
  NULL,
  NULL,
  'advisory',
  'زہروں کا محفوظ استعمال — ہدایات',
  'کیڑے مار زہروں کے استعمال میں حفاظت بہت ضروری ہے۔ اہم ہدایات: (1) استعمال سے پہلے لیبل ضرور پڑھیں۔ (2) دستانے، ماسک اور لمبی آستینوں والے کپڑے پہنیں۔ (3) سپرے کے دوران کھانا نہ کھائیں، پانی نہ پئیں۔ (4) ہوا کی سمت میں سپرے کریں۔ (5) بچوں کی پہنچ سے دور رکھیں۔ (6) خالی بوتلیں دوبارہ استعمال نہ کریں — توڑ کر دفنائیں۔ (7) زہر لگ جائے تو: جلد صابن سے دھوئیں، لیبل لے کر فوری ہسپتال جائیں۔ ایمرجنسی: 0800-22444 (پنجاب زرعی ہیلپ لائن)۔',
  NULL,
  'DPP Pakistan Safety Guidelines Urdu',
  '',
  'en',
  '{"زہر","حفاظت","ماسک","pesticide","safety","urdu","ایمرجنسی"}'
)
ON CONFLICT (id) DO UPDATE SET
  crop_id = EXCLUDED.crop_id,
  disease_id = EXCLUDED.disease_id,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  content_ur = EXCLUDED.content_ur,
  source = EXCLUDED.source,
  source_url = EXCLUDED.source_url,
  language = EXCLUDED.language,
  tags = EXCLUDED.tags,
  updated_at = now();

