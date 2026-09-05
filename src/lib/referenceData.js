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
    target_diseases: ['Leaf Rust', 'Early Blight', 'Blast', 'Purple Blotch', 'Powdery Mildew'],
    target_crops: ['Wheat', 'Tomato', 'Potato', 'Rice', 'Onion', 'Chili'],
    official_url: 'https://www.syngenta.com.pk/product/amistar-top',
    description: 'A systemic broad-spectrum fungicide with preventative and curative activity.'
  },
  {
    id: 'syngenta_ridomil_gold',
    name: 'Ridomil Gold',
    company: 'Syngenta Pakistan',
    product_type: 'Fungicide',
    active_ingredient: 'Metalaxyl-M 4% + Mancozeb 64% WP',
    target_diseases: ['Late Blight', 'Downy Mildew'],
    target_crops: ['Potato', 'Tomato', 'Onion'],
    official_url: 'https://www.syngenta.com.pk/product/ridomil-gold-wg',
    description: 'Dual protective and curative suppression of oomycetes.'
  },
  {
    id: 'fmc_cabrio_top',
    name: 'Cabrio Top',
    company: 'FMC Pakistan',
    product_type: 'Fungicide',
    active_ingredient: 'Pyraclostrobin 5% + Metiram 55%',
    target_diseases: ['Early Blight', 'Late Blight', 'Anthracnose', 'Powdery Mildew'],
    target_crops: ['Tomato', 'Potato', 'Chili'],
    official_url: 'https://ag.fmc.com/pk/en/products/fungicides/cabrio-top',
    description: 'Superior protective and curative control against early blight, late blight, and powdery mildew.'
  },
  {
    id: 'bayer_nativo',
    name: 'Nativo 75 WG',
    company: 'Bayer Crop Science Pakistan',
    product_type: 'Fungicide',
    active_ingredient: 'Tebuconazole 50% + Trifloxystrobin 25%',
    target_diseases: ['Blast', 'Leaf Rust', 'Powdery Mildew', 'Purple Blotch', 'Late Blight'],
    target_crops: ['Rice', 'Wheat', 'Chili', 'Onion', 'Tomato'],
    official_url: 'https://www.cropscience.bayer.com.pk/en-pk/products/fungicides/nativo-75-wg.html',
    description: 'Dual-action protective and curative systemic fungicide.'
  },
  {
    id: 'bayer_infinito',
    name: 'Infinito',
    company: 'Bayer Crop Science Pakistan',
    product_type: 'Fungicide',
    active_ingredient: 'Fluopicolide + Propamocarb Hydrochloride',
    target_diseases: ['Late Blight', 'Downy Mildew'],
    target_crops: ['Potato', 'Tomato', 'Onion'],
    official_url: 'https://www.cropscience.bayer.com.pk/en-pk/products/fungicides/infinito.html',
    description: 'Translaminar mobility suppressing oomycete and blight growth.'
  },
  {
    id: 'suncrop_sun_cop',
    name: 'Sun-Cop',
    company: 'Suncrop Group',
    product_type: 'Fungicide',
    active_ingredient: 'Copper Oxychloride 50% WP',
    target_diseases: ['Bacterial Leaf Blight', 'Bacterial Blight', 'Anthracnose', 'Red Rot', 'Leaf Spot'],
    target_crops: ['Rice', 'Cotton', 'Chili', 'Sugarcane', 'Wheat'],
    official_url: 'https://www.suncropgroup.com/',
    description: 'Contact protective broad-spectrum fungicide and bactericide.'
  },
  {
    id: 'bayer_confidor',
    name: 'Confidor',
    company: 'Bayer Crop Science Pakistan',
    product_type: 'Insecticide',
    active_ingredient: 'Imidacloprid 200 SL',
    target_diseases: ['Cotton Leaf Curl Virus vector control (Whiteflies)', 'Thrips control', 'Aphids control'],
    target_crops: ['Cotton', 'Chili', 'Onion'],
    official_url: 'https://www.cropscience.bayer.com.pk/en-pk/products/insecticides/confidor-200-sl.html',
    description: 'Systemic insecticide targeting sucking pests.'
  },
  {
    id: 'fmc_steward',
    name: 'Steward',
    company: 'FMC Pakistan',
    product_type: 'Insecticide',
    active_ingredient: 'Indoxacarb 150 SC',
    target_diseases: ['Armyworm control', 'Bollworm control'],
    target_crops: ['Cotton', 'Maize'],
    official_url: 'https://ag.fmc.com/pk/en/products/insecticides/steward',
    description: 'Broad-spectrum larvicide with contact and stomach action.'
  },
  {
    id: 'syngenta_match',
    name: 'Match',
    company: 'Syngenta Pakistan',
    product_type: 'Insecticide',
    active_ingredient: 'Lufenuron 50 EC',
    target_diseases: ['Armyworm control', 'Helicoverpa control'],
    target_crops: ['Cotton', 'Maize', 'Tomato'],
    official_url: 'https://www.syngenta.com.pk/product/match-050-ec',
    description: 'Insect growth regulator inhibiting foliar damage.'
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
      'Apply systemic triazole fungicide (Amistar Top or Nativo 75 WG) immediately.',
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
      { name: 'Amistar Top', company: 'Syngenta Pakistan', activeIngredient: 'Azoxystrobin 200g/L + Difenoconazole 125g/L', url: 'https://www.syngenta.com.pk/product/amistar-top' },
      { name: 'Nativo 75 WG', company: 'Bayer Crop Science Pakistan', activeIngredient: 'Tebuconazole 50% + Trifloxystrobin 25%', url: 'https://www.cropscience.bayer.com.pk/en-pk/products/fungicides/nativo-75-wg.html' }
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
      'Apply protective or systemic fungicides (Cabrio Top or Amistar Top).',
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
      { name: 'Cabrio Top', company: 'FMC Pakistan', activeIngredient: 'Pyraclostrobin 5% + Metiram 55%', url: 'https://ag.fmc.com/pk/en/products/fungicides/cabrio-top' },
      { name: 'Amistar Top', company: 'Syngenta Pakistan', activeIngredient: 'Azoxystrobin 200g/L + Difenoconazole 125g/L', url: 'https://www.syngenta.com.pk/product/amistar-top' }
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
      'Apply systemic fungicide (Ridomil Gold or Infinito) immediately.',
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
      { name: 'Ridomil Gold', company: 'Syngenta Pakistan', activeIngredient: 'Metalaxyl-M 4% + Mancozeb 64% WP', url: 'https://www.syngenta.com.pk/product/ridomil-gold-wg' },
      { name: 'Infinito', company: 'Bayer Crop Science Pakistan', activeIngredient: 'Fluopicolide + Propamocarb Hydrochloride', url: 'https://www.cropscience.bayer.com.pk/en-pk/products/fungicides/infinito.html' }
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
      'Control whitefly population with Confidor.',
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
      { name: 'Confidor', company: 'Bayer Crop Science Pakistan', activeIngredient: 'Imidacloprid 200 SL', url: 'https://www.cropscience.bayer.com.pk/en-pk/products/insecticides/confidor-200-sl.html' }
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
      'Apply systemic fungicide (Nativo 75 WG or Amistar Top) immediately.',
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
      { name: 'Nativo 75 WG', company: 'Bayer Crop Science Pakistan', activeIngredient: 'Tebuconazole 50% + Trifloxystrobin 25%', url: 'https://www.cropscience.bayer.com.pk/en-pk/products/fungicides/nativo-75-wg.html' },
      { name: 'Amistar Top', company: 'Syngenta Pakistan', activeIngredient: 'Azoxystrobin 200g/L + Difenoconazole 125g/L', url: 'https://www.syngenta.com.pk/product/amistar-top' }
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
    recommendedProducts: found.recommendedProducts || (refData?.products || FALLBACK_PRODUCTS).filter(p => {
      const tgDis = Array.isArray(p.target_diseases) ? p.target_diseases : [];
      return tgDis.some(td => td.toLowerCase().includes(qName) || qName.includes(td.toLowerCase()));
    }).map(p => ({
      name: p.name,
      company: p.company,
      activeIngredient: p.active_ingredient,
      url: p.official_url
    }))
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
