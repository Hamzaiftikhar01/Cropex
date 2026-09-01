/**
 * Central Agronomic Rules Engine for Cropex
 * -----------------------------------------
 * Contains explainable models for:
 * 1. Disease Risk calculations (crop-scoped)
 * 2. Smart Irrigation scheduling (water-budget & soil parameters)
 * 3. Yield Forecasting (clamped environmental regressions)
 * Supports bilingual outputs (English and Urdu) for judges and farmers.
 */

const CROP_UR = { wheat: 'گندم', rice: 'چاول', cotton: 'کپاس', sugarcane: 'گنا', maize: 'مکئی', potato: 'آلو', tomato: 'ٹماٹر' };
const SOIL_UR = { sandy: 'ریتیلی', loamy: 'میرا (لوامی)', clay: 'چکنی مٹی' };

/**
 * Calculates crop-scoped disease risk based on 7-day weather variables
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
        : 'Weather data not loaded. Risk is calculated as low.'
    };
  }

  const temps = weatherData.daily.map(d => (d.tempMin + d.tempMax) / 2);
  const humidities = weatherData.daily.map(d => d.humidityAvg || 50);
  const rainProbMax = weatherData.daily.map(d => d.precipitationProb || 0);

  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const avgHumid = humidities.reduce((a, b) => a + b, 0) / humidities.length;
  const rainDaysCount = rainProbMax.filter(prob => prob > 40).length;

  const crop = (cropType || '').toLowerCase();

  if (crop === 'potato' || crop === 'tomato') {
    // LATE BLIGHT RULES: Average temp 15-22C + humidity > 85%
    const tempFavorable = avgTemp >= 15 && avgTemp <= 22;
    const humidFavorable = avgHumid > 85;
    const diseaseName = isUrdu ? 'جھلساؤ (Late Blight)' : 'Late Blight';

    if (tempFavorable && humidFavorable) {
      return {
        diseaseName,
        riskLevel: 'High',
        percentage: 85,
        explanation: isUrdu
          ? `ٹماٹر/آلو میں جھلساؤ کے لیے سازگار ترین حالات (درجہ حرارت ${avgTemp}°C اور نمی ${avgHumid}%) پائے گئے ہیں۔ حفاظتی اسپرے کریں۔`
          : 'Ideal conditions (15-22°C with humidity >85%) detected for Late Blight development. Spray preventive fungicide and monitor leaves.'
      };
    } else if (tempFavorable) {
      return {
        diseaseName,
        riskLevel: 'Medium',
        percentage: 45,
        explanation: isUrdu
          ? `درجہ حرارت (${avgTemp}°C) جھلساؤ کے لیے سازگار ہے، لیکن ہوا میں نمی کم ہے۔ پتوں کا باقاعدگی سے معائنہ کریں۔`
          : 'Temperature is favorable for Late Blight (15-22°C), but humidity is currently low-to-moderate. Monitor crop closely.'
      };
    } else {
      return {
        diseaseName,
        riskLevel: 'Low',
        percentage: 15,
        explanation: isUrdu
          ? 'موجودہ موسم میں جھلساؤ کا پھیلاؤ ناممکن ہے۔ کھیتوں کو صاف رکھیں۔'
          : 'Current weather is outside the optimal range for Late Blight spore germination. Keep field sanitary.'
      };
    }
  } 
  
  if (crop === 'wheat') {
    // LEAF RUST RULES: Average temp 15-25C + rain/dew
    const tempFavorable = avgTemp >= 15 && avgTemp <= 25;
    const wetFavorable = rainDaysCount >= 2;
    const diseaseName = isUrdu ? 'پتوں کا کنگی (Leaf Rust)' : 'Leaf Rust';

    if (tempFavorable && wetFavorable) {
      return {
        diseaseName,
        riskLevel: 'High',
        percentage: 80,
        explanation: isUrdu
          ? `معتدل درجہ حرارت (${avgTemp}°C) اور بارش کی وجہ سے کنگی (Rust) کا خطرہ زیادہ ہے۔ گندم کے پتوں کا معائنہ کریں۔`
          : 'Moderate temperatures (15-25°C) and multiple wet days create high risk for Leaf Rust spores germination. Inspect wheat leaves.'
      };
    } else if (tempFavorable) {
      return {
        diseaseName,
        riskLevel: 'Medium',
        percentage: 40,
        explanation: isUrdu
          ? 'درجہ حرارت کنگی کے لیے موافق ہے لیکن خشکی کی وجہ سے پھیلاؤ سست رہے گا۔ پتوں کا معائنہ کرتے رہیں۔'
          : 'Temperatures support rust development, but dry weather will limit spread. Inspect bottom leaves.'
      };
    } else {
      return {
        diseaseName,
        riskLevel: 'Low',
        percentage: 10,
        explanation: isUrdu
          ? 'درجہ حرارت موزوں نہیں ہے اور خشکی کی وجہ سے کنگی کا خطرہ نہ ہونے کے برابر ہے۔'
          : 'Temperatures are too cool/warm or humidity is low. Rust infection is unlikely.'
      };
    }
  } 
  
  if (crop === 'rice') {
    // RICE BLAST RULES: Temp 20-28C + humidity > 88%
    const tempFavorable = avgTemp >= 20 && avgTemp <= 28;
    const humidFavorable = avgHumid > 88;
    const diseaseName = isUrdu ? 'بلاسٹ (Rice Blast)' : 'Rice Blast';

    if (tempFavorable && humidFavorable) {
      return {
        diseaseName,
        riskLevel: 'High',
        percentage: 90,
        explanation: isUrdu
          ? `گرم راتیں (درجہ حرارت ${avgTemp}°C) اور زیادہ نمی (${avgHumid}%) رائس بلاسٹ کا سبب بن سکتی ہیں۔ نائٹروجن کا استعمال کم کریں۔`
          : 'Warning: Warm nights (20-28°C) and high humidity (>88%) trigger high Rice Blast spore release. Avoid excessive nitrogen fertilizer.'
      };
    } else if (tempFavorable) {
      return {
        diseaseName,
        riskLevel: 'Medium',
        percentage: 50,
        explanation: isUrdu
          ? 'درجہ حرارت بلاسٹ کے لیے موافق ہے لیکن خشکی کی وجہ سے پھیلاؤ کم ہے۔ پتوں پر بھورے دھبوں کی جانچ کریں۔'
          : 'Temperature is favorable for Blast, but dry air slows reproduction. Check collar leaf for brown lesions.'
      };
    } else {
      return {
        diseaseName,
        riskLevel: 'Low',
        percentage: 15,
        explanation: isUrdu
          ? 'ہوا میں خشکی ہے اور درجہ حرارت بلاسٹ کے لیے موافق نہیں ہے۔ خطرہ کم ہے۔'
          : 'Weather is dry and temperatures are outside the active Blast envelope. Risk remains low.'
      };
    }
  }

  // DEFAULT / GENERAL FUNGAL (Cotton, Sugarcane, Maize, Chili, etc.)
  const tempFavorable = avgTemp >= 22 && avgTemp <= 32;
  const wetFavorable = rainDaysCount >= 2;
  const diseaseName = isUrdu ? 'فنگل سپاٹ (Leaf Spot)' : 'General Fungal (Leaf Spot)';

  if (tempFavorable && wetFavorable) {
    return {
      diseaseName,
      riskLevel: 'High',
      percentage: 75,
      explanation: isUrdu
        ? `گرم اور مرطوب موسم کی وجہ سے فنگل پتوں کے دھبوں کا خطرہ زیادہ ہے۔ ہوا کی آمد و رفت بہتر بنانے کے لیے پتے تراشیں۔`
        : 'Warm temperatures (22-32°C) and forecast wet weather support spore development. Prune low-hanging branches.'
    };
  } else if (tempFavorable) {
    return {
      diseaseName,
      riskLevel: 'Medium',
      percentage: 35,
      explanation: isUrdu
        ? 'درجہ حرارت فنگس کے لیے موزوں ہے لیکن بارش نہ ہونے سے پھیلاؤ محدود رہے گا۔ نگرانی رکھیں۔'
        : 'Temperatures favor fungal growth, but dry days limit spore spreading. Monitor regularly.'
    };
  } else {
    return {
      diseaseName,
      riskLevel: 'Low',
      percentage: 12,
      explanation: isUrdu
        ? 'موسم خشک ہے اور فنگس کے پھیلنے کا کوئی بڑا خطرہ نہیں ہے۔'
        : 'Conditions are dry or temperatures are outside the active mold multiplication range.'
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
  let litersPerAcre = 30000;
  if (soil === 'sandy') {
    soilInterval = 3;
    litersPerAcre = 15000;
  } else if (soil === 'clay') {
    soilInterval = 9;
    litersPerAcre = 45000;
  }

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
        ? `آخری آبپاشی ${daysSinceIrrigation} دن پہلے کی گئی تھی۔ ${soilTranslated} مٹی ${soilInterval} دنوں میں خشک ہو جاتی ہے۔${humidityAlert} گندم/فصل "${stage}" کے نازک مرحلے میں ہے۔`
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
 * Calculates yield estimate using clamped environment regressions
 */
export function calculateYieldForecast(cropType, soilType, sowingDate, weatherData, diseaseRiskPercentage, language = 'en') {
  const crop = (cropType || '').toLowerCase();
  const soil = (soilType || 'Loamy').toLowerCase();
  const isUrdu = language === 'ur';

  // 1. Base yields per crop (maunds/acre)
  let baseYield = 45;
  if (crop === 'cotton') baseYield = 22;
  else if (crop === 'rice') baseYield = 55;
  else if (crop === 'sugarcane') baseYield = 750;
  else if (crop === 'maize') baseYield = 70;
  else if (crop === 'potato') baseYield = 200;
  else if (crop === 'tomato') baseYield = 300;

  // 2. Sowing Date Factor
  let sowingFactor = 1.0;
  const sowingMonth = new Date(sowingDate).getMonth();

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

  // 3. Weather Factor
  let weatherFactor = 1.0;
  if (weatherData && weatherData.daily) {
    const maxTemp = Math.max(...weatherData.daily.map(d => d.tempMax));
    const avgHumid = weatherData.daily.reduce((acc, d) => acc + (d.humidityAvg || 50), 0) / weatherData.daily.length;

    if (maxTemp > 40) {
      weatherFactor = 0.80;
    } else if (avgHumid < 25) {
      weatherFactor = 0.85;
    }
  }

  // 4. Soil Factor
  let soilFactor = 1.0;
  if (soil === 'clay') soilFactor = 0.90;
  else if (soil === 'sandy') soilFactor = 0.75;

  // 5. Disease Risk Factor
  let diseaseFactor = 1.0;
  if (diseaseRiskPercentage > 60) diseaseFactor = 0.70;
  else if (diseaseRiskPercentage > 30) diseaseFactor = 0.85;

  // 6. Clamp cumulative multipliers
  const environmentalMultiplier = sowingFactor * weatherFactor * soilFactor * diseaseFactor;
  const clampedMultiplier = Math.max(0.60, environmentalMultiplier);

  const expectedYield = baseYield * clampedMultiplier;
  const minYield = Math.round(expectedYield * 0.92);
  const maxYield = Math.round(expectedYield * 1.08);

  // Confidence explanation
  let confidenceNote = '';
  if (isUrdu) {
    confidenceNote = 'سازگار حالات کی پیش گوئی، پیداوار مستحکم رہنے کی امید ہے۔';
    if (clampedMultiplier === 0.60) {
      confidenceNote = 'شدید ماحولیاتی دباؤ (مٹی/گرمی/بیماری) کا پتہ چلا ہے۔ پیداوار کا تخمینہ بقا کی سطح پر محدود کیا گیا ہے۔';
    } else if (diseaseRiskPercentage > 50) {
      confidenceNote = 'بیماری کے فعال خطرے کے سبب پیداوار کے تخمینے میں کمی کی گئی ہے۔';
    } else if (weatherFactor < 1.0) {
      confidenceNote = 'شدید گرمی یا خشکی کے سبب پیداوار کے تخمینے پر اثر پڑا ہے۔';
    } else if (sowingFactor < 1.0) {
      confidenceNote = 'فصل کی تاخیر سے کاشت کی وجہ سے پیداواری صلاحیت متاثر ہوئی ہے۔';
    } else if (soil === 'sandy') {
      confidenceNote = 'ریتیلی مٹی میں پانی بہہ جانے کی وجہ سے پیداواری گنجائش متاثر ہے۔';
    }
  } else {
    confidenceNote = 'Optimal conditions forecast normal yield output.';
    if (clampedMultiplier === 0.60) {
      confidenceNote = 'Severe compound stress (soil/disease/heat) detected. Yield clamped to critical survival floor.';
    } else if (diseaseRiskPercentage > 50) {
      confidenceNote = 'Yield forecast lowered due to active high disease risk concerns.';
    } else if (weatherFactor < 1.0) {
      confidenceNote = 'Yield forecast affected by active heatwave/drought stress forecast.';
    } else if (sowingFactor < 1.0) {
      confidenceNote = 'Yield potential restricted by late crop sowing timeframe.';
    } else if (soil === 'sandy') {
      confidenceNote = 'Yield potential constrained by high water runoff in sandy soil.';
    }
  }

  return {
    expectedYield: Math.round(expectedYield),
    minYield,
    maxYield,
    sowingFactor,
    weatherFactor,
    soilFactor,
    diseaseFactor,
    confidenceNote
  };
}
