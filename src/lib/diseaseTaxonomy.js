/**
 * Cropex Disease Taxonomy — Phase 2
 * -----------------------------------
 * Canonical list of 6 locally important crops and ~5 high-priority diseases
 * for Pakistan. Source-of-truth used by:
 *  - The scoped VLM system prompt (api/analyze.js)
 *  - The confidence-aware hybrid UI pipeline
 *  - The benchmark evaluation harness (scripts/benchmark/)
 *
 * References: PARC/NARC bulletins, DPP Pakistan pesticide registry,
 * PlantVillage + PlantDoc taxonomy.
 */

export const DISEASE_TAXONOMY = {
  wheat: {
    id: 'wheat',
    name: 'Wheat',
    name_ur: 'گندم',
    name_pa: 'کنک',
    season: 'Rabi (Oct–Apr)',
    diseases: [
      {
        id: 'wheat_yellow_rust',
        name: 'Yellow Rust (Stripe Rust)',
        pathogen: 'Puccinia striiformis f.sp. tritici',
        pathogen_type: 'Fungal',
        severity_potential: 'High',
        favorable_conditions: { temp_c: [10, 15], humidity_pct_min: 70, dew: true },
        visual_cues: [
          'Yellow-orange pustules in stripes along leaf veins',
          'Powdery yellow spores on upper leaf surface',
          'Leaves turn pale then dry out',
        ],
        key_products_pk: ['Amistar Top (Syngenta)', 'Nativo 75 WG (Bayer)'],
      },
      {
        id: 'wheat_leaf_rust',
        name: 'Leaf Rust (Brown Rust)',
        pathogen: 'Puccinia triticina',
        pathogen_type: 'Fungal',
        severity_potential: 'High',
        favorable_conditions: { temp_c: [15, 22], humidity_pct_min: 60 },
        visual_cues: [
          'Round to oval orange-brown pustules scattered on upper leaf surface',
          'Pustules turn black in late season',
          'No stripe pattern — distinguishes from yellow rust',
        ],
        key_products_pk: ['Amistar Top (Syngenta)', 'Nativo 75 WG (Bayer)'],
      },
      {
        id: 'wheat_loose_smut',
        name: 'Loose Smut',
        pathogen: 'Ustilago tritici',
        pathogen_type: 'Fungal',
        severity_potential: 'Moderate',
        favorable_conditions: { flowering_infection: true },
        visual_cues: [
          'Smutted black head replacing grain',
          'Black powdery spore mass in ear',
          'Rachis visible after spores disperse',
        ],
        key_products_pk: ['Raxil seed treatment (Bayer)', 'Vitavax seed treatment'],
      },
      {
        id: 'wheat_septoria_blotch',
        name: 'Septoria Blotch',
        pathogen: 'Zymoseptoria tritici',
        pathogen_type: 'Fungal',
        severity_potential: 'Moderate',
        favorable_conditions: { temp_c: [10, 25], rainfall_days_min: 3 },
        visual_cues: [
          'Tan or brown irregular blotches on lower leaves',
          'Black dot-like pycnidia visible inside lesions',
          'Lesions bounded by leaf veins',
        ],
        key_products_pk: ['Amistar Top (Syngenta)', 'Cabrio Top (FMC)'],
      },
      {
        id: 'wheat_powdery_mildew',
        name: 'Powdery Mildew',
        pathogen: 'Blumeria graminis f.sp. tritici',
        pathogen_type: 'Fungal',
        severity_potential: 'Low-Moderate',
        favorable_conditions: { temp_c: [15, 22], humidity_pct_min: 60, dry_leaf_surface: true },
        visual_cues: [
          'White fluffy powdery colonies on upper leaf surfaces',
          'Yellowing beneath colonies',
          'Severe cases cover stems and heads',
        ],
        key_products_pk: ['Nativo 75 WG (Bayer)', 'Amistar Top (Syngenta)'],
      },
    ],
  },

  rice: {
    id: 'rice',
    name: 'Rice',
    name_ur: 'چاول',
    name_pa: 'چاول',
    season: 'Kharif (May–Oct)',
    diseases: [
      {
        id: 'rice_blast',
        name: 'Rice Blast',
        pathogen: 'Magnaporthe oryzae',
        pathogen_type: 'Fungal',
        severity_potential: 'High',
        favorable_conditions: { temp_c: [24, 30], humidity_pct_min: 85, night_temp_cool: true },
        visual_cues: [
          'Spindle-shaped gray-white lesions with brown border on leaves',
          'Neck rot at base of panicle',
          'Node rot causing stem break',
        ],
        key_products_pk: ['Nativo 75 WG (Bayer)', 'Amistar Top (Syngenta)'],
      },
      {
        id: 'rice_bacterial_blight',
        name: 'Bacterial Leaf Blight',
        pathogen: 'Xanthomonas oryzae pv. oryzae',
        pathogen_type: 'Bacterial',
        severity_potential: 'High',
        favorable_conditions: { temp_c: [25, 34], high_nitrogen: true, flooding: true },
        visual_cues: [
          'Water-soaked to yellow stripe from leaf tip or margins',
          'Straw-yellow or white wilted leaves (kresek phase)',
          'Milky bacterial ooze on cut leaf placed in water',
        ],
        key_products_pk: ['Sun-Cop copper-based (Suncrop)', 'Reduce nitrogen applications'],
      },
      {
        id: 'rice_sheath_blight',
        name: 'Sheath Blight',
        pathogen: 'Rhizoctonia solani',
        pathogen_type: 'Fungal',
        severity_potential: 'High',
        favorable_conditions: { temp_c: [28, 32], high_humidity: true, dense_canopy: true },
        visual_cues: [
          'Oval or irregular lesions on leaf sheath near water line',
          'Grayish-white center with dark brown border',
          'Lesions spread upward to flag leaf',
        ],
        key_products_pk: ['Validacin (Bayer)', 'Nativo 75 WG (Bayer)'],
      },
      {
        id: 'rice_false_smut',
        name: 'False Smut (Green Smut)',
        pathogen: 'Ustilaginoidea virens',
        pathogen_type: 'Fungal',
        severity_potential: 'Moderate',
        favorable_conditions: { temp_c: [25, 35], high_humidity: true, panicle_emergence: true },
        visual_cues: [
          'Individual grains replaced by greenish-yellow velvety balls',
          'Orange to olive-green powdery spore balls in panicle',
          'Only some grains affected, others remain normal',
        ],
        key_products_pk: ['Amistar Top (Syngenta)', 'Nativo 75 WG (Bayer)'],
      },
      {
        id: 'rice_brown_spot',
        name: 'Brown Spot',
        pathogen: 'Bipolaris oryzae',
        pathogen_type: 'Fungal',
        severity_potential: 'Moderate',
        favorable_conditions: { low_nutrition: true, high_humidity: true },
        visual_cues: [
          'Oval to circular dark brown spots on leaves and glumes',
          'Spots with yellow halo',
          'Heavy spotting on older lower leaves',
        ],
        key_products_pk: ['Cabrio Top (FMC)', 'Amistar Top (Syngenta)'],
      },
    ],
  },

  cotton: {
    id: 'cotton',
    name: 'Cotton',
    name_ur: 'کپاس',
    name_pa: 'کپاس',
    season: 'Kharif (Apr–Nov)',
    diseases: [
      {
        id: 'cotton_leaf_curl_virus',
        name: 'Cotton Leaf Curl Virus (CLCuV)',
        pathogen: 'Cotton leaf curl geminivirus complex',
        pathogen_type: 'Viral',
        severity_potential: 'High',
        favorable_conditions: { whitefly_population: true, temp_c: [30, 40] },
        visual_cues: [
          'Upward or downward curling of leaf margins',
          'Leaf vein thickening (vein swelling)',
          'Enations (leaf-like outgrowths) on underside of leaf',
        ],
        key_products_pk: ['Confidor (Bayer) — whitefly control', 'Polo (Syngenta) — whitefly control'],
      },
      {
        id: 'cotton_bacterial_blight',
        name: 'Bacterial Blight (Angular Leaf Spot)',
        pathogen: 'Xanthomonas axonopodis pv. malvacearum',
        pathogen_type: 'Bacterial',
        severity_potential: 'High',
        favorable_conditions: { temp_c: [24, 32], wet_weather: true },
        visual_cues: [
          'Angular water-soaked spots bounded by veins',
          'Spots turn dark brown/black with yellow halo',
          'Blackarm stem lesions in severe cases',
        ],
        key_products_pk: ['Sun-Cop (Suncrop)', 'Copper-based bactericides'],
      },
      {
        id: 'cotton_fusarium_wilt',
        name: 'Fusarium Wilt',
        pathogen: 'Fusarium oxysporum f.sp. vasinfectum',
        pathogen_type: 'Fungal',
        severity_potential: 'High',
        favorable_conditions: { soil_temp_c: [25, 30], sandy_soil: true },
        visual_cues: [
          'Yellowing of lower leaves progressing upward',
          'Brown vascular discoloration in stem cross-section',
          'Sudden wilting and death of plant',
        ],
        key_products_pk: ['Topsin-M seed treatment', 'Topsin-M soil drench'],
      },
      {
        id: 'cotton_alternaria_leaf_spot',
        name: 'Alternaria Leaf Spot',
        pathogen: 'Alternaria macrospora',
        pathogen_type: 'Fungal',
        severity_potential: 'Moderate',
        favorable_conditions: { temp_c: [25, 35], humid_weather: true },
        visual_cues: [
          'Circular to irregular dark brown spots with concentric rings',
          'Yellow halo around spots',
          'Premature leaf drop in severe cases',
        ],
        key_products_pk: ['Amistar Top (Syngenta)', 'Cabrio Top (FMC)'],
      },
      {
        id: 'cotton_pink_bollworm',
        name: 'Pink Bollworm (Pest)',
        pathogen: 'Pectinophora gossypiella (insect)',
        pathogen_type: 'Insect Pest',
        severity_potential: 'High',
        favorable_conditions: { late_season: true },
        visual_cues: [
          'Entry hole in boll',
          'Damaged fiber and seed inside boll',
          'Pink caterpillar (larva) visible inside opened boll',
        ],
        key_products_pk: ['Karate (Syngenta)', 'Regent (Bayer)'],
      },
    ],
  },

  sugarcane: {
    id: 'sugarcane',
    name: 'Sugarcane',
    name_ur: 'گنا',
    name_pa: 'گنا',
    season: 'Spring planting (Feb–Mar); Autumn planting (Sep–Oct)',
    diseases: [
      {
        id: 'sugarcane_red_rot',
        name: 'Red Rot',
        pathogen: 'Colletotrichum falcatum',
        pathogen_type: 'Fungal',
        severity_potential: 'High',
        favorable_conditions: { temp_c: [28, 35], humid_weather: true },
        visual_cues: [
          'Reddish discoloration of internal stalk tissue',
          'White patches alternating with red in stalk cross-section',
          'Wilting and drying of top leaves with red midrib',
        ],
        key_products_pk: ['Sun-Cop (Suncrop)', 'Bavistin sett treatment'],
      },
      {
        id: 'sugarcane_smut',
        name: 'Sugarcane Smut (Whip Smut)',
        pathogen: 'Sporisorium scitamineum',
        pathogen_type: 'Fungal',
        severity_potential: 'High',
        favorable_conditions: { dry_warm: true, ratoon_crop: true },
        visual_cues: [
          'Whip-like black structure emerging from growing point',
          'Black powdery spores on whip',
          'Stunted plants with many thin tillers',
        ],
        key_products_pk: ['Hot water treatment of setts', 'Propiconazole sett treatment'],
      },
      {
        id: 'sugarcane_grassy_shoot',
        name: 'Grassy Shoot Disease',
        pathogen: 'Phytoplasma',
        pathogen_type: 'Phytoplasma',
        severity_potential: 'High',
        favorable_conditions: { leafhopper_vector: true },
        visual_cues: [
          'Profuse tillering producing thin grassy shoots',
          'Pale yellow to white narrow leaves',
          'Shortened internodes',
        ],
        key_products_pk: ['Confidor (Bayer) for leafhopper control', 'Use certified disease-free setts'],
      },
      {
        id: 'sugarcane_yellow_leaf',
        name: 'Yellow Leaf Disease',
        pathogen: 'Sugarcane yellow leaf virus (ScYLV)',
        pathogen_type: 'Viral',
        severity_potential: 'Moderate',
        favorable_conditions: { aphid_vector: true },
        visual_cues: [
          'Yellow midrib on upper surface of uppermost leaves',
          'Yellowing spreads to whole leaf blade',
          'Necrosis of midrib on lower leaf surface',
        ],
        key_products_pk: ['Aphid control insecticides', 'Plant certified disease-free setts'],
      },
      {
        id: 'sugarcane_pokkah_boeng',
        name: 'Pokkah Boeng (Twisted Top)',
        pathogen: 'Fusarium moniliforme',
        pathogen_type: 'Fungal',
        severity_potential: 'Moderate',
        favorable_conditions: { temp_c: [25, 32], wet_rainy: true },
        visual_cues: [
          'Chlorotic irregular lesions on young leaves',
          'Wrinkled deformed young leaves with cut or notched margins',
          'Top of plant twists (knife cut symptom) in severe cases',
        ],
        key_products_pk: ['Amistar Top (Syngenta)', 'Avoid excessive nitrogen'],
      },
    ],
  },

  maize: {
    id: 'maize',
    name: 'Maize (Corn)',
    name_ur: 'مکئی',
    name_pa: 'مکئی',
    season: 'Kharif (Apr–Aug); Spring (Feb–May)',
    diseases: [
      {
        id: 'maize_northern_leaf_blight',
        name: 'Northern Leaf Blight',
        pathogen: 'Exserohilum turcicum',
        pathogen_type: 'Fungal',
        severity_potential: 'High',
        favorable_conditions: { temp_c: [18, 27], humid_weather: true },
        visual_cues: [
          'Long cigar-shaped gray-green to tan lesions on leaves',
          'Lesions 2.5–15 cm long with smooth edges',
          'Lesions turn brown and dry as they enlarge',
        ],
        key_products_pk: ['Amistar Top (Syngenta)', 'Nativo 75 WG (Bayer)'],
      },
      {
        id: 'maize_grey_leaf_spot',
        name: 'Grey Leaf Spot',
        pathogen: 'Cercospora zeae-maydis',
        pathogen_type: 'Fungal',
        severity_potential: 'High',
        favorable_conditions: { temp_c: [25, 30], high_humidity: true, prolonged_leaf_wetness: true },
        visual_cues: [
          'Rectangular lesions with parallel sides bounded by leaf veins',
          'Gray to tan color, uniform in shape',
          'Coalesce to blight entire leaf in severe cases',
        ],
        key_products_pk: ['Cabrio Top (FMC)', 'Amistar Top (Syngenta)'],
      },
      {
        id: 'maize_fall_armyworm',
        name: 'Fall Armyworm (Pest)',
        pathogen: 'Spodoptera frugiperda (insect)',
        pathogen_type: 'Insect Pest',
        severity_potential: 'High',
        favorable_conditions: { warm_humid: true },
        visual_cues: [
          'Ragged holes in leaves of whorl-stage plants',
          'Frass (excrement) packed in whorl',
          'Young caterpillar with inverted Y mark on head',
        ],
        key_products_pk: ['Coragen (FMC)', 'Karate (Syngenta)'],
      },
      {
        id: 'maize_ear_rot',
        name: 'Ear Rot',
        pathogen: 'Stenocarpella maydis / Fusarium graminearum',
        pathogen_type: 'Fungal',
        severity_potential: 'Moderate',
        favorable_conditions: { wet_weather_at_silking: true },
        visual_cues: [
          'White to pink mold growing from base or tip of ear',
          'Bleached straw-colored husk',
          'Shriveled lightweight kernels',
        ],
        key_products_pk: ['Nativo 75 WG (Bayer) — preventive foliar spray', 'Proper ear drying at harvest'],
      },
      {
        id: 'maize_common_rust',
        name: 'Common Rust',
        pathogen: 'Puccinia sorghi',
        pathogen_type: 'Fungal',
        severity_potential: 'Moderate',
        favorable_conditions: { temp_c: [16, 23], humid_weather: true },
        visual_cues: [
          'Brick-red to brown elongated pustules on both leaf surfaces',
          'Pustules scattered randomly — unlike wheat rust stripes',
          'Leaves yellow and die early in severe cases',
        ],
        key_products_pk: ['Amistar Top (Syngenta)', 'Nativo 75 WG (Bayer)'],
      },
    ],
  },

  tomato: {
    id: 'tomato',
    name: 'Tomato',
    name_ur: 'ٹماٹر',
    name_pa: 'ٹماٹر',
    season: 'Spring (Feb–May); Autumn (Sep–Dec)',
    diseases: [
      {
        id: 'tomato_early_blight',
        name: 'Early Blight',
        pathogen: 'Alternaria solani',
        pathogen_type: 'Fungal',
        severity_potential: 'Moderate-High',
        favorable_conditions: { temp_c: [24, 29], leaf_wetness_hrs: 2 },
        visual_cues: [
          'Dark brown concentric rings (target-board pattern) on older lower leaves',
          'Yellow halo around lesion',
          'Dark sunken lesions also appear on stems and fruit',
        ],
        key_products_pk: ['Cabrio Top (FMC)', 'Amistar Top (Syngenta)'],
      },
      {
        id: 'tomato_late_blight',
        name: 'Late Blight',
        pathogen: 'Phytophthora infestans',
        pathogen_type: 'Oomycete',
        severity_potential: 'High',
        favorable_conditions: { temp_c: [15, 20], humidity_pct_min: 90, prolonged_leaf_wetness: true },
        visual_cues: [
          'Large irregular water-soaked dark lesions on leaves and stems',
          'White fuzzy sporulation on leaf undersides in humid conditions',
          'Firm brown leathery lesions on fruit',
        ],
        key_products_pk: ['Ridomil Gold (Syngenta)', 'Infinito (Bayer)'],
      },
      {
        id: 'tomato_bacterial_wilt',
        name: 'Bacterial Wilt',
        pathogen: 'Ralstonia solanacearum',
        pathogen_type: 'Bacterial',
        severity_potential: 'High',
        favorable_conditions: { soil_temp_c: [25, 35], high_moisture: true },
        visual_cues: [
          'Sudden wilting of entire plant while leaves remain green',
          'White bacterial ooze from cut stem placed in water',
          'Brown discoloration of vascular ring in stem cross-section',
        ],
        key_products_pk: ['No chemical cure — remove and destroy plant', 'Use resistant varieties', 'Crop rotation'],
      },
      {
        id: 'tomato_leaf_miner',
        name: 'Tomato Leaf Miner (Pest)',
        pathogen: 'Tuta absoluta (insect)',
        pathogen_type: 'Insect Pest',
        severity_potential: 'High',
        favorable_conditions: { warm_weather: true },
        visual_cues: [
          'Irregular silvery mines (tunnels) in leaf tissue',
          'Frass visible inside mines',
          'Leaf tissue dries and dies around mines',
        ],
        key_products_pk: ['Coragen (FMC)', 'Voliam Targo (Syngenta)', 'Pheromone traps'],
      },
      {
        id: 'tomato_blossom_end_rot',
        name: 'Blossom End Rot (Physiological)',
        pathogen: 'Calcium deficiency / water stress (non-infectious)',
        pathogen_type: 'Physiological',
        severity_potential: 'Moderate',
        favorable_conditions: { irregular_irrigation: true, low_calcium_uptake: true },
        visual_cues: [
          'Dark brown to black dry leathery lesion at blossom end of fruit',
          'Lesion is firm and sunken',
          'Usually starts on green fruit',
        ],
        key_products_pk: ['Foliar calcium spray (CaNO3 or CaCl2)', 'Consistent irrigation schedule'],
      },
    ],
  },
};

/** Flat list of all disease IDs — for validation and benchmark labeling */
export const ALL_DISEASE_IDS = Object.values(DISEASE_TAXONOMY)
  .flatMap((crop) => crop.diseases.map((d) => d.id));

/** Flat list of supported crop IDs */
export const SUPPORTED_CROP_IDS = Object.keys(DISEASE_TAXONOMY);

/**
 * Get a disease entry by ID (searches all crops).
 * @param {string} diseaseId
 * @returns {object|null}
 */
export function getDiseaseById(diseaseId) {
  for (const crop of Object.values(DISEASE_TAXONOMY)) {
    const found = crop.diseases.find((d) => d.id === diseaseId);
    if (found) return { ...found, crop_id: crop.id, crop_name: crop.name };
  }
  return null;
}

/**
 * Get all diseases for a crop.
 * @param {string} cropId
 * @returns {object[]|null}
 */
export function getDiseasesForCrop(cropId) {
  return DISEASE_TAXONOMY[cropId.toLowerCase()]?.diseases ?? null;
}

/**
 * Build a compact taxonomy block for embedding in a VLM system prompt.
 * @param {string[]} [cropIds] — subset, or all if omitted
 * @returns {string}
 */
export function buildTaxonomyPromptBlock(cropIds) {
  const ids = cropIds ?? SUPPORTED_CROP_IDS;
  return ids.map((id) => {
    const crop = DISEASE_TAXONOMY[id];
    if (!crop) return '';
    const lines = crop.diseases
      .map((d) => `  - ${d.name} [${d.id}]: ${d.visual_cues.slice(0, 2).join('; ')}`)
      .join('\n');
    return `${crop.name} (${crop.id}):\n${lines}`;
  }).join('\n\n');
}

/**
 * Return low-confidence escalation advice for a crop.
 * Used by the hybrid pipeline when confidence < 70.
 * @param {string} cropId
 * @returns {{ message: string, actions: string[] }}
 */
export function getLowConfidenceGuidance(cropId) {
  const crop = DISEASE_TAXONOMY[cropId?.toLowerCase()];
  const cropName = crop?.name ?? 'the crop';
  return {
    message: `The AI could not identify the disease in ${cropName} with sufficient confidence.`,
    actions: [
      'Retake the photo: use a close-up of the affected leaf in good natural light.',
      'Include both upper and lower leaf surfaces if possible.',
      'Contact your nearest agricultural extension officer (Zila Agriculture Office).',
      'Call the NARC helpline: 051-9255000.',
    ],
  };
}
