import { supabase } from './supabase';

// Offline fallback data directly sourced from agricultural seed data
export const FALLBACK_CROPS = [
  { id: 'wheat', name: 'Wheat', name_ur: 'گندم', name_pa: 'کنک', emoji: '🌾', sort_order: 1 },
  { id: 'rice', name: 'Rice', name_ur: 'چاول', name_pa: 'چاول', emoji: '🌾', sort_order: 2 },
  { id: 'cotton', name: 'Cotton', name_ur: 'کپاس', name_pa: 'کپاس', emoji: '🌿', sort_order: 3 },
  { id: 'sugarcane', name: 'Sugarcane', name_ur: 'گنا', name_pa: 'گنا', emoji: '🎋', sort_order: 4 },
  { id: 'maize', name: 'Maize', name_ur: 'مکئی', name_pa: 'مکئی', emoji: '🌽', sort_order: 5 },
  { id: 'potato', name: 'Potato', name_ur: 'آلو', name_pa: 'آلو', emoji: '🥔', sort_order: 6 },
  { id: 'tomato', name: 'Tomato', name_ur: 'ٹماٹر', name_pa: 'ٹماٹر', emoji: '🍅', sort_order: 7 },
  { id: 'onion', name: 'Onion', name_ur: 'پیاز', name_pa: 'پیاز', emoji: '🧅', sort_order: 8 },
  { id: 'chili', name: 'Chili', name_ur: 'مرچ', name_pa: 'مرچ', emoji: '🌶️', sort_order: 9 }
];

export const FALLBACK_DISTRICTS = [
  { id: 'faisalabad', name: 'Faisalabad', name_ur: 'فیصل آباد', latitude: 31.4504, longitude: 73.1350, sort_order: 1 },
  { id: 'bahawalpur', name: 'Bahawalpur', name_ur: 'بہاولپور', latitude: 29.3544, longitude: 71.6911, sort_order: 2 },
  { id: 'multan', name: 'Multan', name_ur: 'ملتان', latitude: 30.1575, longitude: 71.5249, sort_order: 3 },
  { id: 'sargodha', name: 'Sargodha', name_ur: 'سرگودھا', latitude: 32.0836, longitude: 72.6711, sort_order: 4 },
  { id: 'hyderabad', name: 'Hyderabad', name_ur: 'حیدرآباد', latitude: 25.3960, longitude: 68.3578, sort_order: 5 }
];

export const FALLBACK_SOIL_TYPES = [
  { id: 'sandy', name: 'Sandy', name_ur: 'ریتیلی', sort_order: 1 },
  { id: 'loamy', name: 'Loamy', name_ur: 'میرا (لوامی)', sort_order: 2 },
  { id: 'clay', name: 'Clay', name_ur: 'چکنی مٹی', sort_order: 3 }
];

export const FALLBACK_PRODUCTS = [
  {
    id: 'syngenta_amistar_top',
    name: 'Amistar Top',
    company: 'Syngenta Pakistan',
    product_type: 'Fungicide',
    active_ingredient: 'Azoxystrobin 200g/L + Difenoconazole 125g/L',
    target_diseases: ['Yellow Rust', 'Leaf Rust', 'Rice Blast'],
    target_crops: ['Wheat', 'Rice'],
    official_url: 'https://www.syngenta.com.pk/product/crop-protection/amistar-top-02',
    description: 'A systemic broad-spectrum fungicide with preventative and curative activity against rusts and blast.'
  },
  {
    id: 'syngenta_tilt',
    name: 'Tilt 250 EC',
    company: 'Syngenta Pakistan',
    product_type: 'Fungicide',
    active_ingredient: 'Propiconazole 250 g/L EC',
    target_diseases: ['Northern Leaf Blight', 'Northern Corn Leaf Blight', 'Sugarcane Red Rot', 'Sugarcane Smut', 'Leaf Rust', 'Yellow Rust', 'Powdery Mildew', 'Common Rust', 'Sheath Blight'],
    target_crops: ['Maize', 'Wheat', 'Rice', 'Sugarcane'],
    official_url: 'https://www.syngenta.com.pk/product/crop-protection/tilt-250-ec-01',
    description: 'Broad-spectrum systemic triazole fungicide.'
  },
  {
    id: 'syngenta_score',
    name: 'Score 250 EC',
    company: 'Syngenta Pakistan',
    product_type: 'Fungicide',
    active_ingredient: 'Difenoconazole 250 g/L EC',
    target_diseases: ['Early Blight', 'Brown Spot', 'Purple Blotch', 'Anthracnose', 'Rice Blast'],
    target_crops: ['Tomato', 'Potato', 'Rice', 'Onion', 'Chili'],
    official_url: 'https://www.syngenta.com.pk/product/crop-protection/score-250-ec-01',
    description: 'Systemic specialist fungicide against Alternaria early blight and leaf spot.'
  },
  {
    id: 'syngenta_ridomil_gold',
    name: 'Ridomil Gold',
    company: 'Syngenta Pakistan',
    product_type: 'Fungicide',
    active_ingredient: 'Metalaxyl-M 4% + Mancozeb 64% WP',
    target_diseases: ['Late Blight', 'Downy Mildew'],
    target_crops: ['Potato', 'Tomato', 'Onion'],
    official_url: 'https://www.syngenta.com.pk/product/crop-protection/fungicides',
    description: 'Dual protective and curative suppression of oomycetes.'
  },
  {
    id: 'syngenta_revus',
    name: 'Revus 250 SC',
    company: 'Syngenta Pakistan',
    product_type: 'Fungicide',
    active_ingredient: 'Mandipropamid 250 g/L SC',
    target_diseases: ['Late Blight', 'Downy Mildew'],
    target_crops: ['Potato', 'Tomato'],
    official_url: 'https://www.syngenta.com.pk/product/crop-protection/fungicides',
    description: 'Specialist anti-oomycete fungicide with superior rainfastness.'
  },
  {
    id: 'fmc_cabrio_top',
    name: 'Cabrio Top',
    company: 'FMC Pakistan',
    product_type: 'Fungicide',
    active_ingredient: 'Pyraclostrobin 5% + Metiram 55%',
    target_diseases: ['Early Blight', 'Late Blight', 'Anthracnose', 'Purple Blotch'],
    target_crops: ['Tomato', 'Potato', 'Chili', 'Onion'],
    official_url: 'https://ag.fmc.com/pk/en/products/fungicides/cabrio-top',
    description: 'Superior protective and curative control against early blight, late blight, and anthracnose.'
  },
  {
    id: 'fmc_cuprocaffaro',
    name: 'Cuprocaffaro 50 WP',
    company: 'FMC Pakistan',
    product_type: 'Bactericide / Fungicide',
    active_ingredient: 'Copper Oxychloride 50% WP',
    target_diseases: ['Cotton Bacterial Blight', 'Bacterial Leaf Blight', 'Pokkah Boeng', 'Citrus Canker'],
    target_crops: ['Cotton', 'Rice', 'Sugarcane', 'Citrus', 'Tomato'],
    official_url: 'https://ag.fmc.com/pk/en/products/fungicides',
    description: 'Protective contact copper bactericide and fungicide.'
  },
  {
    id: 'fmc_coragen',
    name: 'Coragen 200 SC',
    company: 'FMC Pakistan',
    product_type: 'Insecticide',
    active_ingredient: 'Chlorantraniliprole 200 g/L SC',
    target_diseases: ['Fall Armyworm', 'Fruit Borer', 'Tomato Leaf Miner', 'Pink Bollworm', 'Stem Borer'],
    target_crops: ['Maize', 'Cotton', 'Tomato', 'Sugarcane', 'Rice'],
    official_url: 'https://ag.fmc.com/pk/en/products/insecticides/coragen',
    description: 'Broad-spectrum diamide insecticide against caterpillars, armyworms, and borers.'
  },
  {
    id: 'syngenta_polo',
    name: 'Polo 500 SC',
    company: 'Syngenta Pakistan',
    product_type: 'Insecticide',
    active_ingredient: 'Diafenthiuron 500 g/L SC',
    target_diseases: ['Cotton Leaf Curl Virus', 'Whitefly', 'Mites', 'Jassids'],
    target_crops: ['Cotton', 'Tomato', 'Chili'],
    official_url: 'https://www.syngenta.com.pk/product/crop-protection/polo-500-sc-01',
    description: 'Targeted insecticide for whitefly vector control in cotton.'
  },
  {
    id: 'fmc_talstar',
    name: 'Talstar 10 EC',
    company: 'FMC Pakistan',
    product_type: 'Insecticide',
    active_ingredient: 'Bifenthrin 10% EC',
    target_diseases: ['Cotton Leaf Curl Virus', 'Whitefly', 'Pink Bollworm', 'Wheat Aphid', 'Yellow Leaf Disease'],
    target_crops: ['Cotton', 'Wheat', 'Sugarcane', 'Rice'],
    official_url: 'https://ag.fmc.com/pk/en/products/insecticides/talstar',
    description: 'Broad-spectrum pyrethroid insecticide and miticide.'
  },
  {
    id: 'syngenta_virtako',
    name: 'Virtako 40 WG',
    company: 'Syngenta Pakistan',
    product_type: 'Insecticide',
    active_ingredient: 'Chlorantraniliprole 20% + Thiamethoxam 20% WG',
    target_diseases: ['Stem Borer', 'Leaf Folder', 'Top Borer'],
    target_crops: ['Rice', 'Sugarcane'],
    official_url: 'https://www.syngenta.com.pk/product/crop-protection/insecticides',
    description: 'Dual systemic insecticide for borers and sucking pests.'
  },
  {
    id: 'fmc_ferterra',
    name: 'Ferterra 0.4 GR',
    company: 'FMC Pakistan',
    product_type: 'Insecticide',
    active_ingredient: 'Chlorantraniliprole 0.4% GR',
    target_diseases: ['Stem Borer', 'Top Borer', 'Shoot Borer'],
    target_crops: ['Sugarcane', 'Rice'],
    official_url: 'https://ag.fmc.com/pk/en/products/insecticides/ferterra',
    description: 'Systemic granular insecticide for root protection against borers.'
  },
  {
    id: 'syngenta_actara',
    name: 'Actara 25 WG',
    company: 'Syngenta Pakistan',
    product_type: 'Insecticide',
    active_ingredient: 'Thiamethoxam 25% WG',
    target_diseases: ['Whitefly', 'Cotton Leaf Curl Virus', 'Aphids', 'Wheat Aphid', 'Jassids', 'Yellow Leaf Disease'],
    target_crops: ['Cotton', 'Wheat', 'Rice', 'Sugarcane', 'Tomato'],
    official_url: 'https://www.syngenta.com.pk/product/crop-protection/insecticides',
    description: 'Systemic neonicotinoid targeting sucking vectors.'
  },
  {
    id: 'syngenta_match',
    name: 'Match 050 EC',
    company: 'Syngenta Pakistan',
    product_type: 'Insecticide',
    active_ingredient: 'Lufenuron 50 EC',
    target_diseases: ['Fall Armyworm', 'Armyworm', 'Helicoverpa', 'Fruit Borer', 'Pink Bollworm'],
    target_crops: ['Cotton', 'Maize', 'Tomato'],
    official_url: 'https://www.syngenta.com.pk/product/match',
    description: 'Insect growth regulator inhibiting larval damage.'
  },
  {
    id: 'fmc_steward',
    name: 'Steward 150 SC',
    company: 'FMC Pakistan',
    product_type: 'Insecticide',
    active_ingredient: 'Indoxacarb 150 SC',
    target_diseases: ['Fall Armyworm', 'Armyworm', 'Fruit Borer', 'Pink Bollworm'],
    target_crops: ['Cotton', 'Maize', 'Tomato'],
    official_url: 'https://ag.fmc.com/pk/en/products/insecticides/steward',
    description: 'Broad-spectrum larvicide with contact and stomach action.'
  }
];

export const FALLBACK_DISEASES = [
  {
    id: 'wheat_leaf_rust',
    crop_id: 'wheat',
    crop: 'Wheat',
    disease_name: 'Leaf Rust',
    confidence: 94,
    severity: 'Moderate',
    description: 'A fungal disease caused by Puccinia triticina, resulting in small orange-brown pustules on leaves.',
    symptoms: [
      'Small, round orange-brown pustules on leaf blades.',
      'Pustules rub off on fingers, leaving a dusty rust-colored residue.',
      'Premature leaf drying and shriveling.'
    ],
    causes: [
      'Fungus Puccinia triticina.',
      'Mild temperatures (15-22°C) combined with high moisture or dew.',
      'Wind-blown spores traveling long distances.'
    ],
    recommended_actions: [
      'Apply systemic triazole fungicide (Amistar Top or Tilt 250 EC) immediately.',
      'Ensure balanced nitrogen levels to avoid overly dense foliage.',
      'Sanitize agricultural tools before working in neighboring fields.'
    ],
    prevention: [
      'Cultivate rust-resistant wheat cultivars.',
      'Adjust sowing dates to avoid peak rust periods.',
      'Manage nitrogen fertilization.'
    ],
    best_practices: [
      'Destroy volunteer green plants that serve as host bridges.',
      'Perform field monitoring during the boot and heading stages.'
    ],
    recommendedProducts: [
      { name: 'Amistar Top', company: 'Syngenta Pakistan', activeIngredient: 'Azoxystrobin 200g/L + Difenoconazole 125g/L', url: 'https://www.syngenta.com.pk/product/crop-protection/amistar-top-02' },
      { name: 'Tilt 250 EC', company: 'Syngenta Pakistan', activeIngredient: 'Propiconazole 250 g/L EC', url: 'https://www.syngenta.com.pk/product/crop-protection/tilt-250-ec-01' }
    ]
  },
  {
    id: 'wheat_loose_smut',
    crop_id: 'wheat',
    crop: 'Wheat',
    disease_name: 'Loose Smut',
    confidence: 93,
    severity: 'Moderate',
    description: 'A seed-borne fungal disease caused by Ustilago tritici transforming wheat ears into black powdery masses.',
    symptoms: [
      'Ears emerge as black powdery masses of spores.',
      'Spore masses blow away leaving only the bare central stem (rachis).',
      'Infected plants appear slightly taller and mature earlier.'
    ],
    causes: [
      'Fungus Ustilago tritici.',
      'Internally infected seed from prior crop season.',
      'Cool, humid weather during the heading and flowering stage.'
    ],
    recommended_actions: [
      'Treat seed prior to sowing with Dividend Star 036 FS.',
      'Carefully rogue out and destroy infected heads in paper bags before spore dispersal.',
      'Use certified disease-free seed.'
    ],
    prevention: [
      'Plant certified, fungicide-treated seed.',
      'Do not keep seed from fields showing smut infection.',
      'Implement crop rotation.'
    ],
    best_practices: [
      'Treat wheat seed with systemic seed treatment slurry before sowing.',
      'Regular scouting during ear emergence.'
    ],
    recommendedProducts: [
      { name: 'Dividend Star 036 FS', company: 'Syngenta Pakistan', activeIngredient: 'Difenoconazole 30 g/L + Cyproconazole 6.25 g/L FS', url: 'https://www.syngenta.com.pk/product/crop-protection/seed-care' }
    ]
  },
  {
    id: 'tomato_early_blight',
    crop_id: 'tomato',
    crop: 'Tomato',
    disease_name: 'Early Blight',
    confidence: 92,
    severity: 'Moderate',
    description: 'Fungal infection by Alternaria solani causing target-like concentric leaf spots on tomatoes.',
    symptoms: [
      'Concentric target-board rings on older foliage.',
      'Yellowing surrounding leaf spot margins.',
      'Premature leaf loss starting from bottom foliage.'
    ],
    causes: [
      'Fungus Alternaria solani.',
      'Warm, humid weather and frequent dew.',
      'Spores overwintering in soil or debris.'
    ],
    recommended_actions: [
      'Prune lower branches to improve air circulation.',
      'Apply protective or systemic fungicides (Score 250 EC or Cabrio Top).',
      'Remove and safely discard heavily infected crop foliage.'
    ],
    prevention: [
      'Plant disease-resistant tomato cultivars.',
      'Apply mulch to prevent soil splashing onto foliage.',
      'Rotate crops every 2-3 years.'
    ],
    best_practices: [
      'Prune the lower 12 inches of foliage to prevent soil contact.',
      'Water at base using drip lines to keep leaves dry.'
    ],
    recommendedProducts: [
      { name: 'Score 250 EC', company: 'Syngenta Pakistan', activeIngredient: 'Difenoconazole 250 g/L EC', url: 'https://www.syngenta.com.pk/product/crop-protection/score-250-ec-01' },
      { name: 'Cabrio Top', company: 'FMC Pakistan', activeIngredient: 'Pyraclostrobin 5% + Metiram 55%', url: 'https://ag.fmc.com/pk/en/products/fungicides/cabrio-top' }
    ]
  },
  {
    id: 'tomato_late_blight',
    crop_id: 'tomato',
    crop: 'Tomato',
    disease_name: 'Late Blight',
    confidence: 96,
    severity: 'High',
    description: 'A highly destructive disease caused by Phytophthora infestans, causing rapid leaf wilting and fruit rot.',
    symptoms: [
      'Large, irregular water-soaked lesions on leaves and stems.',
      'Fuzzy white mold on leaf undersides in wet conditions.',
      'Firm, brown leathery lesions on green and ripe tomato fruit.'
    ],
    causes: [
      'Water mold Phytophthora infestans.',
      'Cool, wet, and humid conditions.',
      'Wind-blown spores from infected potatoes or tomatoes.'
    ],
    recommended_actions: [
      'Apply systemic fungicide (Ridomil Gold or Revus 250 SC) immediately.',
      'Remove and destroy infected plants.',
      'Avoid overhead watering.'
    ],
    prevention: [
      'Plant resistant tomato cultivars.',
      'Destroy volunteer plants and cull piles.',
      'Keep foliage dry and space plants adequately.'
    ],
    best_practices: [
      'Remove and destroy infected plants immediately.',
      'Avoid overhead watering.'
    ],
    recommendedProducts: [
      { name: 'Ridomil Gold', company: 'Syngenta Pakistan', activeIngredient: 'Metalaxyl-M 4% + Mancozeb 64% WP', url: 'https://www.syngenta.com.pk/product/crop-protection/fungicides' },
      { name: 'Revus 250 SC', company: 'Syngenta Pakistan', activeIngredient: 'Mandipropamid 250 g/L SC', url: 'https://www.syngenta.com.pk/product/crop-protection/fungicides' }
    ]
  },
  {
    id: 'potato_late_blight',
    crop_id: 'potato',
    crop: 'Potato',
    disease_name: 'Late Blight',
    confidence: 95,
    severity: 'High',
    description: 'A devastating oomycete infection caused by Phytophthora infestans causing foliar collapse and tuber rot.',
    symptoms: [
      'Dark water-soaked lesions on leaves rapidly turning purplish-brown.',
      'White fungal sporulation on lesion undersides in cool, foggy weather.',
      'Dry brown granular rot beneath tuber skins.'
    ],
    causes: [
      'Phytophthora infestans.',
      'Prolonged high humidity (>90%) with cool temperatures (15-20°C).',
      'Infected seed tubers or volunteer potato cull piles.'
    ],
    recommended_actions: [
      'Spray Ridomil Gold MZ 68 WG or Revus 250 SC preventatively.',
      'Cease irrigation immediately during high disease risk periods.',
      'Burn or dispose of haulms before harvest to prevent tuber contamination.'
    ],
    prevention: [
      'Plant certified certified disease-free seed tubers.',
      'Hill up potato rows deeply to protect tubers from spore wash-down.',
      'Maintain regular preventative fungicide schedule in winter.'
    ],
    best_practices: [
      'Scout low-lying or damp field corners daily.',
      'Respect Pre-Harvest Interval (PHI) before digging tubers.'
    ],
    recommendedProducts: [
      { name: 'Ridomil Gold', company: 'Syngenta Pakistan', activeIngredient: 'Metalaxyl-M 4% + Mancozeb 64% WP', url: 'https://www.syngenta.com.pk/product/crop-protection/fungicides' },
      { name: 'Revus 250 SC', company: 'Syngenta Pakistan', activeIngredient: 'Mandipropamid 250 g/L SC', url: 'https://www.syngenta.com.pk/product/crop-protection/fungicides' }
    ]
  },
  {
    id: 'potato_early_blight',
    crop_id: 'potato',
    crop: 'Potato',
    disease_name: 'Early Blight',
    confidence: 91,
    severity: 'Moderate',
    description: 'Target-spot leaf disease caused by Alternaria solani affecting senescing lower potato leaves.',
    symptoms: [
      'Brown, angular to circular spots with concentric target rings.',
      'Yellow chlorotic halos surrounding lesions.',
      'Premature defoliation of lower canopy.'
    ],
    causes: [
      'Alternaria solani fungus.',
      'Alternating wet and dry weather cycles with plant stress.',
      'Crop residue in soil.'
    ],
    recommended_actions: [
      'Apply Score 250 EC or Cabrio Top.',
      'Maintain adequate potassium and nitrogen nutrition.',
      'Irrigate regularly to prevent water stress.'
    ],
    prevention: [
      'Rotate crops with non-solanaceous crops.',
      'Ensure balanced soil fertilization.'
    ],
    best_practices: [
      'Avoid sprinkler irrigation in the late afternoon.',
      'Spray early at first sight of lower leaf target spots.'
    ],
    recommendedProducts: [
      { name: 'Score 250 EC', company: 'Syngenta Pakistan', activeIngredient: 'Difenoconazole 250 g/L EC', url: 'https://www.syngenta.com.pk/product/crop-protection/score-250-ec-01' },
      { name: 'Cabrio Top', company: 'FMC Pakistan', activeIngredient: 'Pyraclostrobin 5% + Metiram 55%', url: 'https://ag.fmc.com/pk/en/products/fungicides/cabrio-top' }
    ]
  },
  {
    id: 'cotton_leaf_curl_virus',
    crop_id: 'cotton',
    crop: 'Cotton',
    disease_name: 'Cotton Leaf Curl Virus',
    confidence: 91,
    severity: 'High',
    description: 'A viral disease transmitted by whiteflies, causing leaf crinkling and stunt growth.',
    symptoms: [
      'Upward or downward curling of leaf margins.',
      'Thickening of leaf veins.',
      'Enation (leaf-like growth) on the underside of leaves.'
    ],
    causes: [
      'Cotton leaf curl geminivirus.',
      'Vector transmission by whiteflies.',
      'Presence of weed hosts.'
    ],
    recommended_actions: [
      'Control whitefly population with Polo 500 SC, Talstar 10 EC, or Actara 25 WG.',
      'Uproot and destroy severely infected plants.',
      'Apply neem-based sprays.'
    ],
    prevention: [
      'Plant CLCuV-resistant cotton varieties.',
      'Implement effective weed management.',
      'Avoid planting cotton near alternative host plants.'
    ],
    best_practices: [
      'Monitor whitefly populations regularly.',
      'Apply insecticides targeted at whitefly vectors.'
    ],
    recommendedProducts: [
      { name: 'Polo 500 SC', company: 'Syngenta Pakistan', activeIngredient: 'Diafenthiuron 500 g/L SC', url: 'https://www.syngenta.com.pk/product/crop-protection/polo-500-sc-01' },
      { name: 'Talstar 10 EC', company: 'FMC Pakistan', activeIngredient: 'Bifenthrin 10% EC', url: 'https://ag.fmc.com/pk/en/products/insecticides/talstar' }
    ]
  },
  {
    id: 'cotton_bacterial_blight',
    crop_id: 'cotton',
    crop: 'Cotton',
    disease_name: 'Cotton Bacterial Blight',
    confidence: 92,
    severity: 'Moderate',
    description: 'Bacterial pathogen Xanthomonas citri causing angular leaf lesions, blackarm stem cankers, and boll rot.',
    symptoms: [
      'Angular water-soaked leaf spots bounded strictly by minor veins.',
      'Lesions progressively turning dark brown to black.',
      'Black elongated cankers along leaf petioles and stems (blackarm phase).'
    ],
    causes: [
      'Bacterium Xanthomonas citri pv. malvacearum.',
      'Warm temperatures (28-34°C) with driving rain or high humidity.',
      'Infected un-delinted seed.'
    ],
    recommended_actions: [
      'Spray Cuprocaffaro 50 WP (Copper Oxychloride) to halt bacterial spread.',
      'Use acid-delinted certified seeds.',
      'Avoid overhead high-pressure watering.'
    ],
    prevention: [
      'Grow resistant cotton varieties (FH-142, BS-15).',
      'Deep plow crop stubble after picking.'
    ],
    best_practices: [
      'Maintain rigorous field sanitation and rogue infected seedlings.',
      'Rotate crops with non-host cereals.'
    ],
    recommendedProducts: [
      { name: 'Cuprocaffaro 50 WP', company: 'FMC Pakistan', activeIngredient: 'Copper Oxychloride 50% WP', url: 'https://ag.fmc.com/pk/en/products/fungicides' },
      { name: 'Talstar 10 EC', company: 'FMC Pakistan', activeIngredient: 'Bifenthrin 10% EC', url: 'https://ag.fmc.com/pk/en/products/insecticides/talstar' }
    ]
  },
  {
    id: 'rice_blast',
    crop_id: 'rice',
    crop: 'Rice',
    disease_name: 'Rice Blast',
    confidence: 95,
    severity: 'High',
    description: 'A devastating fungal disease caused by Magnaporthe oryzae, affecting leaves, nodes, and panicles.',
    symptoms: [
      'Spindle-shaped lesions on leaves with gray centers and brown borders.',
      'Rotting of nodes, causing stems to break.',
      'Neck rot where base of panicle rots.'
    ],
    causes: [
      'Fungus Magnaporthe oryzae.',
      'High relative humidity (>85%) and cool night temperatures.',
      'Excessive nitrogen application.'
    ],
    recommended_actions: [
      'Apply systemic fungicide (Score 250 EC or Amistar Top) immediately.',
      'Split nitrogen fertilizer applications.',
      'Maintain shallow standing water.'
    ],
    prevention: [
      'Plant blast-resistant rice cultivars.',
      'Avoid excessive nitrogen fertilization.',
      'Maintain appropriate water depth.'
    ],
    best_practices: [
      'Avoid overhead irrigation.',
      'Destroy infected straw and stubble after harvest.'
    ],
    recommendedProducts: [
      { name: 'Score 250 EC', company: 'Syngenta Pakistan', activeIngredient: 'Difenoconazole 250 g/L EC', url: 'https://www.syngenta.com.pk/product/crop-protection/score-250-ec-01' },
      { name: 'Amistar Top', company: 'Syngenta Pakistan', activeIngredient: 'Azoxystrobin 200g/L + Difenoconazole 125g/L', url: 'https://www.syngenta.com.pk/product/crop-protection/amistar-top-02' }
    ]
  },
  {
    id: 'rice_stem_borer',
    crop_id: 'rice',
    crop: 'Rice',
    disease_name: 'Rice Stem Borer',
    confidence: 94,
    severity: 'High',
    description: 'Lepidopteran larvae boring into stems causing deadhearts in tillering stage and whiteheads at heading.',
    symptoms: [
      'Dead central shoot (deadheart) that easily pulls out.',
      'Erect, bleached white panicles (whiteheads) with no grain filling.',
      'Larval boreholes and frass near lower stem nodes.'
    ],
    causes: [
      'Scirpophaga incertulas / Chilo suppressalis larvae.',
      'Dense planting and high nitrogen fertilization.',
      'Stubble left in fields from previous season.'
    ],
    recommended_actions: [
      'Broadcast Ferterra 0.4 GR at early tillering.',
      'Apply Virtako 40 WG or Coragen 200 SC at first moth emergence.',
      'Clip seedling leaf tips before transplanting to remove egg masses.'
    ],
    prevention: [
      'Plow down stubble immediately after harvest.',
      'Avoid excessive nitrogen fertilizer.'
    ],
    best_practices: [
      'Monitor with light traps and pheromone lures.',
      'Apply granular insecticides into standing water.'
    ],
    recommendedProducts: [
      { name: 'Virtako 40 WG', company: 'Syngenta Pakistan', activeIngredient: 'Chlorantraniliprole 20% + Thiamethoxam 20% WG', url: 'https://www.syngenta.com.pk/product/crop-protection/insecticides' },
      { name: 'Ferterra 0.4 GR', company: 'FMC Pakistan', activeIngredient: 'Chlorantraniliprole 0.4% GR', url: 'https://ag.fmc.com/pk/en/products/insecticides/ferterra' }
    ]
  },
  {
    id: 'maize_fall_armyworm',
    crop_id: 'maize',
    crop: 'Maize',
    disease_name: 'Fall Armyworm',
    confidence: 96,
    severity: 'High',
    description: 'Invasive pest Spodoptera frugiperda feeding voraciously inside maize whorls causing severe defoliation.',
    symptoms: [
      'Ragged, windowpaned feeding holes on whorl leaves.',
      'Abundant sawdust-like larval frass accumulating inside plant whorls.',
      'Larvae with dark heads and inverted Y shape visible inside central leaf rolls.'
    ],
    causes: [
      'Spodoptera frugiperda caterpillar infestation.',
      'Warm, humid weather favoring rapid generational turnover.',
      'Continuous maize planting in adjacent tracts.'
    ],
    recommended_actions: [
      'Spray Coragen 200 SC or Match 050 EC directly into the central plant whorl.',
      'Apply Steward 150 SC in rotation for resistance management.',
      'Hand-pick and crush caterpillars in early morning scouting.'
    ],
    prevention: [
      'Early uniform sowing to avoid peak adult moth flights.',
      'Intercrop with legumes or desmodium to deter egg laying.'
    ],
    best_practices: [
      'Ensure spray nozzle points directly into whorls rather than broad flat foliage.',
      'Apply early in the morning or near sunset.'
    ],
    recommendedProducts: [
      { name: 'Coragen 200 SC', company: 'FMC Pakistan', activeIngredient: 'Chlorantraniliprole 200 g/L SC', url: 'https://ag.fmc.com/pk/en/products/insecticides/coragen' },
      { name: 'Match 050 EC', company: 'Syngenta Pakistan', activeIngredient: 'Lufenuron 50 g/L EC', url: 'https://www.syngenta.com.pk/product/match' }
    ]
  },
  {
    id: 'maize_northern_leaf_blight',
    crop_id: 'maize',
    crop: 'Maize',
    disease_name: 'Northern Leaf Blight',
    confidence: 93,
    severity: 'Moderate',
    description: 'Fungal disease caused by Exserohilum turcicum producing long elliptical tan lesions.',
    symptoms: [
      'Large, long elliptical grayish-green to tan lesions (cigar-shaped).',
      'Lesions coalesce causing complete burning and drying of leaf blades.',
      'Dark olive fungal spores visible on lesions during damp mornings.'
    ],
    causes: [
      'Fungus Exserohilum turcicum.',
      'Moderate temperatures (18-27°C) and persistent dew or leaf wetness.',
      'Infected corn debris on soil surface.'
    ],
    recommended_actions: [
      'Apply Tilt 250 EC (Propiconazole) at first sign of lower leaf lesions.',
      'Ensure balanced soil nutrition with adequate potash.',
      'Plow under residue after harvest.'
    ],
    prevention: [
      'Plant resistant maize hybrids.',
      'Rotate fields out of corn for at least 1-2 years.'
    ],
    best_practices: [
      'Scout lower leaves before tasseling stage.',
      'Avoid overhead irrigation that extends leaf wetness periods.'
    ],
    recommendedProducts: [
      { name: 'Tilt 250 EC', company: 'Syngenta Pakistan', activeIngredient: 'Propiconazole 250 g/L EC', url: 'https://www.syngenta.com.pk/product/crop-protection/tilt-250-ec-01' }
    ]
  },
  {
    id: 'sugarcane_stem_borer',
    crop_id: 'sugarcane',
    crop: 'Sugarcane',
    disease_name: 'Sugarcane Stem Borer',
    confidence: 94,
    severity: 'High',
    description: 'Chilo infuscatellus larvae tunneling through internodes causing deadhearts, sugar loss, and cane breakage.',
    symptoms: [
      'Dead dry heart in young tillers that pulls out easily with foul odor.',
      'Entry holes in cane internodes surrounded by red stains and frass.',
      'Stunted shoots with bunchy tops.'
    ],
    causes: [
      'Shoot and stem borer moth larvae.',
      'Dry weather with hot summer temperatures during early shoot growth.',
      'Ratoon crops harboring overwintering larvae.'
    ],
    recommended_actions: [
      'Broadcast Ferterra 0.4 GR at 4 kg/acre with irrigation.',
      'Apply Virtako 40 WG or Coragen 200 SC at borer emergence.',
      'Release Trichogramma egg parasitoid cards.'
    ],
    prevention: [
      'Earth up cane rows at 45-60 days to bury shoot borer entry points.',
      'Burn dry trash and avoid water stagnation.'
    ],
    best_practices: [
      'Regular scouting at early tillering.',
      'Use certified pest-free seed cane.'
    ],
    recommendedProducts: [
      { name: 'Ferterra 0.4 GR', company: 'FMC Pakistan', activeIngredient: 'Chlorantraniliprole 0.4% GR', url: 'https://ag.fmc.com/pk/en/products/insecticides/ferterra' },
      { name: 'Virtako 40 WG', company: 'Syngenta Pakistan', activeIngredient: 'Chlorantraniliprole 20% + Thiamethoxam 20% WG', url: 'https://www.syngenta.com.pk/product/crop-protection/insecticides' }
    ]
  },
  {
    id: 'sugarcane_red_rot',
    crop_id: 'sugarcane',
    crop: 'Sugarcane',
    disease_name: 'Red Rot',
    confidence: 95,
    severity: 'High',
    description: 'Devastating fungal disease Colletotrichum falcatum causing internal cane reddening and alcoholic odor.',
    symptoms: [
      'Third and fourth leaves show yellowing, withering, and drooping.',
      'Longitudinal split reveals red internal stalk tissue with transverse white patches.',
      'Alcoholic or sour fermenting odor from split stalks.'
    ],
    causes: [
      'Fungus Colletotrichum falcatum.',
      'Infected seed setts.',
      'Waterlogged soil and poorly drained heavy clays.'
    ],
    recommended_actions: [
      'Dip seed setts in Tilt 250 EC solution before planting.',
      'Uproot and burn infected stools immediately; do not keep ratoon.',
      'Provide rapid drainage to eliminate waterlogging.'
    ],
    prevention: [
      'Plant red rot resistant varieties (CPF-249, CP-77/400).',
      'Select seed cane only from inspected, certified disease-free nurseries.'
    ],
    best_practices: [
      'Rotate affected fields with rice or wheat for 2 seasons.',
      'Disinfect harvesting knives with formalin or heat.'
    ],
    recommendedProducts: [
      { name: 'Tilt 250 EC', company: 'Syngenta Pakistan', activeIngredient: 'Propiconazole 250 g/L EC', url: 'https://www.syngenta.com.pk/product/crop-protection/tilt-250-ec-01' }
    ]
  }
];

export const FALLBACK_DEMO_PROFILES = [
  {
    id: 'wheat-faisalabad',
    name: '🌾 Profile A: Faisalabad Wheat',
    name_ur: '🌾 گندم: فیصل آباد فارم',
    name_pa: '🌾 کنک: فیصل آباد فارم',
    cropType: 'Wheat',
    district: 'Faisalabad',
    soilType: 'Loamy',
    daysSinceSowing: 75,
    sowingDate: (() => { const d = new Date(); d.setDate(d.getDate() - 75); return d.toISOString().split('T')[0]; })(),
    lastIrrigatedDaysAgo: 4,
    description: 'Optimal sowing window, loamy soil. Yield potential is high.',
    description_ur: 'کاشت کا مناسب ترین وقت اور میرا مٹی۔ پیداوار کا بہترین امکان۔',
    description_pa: 'کاشت دا ٹھیک ویلا تے میرا مٹی۔ چنگی پیداوار دی امید اے۔'
  },
  {
    id: 'tomato-bahawalpur',
    name: '🍅 Profile B: Bahawalpur Tomato',
    name_ur: '🍅 ٹماٹر: بہاولپور فارم',
    name_pa: '🍅 ٹماٹر: بہاولپور فارم',
    cropType: 'Tomato',
    district: 'Bahawalpur',
    soilType: 'Clay',
    daysSinceSowing: 60,
    sowingDate: (() => { const d = new Date(); d.setDate(d.getDate() - 60); return d.toISOString().split('T')[0]; })(),
    lastIrrigatedDaysAgo: 7,
    description: 'Humid & cool weather triggering Late Blight Risk.',
    description_ur: 'نمی سے بھرا معتدل موسم جس کی وجہ سے جھلساؤ کا خطرہ زیادہ ہے۔',
    description_pa: 'نمی والا معتدل موسم جس دی وجہ توں جھلساؤ دا خطرہ زیادہ اے۔'
  },
  {
    id: 'cotton-multan',
    name: '🌿 Profile C: Multan Cotton',
    name_ur: '🌿 کپاس: ملتان فارم',
    name_pa: '🌿 کپاس: ملتان فارم',
    cropType: 'Cotton',
    district: 'Multan',
    soilType: 'Sandy',
    daysSinceSowing: 45,
    sowingDate: (() => { const d = new Date(); d.setDate(d.getDate() - 45); return d.toISOString().split('T')[0]; })(),
    lastIrrigatedDaysAgo: 3,
    description: 'Extreme dry heat, sandy soil. Requires frequent irrigation.',
    description_ur: 'شدید خشک گرمی اور ریتیلی مٹی۔ پانی کی فوری ضرورت۔',
    description_pa: 'شدید خشک گرمی تے ریتلی مٹی۔ پانی دی فوری لوڑ اے۔'
  }
];

export async function loadReferenceData() {
  try {
    const [cropsRes, distsRes, soilsRes, prodsRes, disRes, demoRes] = await Promise.allSettled([
      supabase.from('crops').select('*').order('sort_order', { ascending: true }),
      supabase.from('districts').select('*').order('sort_order', { ascending: true }),
      supabase.from('soil_types').select('*').order('sort_order', { ascending: true }),
      supabase.from('products').select('*'),
      supabase.from('diseases').select('*, crops(name)'),
      supabase.from('demo_profiles').select('*').order('sort_order', { ascending: true })
    ]);

    const crops = (cropsRes.status === 'fulfilled' && cropsRes.value.data?.length)
      ? cropsRes.value.data
      : FALLBACK_CROPS;

    const districts = (distsRes.status === 'fulfilled' && distsRes.value.data?.length)
      ? distsRes.value.data
      : FALLBACK_DISTRICTS;

    const soils = (soilsRes.status === 'fulfilled' && soilsRes.value.data?.length)
      ? soilsRes.value.data
      : FALLBACK_SOIL_TYPES;

    const products = (prodsRes.status === 'fulfilled' && prodsRes.value.data?.length)
      ? prodsRes.value.data
      : FALLBACK_PRODUCTS;

    const rawDiseases = (disRes.status === 'fulfilled' && disRes.value.data?.length)
      ? disRes.value.data
      : FALLBACK_DISEASES;

    const demoProfilesRaw = (demoRes.status === 'fulfilled' && demoRes.value.data?.length)
      ? demoRes.value.data
      : FALLBACK_DEMO_PROFILES;

    const cropNames = crops.map(c => c.name);
    const districtNames = districts.map(d => d.name);
    const soilNames = soils.map(s => s.name);

    const districtCoordinates = {};
    districts.forEach(d => {
      districtCoordinates[d.name] = {
        latitude: parseFloat(d.latitude),
        longitude: parseFloat(d.longitude)
      };
    });

    const demoProfiles = demoProfilesRaw.map(p => {
      const days = p.days_since_sowing || p.daysSinceSowing || 60;
      const sowingDate = p.sowingDate || (() => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().split('T')[0];
      })();

      return {
        id: p.id,
        name: p.name,
        name_ur: p.name_ur,
        name_pa: p.name_pa,
        cropType: p.crop_type || p.cropType,
        district: p.district,
        soilType: p.soil_type || p.soilType,
        daysSinceSowing: days,
        sowingDate,
        lastIrrigatedDaysAgo: p.last_irrigated_days_ago ?? p.lastIrrigatedDaysAgo ?? 3,
        description: p.description,
        description_ur: p.description_ur,
        description_pa: p.description_pa
      };
    });

    return {
      crops,
      cropNames,
      districts,
      districtNames,
      districtCoordinates,
      soils,
      soilNames,
      products,
      diseases: rawDiseases,
      demoProfiles
    };
  } catch (err) {
    console.warn('Error loading reference data from Supabase, using fallback:', err);
    return {
      crops: FALLBACK_CROPS,
      cropNames: FALLBACK_CROPS.map(c => c.name),
      districts: FALLBACK_DISTRICTS,
      districtNames: FALLBACK_DISTRICTS.map(d => d.name),
      districtCoordinates: {
        Faisalabad: { latitude: 31.4504, longitude: 73.1350 },
        Bahawalpur: { latitude: 29.3544, longitude: 71.6911 },
        Multan: { latitude: 30.1575, longitude: 71.5249 },
        Sargodha: { latitude: 32.0836, longitude: 72.6711 },
        Hyderabad: { latitude: 25.3960, longitude: 68.3578 }
      },
      soils: FALLBACK_SOIL_TYPES,
      soilNames: FALLBACK_SOIL_TYPES.map(s => s.name),
      products: FALLBACK_PRODUCTS,
      diseases: FALLBACK_DISEASES,
      demoProfiles: FALLBACK_DEMO_PROFILES
    };
  }
}

export function searchDiseaseByName(refData, cropName, diseaseName) {
  if (!diseaseName) return null;
  const diseases = refData?.diseases || FALLBACK_DISEASES;
  const qName = diseaseName.toLowerCase().trim();
  const qCrop = (cropName || '').toLowerCase().trim();

  const found = diseases.find(d => {
    const dName = (d.disease_name || d.disease || d.name || '').toLowerCase();
    const dCrop = (d.crops?.name || d.crop || d.crop_id || '').toLowerCase();
    const matchesCrop = !qCrop || dCrop.includes(qCrop) || qCrop.includes(dCrop);
    const matchesName = dName.includes(qName) || qName.includes(dName);
    return matchesCrop && matchesName;
  }) || diseases.find(d => {
    const dName = (d.disease_name || d.disease || d.name || '').toLowerCase();
    return dName.includes(qName) || qName.includes(dName);
  });

  if (!found) return null;

  return {
    disease: found.disease_name || found.disease || found.name,
    crop: found.crops?.name || found.crop || cropName,
    confidence: found.confidence || 90,
    severity: found.severity || 'Moderate',
    description: found.description || '',
    symptoms: found.symptoms || [],
    causes: found.causes || [],
    recommendedActions: found.recommended_actions || found.recommendedActions || [],
    prevention: found.prevention || [],
    bestPractices: found.best_practices || found.bestPractices || [],
    recommendedProducts: (found.recommendedProducts || (refData?.products || FALLBACK_PRODUCTS).filter(p => {
      const tgDis = Array.isArray(p.target_diseases) ? p.target_diseases : [];
      const tgCrops = Array.isArray(p.target_crops) ? p.target_crops : [];
      const matchesCrop = !qCrop || tgCrops.some(tc => tc.toLowerCase().includes(qCrop) || qCrop.includes(tc.toLowerCase()));
      const matchesDisease = tgDis.some(td => td.toLowerCase().includes(qName) || qName.includes(td.toLowerCase()));
      return matchesCrop && matchesDisease;
    }).map(p => ({
      name: p.name,
      company: p.company,
      activeIngredient: p.active_ingredient,
      url: p.official_url || p.officialUrl || p.url,
      officialUrl: p.official_url || p.officialUrl || p.url,
      officialProductUrl: p.official_url || p.officialUrl || p.url
    }))).filter(p => {
      const c = ((p.company || p.companyName || '') + ' ' + (p.url || p.official_url || p.officialUrl || '')).toLowerCase();
      return c.includes('syngenta') || c.includes('fmc');
    })

  };
}

export function getMockDiagnosis(refData, cropType = 'Wheat') {
  const diseases = refData?.diseases || FALLBACK_DISEASES;
  const crop = cropType.toLowerCase();

  const matching = diseases.find(d => {
    const dCrop = (d.crops?.name || d.crop || d.crop_id || '').toLowerCase();
    return dCrop.includes(crop) || crop.includes(dCrop);
  }) || diseases[0];

  return {
    crop: cropType,
    cropName: cropType,
    disease: matching?.disease_name || matching?.disease || 'Healthy Crop',
    confidence: matching?.confidence || 92,
    severity: matching?.severity || 'Moderate',
    description: matching?.description || 'No severe visible pathogens detected.',
    visibleSymptoms: matching?.symptoms || ['Minor leaf chlorosis'],
    likelyCauses: matching?.causes || ['Environmental fluctuation'],
    recommendedActions: matching?.recommended_actions || matching?.recommendedActions || ['Continue monitoring standard growth conditions.'],
    prevention: matching?.prevention || ['Regular scouting'],
    bestPractices: matching?.best_practices || matching?.bestPractices || ['Ensure balanced irrigation and fertilizer application.'],
    recommendedProducts: matching?.recommendedProducts || []
  };
}
