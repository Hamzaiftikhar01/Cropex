import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { calculateYieldForecast, calculateDiseaseRisk } from '../utils/agriRules';
import { Target, Calendar, Sun, Sprout, Bug, Lightbulb, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, BookOpen } from 'lucide-react';

export default function YieldView({ fieldProfile, weatherData }) {
  const { t, language } = useLanguage();
  const diseaseRisk = calculateDiseaseRisk(fieldProfile.cropType, weatherData, language).percentage;

  // Sandbox inputs overrides
  const [simulatedDisease, setSimulatedDisease] = useState(diseaseRisk);
  const [simulatedHeatwave, setSimulatedHeatwave] = useState(false);

  // Sync state if crop changes
  useEffect(() => {
    setSimulatedDisease(diseaseRisk);
    setSimulatedHeatwave(false);
  }, [fieldProfile.id, diseaseRisk]);

  const calcWeatherData = simulatedHeatwave 
    ? {
        ...weatherData,
        daily: (weatherData?.daily || []).map(d => ({ ...d, tempMax: 44 }))
      }
    : weatherData;

  const yieldData = calculateYieldForecast(
    fieldProfile,
    calcWeatherData,
    simulatedDisease,
    language
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-earth-100 dark:border-earth-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-earth-900 dark:text-earth-50 tracking-tight font-sans">
            {t('yieldForecastTitle')}
          </h2>
          <p className="text-xs text-earth-800 dark:text-earth-300 mt-0.5 font-medium">
            {t('yieldSubtitle')}
          </p>
        </div>
      </div>

      {/* Main Yield Estimate Result Card */}
      <div className="bg-gradient-to-br from-earth-800 to-earth-900 text-white rounded-2xl p-5 sm:p-6 shadow-md dark:from-earth-900 dark:to-earth-950 border border-earth-700/30">
        <span className="text-[10px] uppercase font-bold text-earth-300 tracking-wider block">{t('yield')}</span>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
          <div>
            <span className="text-4xl sm:text-5xl font-black text-crop-400">
              {yieldData.minYield} - {yieldData.maxYield}
            </span>
            <span className="text-lg sm:text-xl text-earth-100 font-bold ml-2">{t('maundsPerAcre')}</span>
          </div>

          {/* District Baseline & Delta Comparison */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-earth-300 bg-earth-800/80 border border-earth-700 px-3 py-1.5 rounded-full font-semibold">
              <Target size={14} className="inline mr-1" aria-hidden="true" />
              {fieldProfile.district || 'District'} {t('yieldAverage')}: {yieldData.districtAverage} {t('maunds')}
            </span>
            {yieldData.deltaFromAverage !== undefined && (
              <span className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 ${
                yieldData.deltaFromAverage >= 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {yieldData.deltaFromAverage >= 0 ? <TrendingUp size={13} aria-hidden="true" /> : <TrendingDown size={13} aria-hidden="true" />}
                {yieldData.deltaFromAverage >= 0 ? `+${yieldData.deltaFromAverage}%` : `${yieldData.deltaFromAverage}%`} vs Baseline
              </span>
            )}
            {yieldData.confidence && (
              <span className="text-xs bg-crop-500/20 text-crop-300 border border-crop-500/30 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1">
                <ShieldCheck size={13} aria-hidden="true" /> {yieldData.confidence}% Confidence
              </span>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-earth-200 border-t border-earth-700/50 pt-3.5 font-semibold italic">
          * {yieldData.confidenceNote}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {/* Regression Penalties Breakdown */}
        <div className="bg-white border border-earth-100 rounded-2xl p-5 sm:p-6 dark:bg-earth-900 dark:border-earth-800 shadow-soft md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-800 dark:text-earth-200">
              {t('yieldBreakdown')}
            </h4>
            <span className="text-[11px] font-mono text-crop-600 dark:text-crop-400 font-semibold">
              Gradient-Boosted Ensemble
            </span>
          </div>
          
          <div className="space-y-3.5">
            {/* Sowing Factor */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-earth-650 dark:text-earth-350">
                <span className="flex items-center gap-1"><Calendar size={14} aria-hidden="true" /> {t('sowingAlign')}</span>
                <span className={yieldData.sowingFactor < 1.0 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                  {yieldData.sowingFactor.toFixed(2)}x {yieldData.stressAttribution?.sowingPenalty > 0 ? `(-${yieldData.stressAttribution.sowingPenalty}%)` : ''}
                </span>
              </div>
              <div className="w-full bg-earth-100 dark:bg-earth-800 h-2 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${yieldData.sowingFactor < 1.0 ? 'bg-red-500' : 'bg-green-600'}`}
                  style={{ width: `${Math.min(100, yieldData.sowingFactor * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Weather Factor */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-earth-650 dark:text-earth-350">
                <span className="flex items-center gap-1"><Sun size={14} aria-hidden="true" /> {t('tempStress')}</span>
                <span className={yieldData.weatherFactor < 1.0 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                  {yieldData.weatherFactor.toFixed(2)}x {yieldData.stressAttribution?.heatPenalty > 0 ? `(-${yieldData.stressAttribution.heatPenalty}%)` : ''}
                </span>
              </div>
              <div className="w-full bg-earth-100 dark:bg-earth-800 h-2 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${yieldData.weatherFactor < 1.0 ? 'bg-red-500' : 'bg-green-600'}`}
                  style={{ width: `${Math.min(100, yieldData.weatherFactor * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Soil Factor */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-earth-650 dark:text-earth-350">
                <span className="flex items-center gap-1"><Sprout size={14} aria-hidden="true" /> {t('soilEfficiency')}</span>
                <span className={yieldData.soilFactor < 1.0 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                  {yieldData.soilFactor.toFixed(2)}x {yieldData.stressAttribution?.soilAdjustment !== 0 ? `(${yieldData.stressAttribution?.soilAdjustment > 0 ? '+' : ''}${yieldData.stressAttribution?.soilAdjustment}%)` : ''}
                </span>
              </div>
              <div className="w-full bg-earth-100 dark:bg-earth-800 h-2 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${yieldData.soilFactor < 1.0 ? 'bg-red-500' : 'bg-green-600'}`}
                  style={{ width: `${Math.min(100, yieldData.soilFactor * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Disease Risk Factor */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-earth-650 dark:text-earth-350">
                <span className="flex items-center gap-1"><Bug size={14} aria-hidden="true" /> {t('diseaseInfect')}</span>
                <span className={yieldData.diseaseFactor < 1.0 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                  {yieldData.diseaseFactor.toFixed(2)}x {yieldData.stressAttribution?.diseasePenalty > 0 ? `(-${yieldData.stressAttribution.diseasePenalty}%)` : ''}
                </span>
              </div>
              <div className="w-full bg-earth-100 dark:bg-earth-800 h-2 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${yieldData.diseaseFactor < 1.0 ? 'bg-red-500' : 'bg-green-600'}`}
                  style={{ width: `${Math.min(100, yieldData.diseaseFactor * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-earth-100 dark:border-earth-800 flex items-center justify-between text-[11px] text-earth-500 dark:text-earth-400">
            <span className="flex items-center gap-1">
              <BookOpen size={13} className="text-crop-600 dark:text-crop-400" aria-hidden="true" />
              {yieldData.literatureCitation || 'PBS / CRS Agro-Ecological Baselines'}
            </span>
          </div>
        </div>

        {/* Interactive Sandbox */}
        <div className="bg-white border border-earth-100 rounded-2xl p-5 sm:p-6 dark:bg-earth-900 dark:border-earth-800 shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-800 dark:text-earth-200">
              {t('yieldSandboxTitle')}
            </h4>
            <p className="text-xs text-earth-500 dark:text-earth-300 mt-1 font-medium">
              {t('yieldSandboxDesc')}
            </p>

            {/* Disease slider */}
            <div className="space-y-1.5 mt-4">
              <div className="flex justify-between text-xs font-semibold text-earth-700 dark:text-earth-300">
                <span>{t('disease')}</span>
                <span className="font-bold text-crop-600 dark:text-crop-400">{simulatedDisease}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={simulatedDisease} 
                onChange={(e) => setSimulatedDisease(parseInt(e.target.value))}
                className="w-full accent-crop-600 bg-earth-200 h-2 rounded-lg appearance-none dark:bg-earth-800 cursor-pointer"
              />
            </div>

            {/* Heatwave Toggle */}
            <div className="mt-4 pt-3.5 border-t border-earth-100 dark:border-earth-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-earth-700 dark:text-earth-300">
                  {t('simHeatwave')}
                </span>
                <input 
                  type="checkbox"
                  checked={simulatedHeatwave}
                  onChange={(e) => setSimulatedHeatwave(e.target.checked)}
                  className="h-4 w-4 rounded border-earth-300 text-crop-600 focus:ring-crop-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="p-3 bg-earth-50 dark:bg-earth-950/60 rounded-xl border border-earth-100 dark:border-earth-800 text-[10px] text-earth-500 dark:text-earth-400 font-medium leading-relaxed">
            <Lightbulb size={16} className="inline mr-1" aria-hidden="true" /> Slider adjustments immediately simulate stress factors on harvest output.
          </div>
        </div>
      </div>

      {/* Actionable Mitigation Advisories */}
      {yieldData.mitigations && yieldData.mitigations.length > 0 && (
        <div className="bg-white border border-earth-100 rounded-2xl p-5 sm:p-6 dark:bg-earth-900 dark:border-earth-800 shadow-soft space-y-3">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-800 dark:text-earth-200 flex items-center gap-1.5">
            <AlertTriangle size={16} className="text-amber-500" aria-hidden="true" />
            Agronomic Stress Mitigations ({yieldData.mitigations.length} Identified)
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {yieldData.mitigations.map((m, idx) => (
              <div key={idx} className="p-3.5 bg-earth-50 dark:bg-earth-950/60 rounded-xl border border-earth-100 dark:border-earth-800 text-xs">
                <div className="flex items-center justify-between font-bold text-earth-900 dark:text-earth-100">
                  <span className="text-xs font-semibold">{m.factor}</span>
                  <span className="text-rose-500 font-mono text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                    {m.impact}
                  </span>
                </div>
                <p className="mt-1.5 text-earth-650 dark:text-earth-350 leading-relaxed text-[11px]">
                  {m.advice}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

