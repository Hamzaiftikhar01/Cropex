import { useLanguage } from '../context/LanguageContext';

function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="bg-earth-50/50 py-16 sm:py-24 text-left transition-colors duration-200 dark:bg-earth-900/50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-crop-50 px-3 py-1 text-xs font-semibold text-crop-800 ring-1 ring-crop-100 dark:bg-crop-950/30 dark:text-crop-300 dark:ring-crop-900/30">
            🌱 About Cropex
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl dark:text-earth-50">
            Your AI Companion for Smarter Farming
          </h2>
          <p className="mt-4 text-base text-earth-500 max-w-2xl mx-auto dark:text-earth-300 leading-relaxed font-semibold">
            Cropex is an AI-powered multilingual smart farming platform designed to help farmers predict crop diseases, optimize water usage, forecast harvest yield potential, and get instant agricultural insights.
          </p>
        </div>

        <div className="space-y-8">
          {/* Card 1: Main Mission */}
          <div className="rounded-2xl border border-earth-100 bg-white p-6 sm:p-8 shadow-soft transition-all hover:shadow-card dark:border-earth-800 dark:bg-earth-850">
            <h3 className="text-lg font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
              <span>🎯</span> Our Core Mission
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-earth-650 dark:text-earth-350 font-medium">
              Traditional disease detection tools only alert farmers after visible leaf damage has already ruined the crop. Cropex stands for <strong>Prevention &gt; Detection</strong>. By analyzing micro-climate weather trends, soil types, and crop growth stages, the platform predicts outbreak probabilities beforehand, giving farmers an actionable window to protect their crop yield.
            </p>
          </div>

          {/* Card 2: 5 Integrated Smart Modules */}
          <div className="rounded-2xl border border-earth-100 bg-white p-6 sm:p-8 shadow-soft transition-all hover:shadow-card dark:border-earth-800 dark:bg-earth-850">
            <h3 className="text-lg font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
              <span>🚀</span> 5 Genuinely Working Core Modules
            </h3>
            <div className="mt-4 space-y-4">
              <div className="border-l-2 border-crop-500 pl-4">
                <h4 className="text-sm font-bold text-earth-850 dark:text-earth-200">1. Agricultural Weather Intelligence</h4>
                <p className="text-xs text-earth-550 dark:text-earth-400 mt-1">
                  Fetches live forecast variables directly from Open-Meteo with local coordinate calibrations. Flags active danger warnings (frost, heatwaves, heavy rainfall) alongside advice on crop impact.
                </p>
              </div>

              <div className="border-l-2 border-crop-500 pl-4">
                <h4 className="text-sm font-bold text-earth-850 dark:text-earth-200">2. Proactive Disease Risk & Outbreak Warnings</h4>
                <p className="text-xs text-earth-550 dark:text-earth-400 mt-1">
                  Calculates mathematical disease spore thresholds (Late Blight for Tomato/Potato, Rust for Wheat, Blast for Rice) based on 7-day average temperatures and relative humidity readings.
                </p>
              </div>

              <div className="border-l-2 border-crop-500 pl-4">
                <h4 className="text-sm font-bold text-earth-850 dark:text-earth-200">3. Hydrodynamic Smart Irrigation Scheduler</h4>
                <p className="text-xs text-earth-550 dark:text-earth-400 mt-1">
                  Recommends watering requirements by combining soil characteristics (Sandy, Loamy, Clay) with crop age factors, evaporation adjustments, and rain saving offsets.
                </p>
              </div>

              <div className="border-l-2 border-crop-500 pl-4">
                <h4 className="text-sm font-bold text-earth-850 dark:text-earth-200">4. Explainable Yield Regression Analytics</h4>
                <p className="text-xs text-earth-550 dark:text-earth-400 mt-1">
                  Forecasts expected yield ranges (maunds/acre) using a mathematical model that weights climate anomalies, sowing window alignments, and soil texture coefficients.
                </p>
              </div>

              <div className="border-l-2 border-crop-500 pl-4">
                <h4 className="text-sm font-bold text-earth-850 dark:text-earth-200">5. Multilingual AI Assistant with Voice Output</h4>
                <p className="text-xs text-earth-550 dark:text-earth-400 mt-1">
                  Provides unified agricultural guidance in English, Urdu, and Punjabi Shahmukhi script. Features browser-native Text-to-Speech (TTS) to read recommendations aloud, helping farmers with limited literacy.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Manufacturer Registration Index */}
          <div className="rounded-2xl border border-earth-100 bg-white p-6 sm:p-8 shadow-soft transition-all hover:shadow-card dark:border-earth-800 dark:bg-earth-850">
            <h3 className="text-lg font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
              <span>📦</span> Offline registered database
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-earth-650 dark:text-earth-350 font-medium">
              To guarantee immediate support in rural fields with weak cell connectivity, Cropex bundles a local index of officially registered chemical crop treatments. Scrapers gather these indices from leading manufacturers in Pakistan:
            </p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-earth-800 dark:text-earth-200">
              <span className="bg-earth-100 px-3 py-1.5 rounded-lg text-center dark:bg-earth-800">FMC Pakistan</span>
              <span className="bg-earth-100 px-3 py-1.5 rounded-lg text-center dark:bg-earth-800">Suncrop Group</span>
              <span className="bg-earth-100 px-3 py-1.5 rounded-lg text-center dark:bg-earth-800">Syngenta Pakistan</span>
              <span className="bg-earth-100 px-3 py-1.5 rounded-lg text-center dark:bg-earth-800">Bayer Pakistan</span>
            </div>
          </div>

          {/* Professional Disclaimer */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-6 sm:p-8 shadow-soft dark:border-amber-900/40 dark:bg-amber-950/20">
            <h3 className="text-lg font-bold text-amber-950 dark:text-amber-400 flex items-center gap-2">
              <span>⚠️</span> Professional Disclaimer
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-amber-900 dark:text-amber-300 font-semibold italic">
              All diagnosis reports, chemical product listings, and smart predictions provided by Cropex are for educational and informational purposes only. Farmers should consult qualified local agronomists and read official manufacturer product labels before applying crop chemicals.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

export default About;
