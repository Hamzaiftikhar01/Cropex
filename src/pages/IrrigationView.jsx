import { useLanguage } from '../context/LanguageContext';
import { calculateIrrigation, getGrowthStage } from '../utils/agriRules';

export default function IrrigationView({ fieldProfile, weatherData, onProfileChange }) {
  const { t, language } = useLanguage();
  const lastIrrigated = fieldProfile.lastIrrigatedDaysAgo ?? 3;
  const irrInfo = calculateIrrigation(
    fieldProfile.cropType,
    fieldProfile.soilType,
    fieldProfile.sowingDate,
    lastIrrigated,
    weatherData,
    language
  );

  const { stage, daysElapsed } = getGrowthStage(fieldProfile.cropType, fieldProfile.sowingDate, language);

  const handleIrrigateNow = () => {
    onProfileChange({
      ...fieldProfile,
      lastIrrigatedDaysAgo: 0,
      description: 'Just irrigated today! Soil moisture has been restored to capacity.',
      descriptionUr: 'آج پانی دیا گیا ہے! مٹی کی نمی مکمل ہو چکی ہے۔'
    });
  };

  // Color mapping helpers
  const getColorClasses = (color) => {
    if (color === 'red') {
      return {
        bg: 'bg-red-50/80 dark:bg-red-950/20 border-red-200 dark:border-red-900/30',
        text: 'text-red-900 dark:text-red-300',
        badge: 'bg-red-600 text-white',
        border: 'border-red-400 dark:border-red-600'
      };
    }
    if (color === 'amber') {
      return {
        bg: 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30',
        text: 'text-amber-900 dark:text-amber-300',
        badge: 'bg-amber-500 text-white',
        border: 'border-amber-400 dark:border-amber-600'
      };
    }
    return {
      bg: 'bg-green-50/80 dark:bg-green-950/20 border-green-200 dark:border-green-900/30',
      text: 'text-green-900 dark:text-green-300',
      badge: 'bg-green-600 text-white',
      border: 'border-green-400 dark:border-green-600'
    };
  };

  const style = getColorClasses(irrInfo.color);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-earth-100 dark:border-earth-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-earth-900 dark:text-earth-50 tracking-tight font-sans">
            {t('irrAdvisorTitle')}
          </h2>
          <p className="text-xs text-earth-500 dark:text-earth-450 mt-0.5 font-medium">
            {t('irrSubtitle')}
          </p>
        </div>
      </div>

      {/* Traffic Light Recommendation Card */}
      <div className={`p-5 sm:p-6 rounded-2xl border-2 shadow-soft transition-all ${style.bg} ${style.border}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-30 ${style.badge}`}></span>
              <span className={`relative inline-flex rounded-full h-14 w-14 items-center justify-center text-2xl shadow-xs ${style.badge}`}>
                {irrInfo.color === 'red' ? '🚨' : irrInfo.color === 'amber' ? '⚠️' : '✅'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 block">{t('irrVerdict')}</span>
              <h3 className={`text-xl sm:text-2xl font-black ${style.text}`}>
                {irrInfo.recommendation === 'Irrigate Now' && t('high') === 'High' ? 'Irrigate Now' : 
                 irrInfo.recommendation === 'Irrigate Now' ? (language === 'pa' ? 'اج ای پانی دیو' : 'ابھی پانی دیں') :
                 irrInfo.recommendation === 'Irrigate in 2 Days' && t('high') === 'High' ? 'Irrigate in 2 Days' :
                 irrInfo.recommendation === 'Irrigate in 2 Days' ? (language === 'pa' ? '2 دن وچ پانی دیو' : '2 دن میں پانی دیں') :
                 irrInfo.recommendation}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {irrInfo.litersPerAcre > 0 && (
              <div className="bg-white dark:bg-earth-900 px-4 py-2 rounded-xl border border-earth-100 dark:border-earth-800 text-center shadow-xs">
                <span className="text-[10px] uppercase font-bold text-earth-400 dark:text-earth-500 block">{t('litersAcre')}</span>
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                  {irrInfo.litersPerAcre.toLocaleString()}
                </span>
                <span className="text-[10px] text-earth-500 dark:text-earth-400 ml-1">{t('litersAcre')}</span>
              </div>
            )}

            {lastIrrigated > 0 && (
              <button
                onClick={handleIrrigateNow}
                className="h-10 px-5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm text-xs sm:text-sm cursor-pointer"
              >
                {t('irrMarkToday')}
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 pt-3.5 border-t border-current/10 text-xs sm:text-sm leading-relaxed font-semibold">
          {irrInfo.explanation}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Growth Stage Metrics */}
        <div className="bg-white border border-earth-100 rounded-2xl p-5 sm:p-6 dark:bg-earth-900 dark:border-earth-800 shadow-soft flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-earth-500 dark:text-earth-350 uppercase tracking-wider block">{t('irrStage')}</span>
            <h4 className="text-base font-bold text-earth-800 dark:text-earth-100 mt-1">{stage}</h4>
            <p className="text-xs text-earth-600 dark:text-earth-300 mt-2 font-medium leading-relaxed">
              {language === 'ur' ? (
                <>کاشت سے لے کر اب تک کے دن: <strong className="text-earth-700 dark:text-earth-200">{daysElapsed} دن</strong>۔ پھول آنے کے اہم مراحل کے دوران پانی کی ضروریات تبدیل ہوتی رہتی ہیں۔</>
              ) : (
                <>Days elapsed since sowing: <strong className="text-earth-700 dark:text-earth-200">{daysElapsed} days</strong>. Water requirements scale dynamically during flowering stages.</>
              )}
            </p>
          </div>
        </div>

        {/* Water Retention Parameter */}
        <div className="bg-white border border-earth-100 rounded-2xl p-5 sm:p-6 dark:bg-earth-900 dark:border-earth-800 shadow-soft flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-earth-500 dark:text-earth-350 uppercase tracking-wider block">{t('irrHydro')}</span>
            <h4 className="text-base font-bold text-earth-800 dark:text-earth-100 mt-1">{t('soil_' + fieldProfile.soilType.toLowerCase())}</h4>
            <p className="text-xs text-earth-600 dark:text-earth-300 mt-2 font-medium leading-relaxed">
              {fieldProfile.soilType === 'Sandy' && (language === 'ur' ? 'ریتیلی مٹی میں پانی جذب کرنے کی شرح تیز ہوتی ہے۔ یہ نمی نہیں روک سکتی، اس لیے بار بار اور کم مقدار میں پانی دیں۔' : 'Coarse texture has rapid percolation rates. Retains minimal water, requiring frequent, shallow applications.')}
              {fieldProfile.soilType === 'Loamy' && (language === 'ur' ? 'زرعی مقاصد کے لیے بہترین مٹی۔ یہ مناسب نقاسی آب اور بہترین غذائیت اور نمی جذب کرنے کی صلاحیت رکھتی ہے۔' : 'Ideal agricultural texture. Features balanced drainage and high nutrient/moisture holding efficiency.')}
              {fieldProfile.soilType === 'Clay' && (language === 'ur' ? 'چکنی مٹی میں نمی جکڑ لیتی ہے۔ پانی آہستہ آہستہ اندر جاتا ہے، اس لیے گہرا اور کم کثرت سے پانی دیں۔' : 'Dense clay aggregates seal soil moisture. Slow percolation means deep, rare water applications.')}
            </p>
          </div>
        </div>

        {/* Rain Forecast Check */}
        <div className="bg-white border border-earth-100 rounded-2xl p-5 sm:p-6 dark:bg-earth-900 dark:border-earth-800 shadow-soft sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-earth-500 dark:text-earth-350 uppercase tracking-wider block">{t('irrRainOffset')}</span>
            <h4 className="text-base font-bold text-earth-800 dark:text-earth-100 mt-1">
              {weatherData?.daily ? (
                `${weatherData.daily.slice(0, 3).reduce((acc, d) => acc + (d.precipitationSum || 0), 0).toFixed(1)} mm ${language === 'ur' ? 'بارش کی پیش گوئی' : 'Predicted'}`
              ) : (
                `0.0 mm ${language === 'ur' ? 'پیش گوئی' : 'Predicted'}`
              )}
            </h4>
            <p className="text-xs text-earth-600 dark:text-earth-300 mt-2 font-medium leading-relaxed">
              {t('irrRainText')}
            </p>
          </div>
        </div>
      </div>

      {/* Local Watering Tips */}
      <div className="bg-white border border-earth-100 rounded-2xl p-5 sm:p-6 dark:bg-earth-900 dark:border-earth-800 shadow-soft">
        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-800 dark:text-earth-200 mb-3">
          {t('irrTips')}
        </h4>
        <ul className="text-xs text-earth-700 dark:text-earth-300 space-y-2 list-disc pl-4 font-medium leading-relaxed">
          <li>{t('irrTip1')}</li>
          <li>{t('irrTip2')}</li>
          <li>{t('irrTip3')}</li>
          <li>{t('irrTip4')}</li>
        </ul>
      </div>
    </div>
  );
}
