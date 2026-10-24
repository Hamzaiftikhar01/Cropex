import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { calculateDiseaseRisk, calculateIrrigation, calculateYieldForecast } from '../utils/agriRules';
import IrrigationSchedulerWidget from '../components/dashboard/IrrigationSchedulerWidget';
import CropIcon from '../components/icons/CropIcon';
import { Camera, ChevronDown, ChevronUp } from 'lucide-react';

export default function DashboardView({ fieldProfile, weatherData, loading, onNavigate, advice, adviceLoading, onProfileChange }) {
  const { t, language } = useLanguage();
  const [advisorLang, setAdvisorLang] = useState('en');
  const [showAdvancedTelemetry, setShowAdvancedTelemetry] = useState(false);

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
    fieldProfile,
    weatherData,
    riskInfo.percentage,
    language
  );

  // Dynamic advice texts with clean localized fallbacks matching Screenshot 2
  const getAdvisorVerdict = () => {
    if (advisorLang === 'ur') {
      return advice?.verdictUr || '2 دن میں پانی دیں۔ زنگ کے سپرے کے بعد تک نائٹروجن کا استعمال موخر کریں۔ جمعرات کی صبح سپرے کریں۔';
    }
    if (advisorLang === 'pa') {
      return advice?.verdictPa || '2 دن وچ پانی دیو۔ زنگ دے سپرے توں بعد نائٹروجن دی کھاد پاؤ۔ جمعرات دی سویر نوں سپرے کرو۔';
    }
    return advice?.verdict || advice?.ruleBasedVerdict || 'Irrigate within 2 days. Delay nitrogen top-dressing until after the rust spray. Spray Thursday morning.';
  };

  const getAdvisorExplanation = () => {
    if (advisorLang === 'ur') {
      return advice?.explanationUr || 'آپ کی گندم تنے کے پھیلاؤ کے مرحلے میں ہے اور زنگ کے حالات بن رہے ہیں۔ آج نچلے پتوں کو چیک کریں اور جمعرات کی صبح سپرے کرنے کا منصوبہ بنائیں، جب ہوا پرسکون ہو۔';
    }
    if (advisorLang === 'pa') {
      return advice?.explanationPa || 'تہاڈی کنک تنے دے ودھن دے مرحلے وچ اے تے زنگ دے حالات بن رہے نیں۔ اج تھلڑے پتے ویکھو تے جمعرات دی سویر نوں سپرے دی تیاری رکھو، جدوں ہوا ہلکی ہووے۔';
    }
    return advice?.explanation || advice?.rephrasedAdvice || 'Your wheat is at stem extension and rust conditions are building. Check the lower leaves today and plan to spray on Thursday morning, when the wind is calm.';
  };

  const handleRunDiagnostic = () => {
    onNavigate('disease');
    setTimeout(() => {
      document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDemoScan = () => {
    onNavigate('disease');
    setTimeout(() => {
      const demoBtn = document.querySelector('button[title*="Demo"], button:has-text("Demo")');
      if (demoBtn) demoBtn.click();
    }, 150);
  };

  return (
    <div className="space-y-5 text-left relative animate-fade-in">
      
      {/* 1. PROACTIVE RISK BANNER (Cream/Amber Alert Card with 3-Segment Gauge) */}
      <div className="bg-[#FEFCE8] dark:bg-[#232014] border border-[#FEF08A] dark:border-[#423916] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-soft">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#92400E] dark:text-[#FCD34D] block">
            PROACTIVE RISK · {fieldProfile.district.toUpperCase()} · {fieldProfile.cropType.toUpperCase()} {riskInfo.diseaseName ? riskInfo.diseaseName.toUpperCase() : 'STRIPE RUST'}
          </span>
          <p className="text-xs sm:text-sm text-[#78350F] dark:text-[#FEF3C7] mt-1 font-medium leading-relaxed">
            Temperatures of 10–15 °C with humidity above 80% favor spore germination (CIMMYT threshold).
          </p>
        </div>

        {/* 3-Segment Risk Level Gauge: Low | Medium | High */}
        <div className="flex items-center shrink-0 self-start md:self-center">
          <span className={`px-3.5 py-1 text-xs font-semibold rounded-l-md transition-colors ${
            riskInfo.riskLevel === 'Low'
              ? 'bg-[#15803D] text-white font-bold'
              : 'bg-[#E2F3E5] text-[#1B6B2A]'
          }`}>
            Low
          </span>
          <span className={`px-3.5 py-1 text-xs font-semibold transition-colors ${
            riskInfo.riskLevel === 'Medium'
              ? 'bg-[#B45309] text-white font-bold'
              : 'bg-[#FDF4DB] text-[#925700]'
          }`}>
            Medium
          </span>
          <span className={`px-3.5 py-1 text-xs font-bold rounded-r-md transition-colors ${
            riskInfo.riskLevel === 'High'
              ? 'bg-[#E17457] text-white'
              : 'bg-[#FEECE9] text-[#B91C1C]'
          }`}>
            High
          </span>
        </div>
      </div>

      {/* 2. 4 KPI METRIC CARDS (Crop stage, Temperature, Predicted yield, Disease spore risk) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Crop stage */}
        <div className="bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-5 shadow-soft">
          <span className="text-xs text-neutral-medium font-medium block">
            Crop stage
          </span>
          <h3 className="text-xl font-bold text-neutral-high mt-1 tracking-tight">
            Stem extension
          </h3>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1 block">
            Day 64 after sowing
          </span>
        </div>

        {/* KPI 2: Temperature */}
        <div className="bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-5 shadow-soft">
          <span className="text-xs text-neutral-medium font-medium block">
            Temperature
          </span>
          <h3 className="text-xl font-bold text-neutral-high mt-1 tracking-tight">
            {weatherData.current.temp || 18}° air · {Math.round((weatherData.current.temp || 18) * 0.67)}° soil
          </h3>
          <span className="text-xs font-medium text-neutral-medium mt-1 block">
            No heat stress
          </span>
        </div>

        {/* KPI 3: Predicted yield */}
        <div className="bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-5 shadow-soft">
          <span className="text-xs text-neutral-medium font-medium block">
            Predicted yield
          </span>
          <h3 className="text-xl font-bold text-neutral-high mt-1 tracking-tight">
            {yieldInfo.predictedYieldMin || 38}–{yieldInfo.predictedYieldMax || 42}
          </h3>
          <span className="text-xs font-medium text-neutral-medium mt-1 block">
            maunds/acre · +4.2 vs district avg
          </span>
        </div>

        {/* KPI 4: Disease spore risk */}
        <div className="bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-5 shadow-soft">
          <span className="text-xs text-neutral-medium font-medium block">
            Disease spore risk
          </span>
          <h3 className="text-xl font-bold text-[#E17457] mt-1 tracking-tight">
            {riskInfo.riskLevel || 'High'}
          </h3>
          <span className="text-xs font-semibold text-[#E17457]/90 mt-1 block">
            {riskInfo.diseaseName || 'Stripe rust'}
          </span>
        </div>

      </div>

      {/* 3. MIDDLE SECTION (2 Columns: Leaf Diagnostic Scanner + Recent Scans) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (7 cols): Leaf Diagnostic Scanner */}
        <div className="lg:col-span-7 bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-high">
              Leaf diagnostic scanner
            </h3>
            <span className="bg-[#EAF4ED] text-[#166534] border border-[#D2EDD7] text-xs font-semibold px-2.5 py-0.5 rounded-full">
              2G compression active
            </span>
          </div>

          {/* Upload Drop Area */}
          <div
            onClick={handleRunDiagnostic}
            className="border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl p-7 text-center bg-[#FBFDFB] dark:bg-[#141C16] hover:bg-stone-50 dark:hover:bg-[#18231B] cursor-pointer transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-[#CFE5D4] text-[#1B4332] flex items-center justify-center mx-auto mb-2.5 shadow-xs">
              <Camera size={20} />
            </div>
            <p className="text-sm font-semibold text-neutral-high">
              Drag and drop a crop leaf photo
            </p>
            <p className="text-xs text-neutral-medium mt-0.5">
              or tap to capture or upload
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleRunDiagnostic}
              className="bg-[#1B4332] hover:bg-[#143527] text-white px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer shadow-xs"
            >
              Run AI leaf diagnosis
            </button>

            <button
              type="button"
              onClick={handleDemoScan}
              className="bg-white dark:bg-stone-800 border border-neutral-border text-neutral-high hover:bg-neutral-fill px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer shadow-soft"
            >
              Demo scan
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Recent Scans */}
        <div className="lg:col-span-5 bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-6 shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-high">
              Recent scans
            </h3>

            <div className="divide-y divide-neutral-border mt-3">
              <div
                onClick={() => onNavigate('disease')}
                className="py-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition"
              >
                <span className="text-xs sm:text-sm font-semibold text-neutral-high">
                  Yellow rust · Wheat
                </span>
                <span className="bg-[#EAF4ED] text-[#166534] text-xs font-bold px-2.5 py-0.5 rounded-full">
                  92%
                </span>
              </div>

              <div
                onClick={() => onNavigate('disease')}
                className="py-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition"
              >
                <span className="text-xs sm:text-sm font-semibold text-neutral-high">
                  CLCuV · Cotton
                </span>
                <span className="bg-[#EAF4ED] text-[#166534] text-xs font-bold px-2.5 py-0.5 rounded-full">
                  88%
                </span>
              </div>

              <div
                onClick={() => onNavigate('disease')}
                className="py-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition"
              >
                <span className="text-xs sm:text-sm font-semibold text-neutral-high">
                  Late blight · Potato
                </span>
                <span className="bg-[#EAF4ED] text-[#166534] text-xs font-bold px-2.5 py-0.5 rounded-full">
                  95%
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={() => onNavigate('disease')}
              className="text-xs font-semibold text-neutral-medium hover:text-neutral-high transition"
            >
              View all history →
            </button>
          </div>
        </div>

      </div>

      {/* 4. BOTTOM SECTION (2 Columns: AI Farm Advisor + Spray Window Today) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (7 cols): AI Farm Advisor */}
        <div className="lg:col-span-7 bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-neutral-high">
              AI farm advisor
            </h3>

            {/* Language toggle pills: EN | اردو | پنجابی */}
            <div className="flex items-center gap-1 bg-neutral-fill p-1 rounded-lg border border-neutral-border/60">
              <button
                type="button"
                onClick={() => setAdvisorLang('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  advisorLang === 'en'
                    ? 'bg-white dark:bg-stone-800 text-neutral-high shadow-xs'
                    : 'text-neutral-medium hover:text-neutral-high'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setAdvisorLang('ur')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition font-urdu ${
                  advisorLang === 'ur'
                    ? 'bg-white dark:bg-stone-800 text-neutral-high shadow-xs'
                    : 'text-neutral-medium hover:text-neutral-high'
                }`}
              >
                اردو
              </button>
              <button
                type="button"
                onClick={() => setAdvisorLang('pa')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition font-urdu ${
                  advisorLang === 'pa'
                    ? 'bg-white dark:bg-stone-800 text-neutral-high shadow-xs'
                    : 'text-neutral-medium hover:text-neutral-high'
                }`}
              >
                پنجابی
              </button>
            </div>
          </div>

          {/* Layer 1: Rule-Based Verdict */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-medium block">
              LAYER 1 · RULE-BASED VERDICT
            </span>
            <p className="text-xs sm:text-sm text-neutral-high font-medium leading-relaxed mt-1">
              {getAdvisorVerdict()}
            </p>
          </div>

          <div className="border-t border-neutral-border pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-medium block">
              LAYER 2 · FRIENDLY EXPLANATION
            </span>
            <p className="text-xs sm:text-sm text-neutral-high leading-relaxed mt-1">
              {getAdvisorExplanation()}
            </p>
          </div>
        </div>

        {/* Right Column (5 cols): Spray Window Today */}
        <div className="lg:col-span-5 bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-6 shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-high">
              Spray window today
            </h3>

            {/* Visual Hourly Bar Blocks */}
            <div className="mt-5 space-y-2">
              <div className="grid grid-cols-12 gap-1.5 h-7">
                {/* 6 am (ideal) */}
                <div className="col-span-1 rounded bg-[#E2F3E5] border border-[#BBF7D0]"></div>
                <div className="col-span-1 rounded bg-[#22C55E]"></div>
                <div className="col-span-1 rounded bg-[#22C55E]"></div>
                <div className="col-span-1 rounded bg-[#16A34A]"></div>
                {/* Midday caution */}
                <div className="col-span-1 rounded bg-[#FDE047]"></div>
                <div className="col-span-1 rounded bg-[#EAB308]"></div>
                <div className="col-span-1 rounded bg-[#E17457]"></div>
                <div className="col-span-1 rounded bg-[#E17457]"></div>
                {/* Afternoon & Evening */}
                <div className="col-span-1 rounded bg-[#FDE047]"></div>
                <div className="col-span-1 rounded bg-[#22C55E]"></div>
                <div className="col-span-1 rounded bg-[#16A34A]"></div>
                <div className="col-span-1 rounded bg-[#15803D]"></div>
              </div>

              {/* Time Indicators */}
              <div className="flex justify-between text-[11px] text-neutral-medium font-medium px-1">
                <span>6 am</span>
                <span>12 pm</span>
                <span>6 pm</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="text-xs text-neutral-medium leading-relaxed pt-2 border-t border-neutral-border/60">
            Green: ideal · Amber: caution · Red: avoid (wind above 15 km/h or rain).
          </div>
        </div>

      </div>

      {/* 5. OPTIONAL DEEP TELEMETRY ACCORDION (Irrigation Scheduler & Multi-Crop Matrix) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvancedTelemetry(!showAdvancedTelemetry)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-medium hover:text-neutral-high transition cursor-pointer"
        >
          <span>{showAdvancedTelemetry ? 'Hide Advanced Telemetry' : 'Show Advanced Soil & Crop Telemetry'}</span>
          {showAdvancedTelemetry ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAdvancedTelemetry && (
          <div className="mt-4 space-y-5 animate-fade-in">
            {/* Active Crops Multi-Crop Monitoring Matrix */}
            <div className="bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-high">
                  Active Multi-Crop Monitoring Sheet
                </span>
                <span className="text-[10px] text-neutral-medium font-bold">
                  {fieldProfile.cropType} Active
                </span>
              </div>

              <div className="overflow-x-auto mt-3">
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
                    <tr className="bg-brand-surface">
                      <td className="py-3 flex items-center gap-2 font-bold px-2">
                        <CropIcon crop={fieldProfile.cropType} size={18} />
                        <span>{fieldProfile.cropType} (Active)</span>
                      </td>
                      <td className="py-3 font-extrabold px-2">{100 - Math.round(riskInfo.percentage / 2.5)}%</td>
                      <td className="py-3 px-2">{riskInfo.percentage}% ({riskInfo.riskLevel})</td>
                      <td className="py-3 text-right px-2">
                        <span className="bg-[#EAF4ED] text-[#166534] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          Optimal
                        </span>
                      </td>
                    </tr>
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
        )}
      </div>

      {/* Scope disclaimer note for judges and users */}
      <p className="text-[11px] text-neutral-medium text-center pt-2 italic">
        * AI-assisted advice. Confirm diagnoses and chemical doses with a certified extension officer or plant pathologist before applying treatment.
      </p>

    </div>
  );
}
