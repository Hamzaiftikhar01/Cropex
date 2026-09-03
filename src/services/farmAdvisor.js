import { calculateDiseaseRisk, calculateIrrigation, calculateYieldForecast, getGrowthStage } from '../utils/agriRules';
import { translations } from '../locales/translations';

/**
 * Executes Layer 1 (Deterministic Priority Ladder) of the Farm Advisor.
 * Returns structured translation keys and parameters.
 * 
 * @DataContract
 * @param {object} fieldProfile - The user's active profile containing cropType, soilType, sowingDate
 * @param {object} weatherData - Open-Meteo payload containing { daily: [...], current: {...} }
 * @returns {object} { priority: string, urgency: string, headlineKey: string, reasoningKey: string, reasoningData: object, secondaryNotes: array }
 * @fallback If the LLM rephraser endpoint (Layer 2) times out or fails, the UI natively renders the headlineKey and reasoningKey via local translations, ensuring the verdict is never dropped.
 */
export function getDeterministicAdvice(fieldProfile, weatherData, language = 'en') {
  // 1. Calculate inputs from all modules
  const riskInfo = calculateDiseaseRisk(fieldProfile.cropType, weatherData, language);
  const irrInfo = calculateIrrigation(
    fieldProfile.cropType,
    fieldProfile.soilType,
    fieldProfile.sowingDate,
    fieldProfile.lastIrrigatedDaysAgo ?? 3,
    weatherData,
    language
  );
  const yieldInfo = calculateYieldForecast(
    fieldProfile.cropType,
    fieldProfile.soilType,
    fieldProfile.sowingDate,
    weatherData,
    riskInfo.percentage,
    language
  );

  const { stage } = getGrowthStage(fieldProfile.cropType, fieldProfile.sowingDate, language);

  // Extract weather factors
  const daily = weatherData?.daily || [];
  const maxTemp = daily.length > 0 ? Math.max(...daily.map(d => d.tempMax)) : 25;
  const minTemp = daily.length > 0 ? Math.min(...daily.map(d => d.tempMin)) : 15;
  const avgTemp = daily.length > 0 ? Math.round(daily.map(d => (d.tempMin + d.tempMax) / 2).reduce((a, b) => a + b, 0) / daily.length) : 20;
  const avgHumid = daily.length > 0 ? Math.round(daily.map(d => d.humidityAvg || 50).reduce((a, b) => a + b, 0) / daily.length) : 50;

  const heavyRainDay = daily.find(d => d.precipitationProb > 70 && d.precipitationSum > 10);

  // Initialize output fields
  let priority = 'status';
  let headlineKey = '';
  let reasoningKey = '';
  let reasoningData = {};
  let urgency = 'low';

  // ===========================================================================
  // EVALUATION LADDER (Top-Down, first match wins)
  // ===========================================================================

  // 1. Disease Risk >= 70%
  if (riskInfo.percentage >= 70) {
    priority = 'disease';
    urgency = 'high';
    headlineKey = 'adv_disease_headline';
    reasoningKey = 'adv_disease_reasoning';
    reasoningData = {
      temp: avgTemp,
      humidity: avgHumid,
      percentage: riskInfo.percentage,
      disease: riskInfo.diseaseName
    };
  }
  // 2. Irrigation Status = "Irrigate Now"
  else if (irrInfo.recommendation === 'Irrigate Now') {
    priority = 'irrigation';
    urgency = 'high';
    headlineKey = 'adv_irrigation_headline';
    reasoningKey = 'adv_irrigation_reasoning';
    reasoningData = {
      soilKey: 'soil_' + fieldProfile.soilType.toLowerCase(),
      days: fieldProfile.lastIrrigatedDaysAgo ?? 3,
      stage
    };
  }
  // 3. Active Weather Alerts
  else if (maxTemp >= 40 || minTemp <= 4 || heavyRainDay) {
    priority = 'weather';
    urgency = 'medium';

    if (maxTemp >= 40) {
      headlineKey = 'adv_heatwave_headline';
      reasoningKey = 'adv_heatwave_reasoning';
      reasoningData = { temp: maxTemp };
    } else if (minTemp <= 4) {
      headlineKey = 'adv_frost_headline';
      reasoningKey = 'adv_frost_reasoning';
      reasoningData = { temp: minTemp };
    } else {
      const rainVol = heavyRainDay.precipitationSum || 10;
      headlineKey = 'adv_rain_headline';
      reasoningKey = 'adv_rain_reasoning';
      reasoningData = { rain: rainVol.toFixed(1) };
    }
  }
  // 4. Default / Status-led
  else {
    priority = 'status';
    urgency = 'low';
    headlineKey = 'adv_status_headline';
    reasoningKey = 'adv_status_reasoning';
    reasoningData = {
      percentage: riskInfo.percentage,
      min: yieldInfo.minYield,
      max: yieldInfo.maxYield
    };
  }

  // ===========================================================================
  // COMPILING SECONDARY SIGNALS (Traceability)
  // ===========================================================================
  const secondaryNotes = [];
  
  // Weather Signal
  secondaryNotes.push({
    key: 'adv_sec_weather',
    data: { temp: weatherData.current.temp, humidity: weatherData.current.humidity }
  });

  // Disease Signal
  secondaryNotes.push({
    key: 'adv_sec_disease',
    data: { 
      disease: riskInfo.diseaseName, 
      level: riskInfo.riskLevel, // E.g. 'High' / 'Low' / 'Medium'
      percentage: riskInfo.percentage 
    }
  });

  // Irrigation Signal
  secondaryNotes.push({
    key: 'adv_sec_irrigation',
    data: { 
      soilKey: 'soil_' + fieldProfile.soilType.toLowerCase(), 
      days: fieldProfile.lastIrrigatedDaysAgo ?? 3, 
      verdict: irrInfo.recommendation 
    }
  });

  // Yield Signal
  secondaryNotes.push({
    key: 'adv_sec_yield',
    data: { 
      yield: yieldInfo.expectedYield, 
      min: yieldInfo.minYield, 
      max: yieldInfo.maxYield 
    }
  });

  // Resolve translation keys to actual text for LLM rephraser
  const dict = translations[language] || translations.en;
  const resolveKey = (key, data) => {
    let text = dict[key] || key;
    if (data) {
      Object.keys(data).forEach((k) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), data[k]);
      });
    }
    return text;
  };

  const headline = resolveKey(headlineKey, reasoningData);
  const reasoning = resolveKey(reasoningKey, reasoningData);

  return {
    priority,
    urgency,
    headlineKey,
    reasoningKey,
    reasoningData,
    headline,
    reasoning,
    secondaryNotes,
    language
  };
}

/**
 * Layer 2 Completion: Calls the secure serverless rephraser endpoint with client-side timeout fallback
 */
export async function getRephrasedAdvice(deterministicAdvice, language = 'en') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500); // Strict 2.5 second timeout

  try {
    // Use pre-resolved translated text for LLM to rephrase
    const rawHeadline = deterministicAdvice.headline;
    const rawReasoning = deterministicAdvice.reasoning;

    const response = await fetch('/api/rephrase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        priority: deterministicAdvice.priority,
        headline: rawHeadline,
        reasoning: rawReasoning,
        language
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    if (data.headline && data.reasoning) {
      console.log('Advisor Source: llm');
      
      // Interpolate any number codes if LLM rephrased them as templates,
      // or if it rephrased literally, we return the parsed script directly.
      let headline = data.headline;
      let reasoning = data.reasoning;

      // Replace placeholders in LLM responses if they exist
      if (deterministicAdvice.reasoningData) {
        Object.keys(deterministicAdvice.reasoningData).forEach((key) => {
          const replacement = deterministicAdvice.reasoningData[key];
          headline = headline.replace(new RegExp(`{${key}}`, 'g'), replacement);
          reasoning = reasoning.replace(new RegExp(`{${key}}`, 'g'), replacement);
        });
      }

      return {
        ...deterministicAdvice,
        headline,
        reasoning,
        source: 'llm'
      };
    }
    throw new Error('Malformed JSON response from rephraser');
  } catch (err) {
    clearTimeout(timeoutId);
    console.log('Advisor Source: fallback (Layer 1 deterministic rules)', err.message);
    return {
      ...deterministicAdvice,
      source: 'fallback'
    };
  }
}
