import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { downloadPdfReport } from '../utils/pdfGenerator';

const sampleResult = {
  crop: 'Tomato',
  disease: 'Early Blight',
  confidence: 92,
  severity: 'Moderate',
  description: 'Early Blight is a common fungal disease of tomato and potato crops caused by the pathogen Alternaria solani. It primarily damages foliage, stems, and fruits, leading to defoliation and significant yield loss if unmanaged.',
  visibleSymptoms: [
    'Concentric rings (target-like spots) appearing on older leaves first',
    'Yellow halos surrounding leaf spots',
    'Stem lesions or cankers near the soil line'
  ],
  likelyCauses: [
    'High humidity or prolonged leaf wetness',
    'Spore transmission via wind, rain splash, or contaminated tools',
    'Pathogen overwintering in crop debris or alternative solanaceous hosts'
  ],
  recommendedActions: [
    'Prune lower branches to improve air circulation and prevent soil-splash contact',
    'Apply protective copper-based or systemic fungicides immediately',
    'Remove and safely discard heavily infected crop foliage'
  ],
  prevention: [
    'Select disease-resistant tomato varieties for planting',
    'Maintain a 3-year crop rotation cycle avoiding solanaceous crops',
    'Utilize drip irrigation to prevent moisture accumulation on leaves'
  ],
  bestPractices: [
    'Mulch soil surfaces to block spores from splashing up',
    'Sanitize pruning tools between crops with 70% isopropyl alcohol',
    'Conduct soil tests to ensure adequate potassium and nitrogen levels'
  ],
  recommendedProducts: [
    {
      id: 'fmc_cabrio_top',
      name: 'Cabrio Top',
      companyName: 'FMC Pakistan',
      productType: 'Fungicide',
      activeIngredient: 'Pyraclostrobin 5% + Metiram 55%',
      officialProductUrl: 'https://ag.fmc.com/pk/en/products/fungicides/cabrio-top',
      description: 'A high-performance fungicide offering superior protective and curative control against early blight, late blight, and powdery mildew on vegetable crops.'
    },
    {
      id: 'syngenta_amistar_top',
      name: 'Amistar Top',
      companyName: 'Syngenta Pakistan',
      productType: 'Fungicide',
      activeIngredient: 'Azoxystrobin 200g/L + Difenoconazole 125g/L',
      officialProductUrl: 'https://www.syngenta.com.pk/product/crop-protection/fungicide/amistar-top',
      description: 'A systemic broad-spectrum fungicide with preventative and curative activity, highly effective against rust, early blight, and leaf spot diseases.'
    }
  ]
};

function AnalysisResult({ result, isAnalyzing, error, uploadedImage }) {
  const [activeResult, setActiveResult] = useState(sampleResult);
  const [loadingStep, setLoadingStep] = useState(0);

  const isDemo = !result && !isAnalyzing && !error;

  useEffect(() => {
    if (result) {
      setActiveResult(result);
    } else if (isDemo) {
      setActiveResult(sampleResult);
    }
  }, [result, isDemo]);

  // Loading Steps logic
  useEffect(() => {
    if (!isAnalyzing) {
      setLoadingStep(0);
      return;
    }

    setLoadingStep(1);
    const t1 = setTimeout(() => setLoadingStep(2), 2000);
    const t2 = setTimeout(() => setLoadingStep(3), 4000);
    const t3 = setTimeout(() => setLoadingStep(4), 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isAnalyzing]);

  if (error && !result) return null;

  if (isAnalyzing) {
    const steps = [
      { label: 'Analyzing crop structure...', progress: 25 },
      { label: 'Detecting pathogen patterns...', progress: 50 },
      { label: 'Searching local knowledge base...', progress: 75 },
      { label: 'Structuring treatment suggestions...', progress: 95 }
    ];

    const currentStep = steps[Math.min(loadingStep - 1, 3)] || steps[0];

    return (
      <section className="border-t border-earth-100 bg-earth-50/20 py-20 text-center dark:border-earth-850 dark:bg-earth-900/20 transition-colors">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-crop-50 text-2xl text-crop-600 dark:bg-crop-950/30 dark:text-crop-300 animate-bounce">
            ⚡
          </span>
          <h3 className="mt-6 text-xl font-bold text-earth-900 dark:text-earth-50">Processing Leaf Image</h3>
          <p className="mt-2 text-sm text-earth-500 dark:text-earth-450">{currentStep.label}</p>

          {/* Animated Progress Bar */}
          <div className="mt-8 overflow-hidden rounded-full bg-earth-150 h-2.5 dark:bg-earth-800">
            <div
              className="h-full bg-crop-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${currentStep.progress}%` }}
            />
          </div>

          <div className="mt-6 flex justify-center gap-1.5">
            {[1, 2, 3, 4].map((stepIdx) => (
              <span
                key={stepIdx}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  stepIdx <= loadingStep ? 'bg-crop-600 w-4' : 'bg-earth-200 dark:bg-earth-700'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const getConfidenceBadge = (confidence) => {
    let val = 80;
    if (typeof confidence === 'number') {
      val = confidence;
    } else if (typeof confidence === 'string') {
      const parsed = parseInt(confidence.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed)) val = parsed;
    }

    if (val >= 95) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-950/20 dark:text-green-450 dark:ring-green-800/30">
          🟢 High ({val}%)
        </span>
      );
    } else if (val >= 75) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/20 dark:text-amber-450 dark:ring-amber-800/30">
          💡 Med ({val}%)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-950/20 dark:text-red-450 dark:ring-red-800/30">
          ⚠️ Low ({val}%)
        </span>
      );
    }
  };

  const getSeverityBadge = (severity) => {
    const sev = (severity || 'Low').trim().toLowerCase();
    if (sev === 'high') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-950/20 dark:text-red-450 dark:ring-red-800/30">
          🚨 High
        </span>
      );
    } else if (sev === 'moderate' || sev === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/20 dark:text-amber-450 dark:ring-amber-800/30">
          ⚠️ Moderate
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-950/20 dark:text-green-450 dark:ring-green-800/30">
          🌿 Low
        </span>
      );
    }
  };

  const finalCropName = activeResult.cropName || activeResult.crop || 'Unknown';
  const finalDisease = activeResult.disease || 'None';

  return (
    <section id="results" className="border-t border-earth-100 bg-earth-50/50 py-16 sm:py-24 dark:border-earth-850 dark:bg-earth-900/50 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Banner/Header */}
        <div className="mx-auto max-w-2xl text-center">
          {isDemo ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-100/80 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900/30">
              💡 Sample Demo Preview
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-crop-50 px-3 py-1 text-xs font-semibold text-crop-800 ring-1 ring-crop-100 dark:bg-crop-950/30 dark:text-crop-300 dark:ring-crop-900/30">
              ✅ AI Analysis Complete
            </span>
          )}
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl dark:text-earth-50">
            {isDemo ? 'Sample Diagnosis Results' : 'AI Crop Diagnosis'}
          </h2>
          <p className="mt-4 text-earth-500 dark:text-earth-450">
            {isDemo
              ? 'Below is an illustrative layout of the results you will receive. Upload a crop photo to generate live AI results.'
              : 'Our neural vision model has completed its diagnosis. Review the detected condition and action plan below.'}
          </p>
          {!isDemo && (
            <button
              type="button"
              onClick={() => downloadPdfReport(activeResult)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-crop-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-crop-600/20 transition-all hover:bg-crop-700 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-crop-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Report
            </button>
          )}
        </div>

        {/* Offline Warning Banner */}
        {activeResult.isUnindexed && (
          <div className="mt-8 max-w-4xl mx-auto rounded-2xl bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-100 flex items-start gap-4 text-left dark:bg-amber-950/20 dark:text-amber-300 dark:ring-amber-900/30">
            <span className="text-xl mt-0.5" role="img" aria-label="Info">💡</span>
            <div className="flex-1">
              <p className="font-bold text-amber-950 dark:text-amber-400">Offline Database Notice</p>
              <p className="mt-1 text-amber-850 leading-relaxed dark:text-amber-300">
                Although the vision model identified this condition, detailed diagnostic guidelines, symptoms, and registered chemical treatments are not yet present in our local database directory. General precautions have been loaded as a fallback.
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-8 max-w-6xl mx-auto">
          {/* Left Column: Image preview & Core Details */}
          <div className="mb-8 lg:mb-0 lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-earth-100 bg-white p-4 shadow-soft dark:border-earth-800 dark:bg-earth-850 transition-colors">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-earth-450 text-left dark:text-earth-400">
                Leaf Image Scanned
              </p>
              <div className="relative overflow-hidden rounded-xl bg-earth-50 aspect-square flex items-center justify-center border border-earth-100 dark:bg-earth-900 dark:border-earth-800">
                <img
                  src={uploadedImage || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80'}
                  alt={isDemo ? "Sample tomato plant leaf showing early blight spots" : `Uploaded image of ${finalCropName}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 right-3 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  AI Scanned
                </div>
              </div>

              <div className="mt-4 space-y-3 pt-3 border-t border-earth-100 text-left dark:border-earth-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-earth-500 font-medium dark:text-earth-400">Crop</span>
                  <span className="font-semibold text-earth-850 dark:text-earth-200">{finalCropName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-earth-500 font-medium dark:text-earth-400">Diagnosis</span>
                  <span className="font-semibold text-earth-800 dark:text-earth-100">{finalDisease}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-earth-500 font-medium font-semibold dark:text-earth-400">AI Confidence</span>
                  {getConfidenceBadge(activeResult.confidence)}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-earth-500 font-medium dark:text-earth-400">Severity</span>
                  {getSeverityBadge(activeResult.severity)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Cards Grid */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Description */}
            <div
              tabIndex={0}
              className="rounded-2xl border border-earth-100 bg-white p-6 shadow-soft transition-all hover:border-earth-200 hover:shadow-card text-left focus:outline-none focus:ring-2 focus:ring-crop-500 dark:border-earth-800 dark:bg-earth-850 dark:hover:border-earth-700"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base bg-earth-50 text-earth-700 ring-1 ring-earth-100 dark:bg-earth-900 dark:text-earth-300 dark:ring-earth-800" role="img" aria-hidden="true">📝</span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-earth-400 dark:text-earth-500">Description</p>
                  <p className="mt-2 text-sm leading-relaxed text-earth-750 font-medium dark:text-earth-200">
                    {activeResult.description || activeResult.analysisSummary}
                  </p>
                </div>
              </div>
            </div>

            {/* Symptoms & Causes Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Symptoms */}
              <div
                tabIndex={0}
                className="rounded-2xl border border-earth-100 bg-white p-6 shadow-soft transition-all hover:border-earth-200 hover:shadow-card text-left focus:outline-none focus:ring-2 focus:ring-crop-500 dark:border-earth-800 dark:bg-earth-850 dark:hover:border-earth-700"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:ring-amber-900/30" role="img" aria-hidden="true">🌡️</span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-earth-400 dark:text-earth-500">Visible Symptoms</p>
                    <ul className="mt-3 space-y-2">
                      {(activeResult.symptoms || activeResult.visibleSymptoms || []).map((symptom, idx) => (
                        <li key={idx} className="text-sm leading-relaxed text-earth-700 flex items-start gap-2 dark:text-earth-300">
                          <span className="text-amber-500 mt-1.5 select-none text-[8px]">•</span>
                          <span className="flex-1">{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Causes */}
              <div
                tabIndex={0}
                className="rounded-2xl border border-earth-100 bg-white p-6 shadow-soft transition-all hover:border-earth-200 hover:shadow-card text-left focus:outline-none focus:ring-2 focus:ring-crop-500 dark:border-earth-800 dark:bg-earth-850 dark:hover:border-earth-700"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base bg-red-50 text-red-700 ring-1 ring-red-100 dark:bg-red-950/20 dark:text-red-400 dark:ring-red-900/30" role="img" aria-hidden="true">❓</span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-earth-400 dark:text-earth-500">Likely Causes</p>
                    <ul className="mt-3 space-y-2">
                      {(activeResult.causes || activeResult.likelyCauses || []).map((cause, idx) => (
                        <li key={idx} className="text-sm leading-relaxed text-earth-700 flex items-start gap-2 dark:text-earth-300">
                          <span className="text-red-500 mt-1.5 select-none text-[8px]">•</span>
                          <span className="flex-1">{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Actions & Prevention */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Recommended Actions */}
              <div
                tabIndex={0}
                className="rounded-2xl border border-earth-100 bg-white p-6 shadow-soft transition-all hover:border-earth-200 hover:shadow-card text-left focus:outline-none focus:ring-2 focus:ring-crop-500 dark:border-earth-800 dark:bg-earth-850 dark:hover:border-earth-700"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base bg-crop-50 text-crop-700 ring-1 ring-crop-100 dark:bg-crop-950/20 dark:text-crop-400 dark:ring-crop-900/30" role="img" aria-hidden="true">⚡</span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-earth-400 dark:text-earth-500">Recommended Actions</p>
                    <ul className="mt-3 space-y-2">
                      {(activeResult.recommendedActions || activeResult.prevention || []).map((action, idx) => (
                        <li key={idx} className="text-sm leading-relaxed text-earth-700 flex items-start gap-2 dark:text-earth-300">
                          <span className="text-crop-600 mt-1.5 select-none text-[8px] dark:text-crop-400">⚫</span>
                          <span className="flex-1">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Prevention */}
              <div
                tabIndex={0}
                className="rounded-2xl border border-earth-100 bg-white p-6 shadow-soft transition-all hover:border-earth-200 hover:shadow-card text-left focus:outline-none focus:ring-2 focus:ring-crop-500 dark:border-earth-800 dark:bg-earth-850 dark:hover:border-earth-700"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base bg-earth-50 text-earth-750 ring-1 ring-earth-100 dark:bg-earth-900 dark:text-earth-300 dark:ring-earth-800" role="img" aria-hidden="true">🛡️</span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-earth-400 dark:text-earth-500">Prevention Strategies</p>
                    <ul className="mt-3 space-y-2">
                      {(activeResult.prevention || []).map((strategy, idx) => (
                        <li key={idx} className="text-sm leading-relaxed text-earth-700 flex items-start gap-2 dark:text-earth-300">
                          <span className="text-earth-450 mt-1.5 select-none text-[8px] dark:text-earth-500">•</span>
                          <span className="flex-1">{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div
              tabIndex={0}
              className="rounded-2xl border border-earth-100 bg-white p-6 shadow-soft transition-all hover:border-earth-200 hover:shadow-card text-left focus:outline-none focus:ring-2 focus:ring-crop-500 dark:border-earth-800 dark:bg-earth-850 dark:hover:border-earth-700"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base bg-crop-50 text-crop-850 ring-1 ring-crop-100 dark:bg-crop-950/20 dark:text-crop-400 dark:ring-crop-900/30" role="img" aria-hidden="true">🌾</span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-earth-400 dark:text-earth-500">Best Farming Practices</p>
                  <ul className="mt-3 space-y-2">
                    {(activeResult.bestPractices || []).map((practice, idx) => (
                      <li key={idx} className="text-sm leading-relaxed text-earth-700 flex items-start gap-2 dark:text-earth-300">
                        <span className="text-crop-600 mt-1.5 select-none text-[8px] dark:text-crop-400">⚫</span>
                        <span className="flex-1">{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Recommended Products Section */}
        {activeResult.recommendedProducts && (
          <div className="mt-16 border-t border-earth-150 pt-12 max-w-6xl mx-auto dark:border-earth-800">
            <h3 className="text-2xl font-bold tracking-tight text-earth-900 text-left dark:text-earth-50">
              Recommended Crop Protection Products
            </h3>
            <p className="mt-2 text-sm text-earth-500 text-left dark:text-earth-450">
              The following products from trusted manufacturers are officially registered for treating this condition:
            </p>

            {activeResult.recommendedProducts.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeResult.recommendedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col justify-between rounded-2xl border border-earth-100 bg-white p-6 shadow-soft transition-all hover:border-earth-200 hover:shadow-card text-left dark:border-earth-800 dark:bg-earth-850 dark:hover:border-earth-700"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center rounded-md bg-crop-50 px-2.5 py-0.5 text-xs font-semibold text-crop-800 ring-1 ring-inset ring-crop-600/20 dark:bg-crop-950/20 dark:text-crop-300 dark:ring-crop-900/30">
                          {product.productType}
                        </span>
                        <span className="text-xs font-semibold text-earth-450 dark:text-earth-400">
                          {product.companyName || product.company}
                        </span>
                      </div>
                      <h4 className="mt-3 text-lg font-bold text-earth-900 dark:text-earth-100">{product.name}</h4>
                      {product.activeIngredient && (
                        <p className="mt-1 text-xs text-earth-500 dark:text-earth-400">
                          <span className="font-semibold text-earth-650 dark:text-earth-300">Active Ingredient: </span>
                          {product.activeIngredient}
                        </p>
                      )}
                      <p className="mt-3 text-sm leading-relaxed text-earth-550 dark:text-earth-400">
                        {product.description || product.notes || 'No description available.'}
                      </p>
                    </div>
                    <div className="mt-6">
                      <a
                        href={product.officialProductUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Official details page for ${product.name} by ${product.companyName || product.company}`}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-earth-200 bg-white px-4 py-2.5 text-sm font-semibold text-earth-700 shadow-sm transition-all hover:bg-earth-55 hover:text-earth-950 dark:border-earth-800 dark:bg-earth-900 dark:text-earth-200 dark:hover:bg-earth-800 dark:hover:text-earth-100 focus:outline-none focus:ring-2 focus:ring-crop-500"
                      >
                        Official Product Details
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-earth-205 bg-earth-50/30 p-8 text-center dark:border-earth-800 dark:bg-earth-900/10">
                <span className="text-2xl" role="img" aria-label="Sprout">🌱</span>
                <h4 className="mt-2 text-sm font-semibold text-earth-850 dark:text-earth-200">No Chemical Products Recommended</h4>
                <p className="mt-1 text-xs text-earth-500 dark:text-earth-400 max-w-sm mx-auto">
                  {activeResult.healthStatus?.toLowerCase().includes('healthy')
                    ? 'This crop is healthy. No treatment products are required.'
                    : 'Manage this condition using the preventative steps and cultural best practices outlined above.'}
                </p>
              </div>
            )}
          </div>
        )}

        {isDemo && (
          <p className="mt-8 text-center text-sm text-earth-400 animate-pulse dark:text-earth-500">
            Demo data shown. Upload an image and click "Analyze Crop" to execute live diagnostics.
          </p>
        )}
      </div>
    </section>
  );
}

export default AnalysisResult;
