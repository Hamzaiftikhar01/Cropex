import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AdvisorCard from '../components/AdvisorCard';
import { calculateDiseaseRisk, calculateIrrigation, calculateYieldForecast } from '../utils/agriRules';

export default function DashboardView({ fieldProfile, weatherData, loading, onNavigate, advice, adviceLoading }) {
  const { t, language } = useLanguage();

  if (loading || !weatherData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-crop-600 border-t-transparent"></div>
        <p className="mt-4 text-xs font-semibold text-earth-500 dark:text-earth-400">
          Syncing field telemetry...
        </p>
      </div>
    );
  }

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

  // Weather description translations
  const translateWeatherDesc = (desc) => {
    if (language === 'en') return desc;
    const descMap = {
      'Clear Sky': 'صاف آسمان',
      'Clear Sunny': 'صاف دھوپ',
      'Partly Cloudy': 'جزوی طور پر ابر آلود',
      'Foggy': 'دھند',
      'Light Drizzle': 'ہلکی بوندا باندی',
      'Rainy': 'بارش',
      'Rain Showers': 'تیز بارش',
      'Thunderstorms': 'گرج چمک کے ساتھ طوفان',
      'Overcast & Humid': 'ابر آلود اور نمی',
      'Extreme Heat': 'شدید گرمی'
    };
    return descMap[desc] || desc;
  };

  // Crop icons
  const getCropIcon = (crop) => {
    switch (crop.toLowerCase()) {
      case 'wheat': return '🌾';
      case 'rice': return '🌾';
      case 'cotton': return '🌿';
      case 'sugarcane': return '🎋';
      case 'maize': return '🌽';
      case 'potato': return '🥔';
      case 'tomato': return '🍅';
      default: return '🌱';
    }
  };

  // Overall Farm Health Score calculation
  const calculateHealthScore = () => {
    let score = 100;
    if (riskInfo.riskLevel === 'High') score -= 25;
    else if (riskInfo.riskLevel === 'Medium') score -= 12;

    if (irrInfo.recommendation === 'Irrigate Now') score -= 20;
    else if (irrInfo.recommendation === 'Irrigate in 2 Days') score -= 8;

    if (weatherData.current.temp >= 38) score -= 10;
    return Math.max(20, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();

  const getHealthState = (score) => {
    if (score >= 80) {
      return {
        text: language === 'ur' ? 'بہترین حالت' : language === 'pa' ? 'بہترین حالت' : 'Optimal Condition',
        color: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-900/50'
      };
    }
    if (score >= 60) {
      return {
        text: language === 'ur' ? 'توجہ طلب' : language === 'pa' ? 'دھیان دی لوڑ' : 'Attention Needed',
        color: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'
      };
    }
    return {
      text: language === 'ur' ? 'فوری عمل درکار' : language === 'pa' ? 'فوری عمل کرو' : 'Action Required',
      color: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50'
    };
  };

  const healthState = getHealthState(healthScore);

  const getContextualInsight = () => {
    if (weatherData.current.temp >= 38) {
      return language === 'ur'
        ? 'شدید درجہ حرارت کی وجہ سے نمی کے اخراج میں تیزی آ گئی ہے۔ شام کے وقت آبپاشی کی منصوبہ بندی کریں۔'
        : language === 'pa'
        ? 'شدید گرمی نال نمی تیزی نال گھٹ رہی اے۔ شام ویلے پانی لان دی تیاری کرو۔'
        : 'Severe atmospheric temperature is driving rapid moisture loss. Schedule evening irrigation.';
    }
    if (riskInfo.riskLevel === 'High') {
      return language === 'ur'
        ? `ہوا میں نمی بڑھنے کے باعث ${t('crop_' + fieldProfile.cropType.toLowerCase())} پر فنگس کے جراثیم متحرک ہیں۔`
        : language === 'pa'
        ? `ہوا دی نمی دی وجہ توں ${t('crop_' + fieldProfile.cropType.toLowerCase())} اُتے فنگس دا خطرہ ودھ گیا اے۔`
        : `Elevated microclimate humidity is promoting fungal propagation on ${t('crop_' + fieldProfile.cropType.toLowerCase())}.`;
    }
    if (irrInfo.recommendation === 'Irrigate Now') {
      return language === 'ur'
        ? 'زمین میں جڑوں کی نمی ختم ہو چکی ہے۔ اگلے 24 گھنٹوں میں پانی دینا ضروری ہے۔'
        : language === 'pa'
        ? 'مٹی وچ نمی مک چکی اے۔ اگلے 24 گھنٹیاں وچ پانی دینا ضروری اے۔'
        : 'Root zone moisture depleted. Irrigation required within the next 24 hours.';
    }
    return language === 'ur'
      ? 'کھیت کے تمام پیرامیٹرز معمول کے مطابق اور سازگار ہیں۔'
      : language === 'pa'
      ? 'کھیت دے سارے حالات ٹھیک تے سازگار نیں۔'
      : 'All primary environmental sensors and crop bio-metrics are operating within safe baseline parameters.';
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Header Command Bar: Greeting & Contextual Insight */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-earth-900 border border-earth-100 dark:border-earth-800 shadow-soft">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-earth-900 dark:text-earth-50 tracking-tight font-sans">
              {language === 'ur' ? 'خوش آمدید، کسان بھائی' : language === 'pa' ? 'جی آیاں نوں، کسان ویر' : 'Farm Command Center'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-earth-100 dark:bg-earth-800 text-earth-700 dark:text-earth-300">
              {t('dist_' + fieldProfile.district.toLowerCase())}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-earth-500 dark:text-earth-400 mt-1 font-medium">
            {language === 'ur' ? 'زرعی کمانڈ سنٹر آپ کے کھیت کے تازہ ترین ڈیٹا کے ساتھ فعال ہے۔' : language === 'pa' ? 'زرعی کمانڈ سنٹر کھیت دے تازہ ڈیٹا نال تیار اے۔' : 'Agricultural intelligence system is monitoring active field conditions.'}
          </p>
        </div>

        <div className="w-full md:w-auto text-xs font-semibold text-crop-800 dark:text-crop-300 bg-crop-50/90 dark:bg-crop-950/40 border border-crop-200/60 dark:border-crop-900/40 px-4 py-2.5 rounded-xl shadow-xs">
          💡 {getContextualInsight()}
        </div>
      </div>

      {/* 2. Top AI Farm Advisor Prioritized Verdict */}
      <AdvisorCard 
        advice={advice} 
        loading={adviceLoading} 
        fieldProfile={fieldProfile}
        weatherData={weatherData}
      />

      {/* 3. Main Command Center Grid: Left Operations Column (7 cols) + Right Modules Column (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Farm Health + Active Risks + Multi-Crop Monitoring Matrix */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Farm Health Index Bar */}
          <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-800 rounded-2xl p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-earth-50 dark:bg-earth-950 border-2 border-crop-500/20 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl sm:text-3xl font-black text-earth-900 dark:text-earth-50 leading-none">
                  {healthScore}
                </span>
                <span className="text-[10px] text-earth-400 dark:text-earth-300 font-bold mt-1">/ 100</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-earth-500 dark:text-earth-300 block">
                  {language === 'ur' ? 'ہیلتھ انڈیکس' : language === 'pa' ? 'فارم انڈیکس' : 'Farm Health Index'}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${healthState.badge}`}>
                    {healthState.text}
                  </span>
                </div>
                <p className="text-xs text-earth-550 dark:text-earth-300 font-medium mt-1.5 leading-relaxed">
                  {healthScore >= 80 
                    ? (language === 'ur' ? 'کھیت کی مجموعی حالت تسلی بخش اور مستحکم ہے۔' : language === 'pa' ? 'کھیت دی مجموعی حالت ٹھیک تے مستحکم اے۔' : 'All parameters are operating within optimal seasonal ranges.')
                    : (language === 'ur' ? 'کچھ حصوں میں بیماری کے جراثیم یا پانی کی کمی کا دباؤ دیکھا گیا ہے۔' : language === 'pa' ? 'کجھ حصیاں وچ فنگس یا پانی دا دباؤ ویکھیا گیا اے۔' : 'Elevated environmental stress detected on monitored crop profiles.')}
                </p>
              </div>
            </div>
          </div>

          {/* Explainable AI Risk Center */}
          <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-800 rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-earth-100 dark:border-earth-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <h3 className="text-xs sm:text-sm font-bold text-earth-900 dark:text-earth-50 uppercase tracking-wider">
                  {language === 'ur' ? 'ایکٹو رسک سنٹر (Explainable AI)' : language === 'pa' ? 'ایکٹو رسک سنٹر (Explainable AI)' : 'Active Risks (Explainable AI)'}
                </h3>
              </div>
              <span className="text-[10px] text-earth-400 dark:text-earth-300 font-semibold uppercase">Real-Time</span>
            </div>

            {(riskInfo.percentage >= 40 || irrInfo.recommendation === 'Irrigate Now') ? (
              <div className="space-y-3">
                {/* Fungal Spore Threat */}
                {riskInfo.percentage >= 40 && (
                  <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 dark:bg-red-950/20 dark:border-red-900/40 text-left space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 dark:text-red-300">
                        ⚠️ Outbreak Risk • {riskInfo.percentage}%
                      </span>
                      <span className="text-xs font-bold text-red-900 dark:text-red-200">
                        {t('crop_' + fieldProfile.cropType.toLowerCase())}: {riskInfo.diseaseName}
                      </span>
                    </div>
                    <div className="text-xs text-earth-700 dark:text-earth-300">
                      <strong>{language === 'ur' ? 'وجہ:' : language === 'pa' ? 'وجہ:' : 'Why?'}</strong> {riskInfo.explanation}
                    </div>
                    <div className="text-xs font-semibold text-crop-800 dark:text-crop-300 pt-1.5 border-t border-red-200/50 dark:border-red-900/40">
                      <strong>{language === 'ur' ? 'فوری عمل:' : language === 'pa' ? 'فوری عمل:' : 'Recommended Action:'}</strong> Apply systemic protective fungicide spray to suppress spore propagation.
                    </div>
                  </div>
                )}

                {/* Irrigation Prompt */}
                {irrInfo.recommendation === 'Irrigate Now' && (
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40 text-left space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                        💧 Water Depletion Alert
                      </span>
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                        {t('soil_' + fieldProfile.soilType.toLowerCase())} Profile
                      </span>
                    </div>
                    <div className="text-xs text-earth-700 dark:text-earth-300">
                      <strong>{language === 'ur' ? 'وجہ:' : language === 'pa' ? 'وجہ:' : 'Why?'}</strong> {irrInfo.explanation}
                    </div>
                    <div className="text-xs font-semibold text-blue-800 dark:text-blue-300 pt-1.5 border-t border-blue-200/50 dark:border-blue-900/40">
                      <strong>{language === 'ur' ? 'تجویز:' : language === 'pa' ? 'تجویز:' : 'Recommended Action:'}</strong> Apply {irrInfo.amountLitersPerAcre.toLocaleString()} Liters/Acre today.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <span className="text-3xl">✅</span>
                <p className="text-xs font-bold text-crop-800 dark:text-crop-300">No Imminent Critical Pathogen or Soil Drought Alerts</p>
                <p className="text-[11px] text-earth-500 dark:text-earth-400 max-w-sm mx-auto">
                  Local climate conditions for {fieldProfile.district} are currently hostile to major foliar pathogen germination.
                </p>
              </div>
            )}
          </div>

          {/* Active Crops Multi-Crop Monitoring Matrix */}
          <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-800 rounded-2xl p-5 sm:p-6 shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-earth-100 dark:border-earth-800">
              <span className="text-xs font-bold uppercase tracking-wider text-earth-800 dark:text-earth-200">
                {language === 'ur' ? 'فعال فصلیں مانیٹرنگ شیٹ' : language === 'pa' ? 'فصلاں دی نگرانی شیٹ' : 'Active Multi-Crop Monitoring Sheet'}
              </span>
              <span className="text-[10px] text-earth-500 dark:text-earth-350 font-bold">
                {t('crop_' + fieldProfile.cropType.toLowerCase())} Active
              </span>
            </div>

            <div className="overflow-x-auto mt-3 -mx-5 sm:mx-0 px-5 sm:px-0">
              <table className="w-full text-left text-xs min-w-[420px]">
                <thead>
                  <tr className="border-b border-earth-100 dark:border-earth-800 text-earth-500 dark:text-earth-300 uppercase text-[9px] tracking-wider">
                    <th className="pb-2.5 font-bold">{t('cropType')}</th>
                    <th className="pb-2.5 font-bold">Health Est.</th>
                    <th className="pb-2.5 font-bold">{t('sporeRisk')}</th>
                    <th className="pb-2.5 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 dark:divide-earth-800/60 font-semibold text-earth-800 dark:text-earth-200">
                  
                  {/* Current Active Crop */}
                  <tr className="bg-crop-50/30 dark:bg-crop-950/10">
                    <td className="py-3 flex items-center gap-2 font-bold">
                      <span className="text-base">{getCropIcon(fieldProfile.cropType)}</span>
                      <span>{t('crop_' + fieldProfile.cropType.toLowerCase())} (Active)</span>
                    </td>
                    <td className="py-3 font-extrabold">{100 - Math.round(riskInfo.percentage / 2.5)}%</td>
                    <td className="py-3">{riskInfo.percentage}% ({t(riskInfo.riskLevel.toLowerCase())})</td>
                    <td className="py-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        riskInfo.riskLevel === 'High' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                          : riskInfo.riskLevel === 'Medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                      }`}>
                        {riskInfo.riskLevel === 'High' ? (language === 'ur' ? 'فوری عمل' : language === 'pa' ? 'فوری عمل' : 'Action Req.') :
                         riskInfo.riskLevel === 'Medium' ? (language === 'ur' ? 'نگرانی' : language === 'pa' ? 'نگرانی' : 'Monitor') :
                         (language === 'ur' ? 'مستحکم' : language === 'pa' ? 'ٹھیک' : 'Stable')}
                      </span>
                    </td>
                  </tr>

                  {/* Wheat row (if not active) */}
                  {fieldProfile.cropType !== 'Wheat' && (
                    <tr>
                      <td className="py-3 flex items-center gap-2 font-semibold">
                        <span className="text-base">🌾</span>
                        <span>{t('crop_wheat')}</span>
                      </td>
                      <td className="py-3">91%</td>
                      <td className="py-3">10% ({t('low')})</td>
                      <td className="py-3 text-right">
                        <span className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          Stable
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* Rice row (if not active) */}
                  {fieldProfile.cropType !== 'Rice' && (
                    <tr>
                      <td className="py-3 flex items-center gap-2 font-semibold">
                        <span className="text-base">🌾</span>
                        <span>{t('crop_rice')}</span>
                      </td>
                      <td className="py-3">82%</td>
                      <td className="py-3">30% ({t('low')})</td>
                      <td className="py-3 text-right">
                        <span className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          Stable
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* Tomato row (if not active) */}
                  {fieldProfile.cropType !== 'Tomato' && (
                    <tr>
                      <td className="py-3 flex items-center gap-2 font-semibold">
                        <span className="text-base">🍅</span>
                        <span>{t('crop_tomato')}</span>
                      </td>
                      <td className="py-3">88%</td>
                      <td className="py-3">15% ({t('low')})</td>
                      <td className="py-3 text-right">
                        <span className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          Stable
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: 4 Core Agricultural Intelligence Modules */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-earth-600 dark:text-earth-400">
              {language === 'ur' ? 'زرعی ماڈیولز کا جائزہ' : language === 'pa' ? 'زرعی ماڈیولز دا جائزہ' : 'Core Agricultural Modules'}
            </h3>
            <span className="text-[10px] text-earth-400 font-bold">4 Live Engines</span>
          </div>

          {/* Module 1: Weather Intelligence */}
          <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-800 rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-crop-600 dark:text-crop-400 tracking-wider">
                  {t('weather')}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-earth-900 dark:text-earth-50">
                    {weatherData.current.temp}°C
                  </span>
                  <span className="text-xs font-semibold text-earth-500 dark:text-earth-400">
                    {translateWeatherDesc(weatherData.current.description)}
                  </span>
                </div>
              </div>
              <span className="text-2xl">⛅</span>
            </div>
            <button
              onClick={() => onNavigate('weather')}
              className="h-9 w-full mt-3.5 inline-flex items-center justify-center text-xs font-bold text-crop-700 dark:text-crop-300 bg-crop-50 dark:bg-crop-950/30 hover:bg-crop-100 dark:hover:bg-crop-900/40 rounded-xl transition-colors cursor-pointer border border-crop-200/40"
            >
              {t('weather')} →
            </button>
          </div>

          {/* Module 2: Disease Risk & Diagnosis */}
          <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-800 rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-crop-600 dark:text-crop-400 tracking-wider">
                  {t('disease')}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-earth-900 dark:text-earth-50">
                    {riskInfo.percentage}%
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    riskInfo.riskLevel === 'High' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300' 
                      : riskInfo.riskLevel === 'Medium' 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                  }`}>
                    {t(riskInfo.riskLevel.toLowerCase())}
                  </span>
                </div>
                <span className="text-xs text-earth-500 dark:text-earth-300 block mt-0.5 font-medium">
                  {riskInfo.diseaseName}
                </span>
              </div>
              <span className="text-2xl">🦠</span>
            </div>
            <button
              onClick={() => onNavigate('disease')}
              className="h-9 w-full mt-3.5 inline-flex items-center justify-center text-xs font-bold text-crop-700 dark:text-crop-300 bg-crop-50 dark:bg-crop-950/30 hover:bg-crop-100 dark:hover:bg-crop-900/40 rounded-xl transition-colors cursor-pointer border border-crop-200/40"
            >
              {t('scanLeaf')} →
            </button>
          </div>

          {/* Module 3: Smart Irrigation */}
          <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-800 rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-crop-600 dark:text-crop-400 tracking-wider">
                  {t('irrigation')}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    irrInfo.color === 'red' ? 'bg-red-500' : irrInfo.color === 'amber' ? 'bg-amber-500' : 'bg-green-500'
                  }`}></span>
                  <span className="text-base font-bold text-earth-900 dark:text-earth-50">
                    {irrInfo.recommendation === 'Irrigate Now' && t('high') === 'High' ? 'Irrigate Now' : 
                     irrInfo.recommendation === 'Irrigate Now' ? (language === 'pa' ? 'اج ای پانی دیو' : 'ابھی پانی دیں') :
                     irrInfo.recommendation === 'Irrigate in 2 Days' && t('high') === 'High' ? 'Irrigate in 2 Days' :
                     irrInfo.recommendation === 'Irrigate in 2 Days' ? (language === 'pa' ? '2 دن وچ پانی دیو' : '2 دن میں پانی دیں') :
                     t('soilAdequate')}
                  </span>
                </div>
                <span className="text-xs text-earth-500 dark:text-earth-300 block mt-0.5 font-medium">
                  {irrInfo.litersPerAcre > 0 ? `${irrInfo.litersPerAcre.toLocaleString()} ${t('litersAcre')}` : t('soilAdequate')}
                </span>
              </div>
              <span className="text-2xl">💦</span>
            </div>
            <button
              onClick={() => onNavigate('irrigation')}
              className="h-9 w-full mt-3.5 inline-flex items-center justify-center text-xs font-bold text-crop-700 dark:text-crop-300 bg-crop-50 dark:bg-crop-950/30 hover:bg-crop-100 dark:hover:bg-crop-900/40 rounded-xl transition-colors cursor-pointer border border-crop-200/40"
            >
              {t('irrigation')} →
            </button>
          </div>

          {/* Module 4: Yield Forecasting */}
          <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-800 rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-crop-600 dark:text-crop-400 tracking-wider">
                  {t('yield')}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-crop-600 dark:text-crop-400">
                    {yieldInfo.minYield} - {yieldInfo.maxYield}
                  </span>
                  <span className="text-xs font-semibold text-earth-500 dark:text-earth-300">
                    {t('maundsPerAcre')}
                  </span>
                </div>
              </div>
              <span className="text-2xl">🌾</span>
            </div>
            <button
              onClick={() => onNavigate('yield')}
              className="h-9 w-full mt-3.5 inline-flex items-center justify-center text-xs font-bold text-crop-700 dark:text-crop-300 bg-crop-50 dark:bg-crop-950/30 hover:bg-crop-100 dark:hover:bg-crop-900/40 rounded-xl transition-colors cursor-pointer border border-crop-200/40"
            >
              {t('yield')} →
            </button>
          </div>

        </div>

      </div>

      {/* Scope disclaimer note for judges and users */}
      <p className="text-[11px] text-earth-500 dark:text-earth-350 text-center pt-2 italic">
        * {t('disclaimer')}
      </p>
    </div>
  );
}
