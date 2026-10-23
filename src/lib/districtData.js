/**
 * Cropex Phase 4 — Pakistani Agricultural District Baselines & Crop Statistics
 * ============================================================================
 * Official historical statistics from Pakistan Bureau of Statistics (PBS),
 * Punjab Crop Reporting Service, and Sindh Agriculture Extension.
 *
 * Provides district-level baselines, agro-ecological zones, and seasonal norms
 * for gradient-boosted yield prediction and environmental stress calculations.
 */

export const AGRO_ECOLOGICAL_ZONES = {
  RICE_WHEAT: {
    id: 'RICE_WHEAT',
    name: 'Rice-Wheat Cropping Zone',
    name_ur: 'چاول-گندم زون',
    description: 'Upper Punjab plains with high canal water and tube-well availability. High humidity during Kharif.',
    districts: ['sheikhupura', 'gujranwala', 'sialkot', 'hafizabad', 'nankana sahib', 'lahore', 'kasur'],
  },
  COTTON_WHEAT: {
    id: 'COTTON_WHEAT',
    name: 'Cotton-Wheat Cropping Zone',
    name_ur: 'کپاس-گندم زون',
    description: 'Southern Punjab & Central/Lower Sindh. High summer heat, intensive cotton cultivation, vulnerable to whitefly and heat stress.',
    districts: ['multan', 'bahawalpur', 'rahim yar khan', 'khanewal', 'lodhran', 'vehari', 'muzaffargarh', 'hyderabad', 'sanghar', 'mirpur khas', 'shaheed benazirabad'],
  },
  MIXED_CROPPING: {
    id: 'MIXED_CROPPING',
    name: 'Mixed Cropping Zone',
    name_ur: 'مخلوط کاشت زون',
    description: 'Central Punjab canal colonies with diverse wheat, sugarcane, maize, and vegetable cultivation.',
    districts: ['faisalabad', 'sahiwal', 'okara', 'jhang', 'toba tek singh', 'pakpattan', 'chiniot'],
  },
  CITRUS_WHEAT: {
    id: 'CITRUS_WHEAT',
    name: 'Citrus & Wheat Northern Zone',
    name_ur: 'سائٹرس-گندم زون',
    description: 'Sargodha division known for kinnow orchards and rabi wheat.',
    districts: ['sargodha', 'bhalwal', 'mandi bahauddin', 'khushab'],
  },
  SINDH_INDUS_DELTA: {
    id: 'SINDH_INDUS_DELTA',
    name: 'Lower Indus Delta & Coastal Plain',
    name_ur: 'زیریں سندھ زون',
    description: 'Lower Sindh plains with heavy soils and intensive sugarcane, rice, and tomato production.',
    districts: ['badin', 'thatta', 'sujawal', 'tando muhammad khan'],
  },
  UPPER_SINDH: {
    id: 'UPPER_SINDH',
    name: 'Upper Sindh Rice & Oilseeds Zone',
    name_ur: 'بالائی سندھ زون',
    description: 'Right bank of Indus River, major producer of IRRI coarse rice.',
    districts: ['larkana', 'sukkur', 'shikarpur', 'jacobabad', 'kashmore', 'ghotki'],
  },
  KPK_VALLEYS: {
    id: 'KPK_VALLEYS',
    name: 'KPK Valleys & Sub-Mountainous Zone',
    name_ur: 'خیبر پختونخوا وادی زون',
    description: 'Mild climate valleys with temperate fruit, off-season vegetables, and maize.',
    districts: ['swat', 'mardan', 'charsadda', 'peshawar', 'dera ismail khan'],
  },
};

/**
 * District baseline statistics:
 * Historical mean yield (maunds/acre), typical soil type, average annual rainfall (mm),
 * and primary agro-ecological zone.
 * (1 maund = 40 kg; 1 acre = 0.4047 hectare)
 */
export const DISTRICT_STATISTICS = {
  faisalabad: {
    name: 'Faisalabad',
    name_ur: 'فیصل آباد',
    province: 'Punjab',
    zone: 'MIXED_CROPPING',
    avgAnnualRainfallMm: 375,
    dominantSoil: 'loamy',
    baseYields: {
      wheat: 45,
      rice: 46,
      cotton: 22,
      sugarcane: 740,
      maize: 78,
      potato: 210,
      tomato: 290,
    },
  },
  multan: {
    name: 'Multan',
    name_ur: 'ملتان',
    province: 'Punjab',
    zone: 'COTTON_WHEAT',
    avgAnnualRainfallMm: 210,
    dominantSoil: 'loamy',
    baseYields: {
      wheat: 43,
      rice: 42,
      cotton: 25,
      sugarcane: 710,
      maize: 72,
      potato: 195,
      tomato: 270,
    },
  },
  bahawalpur: {
    name: 'Bahawalpur',
    name_ur: 'بہاولپور',
    province: 'Punjab',
    zone: 'COTTON_WHEAT',
    avgAnnualRainfallMm: 180,
    dominantSoil: 'sandy',
    baseYields: {
      wheat: 41,
      rice: 40,
      cotton: 24,
      sugarcane: 690,
      maize: 68,
      potato: 180,
      tomato: 260,
    },
  },
  'rahim yar khan': {
    name: 'Rahim Yar Khan',
    name_ur: 'رحیم یار خان',
    province: 'Punjab',
    zone: 'COTTON_WHEAT',
    avgAnnualRainfallMm: 165,
    dominantSoil: 'loamy',
    baseYields: {
      wheat: 44,
      rice: 42,
      cotton: 27,
      sugarcane: 820,
      maize: 70,
      potato: 185,
      tomato: 280,
    },
  },
  sheikhupura: {
    name: 'Sheikhupura',
    name_ur: 'شیخوپورہ',
    province: 'Punjab',
    zone: 'RICE_WHEAT',
    avgAnnualRainfallMm: 520,
    dominantSoil: 'clay',
    baseYields: {
      wheat: 46,
      rice: 52, // Basmati heartland
      cotton: 18,
      sugarcane: 730,
      maize: 76,
      potato: 215,
      tomato: 300,
    },
  },
  gujranwala: {
    name: 'Gujranwala',
    name_ur: 'گوجرانوالہ',
    province: 'Punjab',
    zone: 'RICE_WHEAT',
    avgAnnualRainfallMm: 580,
    dominantSoil: 'clay',
    baseYields: {
      wheat: 47,
      rice: 54,
      cotton: 16,
      sugarcane: 720,
      maize: 78,
      potato: 220,
      tomato: 310,
    },
  },
  sargodha: {
    name: 'Sargodha',
    name_ur: 'سرگودھا',
    province: 'Punjab',
    zone: 'CITRUS_WHEAT',
    avgAnnualRainfallMm: 410,
    dominantSoil: 'loamy',
    baseYields: {
      wheat: 45,
      rice: 45,
      cotton: 20,
      sugarcane: 760,
      maize: 74,
      potato: 200,
      tomato: 285,
    },
  },
  sahiwal: {
    name: 'Sahiwal',
    name_ur: 'ساہیوال',
    province: 'Punjab',
    zone: 'MIXED_CROPPING',
    avgAnnualRainfallMm: 350,
    dominantSoil: 'loamy',
    baseYields: {
      wheat: 48,
      rice: 48,
      cotton: 24,
      sugarcane: 780,
      maize: 88, // Hybrid corn capital
      potato: 240,
      tomato: 320,
    },
  },
  okara: {
    name: 'Okara',
    name_ur: 'اوکاڑہ',
    province: 'Punjab',
    zone: 'MIXED_CROPPING',
    avgAnnualRainfallMm: 380,
    dominantSoil: 'loamy',
    baseYields: {
      wheat: 47,
      rice: 47,
      cotton: 22,
      sugarcane: 770,
      maize: 90,
      potato: 250, // National potato hub
      tomato: 330,
    },
  },
  hyderabad: {
    name: 'Hyderabad',
    name_ur: 'حیدرآباد',
    province: 'Sindh',
    zone: 'COTTON_WHEAT',
    avgAnnualRainfallMm: 195,
    dominantSoil: 'clay',
    baseYields: {
      wheat: 40,
      rice: 48,
      cotton: 26,
      sugarcane: 790,
      maize: 65,
      potato: 180,
      tomato: 320,
    },
  },
  sanghar: {
    name: 'Sanghar',
    name_ur: 'سانگھڑ',
    province: 'Sindh',
    zone: 'COTTON_WHEAT',
    avgAnnualRainfallMm: 170,
    dominantSoil: 'loamy',
    baseYields: {
      wheat: 39,
      rice: 44,
      cotton: 28, // Highest cotton yield in Sindh
      sugarcane: 780,
      maize: 64,
      potato: 175,
      tomato: 290,
    },
  },
  sukkur: {
    name: 'Sukkur',
    name_ur: 'سکھر',
    province: 'Sindh',
    zone: 'UPPER_SINDH',
    avgAnnualRainfallMm: 130,
    dominantSoil: 'clay',
    baseYields: {
      wheat: 42,
      rice: 58,
      cotton: 25,
      sugarcane: 740,
      maize: 60,
      potato: 180,
      tomato: 280,
    },
  },
  larkana: {
    name: 'Larkana',
    name_ur: 'لاڑکانہ',
    province: 'Sindh',
    zone: 'UPPER_SINDH',
    avgAnnualRainfallMm: 140,
    dominantSoil: 'clay',
    baseYields: {
      wheat: 41,
      rice: 62, // High-yielding coarse rice (IRRI)
      cotton: 21,
      sugarcane: 730,
      maize: 60,
      potato: 175,
      tomato: 275,
    },
  },
  badin: {
    name: 'Badin',
    name_ur: 'بدین',
    province: 'Sindh',
    zone: 'SINDH_INDUS_DELTA',
    avgAnnualRainfallMm: 230,
    dominantSoil: 'clay',
    baseYields: {
      wheat: 38,
      rice: 55,
      cotton: 23,
      sugarcane: 850,
      maize: 62,
      potato: 180,
      tomato: 340, // Leading coastal winter tomato
    },
  },
  swat: {
    name: 'Swat',
    name_ur: 'سوات',
    province: 'KPK',
    zone: 'KPK_VALLEYS',
    avgAnnualRainfallMm: 850,
    dominantSoil: 'loamy',
    baseYields: {
      wheat: 36,
      rice: 40,
      cotton: 12,
      sugarcane: 550,
      maize: 82,
      potato: 210,
      tomato: 350, // Off-season summer tomato
    },
  },
  'dera ismail khan': {
    name: 'Dera Ismail Khan',
    name_ur: 'ڈیرہ اسماعیل خان',
    province: 'KPK',
    zone: 'KPK_VALLEYS',
    avgAnnualRainfallMm: 270,
    dominantSoil: 'sandy',
    baseYields: {
      wheat: 40,
      rice: 45,
      cotton: 20,
      sugarcane: 760,
      maize: 70,
      potato: 190,
      tomato: 270,
    },
  },
};

/** Default national/provincial baseline for unindexed districts */
export const DEFAULT_NATIONAL_BASELINE = {
  name: 'Pakistan General',
  name_ur: 'پاکستان عمومی',
  province: 'General',
  zone: 'MIXED_CROPPING',
  avgAnnualRainfallMm: 350,
  dominantSoil: 'loamy',
  baseYields: {
    wheat: 44,
    rice: 48,
    cotton: 23,
    sugarcane: 730,
    maize: 74,
    potato: 210,
    tomato: 290,
  },
};

/**
 * Returns statistics and historical base yields for a district.
 *
 * @param {string} districtName
 * @returns {object}
 */
export function getDistrictData(districtName) {
  if (!districtName || typeof districtName !== 'string') {
    return DEFAULT_NATIONAL_BASELINE;
  }
  const key = districtName.toLowerCase().trim();
  return DISTRICT_STATISTICS[key] || DEFAULT_NATIONAL_BASELINE;
}

/**
 * Returns historical average yield for a specific crop in a district.
 *
 * @param {string} districtName
 * @param {string} cropType
 * @returns {number} Yield in maunds per acre
 */
export function getHistoricalYield(districtName, cropType) {
  const district = getDistrictData(districtName);
  const crop = (cropType || '').toLowerCase().trim();
  return district.baseYields[crop] ?? DEFAULT_NATIONAL_BASELINE.baseYields[crop] ?? 40;
}

/**
 * Returns list of all indexed districts.
 */
export const SUPPORTED_DISTRICTS = Object.keys(DISTRICT_STATISTICS);
