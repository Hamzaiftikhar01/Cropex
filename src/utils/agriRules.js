import { calculateAdvancedYieldForecast } from '../lib/yieldModel.js';

const CROP_UR = { wheat: 'گندم', rice: 'چاول', cotton: 'کپاس', sugarcane: 'گنا', maize: 'مکئی', potato: 'آلو', tomato: 'ٹماٹر' };
const SOIL_UR = { sandy: 'ریتیلی', loamy: 'میرا (لوامی)', clay: 'چکنی مٹی' };

/**
 * Scientific Literature Citations for Crop Disease Forecasting
 */
export const DISEASE_LITERATURE = {
  LATE_BLIGHT: {
    citation: 'Wallin (1962) Late Blight Severity System (American Potato Journal)',
    threshold: 'Optimal sporulation at 15–22°C with sustained relative humidity >85%',
  },
  WHEAT_YELLOW_RUST: {
    citation: 'CIMMYT Wheat Rust Epidemiology Guide (Roelfs et al., 1992; Stubbs 1985)',
    threshold: 'Optimal urediniospore germination at 10–15°C with leaf wetness / RH >70%',
  },
  WHEAT_LEAF_RUST: {
    citation: 'CIMMYT Rust Spore Germination Matrix (Roelfs et al., 1992)',
    threshold: 'Optimal infection at 15–25°C with free moisture or prolonged dew',
  },
  RICE_BLAST: {
    citation: 'IRRI Rice Blast Warning Criteria (Ou, 1985; IRRI Compendium)',
    threshold: 'Blast spore release threshold: 20–28°C and night humidity >88%',
  },
  COTTON_WHITEFLY: {
    citation: 'Central Cotton Research Institute (CCRI Multan, Ahmad et al., 2010)',
    threshold: 'Vector surge threshold: 30–42°C with relative humidity <65% and dry spells',
  },
  SUGARCANE_RED_ROT: {
    citation: 'Sugarcane Research Institute (SRI Faisalabad, Satyavir 2003)',
    threshold: 'Red Rot mycelial proliferation: 28–35°C and sustained RH >80%',
  },
  MAIZE_BLIGHT: {
    citation: 'MMRI Yousafwala Maize Pathology Guide (CIMMYT Compendium)',
    threshold: 'Turcicum spore germination: 18–27°C with high relative humidity (>75%)',
  },
  GENERAL_FUNGAL: {
    citation: 'Agrometeorological Fungal Dispersal Standard (FAO Plant Protection)',
    threshold: 'General fungal vegetative growth: 22–32°C with consecutive rain days',
  },
};

/**
 * Calculates crop-scoped disease risk based on 7-day weather variables backed by scientific epidemiology models
 * 
 * @DataContract
 * @param {string} cropType - The crop enum (e.g., 'wheat', 'rice')
 * @param {object} weatherData - Open-Meteo payload containing { daily: [...] }
 * @param {string} [language='en'] - Output language code ('en', 'ur', 'pa')
 * @returns {object} { diseaseName: string, riskLevel: 'Low'|'Medium'|'High', percentage: number, explanation: string, literatureCitation: string, epidemiologyThreshold: string }
 * @fallback Returns a generic 'Low' risk (10%) gracefully if weatherData is missing.
 */
export function calculateDiseaseRisk(cropType, weatherData, language = 'en') {
  const isUrdu = language === 'ur';

  if (!weatherData || !weatherData.daily || weatherData.daily.length === 0) {
    return {
      diseaseName: isUrdu ? 'فنگس (پھپھوندی)' : 'General Fungal',
      riskLevel: 'Low',
      percentage: 10,
      explanation: isUrdu 
        ? 'موسمی ڈیٹا لوڈ نہیں ہوا۔ بیماری کا خطرہ کم سمجھا جاتا ہے۔'
        : 'Weather data not loaded. Risk is calculated as low.',
      literatureCitation: DISEASE_LITERATURE.GENERAL_FUNGAL.citation,
      epidemiologyThreshold: DISEASE_LITERATURE.GENERAL_FUNGAL.threshold
    };
  }

  const temps = weatherData.daily.map(d => (d.tempMin + d.tempMax) / 2);
  const humidities = weatherData.daily.map(d => d.humidityAvg || 50);
  const rainProbMax = weatherData.daily.map(d => d.precipitationProb || 0);

  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const avgHumid = humidities.reduce((a, b) => a + b, 0) / humidities.length;
  const rainDaysCount = rainProbMax.filter(prob => prob > 40).length;

  const crop = (cropType || '').toLowerCase();

  // 1. TOMATO / POTATO: Wallin Late Blight Units (LBU)
  if (crop === 'potato' || crop === 'tomato') {
    const tempFavorable = avgTemp >= 15 && avgTemp <= 22;
    const humidFavorable = avgHumid > 85 || (avgHumid > 80 && rainDaysCount >= 1);
    const diseaseName = isUrdu ? 'جھلساؤ (Late Blight)' : 'Late Blight';
    const lit = DISEASE_LITERATURE.LATE_BLIGHT;

    if (tempFavorable && humidFavorable) {
      return {
        diseaseName,
        riskLevel: 'High',
        percentage: 88,
        explanation: isUrdu
          ? `ٹماٹر/آلو میں جھلساؤ کے لیے سازگار ترین حالات (درجہ حرارت ${avgTemp.toFixed(1)}°C اور نمی ${avgHumid.toFixed(0)}%) پائے گئے ہیں۔ والین (Wallin) ماڈل کے تحت فوری حفاظتی اسپرے کریں۔`
          : `Wallin Late Blight Units (LBU) threshold triggered: Favorable conditions (${avgTemp.toFixed(1)}°C with ${avgHumid.toFixed(0)}% RH). Apply preventive systemic fungicide immediately.`,
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else if (tempFavorable) {
      return {
        diseaseName,
        riskLevel: 'Medium',
        percentage: 45,
        explanation: isUrdu
          ? `درجہ حرارت (${avgTemp.toFixed(1)}°C) جھلساؤ کے لیے سازگار ہے، لیکن ہوا میں نمی کم ہے۔ پتوں کا باقاعدگی سے معائنہ کریں۔`
          : `Temperature is within the Wallin sporulation band (15-22°C), but humidity is moderate (${avgHumid.toFixed(0)}%). Monitor canopy closely.`,
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else {
      return {
        diseaseName,
        riskLevel: 'Low',
        percentage: 15,
        explanation: isUrdu
          ? 'موجودہ موسم میں جھلساؤ کا پھیلاؤ ناممکن ہے۔ کھیتوں کو صاف رکھیں۔'
          : 'Current weather is outside the Wallin Late Blight thermal envelope. Spore germination probability is low.',
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    }
  } 
  
  // 2. WHEAT: CIMMYT Yellow Rust (Stripe) vs Leaf Rust Epidemiology
  if (crop === 'wheat') {
    const isCoolYellowRust = avgTemp >= 9 && avgTemp <= 16;
    const isWarmLeafRust = avgTemp > 16 && avgTemp <= 26;
    const wetFavorable = rainDaysCount >= 1 || avgHumid >= 70;

    if (isCoolYellowRust && wetFavorable) {
      const lit = DISEASE_LITERATURE.WHEAT_YELLOW_RUST;
      return {
        diseaseName: isUrdu ? 'پیلے کنگی (Yellow Stripe Rust)' : 'Yellow (Stripe) Rust',
        riskLevel: 'High',
        percentage: 85,
        explanation: isUrdu
          ? `ٹھنڈا اور مرطوب موسم (${avgTemp.toFixed(1)}°C، نمی ${avgHumid.toFixed(0)}%) پیلی کنگی کے پھیلاؤ کے لیے انتہائی موزوں ہے۔ سی ایم آئی ٹی (CIMMYT) ماڈل کے مطابق فوری معائنہ کریں۔`
          : `CIMMYT Stripe Rust warning: Cool temperatures (${avgTemp.toFixed(1)}°C) and high humidity/dew satisfy Puccinia striiformis infection criteria. Inspect wheat leaves for yellow stripes.`,
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else if (isWarmLeafRust && (rainDaysCount >= 2 || avgHumid >= 65)) {
      const lit = DISEASE_LITERATURE.WHEAT_LEAF_RUST;
      return {
        diseaseName: isUrdu ? 'بھوری کنگی (Brown Leaf Rust)' : 'Leaf (Brown) Rust',
        riskLevel: 'High',
        percentage: 80,
        explanation: isUrdu
          ? `معتدل درجہ حرارت (${avgTemp.toFixed(1)}°C) اور نمی کی وجہ سے بھوری کنگی (Leaf Rust) کا خطرہ زیادہ ہے۔ گندم کے نچلے پتوں کا معائنہ کریں۔`
          : `CIMMYT Leaf Rust criteria met: Moderate temperatures (${avgTemp.toFixed(1)}°C) and dew support Puccinia triticina sporulation. Inspect flag leaves.`,
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else if (isCoolYellowRust || isWarmLeafRust) {
      const lit = isCoolYellowRust ? DISEASE_LITERATURE.WHEAT_YELLOW_RUST : DISEASE_LITERATURE.WHEAT_LEAF_RUST;
      return {
        diseaseName: isCoolYellowRust 
          ? (isUrdu ? 'پیلے کنگی (Yellow Rust)' : 'Yellow (Stripe) Rust')
          : (isUrdu ? 'بھوری کنگی (Leaf Rust)' : 'Leaf (Brown) Rust'),
        riskLevel: 'Medium',
        percentage: 40,
        explanation: isUrdu
          ? 'درجہ حرارت کنگی کے لیے موافق ہے لیکن خشکی کی وجہ سے پھیلاؤ سست رہے گا۔ پتوں کا معائنہ کرتے رہیں۔'
          : 'Temperatures are within rust germination range, but low humidity slows spore amplification. Continue periodic scouting.',
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else {
      return {
        diseaseName: isUrdu ? 'کنگی (Wheat Rust)' : 'Wheat Rust',
        riskLevel: 'Low',
        percentage: 10,
        explanation: isUrdu
          ? 'درجہ حرارت موزوں نہیں ہے اور خشکی کی وجہ سے کنگی کا خطرہ نہ ہونے کے برابر ہے۔'
          : 'Thermal conditions exceed or fall below active rust sporulation thresholds. Risk is low.',
        literatureCitation: DISEASE_LITERATURE.WHEAT_LEAF_RUST.citation,
        epidemiologyThreshold: DISEASE_LITERATURE.WHEAT_LEAF_RUST.threshold
      };
    }
  } 
  
  // 3. RICE: IRRI Rice Blast Index (Ou, 1985)
  if (crop === 'rice') {
    const tempFavorable = avgTemp >= 20 && avgTemp <= 28;
    const humidFavorable = avgHumid > 85 || (avgHumid > 80 && rainDaysCount >= 1);
    const diseaseName = isUrdu ? 'رائس بلاسٹ (Rice Blast)' : 'Rice Blast';
    const lit = DISEASE_LITERATURE.RICE_BLAST;

    if (tempFavorable && humidFavorable) {
      return {
        diseaseName,
        riskLevel: 'High',
        percentage: 90,
        explanation: isUrdu
          ? `گرم راتیں (درجہ حرارت ${avgTemp.toFixed(1)}°C) اور زیادہ نمی (${avgHumid.toFixed(0)}%) رائس بلاسٹ کا سبب بن سکتی ہیں۔ آئی آر آر آئی (IRRI) ہدایات کے مطابق نائٹروجن کھاد کا اضافی استعمال روکیں۔`
          : `IRRI Blast Warning: Warm temperatures (${avgTemp.toFixed(1)}°C) and high humidity (>85%) trigger high Magnaporthe oryzae conidia release. Avoid excess nitrogen.`,
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else if (tempFavorable) {
      return {
        diseaseName,
        riskLevel: 'Medium',
        percentage: 48,
        explanation: isUrdu
          ? 'درجہ حرارت بلاسٹ کے لیے موافق ہے لیکن ہوا میں نمی معتدل ہے۔ پتوں پر بھورے دھبوں کی جانچ کریں۔'
          : 'Temperature is favorable for blast incubation, but dry air slows lesion expansion. Monitor leaf tips.',
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else {
      return {
        diseaseName,
        riskLevel: 'Low',
        percentage: 15,
        explanation: isUrdu
          ? 'ہوا میں خشکی ہے اور درجہ حرارت بلاسٹ کے لیے موافق نہیں ہے۔ خطرہ کم ہے۔'
          : 'Environmental conditions do not satisfy IRRI blast outbreak thresholds. Risk remains low.',
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    }
  }

  // 4. COTTON: CCRI Multan Whitefly / CLCuV & Bacterial Blight Thresholds
  if (crop === 'cotton') {
    const lit = DISEASE_LITERATURE.COTTON_WHITEFLY;
    const isHotAndDry = avgTemp >= 30 && avgTemp <= 42 && avgHumid < 65 && rainDaysCount === 0;
    const isHumidBlight = avgTemp >= 26 && avgTemp <= 35 && (avgHumid > 75 || rainDaysCount >= 2);

    if (isHotAndDry) {
      return {
        diseaseName: isUrdu ? 'سفید مکھی / وائرس (Whitefly / CLCuV)' : 'Whitefly / CLCuV Vector',
        riskLevel: 'High',
        percentage: 82,
        explanation: isUrdu
          ? `شدید گرم اور خشک موسم (${avgTemp.toFixed(1)}°C، نمی ${avgHumid.toFixed(0)}%) سفید مکھی کی تیز افزائش کا باعث بنتا ہے۔ سی سی آر آئی ملتان کے مطابق کاٹن لیف کرل وائرس کا خطرہ شدید ہے۔`
          : `CCRI Multan Vector Alert: Hot and dry conditions (${avgTemp.toFixed(1)}°C, ${avgHumid.toFixed(0)}% RH) accelerate Bemisia tabaci breeding and Cotton Leaf Curl Virus (CLCuV) transmission.`,
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else if (isHumidBlight) {
      return {
        diseaseName: isUrdu ? 'بیکٹیریل بلائیٹ / گڈی سڑاند' : 'Bacterial Blight / Boll Rot',
        riskLevel: 'High',
        percentage: 75,
        explanation: isUrdu
          ? `گرم اور مرطوب موسم بیکٹیریل بلائیٹ اور ٹینڈوں کے سڑنے کے خطرے کو بڑھاتا ہے۔ کھیت سے اضافی پانی نکالیں۔`
          : `High humidity and warm conditions support Xanthomonas bacterial blight and boll rot fungi. Ensure proper field drainage.`,
        literatureCitation: DISEASE_LITERATURE.GENERAL_FUNGAL.citation,
        epidemiologyThreshold: DISEASE_LITERATURE.GENERAL_FUNGAL.threshold
      };
    } else if (avgTemp >= 28 && avgTemp <= 38) {
      return {
        diseaseName: isUrdu ? 'سفید مکھی (Whitefly)' : 'Whitefly / Jassid Stress',
        riskLevel: 'Medium',
        percentage: 42,
        explanation: isUrdu
          ? 'درجہ حرارت کیڑوں کی سرگرمی کے لیے سازگار ہے۔ ہفتہ وار اسکاٹنگ کریں۔'
          : 'Temperature supports moderate sucking pest activity. Scout 20 consecutive cotton plants weekly.',
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else {
      return {
        diseaseName: isUrdu ? 'کاٹن کیڑے / بیماریاں' : 'Cotton Pest/Disease',
        riskLevel: 'Low',
        percentage: 15,
        explanation: isUrdu
          ? 'موسم کیڑوں اور بیماریوں کے حملے کے لیے موزوں نہیں ہے۔'
          : 'Weather parameters are unfavorable for rapid insect vector expansion or fungal outbreaks.',
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    }
  }

  // 5. SUGARCANE: Sugarcane Research Institute (SRI) Red Rot Thresholds
  if (crop === 'sugarcane') {
    const lit = DISEASE_LITERATURE.SUGARCANE_RED_ROT;
    const isRedRotFavorable = avgTemp >= 28 && avgTemp <= 35 && (avgHumid > 80 || rainDaysCount >= 2);

    if (isRedRotFavorable) {
      return {
        diseaseName: isUrdu ? 'گنے کا سرخ سڑاؤ (Red Rot)' : 'Sugarcane Red Rot',
        riskLevel: 'High',
        percentage: 80,
        explanation: isUrdu
          ? `زیادہ نمی (${avgHumid.toFixed(0)}%) اور درجہ حرارت (${avgTemp.toFixed(1)}°C) سرخ سڑاؤ (Red Rot) کی بیماری کے لیے سازگار ہیں۔ ایس آر آئی فیصل آباد ماڈل کے تحت بیماری زدہ تنے فوری تلف کریں۔`
          : `SRI Faisalabad Red Rot Alert: Warm humid environment (${avgTemp.toFixed(1)}°C, ${avgHumid.toFixed(0)}% RH) satisfies Colletotrichum falcatum spread criteria. Rogue out diseased clumps.`,
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else if (avgTemp >= 25 && avgTemp <= 36) {
      return {
        diseaseName: isUrdu ? 'سرخ سڑاؤ / فنگس' : 'Sugarcane Red Rot / Smut',
        riskLevel: 'Medium',
        percentage: 40,
        explanation: isUrdu
          ? 'درجہ حرارت فنگس کے لیے موزوں ہے لیکن پانی کا ٹھہراؤ کم ہے۔ نالیاں صاف رکھیں۔'
          : 'Temperature favors mycelial growth, but dry soil reduces systemic spread. Maintain field aeration.',
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else {
      return {
        diseaseName: isUrdu ? 'گنے کی بیماریاں' : 'Sugarcane Pathogens',
        riskLevel: 'Low',
        percentage: 12,
        explanation: isUrdu
          ? 'موسم بیماریوں کے پھیلاؤ کے لیے ناموافق ہے۔'
          : 'Climatic conditions do not support rapid fungal sporulation in sugarcane.',
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    }
  }

  // 6. MAIZE: MMRI Yousafwala Turcicum Leaf Blight
  if (crop === 'maize') {
    const lit = DISEASE_LITERATURE.MAIZE_BLIGHT;
    const isBlightFavorable = avgTemp >= 18 && avgTemp <= 27 && (avgHumid > 75 || rainDaysCount >= 2);

    if (isBlightFavorable) {
      return {
        diseaseName: isUrdu ? 'مکئی کا جھلساؤ (Turcicum Leaf Blight)' : 'Northern Corn Leaf Blight',
        riskLevel: 'High',
        percentage: 80,
        explanation: isUrdu
          ? `معتدل درجہ حرارت (${avgTemp.toFixed(1)}°C) اور نمی کی زیادتی (${avgHumid.toFixed(0)}%) مکئی کے جھلساؤ کے لیے سازگار ہے۔ یوسف والا ریسرچ ماڈل کے مطابق حفاظتی اسپرے کریں۔`
          : `MMRI Yousafwala Blight Alert: High humidity (${avgHumid.toFixed(0)}%) and moderate temperatures (${avgTemp.toFixed(1)}°C) trigger Exserohilum turcicum conidial germination.`,
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else if (avgTemp >= 18 && avgTemp <= 30) {
      return {
        diseaseName: isUrdu ? 'مکئی کا جھلساؤ' : 'Northern Corn Leaf Blight',
        riskLevel: 'Medium',
        percentage: 40,
        explanation: isUrdu
          ? 'درجہ حرارت سازگار ہے مگر نمی کم ہے۔ نگرانی رکھیں۔'
          : 'Temperature supports fungal incubation, but lack of continuous leaf wetness limits spread.',
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    } else {
      return {
        diseaseName: isUrdu ? 'مکئی کی بیماریاں' : 'Maize Fungal Pathogens',
        riskLevel: 'Low',
        percentage: 12,
        explanation: isUrdu
          ? 'موسم خشک ہے اور بیماری کا خطرہ نہ ہونے کے برابر ہے۔'
          : 'Environmental conditions remain outside the active sporulation window for corn blights.',
        literatureCitation: lit.citation,
        epidemiologyThreshold: lit.threshold
      };
    }
  }

  // DEFAULT / GENERAL FUNGAL (Chili, Pulses, Vegetables)
  const tempFavorable = avgTemp >= 22 && avgTemp <= 32;
  const wetFavorable = rainDaysCount >= 2;
  const diseaseName = isUrdu ? 'فنگل سپاٹ (Leaf Spot)' : 'General Fungal (Leaf Spot)';
  const lit = DISEASE_LITERATURE.GENERAL_FUNGAL;

  if (tempFavorable && wetFavorable) {
    return {
      diseaseName,
      riskLevel: 'High',
      percentage: 75,
      explanation: isUrdu
        ? `گرم اور مرطوب موسم کی وجہ سے فنگل پتوں کے دھبوں کا خطرہ زیادہ ہے۔ ہوا کی آمد و رفت بہتر بنانے کے لیے پتے تراشیں۔`
        : 'Warm temperatures (22-32°C) and forecast wet weather support spore development. Prune low-hanging branches.',
      literatureCitation: lit.citation,
      epidemiologyThreshold: lit.threshold
    };
  } else if (tempFavorable) {
    return {
      diseaseName,
      riskLevel: 'Medium',
      percentage: 35,
      explanation: isUrdu
        ? 'درجہ حرارت فنگس کے لیے موزوں ہے لیکن بارش نہ ہونے سے پھیلاؤ محدود رہے گا۔ نگرانی رکھیں۔'
        : 'Temperatures favor fungal growth, but dry days limit spore spreading. Monitor regularly.',
      literatureCitation: lit.citation,
      epidemiologyThreshold: lit.threshold
    };
  } else {
    return {
      diseaseName,
      riskLevel: 'Low',
      percentage: 12,
      explanation: isUrdu
        ? 'موسم خشک ہے اور فنگس کے پھیلنے کا کوئی بڑا خطرہ نہیں ہے۔'
        : 'Conditions are dry or temperatures are outside the active mold multiplication range.',
      literatureCitation: lit.citation,
      epidemiologyThreshold: lit.threshold
    };
  }
}

/**
 * Calculates Crop growth stage from days elapsed since sowing
 */
export function getGrowthStage(cropType, sowingDate, language = 'en') {
  const sowing = new Date(sowingDate);
  const today = new Date();
  const diffTime = Math.abs(today - sowing);
  const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const crop = (cropType || '').toLowerCase();
  const isUrdu = language === 'ur';

  // Agronomic growth-stage assumptions (Pakistan conditions):
  // Wheat: 120 days total. Emergence(15d), Tillering(60d), Flowering(90d), Ripening(120d).
  // Rice: 120 days. Transplanting(25d), Veg(65d), Flowering(95d), Ripening(120d).
  // Cotton: 180 days. Emergence(20d), Veg(60d), Flowering(130d), Ripening(180d).
  // Sugarcane: 365 days. Germination(60d), Tillering(270d), Arrowing(330d), Ripening(365d).
  // Maize: 110 days. Emergence(15d), Veg(50d), Silking(80d), Ripening(110d).
  // Potato: 100 days. Sprouting(20d), Veg(50d), Tuber initiation(80d), Bulking(100d).
  // Tomato: 110 days. Transplanting(25d), Veg(55d), Fruit set(85d), Ripening(110d).

  let stage = 'Vegetative';
  let stageUr = 'شاخیں اور پتے (Vegetative)';
  let factor = 1.0;

  if (crop === 'wheat') {
    if (daysElapsed <= 15) { stage = 'Sowing/Emergence'; stageUr = 'اگاؤ / شروعات (Emergence)'; factor = 0.5; }
    else if (daysElapsed <= 60) { stage = 'Vegetative (Tillering)'; stageUr = 'شاخیں نکلنا (Tillering)'; factor = 1.0; }
    else if (daysElapsed <= 90) { stage = 'Flowering (Booting/Heading)'; stageUr = 'سٹہ نکلنا / پھول (Flowering)'; factor = 1.5; }
    else if (daysElapsed <= 120) { stage = 'Yield/Ripening'; stageUr = 'دانہ بننا / پکنا (Ripening)'; factor = 0.8; }
    else { stage = 'Maturity/Harvest'; stageUr = 'کٹائی کا مرحلہ (Harvest)'; factor = 0.2; }
  } else if (crop === 'rice') {
    if (daysElapsed <= 25) { stage = 'Transplanting/Emergence'; stageUr = 'پنیری کی منتقلی (Transplanting)'; factor = 0.5; }
    else if (daysElapsed <= 65) { stage = 'Vegetative'; stageUr = 'بڑھوتری (Vegetative)'; factor = 1.0; }
    else if (daysElapsed <= 95) { stage = 'Flowering/Panicle'; stageUr = 'پھول آنا / منجھر (Flowering)'; factor = 1.5; }
    else if (daysElapsed <= 120) { stage = 'Yield/Ripening'; stageUr = 'پکنا (Ripening)'; factor = 0.8; }
    else { stage = 'Maturity/Harvest'; stageUr = 'کٹائی (Harvest)'; factor = 0.2; }
  } else if (crop === 'cotton') {
    if (daysElapsed <= 20) { stage = 'Sowing/Emergence'; stageUr = 'اگاؤ (Emergence)'; factor = 0.5; }
    else if (daysElapsed <= 60) { stage = 'Vegetative'; stageUr = 'بڑھوتری (Vegetative)'; factor = 1.0; }
    else if (daysElapsed <= 130) { stage = 'Flowering (Squaring/Blooming)'; stageUr = 'پھول اور ڈوڈی (Flowering)'; factor = 1.5; }
    else if (daysElapsed <= 180) { stage = 'Yield (Boll Opening)'; stageUr = 'ٹینڈے کھلنا (Yield)'; factor = 0.8; }
    else { stage = 'Maturity/Harvest'; stageUr = 'چنائی (Harvest)'; factor = 0.2; }
  } else if (crop === 'sugarcane') {
    if (daysElapsed <= 60) { stage = 'Germination/Sowing'; stageUr = 'اگاؤ (Germination)'; factor = 0.5; }
    else if (daysElapsed <= 270) { stage = 'Grand Growth (Vegetative)'; stageUr = 'بڑھوتری کا مرحلہ'; factor = 1.0; }
    else if (daysElapsed <= 330) { stage = 'Flowering (Arrowing)'; stageUr = 'پھول نکلنا (Arrowing)'; factor = 1.2; }
    else if (daysElapsed <= 365) { stage = 'Yield/Ripening'; stageUr = 'پکنا / مٹھاس'; factor = 0.8; }
    else { stage = 'Maturity/Harvest'; stageUr = 'کٹائی (Harvest)'; factor = 0.2; }
  } else if (crop === 'maize') {
    if (daysElapsed <= 15) { stage = 'Sowing/Emergence'; stageUr = 'اگاؤ (Emergence)'; factor = 0.5; }
    else if (daysElapsed <= 50) { stage = 'Vegetative'; stageUr = 'بڑھوتری (Vegetative)'; factor = 1.0; }
    else if (daysElapsed <= 80) { stage = 'Flowering (Silking)'; stageUr = 'چھلی اور پھول (Silking)'; factor = 1.5; }
    else if (daysElapsed <= 110) { stage = 'Yield/Ripening'; stageUr = 'دانہ بننا / پکنا'; factor = 0.8; }
    else { stage = 'Maturity/Harvest'; stageUr = 'کٹائی (Harvest)'; factor = 0.2; }
  } else if (crop === 'potato') {
    if (daysElapsed <= 20) { stage = 'Sprouting/Sowing'; stageUr = 'اگاؤ (Sprouting)'; factor = 0.5; }
    else if (daysElapsed <= 50) { stage = 'Vegetative'; stageUr = 'بڑھوتری (Vegetative)'; factor = 1.0; }
    else if (daysElapsed <= 80) { stage = 'Flowering (Tuber Initiation)'; stageUr = 'آلو بننے کی شروعات (Tuber)'; factor = 1.5; }
    else if (daysElapsed <= 100) { stage = 'Yield/Bulking'; stageUr = 'سائز بڑھنا (Bulking)'; factor = 0.8; }
    else { stage = 'Maturity/Harvest'; stageUr = 'کھدائی (Harvest)'; factor = 0.2; }
  } else if (crop === 'tomato') {
    if (daysElapsed <= 25) { stage = 'Transplanting/Sowing'; stageUr = 'پنیری کی منتقلی (Transplanting)'; factor = 0.5; }
    else if (daysElapsed <= 55) { stage = 'Vegetative'; stageUr = 'شاخیں اور پتے (Vegetative)'; factor = 1.0; }
    else if (daysElapsed <= 85) { stage = 'Flowering (Fruit Set)'; stageUr = 'پھول اور پھل بننا (Fruit Set)'; factor = 1.5; }
    else if (daysElapsed <= 110) { stage = 'Yield/Ripening'; stageUr = 'ٹماٹر پکنا (Ripening)'; factor = 0.8; }
    else { stage = 'Maturity/Harvest'; stageUr = 'کھدائی / چنائی (Harvest)'; factor = 0.2; }
  }

  return { 
    stage: isUrdu ? stageUr : stage, 
    factor, 
    daysElapsed 
  };
}

/**
 * Calculates optimal irrigation scheduling using a water-budget logic
 * 
 * @DataContract
 * @param {string} cropType - The crop enum (e.g., 'wheat', 'rice')
 * @param {string} soilType - 'sandy', 'loamy', or 'clay'
 * @param {string} sowingDate - ISO string Date (e.g., '2026-08-01')
 * @param {number} lastIrrigatedDaysAgo - Days elapsed since last manual watering
 * @param {object} weatherData - Open-Meteo payload containing { daily: [...] }
 * @param {string} [language='en'] - Output language code ('en', 'ur', 'pa')
 * @returns {object} { recommendation: string, color: string, litersPerAcre: number, explanation: string }
 * @fallback Clamps litersPerAcre to a max of 80000. Offsets requirement by recent 72hr rain.
 */
export function calculateIrrigation(cropType, soilType, sowingDate, lastIrrigatedDaysAgo, weatherData, language = 'en') {
  const crop = (cropType || '').toLowerCase();
  const soil = (soilType || 'Loamy').toLowerCase();
  const daysSinceIrrigation = lastIrrigatedDaysAgo ?? 3;
  const isUrdu = language === 'ur';

  // 1. Base Daily Water Requirement (mm/day)
  let baseDemand = 4;
  if (crop === 'sugarcane' || crop === 'rice') baseDemand = 8;
  else if (crop === 'cotton' || crop === 'maize') baseDemand = 6;

  // 2. Growth stage factor adjustment
  const { stage, factor } = getGrowthStage(cropType, sowingDate, language);
  let adjustedDemand = baseDemand * factor;

  // 3. Weather adjustments
  let tempMultiplier = 1.0;
  let next3DaysRain = 0;
  let avgHumid = 50;

  if (weatherData && weatherData.daily && weatherData.daily.length > 0) {
    const maxTemp = Math.max(...weatherData.daily.slice(0, 3).map(d => d.tempMax));
    if (maxTemp > 38) {
      tempMultiplier = 1.20; // 20% increase due to high evaporation
    }
    next3DaysRain = weatherData.daily.slice(0, 3).reduce((acc, d) => acc + (d.precipitationSum || 0), 0);
    avgHumid = weatherData.daily.reduce((acc, d) => acc + (d.humidityAvg || 50), 0) / weatherData.daily.length;
  }

  adjustedDemand = adjustedDemand * tempMultiplier;

  // 4. Soil Interval parameters (Sandy / Loamy / Clay)
  let soilInterval = 6;
  if (soil === 'sandy') {
    soilInterval = 3;
  } else if (soil === 'clay') {
    soilInterval = 9;
  }
  
  // Base requirement is daily demand * days since last irrigation * 4046 (sq meters per acre) / 1000 to get thousands, but we'll use a simpler heuristic:
  // liters = adjustedDemand (mm) * 4000 (roughly liters per acre per mm) * daysSinceIrrigation
  let rawLiters = adjustedDemand * 4000 * daysSinceIrrigation;
  
  // Rain offset: 1mm of rain saves roughly 4000 liters
  rawLiters -= (next3DaysRain * 4000);
  
  // Sanity Clamps (Floor at 0, Ceiling at 80,000)
  const litersPerAcre = Math.min(80000, Math.max(0, rawLiters));
  // Humidity adjustment
  let humidityAlert = '';
  if (avgHumid > 80) {
    soilInterval += 2;
    if (isUrdu) {
      humidityAlert = ` ہوا میں زیادہ نمی (${Math.round(avgHumid)}%) کی وجہ سے مٹی خشک ہونے کا عمل سست ہے، جس سے پانی کی ضرورت میں 2 دن کی تاخیر کی گئی ہے۔`;
    } else {
      humidityAlert = ` High relative humidity (${Math.round(avgHumid)}%) slows moisture evaporation, extending soil retention by 2 days and reducing irrigation urgency.`;
    }
  }

  const cropTranslated = CROP_UR[crop] || cropType;
  const soilTranslated = SOIL_UR[soil] || soilType;

  // 5. Advisor Recommendation Logic
  if (next3DaysRain > 8.0) {
    return {
      recommendation: isUrdu ? 'انتظار کریں (Wait)' : 'Wait / Skip',
      color: 'green',
      litersPerAcre: 0,
      explanation: isUrdu
        ? `اگلے 3 دنوں میں تیز بارش (~${next3DaysRain.toFixed(1)}mm) متوقع ہے۔ قدرتی بارش فصل کی ضرورت پوری کرے گی۔ اسپرے نہ کریں۔`
        : `Heavy rain (~${next3DaysRain.toFixed(1)}mm) is forecast in the next 3 days. Natural rainfall will meet crop needs. Skip manual irrigation.`
    };
  }

  if (daysSinceIrrigation >= soilInterval) {
    return {
      recommendation: isUrdu ? 'ابھی پانی دیں' : 'Irrigate Now',
      color: 'red',
      litersPerAcre,
      explanation: isUrdu
        ? `آخری آبپاشی ${daysSinceIrrigation} دن پہلے کی گئی تھی۔ ${soilTranslated} مٹی ${soilInterval} دنوں میں خشک ہو جاتی ہے۔${humidityAlert} ${cropTranslated} "${stage}" کے نازک مرحلے میں ہے۔`
        : `Last irrigated ${daysSinceIrrigation} days ago. ${soilType} soil dries within ${soilInterval} days under these conditions.${humidityAlert} ${cropType} is in the critical "${stage}" stage.`
    };
  }

  if (daysSinceIrrigation === soilInterval - 1 || daysSinceIrrigation === soilInterval - 2) {
    return {
      recommendation: isUrdu ? '2 دن میں پانی دیں' : 'Irrigate in 2 Days',
      color: 'amber',
      litersPerAcre,
      explanation: isUrdu
        ? `مٹی میں نمی ختم ہو رہی ہے۔ آخری بار پانی ${daysSinceIrrigation} دن پہلے دیا گیا تھا۔ اگلے 48 گھنٹوں میں پانی دینے کی تیاری کریں۔${humidityAlert}`
        : `Soil moisture level is depleting. Last irrigated ${daysSinceIrrigation} days ago. Prepare to irrigate within 48 hours.${humidityAlert}`
    };
  }

  return {
    recommendation: isUrdu ? 'انتظار کریں (Wait)' : 'Wait / Skip',
    color: 'green',
    litersPerAcre: 0,
    explanation: isUrdu
      ? `مٹی میں نمی کافی ہے۔ آخری بار پانی ${daysSinceIrrigation} دن پہلے دیا گیا تھا۔ اگلی آبپاشی ${soilInterval - daysSinceIrrigation} دن بعد شیڈول ہے۔${humidityAlert}`
      : `Soil moisture is adequate. Last irrigated ${daysSinceIrrigation} days ago. Next irrigation scheduled in ${soilInterval - daysSinceIrrigation} days.${humidityAlert}`
  };
}

/**
 * Calculates yield estimate using gradient-boosted ensemble regression with historical district baselines,
 * falling back to clamped environmental regressions if needed.
 * 
 * @DataContract
 * @param {string|object} cropTypeOrProfile - Crop enum (e.g. 'wheat') OR full fieldProfile object { cropType, district, soilType, sowingDate }
 * @param {string|object} soilTypeOrWeather - Soil type string OR weatherData if 1st arg was fieldProfile
 * @param {string|number} sowingDateOrRisk - ISO date string OR diseaseRiskPercentage if 1st arg was fieldProfile
 * @param {object|string} weatherDataOrLang - Open-Meteo payload OR language string
 * @param {number} [diseaseRiskPercentage] - Calculated risk % (0-100)
 * @param {string} [language='en'] - Output language code ('en', 'ur', 'pa')
 * @param {string} [districtName='Faisalabad'] - District name
 * @returns {object} { expectedYield, minYield, maxYield, districtAverage, deltaFromAverage, confidence, stressAttribution, mitigations, sowingFactor, weatherFactor, soilFactor, diseaseFactor, confidenceNote }
 */
export function calculateYieldForecast(
  cropTypeOrProfile,
  soilTypeOrWeather,
  sowingDateOrRisk,
  weatherDataOrLang,
  diseaseRiskPercentage = 0,
  language = 'en',
  districtName = 'Faisalabad'
) {
  // Normalize polymorphic arguments
  let profile = {};
  let weatherData = null;
  let riskPct = 0;
  let lang = 'en';

  if (cropTypeOrProfile && typeof cropTypeOrProfile === 'object') {
    profile = {
      cropType: cropTypeOrProfile.cropType || 'wheat',
      soilType: cropTypeOrProfile.soilType || 'loamy',
      sowingDate: cropTypeOrProfile.sowingDate,
      district: cropTypeOrProfile.district || 'Faisalabad',
    };
    weatherData = soilTypeOrWeather;
    riskPct = typeof sowingDateOrRisk === 'number' ? sowingDateOrRisk : (diseaseRiskPercentage || 0);
    lang = typeof weatherDataOrLang === 'string' ? weatherDataOrLang : (language || 'en');
  } else {
    profile = {
      cropType: cropTypeOrProfile || 'wheat',
      soilType: soilTypeOrWeather || 'loamy',
      sowingDate: sowingDateOrRisk || new Date().toISOString(),
      district: districtName || 'Faisalabad',
    };
    weatherData = weatherDataOrLang;
    riskPct = diseaseRiskPercentage || 0;
    lang = language || 'en';
  }

  const isUrdu = lang === 'ur';

  // 1. Attempt ML Gradient-Boosted Ensemble Forecast
  try {
    const mlResult = calculateAdvancedYieldForecast(profile, weatherData, riskPct);
    if (mlResult && mlResult.expectedYield > 0) {
      // Map stress attribution to backwards-compatible factors
      const sowingPenaltyPct = mlResult.stressAttribution?.sowingPenalty || 0;
      const heatPenaltyPct = mlResult.stressAttribution?.heatPenalty || 0;
      const soilAdjPct = mlResult.stressAttribution?.soilAdjustment || 0;
      const diseasePenaltyPct = mlResult.stressAttribution?.diseasePenalty || 0;

      const sowingFactor = Math.round((1.0 - sowingPenaltyPct / 100) * 100) / 100;
      const weatherFactor = Math.round((1.0 - heatPenaltyPct / 100) * 100) / 100;
      const soilFactor = Math.round((1.0 + soilAdjPct / 100) * 100) / 100;
      const diseaseFactor = Math.round((1.0 - diseasePenaltyPct / 100) * 100) / 100;

      // Construct explainable bilingual confidence note
      let confidenceNote = '';
      const delta = mlResult.deltaFromAverage;
      const dist = profile.district || 'district';

      if (isUrdu) {
        if (delta <= -12) {
          confidenceNote = `شدید ماحولیاتی دباؤ (گرمی/بیماری/تاخیر): پیداوار ${dist} کے تاریخی اوسط سے ${Math.abs(delta)}% کم متوقع ہے۔`;
        } else if (delta >= 6) {
          confidenceNote = `سازگار موسمی حالات اور عمدہ زرخیزی: پیداوار ${dist} کے تاریخی اوسط سے ${delta}% زائد متوقع ہے۔`;
        } else {
          confidenceNote = `موجودہ حالات میں پیداوار ${dist} کے تاریخی اوسط (${mlResult.districtAverage} من) کے قریب متوقع ہے۔`;
        }
      } else {
        if (delta <= -12) {
          confidenceNote = `Compound stress detected: forecast is ${Math.abs(delta)}% below the ${dist} historical baseline (${mlResult.districtAverage} maunds).`;
        } else if (delta >= 6) {
          confidenceNote = `Optimal conditions: forecast is ${delta}% above the ${dist} historical baseline (${mlResult.districtAverage} maunds).`;
        } else {
          confidenceNote = `Yield forecast aligns with ${dist} historical district baseline (${mlResult.districtAverage} maunds) under current agro-ecological parameters.`;
        }
      }

      return {
        ...mlResult,
        sowingFactor,
        weatherFactor,
        soilFactor,
        diseaseFactor,
        confidenceNote,
        literatureCitation: 'PBS / Provincial Crop Reporting Service District Baselines & CIMMYT/IRRI GDD Phenology',
      };
    }
  } catch (err) {
    console.warn('Advanced yield model encountered an error, activating deterministic fallback:', err);
  }

  // 2. Deterministic Clamped Environmental Regression Fallback
  const crop = (profile.cropType || '').toLowerCase();
  const soil = (profile.soilType || 'Loamy').toLowerCase();

  let baseYield = 45;
  if (crop === 'cotton') baseYield = 22;
  else if (crop === 'rice') baseYield = 55;
  else if (crop === 'sugarcane') baseYield = 750;
  else if (crop === 'maize') baseYield = 70;
  else if (crop === 'potato') baseYield = 200;
  else if (crop === 'tomato') baseYield = 300;

  let sowingFactor = 1.0;
  const sowingMonth = new Date(profile.sowingDate).getMonth();

  if (crop === 'wheat') {
    if (sowingMonth === 10) sowingFactor = 1.0;
    else if (sowingMonth === 11) sowingFactor = 0.85;
    else sowingFactor = 0.70;
  } else if (crop === 'tomato' || crop === 'potato') {
    if (sowingMonth === 9 || sowingMonth === 10) sowingFactor = 1.0;
    else sowingFactor = 0.85;
  } else if (crop === 'cotton') {
    if (sowingMonth === 3 || sowingMonth === 4) sowingFactor = 1.0;
    else sowingFactor = 0.80;
  }

  let weatherFactor = 1.0;
  if (weatherData && weatherData.daily) {
    const maxTemp = Math.max(...weatherData.daily.map(d => d.tempMax));
    const avgHumid = weatherData.daily.reduce((acc, d) => acc + (d.humidityAvg || 50), 0) / weatherData.daily.length;

    if (maxTemp > 40) weatherFactor = 0.80;
    else if (avgHumid < 25) weatherFactor = 0.85;
  }

  let soilFactor = 1.0;
  if (soil === 'clay') soilFactor = 0.90;
  else if (soil === 'sandy') soilFactor = 0.75;

  let diseaseFactor = 1.0;
  if (riskPct > 60) diseaseFactor = 0.70;
  else if (riskPct > 30) diseaseFactor = 0.85;

  const environmentalMultiplier = sowingFactor * weatherFactor * soilFactor * diseaseFactor;
  const clampedMultiplier = Math.max(0.60, environmentalMultiplier);

  const expectedYield = Math.round(baseYield * clampedMultiplier);
  const minYield = Math.round(expectedYield * 0.92);
  const maxYield = Math.round(expectedYield * 1.08);

  const confidenceNote = isUrdu
    ? (clampedMultiplier === 0.60 ? 'شدید ماحولیاتی دباؤ کا پتہ چلا ہے۔ پیداوار کا تخمینہ بقا کی سطح پر محدود کیا گیا ہے۔' : 'سازگار حالات کی پیش گوئی، پیداوار مستحکم رہنے کی امید ہے۔')
    : (clampedMultiplier === 0.60 ? 'Severe compound stress detected. Yield clamped to critical survival floor.' : 'Optimal conditions forecast normal yield output.');

  return {
    expectedYield,
    minYield,
    maxYield,
    unit: 'maunds/acre',
    unitUr: 'من فی ایکڑ',
    districtAverage: baseYield,
    deltaFromAverage: Math.round(((expectedYield - baseYield) / baseYield) * 100),
    confidence: 80,
    stressAttribution: {
      heatPenalty: Math.round((1.0 - weatherFactor) * 100),
      sowingPenalty: Math.round((1.0 - sowingFactor) * 100),
      diseasePenalty: Math.round((1.0 - diseaseFactor) * 100),
      moistureImpact: 0,
      soilAdjustment: Math.round((soilFactor - 1.0) * 100),
      zoneBonus: 0,
    },
    mitigations: [],
    sowingFactor,
    weatherFactor,
    soilFactor,
    diseaseFactor,
    confidenceNote,
    literatureCitation: 'Deterministic Environmental Regressions (Fallback)',
  };
}
