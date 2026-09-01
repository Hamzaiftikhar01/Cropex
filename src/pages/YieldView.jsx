import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { calculateYieldForecast, calculateDiseaseRisk } from '../utils/agriRules';

export default function YieldView({ fieldProfile, weatherData }) {
  const { t, language } = useLanguage();
  const diseaseRisk = calculateDiseaseRisk(fieldProfile.cropType, weatherData, language).percentage;

  // Sandbox inputs overrides
  const [simulatedDisease, setSimulatedDisease] = useState(diseaseRisk);
  const [simulatedHeatwave, setSimulatedHeatwave] = useState(false);

  // Sync state if crop changes (just in case key doesn't trigger)
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
    fieldProfile.cropType,
    fieldProfile.soilType,
    fieldProfile.sowingDate,
    calcWeatherData,
    simulatedDisease,
    language
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-earth-900 dark:text-earth-50">{t('yieldForecastTitle')}</h2>
        <p className="text-xs text-earth-500 dark:text-earth-450 mt-0.5">
          {t('yieldSubtitle')}
        </p>
      </div>

      {/* Main Yield Estimate Result Card */}
      <div className="bg-gradient-to-br from-earth-800 to-earth-900 text-white rounded-2xl p-6 shadow-md dark:from-earth-900 dark:to-earth-950 border border-earth-700/30">
        <span className="text-xs uppercase font-bold text-earth-300 tracking-wider">{t('yield')}</span>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div>
            <span className="text-5xl font-black text-crop-400">
              {yieldData.minYield} - {yieldData.maxYield}
            </span>
            <span className="text-xl text-earth-100 font-bold ml-2">{t('maundsPerAcre')}</span>
          </div>
          <span className="text-xs text-earth-300 bg-earth-800/80 border border-earth-700 px-3 py-1 rounded-full font-medium">
            🎯 {t('yieldAverage')}: {yieldData.expectedYield} {t('maunds')}
          </span>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-earth-200 border-t border-earth-700/50 pt-4 font-semibold italic">
          * {yieldData.confidenceNote}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Regression Penalties Breakdown */}
        <div className="bg-white border border-earth-100 rounded-2xl p-5 dark:bg-earth-900 dark:border-earth-850 shadow-soft md:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-earth-800 dark:text-earth-200">{t('yieldBreakdown')}</h4>
          
          <div className="space-y-3.5">
            {/* Sowing Factor */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-earth-650 dark:text-earth-350">
                <span>📅 {t('sowingAlign')}</span>
                <span className={yieldData.sowingFactor < 1.0 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                  {yieldData.sowingFactor.toFixed(2)}x
                </span>
              </div>
              <div className="w-full bg-earth-100 dark:bg-earth-800 h-2 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${yieldData.sowingFactor < 1.0 ? 'bg-red-500' : 'bg-green-600'}`}
                  style={{ width: `${yieldData.sowingFactor * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Weather Factor */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-earth-650 dark:text-earth-350">
                <span>☀️ {t('tempStress')}</span>
                <span className={yieldData.weatherFactor < 1.0 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                  {yieldData.weatherFactor.toFixed(2)}x
                </span>
              </div>
              <div className="w-full bg-earth-100 dark:bg-earth-800 h-2 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${yieldData.weatherFactor < 1.0 ? 'bg-red-500' : 'bg-green-600'}`}
                  style={{ width: `${yieldData.weatherFactor * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Soil Factor */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-earth-650 dark:text-earth-350">
                <span>🌱 {t('soilEfficiency')}</span>
                <span className={yieldData.soilFactor < 1.0 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                  {yieldData.soilFactor.toFixed(2)}x
                </span>
              </div>
              <div className="w-full bg-earth-100 dark:bg-earth-800 h-2 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${yieldData.soilFactor < 1.0 ? 'bg-red-500' : 'bg-green-600'}`}
                  style={{ width: `${yieldData.soilFactor * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Disease Risk Factor */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-earth-650 dark:text-earth-350">
                <span>🦠 {t('diseaseInfect')}</span>
                <span className={yieldData.diseaseFactor < 1.0 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                  {yieldData.diseaseFactor.toFixed(2)}x
                </span>
              </div>
              <div className="w-full bg-earth-100 dark:bg-earth-800 h-2 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${yieldData.diseaseFactor < 1.0 ? 'bg-red-500' : 'bg-green-600'}`}
                  style={{ width: `${yieldData.diseaseFactor * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-earth-450 dark:text-earth-500 pt-2 border-t border-earth-100 dark:border-earth-805">
            Formula: Yield = Base Potential × Max(0.60, Sowing × Weather × Soil × Disease). Factors are calculated daily. Clamped to a minimum of 0.60 to prevent unrealistic compound destruction.
          </p>
        </div>

        {/* Interactive Sandbox */}
        <div className="bg-earth-50 border border-earth-100 rounded-2xl p-5 dark:bg-earth-900 dark:border-earth-850 shadow-soft space-y-4">
          <h4 className="text-sm font-bold text-earth-800 dark:text-earth-200">{t('yieldSandboxTitle')}</h4>
          <p className="text-xs text-earth-500 dark:text-earth-450">
            {t('yieldSandboxDesc')}
          </p>

          {/* Disease slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-earth-700 dark:text-earth-350">
              <span>{t('disease')}</span>
              <span className="font-bold">{simulatedDisease}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={simulatedDisease} 
              onChange={(e) => setSimulatedDisease(parseInt(e.target.value))}
              className="w-full accent-crop-600 bg-earth-200 h-1.5 rounded-lg appearance-none dark:bg-earth-800"
            />
          </div>

          {/* Heatwave toggle */}
          <div className="flex items-center justify-between text-xs font-medium text-earth-700 dark:text-earth-350 pt-2">
            <span>{t('simHeatwave')}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={simulatedHeatwave} 
                onChange={(e) => setSimulatedHeatwave(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-earth-300 dark:bg-earth-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-earth-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-crop-600"></div>
            </label>
          </div>

          {/* Reset buttons */}
          <button
            onClick={() => {
              setSimulatedDisease(diseaseRisk);
              setSimulatedHeatwave(false);
            }}
            className="w-full mt-2 py-2 border border-earth-200 bg-white hover:bg-earth-100 text-[11px] font-bold rounded-xl text-earth-700 dark:bg-earth-850 dark:border-earth-800 dark:text-earth-300 dark:hover:bg-earth-800 cursor-pointer"
          >
            {t('resetSim')}
          </button>
        </div>
      </div>
    </div>
  );
}
