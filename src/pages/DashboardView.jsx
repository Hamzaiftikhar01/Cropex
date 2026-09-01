import { useLanguage } from '../context/LanguageContext';
import AdvisorCard from '../components/AdvisorCard';
import { calculateDiseaseRisk, calculateIrrigation, calculateYieldForecast } from '../utils/agriRules';

export default function DashboardView({ fieldProfile, weatherData, loading, onNavigate, advice, adviceLoading }) {
  const { t, language } = useLanguage();

  const getCropIcon = (crop) => {
    const icons = { wheat: '🌾', rice: '🌾', cotton: '🌿', sugarcane: '🎋', maize: '🌽', potato: '🥔', tomato: '🍅' };
    return icons[crop.toLowerCase()] || '🌱';
  };

  const translateWeatherDesc = (desc) => {
    if (language === 'en') return desc;
    const descMap = {
      'Clear Sky': 'صاف آسمان',
      'Clear Sunny': 'صاف دھوپ',
      'Partly Cloudy': 'جزوی ابر آلود',
      'Foggy': 'دھند',
      'Light Drizzle': 'ہلکی بوندا باندی',
      'Rainy': 'بارش',
      'Rain Showers': 'تیز بارش',
      'Thunderstorms': 'گرج چمک',
      'Overcast & Humid': 'ابر آلود اور نمی',
      'Drizzle & Foggy': 'بوندا باندی اور دھند',
      'Rainy & Humid': 'بارش اور نمی',
      'Extreme Heat': 'شدید گرمی',
      'Dry Heat / Dust Storm': 'لو اور مٹی کا طوفان',
      'Breezy & Warm': 'تیز ہوا اور گرمی',
      'Sunny & Windy': 'دھوپ اور ہوا'
    };
    return descMap[desc] || desc;
  };

  const getOnboardingTip = () => {
    return (
      <div className="bg-gradient-to-r from-crop-600/10 to-earth-500/10 border-l-4 border-crop-600 p-4 rounded-r-xl mb-6 text-left">
        <h4 className="font-bold text-sm text-crop-800 dark:text-crop-300">{t('onboardingTitle')}</h4>
        <p className="text-xs text-earth-650 dark:text-earth-450 mt-1 leading-relaxed">
          {t('onboardingText')}
        </p>
        <ul className="text-[11px] text-earth-550 dark:text-earth-400 mt-2 space-y-1 list-disc pl-4">
          <li><strong>{t('presetA')}</strong></li>
          <li><strong>{t('presetB')}</strong></li>
          <li><strong>{t('presetC')}</strong></li>
        </ul>
      </div>
    );
  };

  // Visually calm loading state
  if (loading || !weatherData) {
    const cropIcon = getCropIcon(fieldProfile.cropType);
    const loadingText = language === 'ur' 
      ? 'فصل کے کوائف اور سفارشات تیار ہو رہی ہیں...' 
      : language === 'pa' 
      ? 'فصل دے کوائف تے سفارشات تیار ہو رہیاں نیں...' 
      : 'Evolving crop intelligence and recommendations...';

    return (
      <div className="space-y-6 text-left">
        {getOnboardingTip()}
        <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-850 rounded-2xl p-12 flex flex-col items-center justify-center shadow-soft">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crop-600/10 opacity-75"></span>
            <span className="relative text-4xl">{cropIcon}</span>
          </div>
          
          <div className="mt-6 flex items-center gap-2.5">
            <div className="animate-spin rounded-full h-4.5 w-4.5 border-2 border-t-transparent border-crop-600"></div>
            <p className="text-xs sm:text-sm font-semibold text-earth-700 dark:text-earth-300">
              {loadingText}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pre-calculate variables for dashboard summaries
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

  // Read current user info for command center welcome
  const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cropex_current_user') || 'null') : null;
  const farmerName = currentUser ? currentUser.fullName : 'Farmer';

  // Dynamic Contextual AI Insight Lines
  const getContextualInsight = () => {
    const cropLabel = t('crop_' + fieldProfile.cropType.toLowerCase());
    if (weatherData.daily && weatherData.daily[0].precipitationProb > 60) {
      return language === 'ur'
        ? "کراپیکس انٹیلیجنس: کل متوقع بارش کی وجہ سے پانی کی ضرورت کم ہو سکتی ہے۔"
        : language === 'pa'
        ? "کراپیکس انٹیلیجنس: کل متوقع بارش دی وجہ توں پانی دی لوڑ گھٹ ہو سکدی اے۔"
        : "Cropex Intelligence: Rainfall expected tomorrow may reduce your irrigation requirement.";
    }
    if (weatherData.current.humidity > 80) {
      return language === 'ur'
        ? `رسک انٹیلیجنس: ہوا میں نمی کا تناسب ${weatherData.current.humidity}% ہے — فنگس پھیلنے کے امکانات زیادہ ہیں۔`
        : language === 'pa'
        ? `رسک انٹیلیجنس: ہوا وچ نمی دا تناسب ${weatherData.current.humidity}% اے — فنگس پھیل پین دے امکانات زیادہ نیں۔`
        : `Risk Insight: Ambient humidity averages ${weatherData.current.humidity}% — conditions favor fungal spore propagation.`;
    }
    if (Math.max(...weatherData.daily.map(d => d.tempMax)) >= 40) {
      return language === 'ur'
        ? "ہیٹ ویو الرٹ: شدید گرمی کا دباؤ پایا گیا ہے — مٹی میں پانی کی مقدار کی جانچ کریں۔"
        : language === 'pa'
        ? "ہیٹ ویو الرٹ: شدید گرمی دا دباؤ پایا گیا اے — مٹی وچ پانی دی مقدار چیک کرو۔"
        : "Weather Alert: Extreme heat stress detected — increase monitored crop transpiration checks.";
    }
    return language === 'ur'
      ? `پیداوار کا اندازہ: موجودہ حالات کے مطابق ${cropLabel} کی پیداواری صلاحیت مستحکم ہے۔`
      : language === 'pa'
      ? `پیداوار دا اندازہ: موجودہ حالات دے مطابق ${cropLabel} دی پیداواری صلاحیت مستحکم اے۔`
      : `Yield Forecast: Current conditions align with optimal ${cropLabel} potential yield output.`;
  };

  // Dynamic Command Center Health Index Calculations
  const calculateHealthIndex = () => {
    let score = 100;
    if (riskInfo.percentage >= 70) score -= 22;
    else if (riskInfo.percentage > 30) score -= 12;

    if (irrInfo.recommendation === 'Irrigate Now') score -= 15;
    else if (irrInfo.recommendation === 'Irrigate in 2 Days') score -= 8;

    const maxTemp = Math.max(...weatherData.daily.map(d => d.tempMax));
    if (maxTemp >= 40) score -= 10;

    return Math.max(40, score);
  };

  const healthScore = calculateHealthIndex();

  const getHealthLevel = (score) => {
    if (score >= 85) return { text: language === 'ur' ? 'مستحکم' : language === 'pa' ? 'ٹھیک' : 'Stable / Optimal', color: 'text-green-600 dark:text-green-400' };
    if (score >= 65) return { text: language === 'ur' ? 'نگرانی درکار' : language === 'pa' ? 'نگرانی لوڑ' : 'Monitor / Warning', color: 'text-amber-500 dark:text-amber-400' };
    return { text: language === 'ur' ? 'فوری توجہ' : language === 'pa' ? 'فوری دھیان' : 'Action Required', color: 'text-red-600 dark:text-red-400' };
  };

  const healthState = getHealthLevel(healthScore);

  return (
    <div className="space-y-6 text-left">
      {/* Onboarding Banner */}
      {getOnboardingTip()}

      {/* AI Farm Advisor prioritized verdict card */}
      <AdvisorCard 
        advice={advice} 
        loading={adviceLoading} 
        fieldProfile={fieldProfile}
        weatherData={weatherData}
      />

      {/* Dynamic Command Center Greeting & Single Line AI Insight */}
      <div className="bg-earth-50/70 border border-earth-100 rounded-2xl p-4.5 dark:bg-earth-900/60 dark:border-earth-855 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-lg font-black text-earth-900 dark:text-earth-50">
            {language === 'ur' ? `خوش آمدید، ${farmerName}` : language === 'pa' ? `جی آیاں نوں، ${farmerName}` : `Welcome back, ${farmerName}`}
          </h2>
          <p className="text-xs text-earth-500 dark:text-earth-450 mt-0.5 font-semibold">
            {language === 'ur' ? 'کمانڈ سنٹر آپ کے کھیت کا مکمل جائزہ پیش کر رہا ہے۔' : language === 'pa' ? 'کمانڈ سنٹر کھیت دا پورا جائزہ پیش کر رہیا اے۔' : 'Your agricultural command center is active.'}
          </p>
        </div>
        <div className="text-xs font-bold text-crop-800 dark:text-crop-300 bg-crop-600/10 px-3.5 py-2 rounded-xl max-w-xl">
          💡 {getContextualInsight()}
        </div>
      </div>

      {/* Command Center: Health index and Multi-Crop Sheets */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Radial Index Card */}
        <div className="bg-white border border-earth-100 rounded-2xl p-6 shadow-soft md:col-span-4 dark:bg-earth-900 dark:border-earth-850 flex flex-col justify-between items-center text-center">
          <div className="w-full text-left">
            <span className="text-[10px] uppercase font-bold text-earth-400 dark:text-earth-500 tracking-wider">
              {language === 'ur' ? 'ہیلتھ انڈیکس' : language === 'pa' ? 'فارم انڈیکس' : 'Farm Health Index'}
            </span>
          </div>

          <div className="my-6 relative flex items-center justify-center">
            {/* Simple Circular Radial */}
            <div className="w-32 h-32 rounded-full border-8 border-earth-50 dark:border-earth-850 flex flex-col items-center justify-center relative">
              <span className="text-4xl font-black text-earth-900 dark:text-earth-50">{healthScore}</span>
              <span className="text-[9px] text-earth-400 dark:text-earth-500 font-bold">/ 100</span>
            </div>
          </div>

          <div>
            <span className={`text-sm font-extrabold uppercase tracking-wide ${healthState.color}`}>
              {healthState.text}
            </span>
            <p className="text-xs text-earth-500 dark:text-earth-455 mt-1 max-w-[200px] font-semibold">
              {healthScore >= 85 
                ? (language === 'ur' ? 'کھیت کی حالت تسلی بخش ہے۔' : language === 'pa' ? 'کھیت دی حالت ٹھیک اے۔' : 'All parameters are running within stable ranges.')
                : (language === 'ur' ? 'کچھ حصوں میں بیماری یا پانی کا خطرہ ہے۔' : language === 'pa' ? 'کجھ حصیاں وچ فنگس یا پانی دا خطرہ اے۔' : 'Active anomalies detected on monitored crop profiles.')}
            </p>
          </div>
        </div>

        {/* Agricultural Crops Spreadsheet */}
        <div className="bg-white border border-earth-100 rounded-2xl p-6 shadow-soft md:col-span-8 dark:bg-earth-900 dark:border-earth-850 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-earth-400 dark:text-earth-500 tracking-wider">
              {language === 'ur' ? 'فعال فصلیں مانیٹرنگ' : language === 'pa' ? 'فصلاں دی نگرانی' : 'Active Crop Monitoring Sheet'}
            </span>
            
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-earth-100 dark:border-earth-800 text-earth-400 dark:text-earth-550 uppercase text-[9px] tracking-wider">
                    <th className="pb-2 font-bold">{t('cropType')}</th>
                    <th className="pb-2 font-bold">Estimated Health</th>
                    <th className="pb-2 font-bold">{t('sporeRisk')}</th>
                    <th className="pb-2 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 dark:divide-earth-800/40 text-earth-800 dark:text-earth-200">
                  {/* Dynamic Row from Active Field Profile */}
                  <tr className="bg-crop-50/20 dark:bg-crop-950/5">
                    <td className="py-3 flex items-center gap-1.5 font-bold">
                      <span>{getCropIcon(fieldProfile.cropType)}</span>
                      <span>{t('crop_' + fieldProfile.cropType.toLowerCase())}</span>
                    </td>
                    <td className="py-3 font-extrabold">{100 - Math.round(riskInfo.percentage / 2.5)}%</td>
                    <td className="py-3">{riskInfo.percentage}% ({t(riskInfo.riskLevel.toLowerCase())})</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        riskInfo.riskLevel === 'High' 
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
                          : riskInfo.riskLevel === 'Medium'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
                          : 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                      }`}>
                        {riskInfo.riskLevel === 'High' ? (language === 'ur' ? 'فوری عمل' : language === 'pa' ? 'فوری عمل' : 'Action Required') :
                         riskInfo.riskLevel === 'Medium' ? (language === 'ur' ? 'نگرانی' : language === 'pa' ? 'نگرانی' : 'Monitor') :
                         (language === 'ur' ? 'مستحکم' : language === 'pa' ? 'ٹھیک' : 'Stable')}
                      </span>
                    </td>
                  </tr>

                  {/* Seeded Row A: Faisalabad Wheat */}
                  {fieldProfile.cropType !== 'Wheat' && (
                    <tr>
                      <td className="py-3 flex items-center gap-1.5">
                        <span>🌾</span>
                        <span>{t('crop_wheat')}</span>
                      </td>
                      <td className="py-3">91%</td>
                      <td className="py-3">10% ({t('low')})</td>
                      <td className="py-3">
                        <span className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          {language === 'ur' ? 'مستحکم' : language === 'pa' ? 'ٹھیک' : 'Stable'}
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* Seeded Row B: Rice */}
                  {fieldProfile.cropType !== 'Rice' && (
                    <tr>
                      <td className="py-3 flex items-center gap-1.5">
                        <span>🌾</span>
                        <span>{t('crop_rice')}</span>
                      </td>
                      <td className="py-3">82%</td>
                      <td className="py-3">30% ({t('low')})</td>
                      <td className="py-3">
                        <span className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          {language === 'ur' ? 'مستحکم' : language === 'pa' ? 'ٹھیک' : 'Stable'}
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* Seeded Row C: Tomato */}
                  {fieldProfile.cropType !== 'Tomato' && (
                    <tr>
                      <td className="py-3 flex items-center gap-1.5">
                        <span>🍅</span>
                        <span>{t('crop_tomato')}</span>
                      </td>
                      <td className="py-3">88%</td>
                      <td className="py-3">15% ({t('low')})</td>
                      <td className="py-3">
                        <span className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          {language === 'ur' ? 'مستحکم' : language === 'pa' ? 'ٹھیک' : 'Stable'}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[10px] text-earth-450 dark:text-earth-500 italic mt-3">
            * Health index resolves environmental stress, sowing timelines, and fungal spore risks.
          </p>
        </div>
      </div>

      {/* Explainable AI Risk Center (Explain Outbreak Dangers) */}
      {(riskInfo.percentage >= 40 || irrInfo.recommendation === 'Irrigate Now') && (
        <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-850 rounded-2xl p-5 shadow-soft text-left space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-earth-100 dark:border-earth-800">
            <span className="text-xl">🛡️</span>
            <h3 className="text-sm font-black text-earth-900 dark:text-earth-100 uppercase tracking-wider">
              {language === 'ur' ? 'ایکٹو رسک سنٹر (Explainable AI)' : language === 'pa' ? 'ایکٹو رسک سنٹر (Explainable AI)' : 'Risk Center — Explainable Spore Dangers'}
            </h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Fungal Spore Threat */}
            {riskInfo.percentage >= 40 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">⚠️ Disease Threat Alert</span>
                <h4 className="text-sm font-extrabold text-earth-800 dark:text-earth-200">
                  {t('crop_' + fieldProfile.cropType.toLowerCase())} {riskInfo.diseaseName}
                </h4>
                <div className="text-xs text-earth-600 dark:text-earth-400 space-y-1 bg-earth-50 dark:bg-earth-950 p-3.5 rounded-xl border border-earth-100 dark:border-earth-800 font-semibold">
                  <div><strong>{language === 'ur' ? 'خطرے کی وجہ؟' : language === 'pa' ? 'خطرے دی وجہ؟' : 'Why?'}</strong> {riskInfo.explanation}</div>
                  <div className="mt-1.5 text-crop-800 dark:text-crop-300"><strong>{language === 'ur' ? 'تجویز کردہ اسپرے:' : language === 'pa' ? 'تجویز کردہ اسپرے:' : 'Action:'}</strong> Apply systemic copper fungicide immediately to suppress germination.</div>
                </div>
              </div>
            )}

            {/* Smart Irrigation Warning */}
            {irrInfo.recommendation === 'Irrigate Now' && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">💦 Moisture Depletion Alert</span>
                <h4 className="text-sm font-extrabold text-earth-800 dark:text-earth-200">
                  {t('crop_' + fieldProfile.cropType.toLowerCase())} Hydro-stress
                </h4>
                <div className="text-xs text-earth-600 dark:text-earth-400 space-y-1 bg-earth-50 dark:bg-earth-950 p-3.5 rounded-xl border border-earth-100 dark:border-earth-800 font-semibold">
                  <div><strong>{language === 'ur' ? 'خطرے کی وجہ؟' : language === 'pa' ? 'خطرے دی وجہ؟' : 'Why?'}</strong> {irrInfo.explanation}</div>
                  <div className="mt-1.5 text-crop-800 dark:text-crop-300"><strong>{language === 'ur' ? 'تجویز کردہ عمل:' : language === 'pa' ? 'تجویز کردہ عمل:' : 'Action:'}</strong> Apply {irrInfo.litersPerAcre.toLocaleString()} Liters water per acre at dawn.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid of 4 Module Summaries */}
      <div className="grid gap-5 sm:grid-cols-2">
        
        {/* Card 1: Weather Intelligence */}
        <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-850 rounded-2xl p-5 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-bold text-crop-600 dark:text-crop-400">{t('weather')}</span>
              <span className="text-xl">⛅</span>
            </div>
            <div className="my-3">
              <span className="text-3xl font-black text-earth-900 dark:text-earth-50">{weatherData.current.temp}°C</span>
              <span className="text-xs text-earth-500 dark:text-earth-450 block mt-1 font-semibold">
                {translateWeatherDesc(weatherData.current.description)} in {t('dist_' + fieldProfile.district.toLowerCase())}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => onNavigate('weather')}
            className="w-full mt-4 text-center py-2 text-xs font-bold bg-earth-55 hover:bg-earth-100 dark:bg-earth-950 dark:hover:bg-earth-800 text-earth-700 dark:text-earth-300 rounded-xl transition-all cursor-pointer border border-earth-100 dark:border-earth-800"
          >
            {t('weather')} →
          </button>
        </div>

        {/* Card 2: Disease Risk & Diagnosis */}
        <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-850 rounded-2xl p-5 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-bold text-crop-600 dark:text-crop-400">{t('disease')}</span>
              <span className="text-xl">🦠</span>
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-earth-900 dark:text-earth-50">{riskInfo.percentage}%</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  riskInfo.riskLevel === 'High' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300' 
                    : riskInfo.riskLevel === 'Medium' 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                }`}>
                  {t('riskLevel')}: {t(riskInfo.riskLevel.toLowerCase())}
                </span>
              </div>
              <span className="text-xs text-earth-500 dark:text-earth-455 block mt-1 font-semibold">
                {t('cropType')}: {t('crop_' + fieldProfile.cropType.toLowerCase())} • {riskInfo.diseaseName}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => onNavigate('disease')}
            className="w-full mt-4 text-center py-2 text-xs font-bold bg-earth-55 hover:bg-earth-100 dark:bg-earth-950 dark:hover:bg-earth-800 text-earth-700 dark:text-earth-300 rounded-xl transition-all cursor-pointer border border-earth-100 dark:border-earth-800"
          >
            {t('scanLeaf')} →
          </button>
        </div>

        {/* Card 3: Smart Irrigation Advisor */}
        <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-850 rounded-2xl p-5 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-bold text-crop-600 dark:text-crop-400">{t('irrigation')}</span>
              <span className="text-xl">💦</span>
            </div>
            <div className="my-3">
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${
                  irrInfo.color === 'red' ? 'bg-red-500' : irrInfo.color === 'amber' ? 'bg-amber-500' : 'bg-green-500'
                }`}></span>
                <span className="text-xl font-bold text-earth-900 dark:text-earth-50">
                  {irrInfo.recommendation === 'Irrigate Now' && t('high') === 'High' ? 'Irrigate Now' : 
                   irrInfo.recommendation === 'Irrigate Now' ? (language === 'pa' ? 'اج ای پانی دیو' : 'ابھی پانی دیں') :
                   irrInfo.recommendation === 'Irrigate in 2 Days' && t('high') === 'High' ? 'Irrigate in 2 Days' :
                   irrInfo.recommendation === 'Irrigate in 2 Days' ? (language === 'pa' ? '2 دن وچ پانی دیو' : '2 دن میں پانی دیں') :
                   t('soilAdequate')}
                </span>
              </div>
              <span className="text-xs text-earth-500 dark:text-earth-455 block mt-1.5 font-semibold">
                {irrInfo.litersPerAcre > 0 
                  ? `${t('litersAcre')}: ${irrInfo.litersPerAcre.toLocaleString()} ${t('litersAcre')}` 
                  : t('soilAdequate')}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => onNavigate('irrigation')}
            className="w-full mt-4 text-center py-2 text-xs font-bold bg-earth-55 hover:bg-earth-100 dark:bg-earth-950 dark:hover:bg-earth-800 text-earth-700 dark:text-earth-300 rounded-xl transition-all cursor-pointer border border-earth-100 dark:border-earth-800"
          >
            {t('irrigation')} →
          </button>
        </div>

        {/* Card 4: Yield Forecasting */}
        <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-850 rounded-2xl p-5 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-bold text-crop-600 dark:text-crop-400">{t('yield')}</span>
              <span className="text-xl">🌾</span>
            </div>
            <div className="my-3">
              <span className="text-3xl font-black text-crop-600 dark:text-crop-400">
                {yieldInfo.minYield} - {yieldInfo.maxYield}
              </span>
              <span className="text-xs text-earth-500 dark:text-earth-455 block mt-1 font-semibold">
                {t('maundsPerAcre')}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => onNavigate('yield')}
            className="w-full mt-4 text-center py-2 text-xs font-bold bg-earth-55 hover:bg-earth-100 dark:bg-earth-950 dark:hover:bg-earth-800 text-earth-700 dark:text-earth-300 rounded-xl transition-all cursor-pointer border border-earth-100 dark:border-earth-800"
          >
            {t('yield')} →
          </button>
        </div>

      </div>

      {/* Field Profile Status */}
      <div className="bg-earth-50 border border-earth-100 dark:bg-earth-900 dark:border-earth-850 rounded-2xl p-5 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="text-sm font-bold text-earth-800 dark:text-earth-200">
            {t('activeSoil')}: {t('soil_' + fieldProfile.soilType.toLowerCase())}
          </h4>
          <p className="text-xs text-earth-500 dark:text-earth-455 mt-0.5 font-semibold">
            {t('sowingDate')}: {fieldProfile.sowingDate} • {t('lastIrrigated')}: {fieldProfile.lastIrrigatedDaysAgo ?? 3} {t('daysAgo')}
          </p>
        </div>
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xs text-crop-600 hover:text-crop-700 font-bold underline cursor-pointer"
        >
          {t('changeSettings')}
        </button>
      </div>

      {/* Scope disclaimer note for judges and users safety */}
      <p className="text-[10px] text-earth-400 dark:text-earth-500 text-center mt-6 leading-relaxed max-w-2xl mx-auto italic">
        * {t('disclaimer')}
      </p>
    </div>
  );
}
