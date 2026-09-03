import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AdvisorCard from '../components/AdvisorCard';
import { calculateDiseaseRisk, calculateIrrigation, calculateYieldForecast } from '../utils/agriRules';
import IrrigationSchedulerWidget from '../components/dashboard/IrrigationSchedulerWidget';
import CropIcon from '../components/icons/CropIcon';
import { Shield, AlertTriangle, Droplets, CheckCircle, CloudSun, Bug, Activity } from 'lucide-react';

export default function DashboardView({ fieldProfile, weatherData, loading, onNavigate, advice, adviceLoading, onProfileChange }) {
  const { t, language } = useLanguage();

  if (loading || !weatherData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-primary border-t-transparent"></div>
        <p className="mt-4 text-xs font-semibold text-neutral-medium">
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

  // Removed getCropIcon, we use CropIcon directly

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
        color: 'text-semantic-low',
        badge: 'bg-semantic-low/10 text-semantic-low border border-semantic-low/20'
      };
    }
    if (score >= 60) {
      return {
        text: language === 'ur' ? 'توجہ طلب' : language === 'pa' ? 'دھیان دی لوڑ' : 'Attention Needed',
        color: 'text-semantic-medium',
        badge: 'bg-semantic-medium/10 text-semantic-medium border border-semantic-medium/20'
      };
    }
    return {
      text: language === 'ur' ? 'فوری عمل درکار' : language === 'pa' ? 'فوری عمل کرو' : 'Action Required',
      color: 'text-semantic-high',
      badge: 'bg-semantic-high/10 text-semantic-high border border-semantic-high/20'
    };
  };

  const healthState = getHealthState(healthScore);

  return (
    <div className="space-y-6 text-left relative animate-fade-in print:m-0 print:p-0">
      <div className="flex justify-end mb-[-10px] z-10 relative animate-slide-up print:hidden" style={{ animationDelay: '0.1s' }}>
        <button 
          onClick={() => window.print()}
          className="text-[11px] font-bold px-3 py-1.5 bg-neutral-surface border border-neutral-border rounded-lg shadow-xs hover:bg-neutral-fill text-neutral-high transition-colors flex items-center gap-1.5"
          title="Export as PDF"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {language === 'ur' ? 'پی ڈی ایف ڈاؤن لوڈ' : language === 'pa' ? 'پی ڈی ایف محفوظ کرو' : 'Export PDF'}
        </button>
      </div>

      <div id="dashboard-content" className="space-y-6">
        {/* Top AI Farm Advisor Prioritized Verdict */}
        <AdvisorCard 
          advice={advice} 
          loading={adviceLoading} 
          fieldProfile={fieldProfile}
          weatherData={weatherData}
        />

      {/* Main Command Center Grid: Left Operations Column (7 cols) + Right Modules Column (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Farm Health + Active Risks + Multi-Crop Monitoring Matrix */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Farm Health Index (Redesigned as compact string) */}
          <div className="bg-neutral-surface border border-neutral-border rounded-xl p-4 shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-medium">
                {language === 'ur' ? 'ہیلتھ انڈیکس' : language === 'pa' ? 'فارم انڈیکس' : 'Farm Health:'}
              </span>
              <span className="text-sm font-black text-neutral-high">{healthScore}/100</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${healthState.badge}`}>
                {healthState.text}
              </span>
            </div>
            <div className="hidden sm:block text-xs font-medium text-neutral-medium">
              {healthScore >= 80 
                ? (language === 'ur' ? 'کھیت کی حالت مستحکم ہے۔' : language === 'pa' ? 'کھیت دی حالت ٹھیک اے۔' : 'All parameters optimal.')
                : (language === 'ur' ? 'دباؤ کی علامات۔' : language === 'pa' ? 'دباؤ دیاں علامتاں۔' : 'Environmental stress detected.')}
            </div>
          </div>

          {/* Explainable AI Risk Center */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-earth-500" aria-hidden="true" />
                <h3 className="text-xs sm:text-sm font-bold text-neutral-high uppercase tracking-wider">
                  {language === 'ur' ? 'ایکٹو رسک سنٹر (Explainable AI)' : language === 'pa' ? 'ایکٹو رسک سنٹر (Explainable AI)' : 'Active Risks (Explainable AI)'}
                </h3>
              </div>
              <span className="text-[10px] text-neutral-medium font-semibold uppercase">Real-Time</span>
            </div>

            {(riskInfo.percentage >= 40 || irrInfo.recommendation === 'Irrigate Now') ? (
              <div className="space-y-3">
                {/* Fungal Spore Threat */}
                {riskInfo.percentage >= 40 && (
                  <div className="p-4 rounded-xl bg-semantic-high/10 border border-semantic-high/30 text-left space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-semantic-high flex items-center gap-1">
                        <AlertTriangle size={12} aria-hidden="true" /> Outbreak Risk • {riskInfo.percentage}%
                      </span>
                      <span className="text-xs font-bold text-neutral-high">
                        {t('crop_' + fieldProfile.cropType.toLowerCase())}: {riskInfo.diseaseName}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-high">
                      <strong>{language === 'ur' ? 'وجہ:' : language === 'pa' ? 'وجہ:' : 'Why?'}</strong> {riskInfo.explanation}
                    </div>
                    <div className="text-xs font-semibold text-brand-primary pt-1.5 border-t border-semantic-high/20">
                      <strong>{language === 'ur' ? 'فوری عمل:' : language === 'pa' ? 'فوری عمل:' : 'Recommended Action:'}</strong> Apply systemic protective fungicide spray to suppress spore propagation.
                    </div>
                  </div>
                )}

                {/* Irrigation Prompt */}
                {irrInfo.recommendation === 'Irrigate Now' && (
                  <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] dark:bg-[#1E3A8A]/30 dark:border-[#1E3A8A] text-left space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1D4ED8] dark:text-[#93C5FD] flex items-center gap-1">
                        <Droplets size={12} aria-hidden="true" /> Water Depletion Alert
                      </span>
                      <span className="text-xs font-bold text-neutral-high">
                        {t('soil_' + fieldProfile.soilType.toLowerCase())} Profile
                      </span>
                    </div>
                    <div className="text-xs text-neutral-high">
                      <strong>{language === 'ur' ? 'وجہ:' : language === 'pa' ? 'وجہ:' : 'Why?'}</strong> {irrInfo.explanation}
                    </div>
                    <div className="text-xs font-semibold text-brand-primary pt-1.5 border-t border-[#BFDBFE] dark:border-[#1E3A8A]">
                      <strong>{language === 'ur' ? 'تجویز:' : language === 'pa' ? 'تجویز:' : 'Recommended Action:'}</strong> Apply {irrInfo.litersPerAcre.toLocaleString()} Liters/Acre today.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <CheckCircle size={36} className="text-brand-primary mx-auto mb-2" aria-hidden="true" />
                <p className="text-xs font-bold text-brand-primary">No Imminent Critical Pathogen or Soil Drought Alerts</p>
                <p className="text-[11px] text-neutral-medium max-w-sm mx-auto">
                  Local climate conditions for {fieldProfile.district} are currently hostile to major foliar pathogen germination.
                </p>
              </div>
            )}
          </div>

          {/* Active Crops Multi-Crop Monitoring Matrix */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 sm:p-6 shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-high">
                {language === 'ur' ? 'فعال فصلیں مانیٹرنگ شیٹ' : language === 'pa' ? 'فصلاں دی نگرانی شیٹ' : 'Active Multi-Crop Monitoring Sheet'}
              </span>
              <span className="text-[10px] text-neutral-medium font-bold">
                {t('crop_' + fieldProfile.cropType.toLowerCase())} Active
              </span>
            </div>

            <div className="overflow-x-auto mt-3 -mx-5 sm:mx-0 px-5 sm:px-0">
              <table className="w-full text-left text-xs min-w-[420px]">
                <thead>
                  <tr className="border-b border-neutral-border text-neutral-medium uppercase text-[9px] tracking-wider">
                    <th className="pb-2.5 font-bold">{t('cropType')}</th>
                    <th className="pb-2.5 font-bold">Health Est.</th>
                    <th className="pb-2.5 font-bold">{t('sporeRisk')}</th>
                    <th className="pb-2.5 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border font-semibold text-neutral-high">
                  
                  {/* Current Active Crop */}
                  <tr className="bg-brand-surface">
                    <td className="py-3 flex items-center gap-2 font-bold px-2">
                      <span className="text-base flex items-center"><CropIcon crop={fieldProfile.cropType} size={20} aria-hidden="true" /></span>
                      <span>{t('crop_' + fieldProfile.cropType.toLowerCase())} (Active)</span>
                    </td>
                    <td className="py-3 font-extrabold px-2">{100 - Math.round(riskInfo.percentage / 2.5)}%</td>
                    <td className="py-3 px-2">{riskInfo.percentage}% ({t(riskInfo.riskLevel.toLowerCase())})</td>
                    <td className="py-3 text-right px-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        riskInfo.riskLevel === 'High' 
                          ? 'bg-semantic-high/10 text-semantic-high'
                          : riskInfo.riskLevel === 'Medium'
                          ? 'bg-semantic-medium/10 text-semantic-medium'
                          : 'bg-semantic-low/10 text-semantic-low'
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
                      <td className="py-3 flex items-center gap-2 font-semibold px-2">
                        <span className="text-base flex items-center"><CropIcon crop="Wheat" size={16} aria-hidden="true" /></span>
                        <span>{t('crop_wheat')}</span>
                      </td>
                      <td className="py-3 px-2">91%</td>
                      <td className="py-3 px-2">10% ({t('low')})</td>
                      <td className="py-3 text-right px-2">
                        <span className="bg-semantic-low/10 text-semantic-low px-2 py-0.5 rounded text-[10px] font-bold">
                          Stable
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* Rice row (if not active) */}
                  {fieldProfile.cropType !== 'Rice' && (
                    <tr>
                      <td className="py-3 flex items-center gap-2 font-semibold px-2">
                        <span className="text-base flex items-center"><CropIcon crop="Rice" size={16} aria-hidden="true" /></span>
                        <span>{t('crop_rice')}</span>
                      </td>
                      <td className="py-3 px-2">82%</td>
                      <td className="py-3 px-2">30% ({t('low')})</td>
                      <td className="py-3 text-right px-2">
                        <span className="bg-semantic-low/10 text-semantic-low px-2 py-0.5 rounded text-[10px] font-bold">
                          Stable
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* Tomato row (if not active) */}
                  {fieldProfile.cropType !== 'Tomato' && (
                    <tr>
                      <td className="py-3 flex items-center gap-2 font-semibold px-2">
                        <span className="text-base flex items-center"><CropIcon crop="Tomato" size={16} aria-hidden="true" /></span>
                        <span>{t('crop_tomato')}</span>
                      </td>
                      <td className="py-3 px-2">88%</td>
                      <td className="py-3 px-2">15% ({t('low')})</td>
                      <td className="py-3 text-right px-2">
                        <span className="bg-semantic-low/10 text-semantic-low px-2 py-0.5 rounded text-[10px] font-bold">
                          Stable
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          
          {/* Smart Irrigation Scheduler */}
          <div id="irrigation-graph">
            <IrrigationSchedulerWidget 
              irrInfo={irrInfo} 
              fieldProfile={fieldProfile} 
              onProfileChange={onProfileChange} 
            />
          </div>
        </div>

        {/* Right Column: 4 Core Agricultural Intelligence Modules */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-high">
              {language === 'ur' ? 'زرعی ماڈیولز کا جائزہ' : language === 'pa' ? 'زرعی ماڈیولز دا جائزہ' : 'Core Agricultural Modules'}
            </h3>
            <span className="text-[10px] text-neutral-high font-bold">4 Live Engines</span>
          </div>

          {/* Module 1: Weather Intelligence */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-primary tracking-wider">
                  {t('weather')}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-neutral-high">
                    {weatherData.current.temp}°C
                  </span>
                  <span className="text-xs font-semibold text-neutral-medium">
                    {translateWeatherDesc(weatherData.current.description)}
                  </span>
                </div>
              </div>
              <CloudSun size={24} className="text-earth-600 dark:text-earth-400" aria-hidden="true" />
            </div>
            <button
              onClick={() => onNavigate('weather')}
              className="h-9 w-full mt-3.5 inline-flex items-center justify-center text-xs font-bold text-brand-primary bg-brand-surface hover:bg-neutral-fill rounded-xl transition-colors cursor-pointer border border-brand-primary/20"
            >
              {t('weather')} →
            </button>
          </div>

          {/* Module 2: Disease Risk & Diagnosis */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-primary tracking-wider">
                  {t('disease')}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-neutral-high">
                    {riskInfo.percentage}%
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    riskInfo.riskLevel === 'High' 
                      ? 'bg-semantic-high/10 text-semantic-high' 
                      : riskInfo.riskLevel === 'Medium' 
                      ? 'bg-semantic-medium/10 text-semantic-medium' 
                      : 'bg-semantic-low/10 text-semantic-low'
                  }`}>
                    {t(riskInfo.riskLevel.toLowerCase())}
                  </span>
                </div>
                <span className="text-xs text-neutral-medium block mt-0.5 font-medium">
                  {riskInfo.diseaseName}
                </span>
              </div>
              <Bug size={24} className="text-red-500 dark:text-red-400" aria-hidden="true" />
            </div>
            <button
              onClick={() => onNavigate('disease')}
              className="h-9 w-full mt-3.5 inline-flex items-center justify-center text-xs font-bold text-brand-primary bg-brand-surface hover:bg-neutral-fill rounded-xl transition-colors cursor-pointer border border-brand-primary/20"
            >
              {t('scanLeaf')} →
            </button>
          </div>

          {/* Module 3: Smart Irrigation */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-primary tracking-wider">
                  {t('irrigation')}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    irrInfo.color === 'red' ? 'bg-semantic-high' : irrInfo.color === 'amber' ? 'bg-semantic-medium' : 'bg-semantic-low'
                  }`}></span>
                  <span className="text-base font-bold text-neutral-high">
                    {irrInfo.recommendation === 'Irrigate Now' && t('high') === 'High' ? 'Irrigate Now' : 
                     irrInfo.recommendation === 'Irrigate Now' ? (language === 'pa' ? 'اج ای پانی دیو' : 'ابھی پانی دیں') :
                     irrInfo.recommendation === 'Irrigate in 2 Days' && t('high') === 'High' ? 'Irrigate in 2 Days' :
                     irrInfo.recommendation === 'Irrigate in 2 Days' ? (language === 'pa' ? '2 دن وچ پانی دیو' : '2 دن میں پانی دیں') :
                     t('soilAdequate')}
                  </span>
                </div>
                <span className="text-xs text-neutral-medium block mt-0.5 font-medium">
                  {irrInfo.litersPerAcre > 0 ? `${irrInfo.litersPerAcre.toLocaleString()} ${t('litersAcre')}` : t('soilAdequate')}
                </span>
              </div>
              <Droplets size={24} className="text-blue-500 dark:text-blue-400" aria-hidden="true" />
            </div>
            <button
              onClick={() => {
                document.getElementById('irrigation-graph')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="h-9 w-full mt-3.5 inline-flex items-center justify-center text-xs font-bold text-brand-primary bg-brand-surface hover:bg-neutral-fill rounded-xl transition-colors cursor-pointer border border-brand-primary/20"
            >
              {t('irrigation')} ↓
            </button>
          </div>

          {/* Module 4: Yield Forecasting */}
          <div className="bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-primary tracking-wider">
                  {t('yield')}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-brand-primary">
                    {yieldInfo.minYield} - {yieldInfo.maxYield}
                  </span>
                  <span className="text-xs font-semibold text-neutral-medium">
                    {t('maundsPerAcre')}
                  </span>
                </div>
              </div>
              <Activity size={24} className="text-crop-600 dark:text-crop-400" aria-hidden="true" />
            </div>
            <button
              onClick={() => onNavigate('yield')}
              className="h-9 w-full mt-3.5 inline-flex items-center justify-center text-xs font-bold text-brand-primary bg-brand-surface hover:bg-neutral-fill rounded-xl transition-colors cursor-pointer border border-brand-primary/20"
            >
              {t('yield')} →
            </button>
          </div>

        </div>

      </div>

      {/* Scope disclaimer note for judges and users */}
      <p className="text-[11px] text-neutral-high text-center pt-2 italic">
        * {t('disclaimer')}
      </p>
      </div>
    </div>
  );
}
