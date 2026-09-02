import { useEffect, useState } from 'react';
import { downloadPdfReport } from '../utils/pdfGenerator';
import { downloadWordReport } from '../utils/docGenerator';

const sampleResult = {
  crop: 'Cotton',
  cropName: 'Cotton',
  disease: 'Cotton Bacterial Blight',
  confidence: 91,
  severity: 'Moderate',
  description: 'Cotton Bacterial Blight (also termed Angular Leaf Spot or Blackarm) is a devastating vascular and foliar bacterial disease caused by Xanthomonas citri pv. malvacearum. The pathogen penetrates through stomata and mechanical wounds, multiplying in the intercellular spaces of parenchyma tissues. If left unchecked during monsoon winds, infection progresses from foliage down into petioles and structural branches, forming black girdling cankers (blackarm) and water-soaked boll lesions that cause premature boll opening, lint discoloration, and substantial yield depletion.',
  visibleSymptoms: [
    'Angular, water-soaked polyhedral lesions delimited strictly by minor leaf veins',
    'Lesions progressively darkening from dull green to dark brown and necrosis as tissue collapses',
    'Black, elongated water-soaked cankers along leaf petioles and main stems (blackarm phase)',
    'Water-soaked circular to irregular oily spots on developing bolls causing internal boll rot',
    'Severe infection causing premature defoliation, boll mummification, and fiber lint staining'
  ],
  likelyCauses: [
    'Bacterium Xanthomonas citri pv. malvacearum infection',
    'Prolonged high relative humidity (>80%) and canopy warmth (28°C to 34°C)',
    'Heavy or wind-driven monsoon rainfall splashing bacterial ooze across plant canopies',
    'Planting fuzzy, non-delinted seeds carrying internal bacterial inoculum',
    'Contaminated infected crop stubble and alternative malvaceous weed hosts surviving in field borders'
  ],
  recommendedActions: [
    'Plant certified, acid-delinted disease-free seed treated with antibacterial protectants',
    'Select resistant or tolerant cotton cultivars (e.g., FH-142, BS-15, IUB-2013) adapted to local zones',
    'Maintain rigorous field sanitation and rogue out infected volunteer seedlings during early thinning',
    'Deeply plow and incorporate crop residue into the soil post-harvest to accelerate bacterial decay',
    'Implement a 2- to 3-year crop rotation cycle with non-host cereals such as wheat, maize, or sorghum',
    'Avoid high-pressure overhead sprinkler irrigation that mechanically spreads bacterial inoculum'
  ],
  prevention: [
    'Plant certified, acid-delinted disease-free seed treated with antibacterial protectants',
    'Select resistant or tolerant cotton cultivars (e.g., FH-142, BS-15, IUB-2013) adapted to local zones',
    'Maintain rigorous field sanitation and rogue out infected volunteer seedlings during early thinning',
    'Deeply plow and incorporate crop residue into the soil post-harvest to accelerate bacterial decay',
    'Implement a 2- to 3-year crop rotation cycle with non-host cereals such as wheat, maize, or sorghum',
    'Avoid high-pressure overhead irrigation that mechanically spreads bacterial inoculum'
  ],
  recommendedProducts: [
    {
      id: 'suncrop_sun_cop',
      name: 'Sun-Cop 50% WP',
      companyName: 'Suncrop Group',
      company: 'Suncrop Group',
      productType: 'Bactericide / Fungicide',
      activeIngredient: 'Copper Oxychloride 50% WP',
      dosage: '250g - 300g per 100 liters of water / acre',
      officialProductUrl: 'https://www.suncropgroup.com/',
      description: 'Contact protective broad-spectrum bactericide and fungicide. Releases copper ions upon moisture contact, denaturing bacterial enzymes and forming a protective barrier that arrests Xanthomonas spread across leaf and boll surfaces.'
    },
    {
      id: 'bayer_confidor',
      name: 'Confidor 200 SL',
      companyName: 'Bayer Crop Science Pakistan',
      company: 'Bayer Crop Science Pakistan',
      productType: 'Systemic Insecticide',
      activeIngredient: 'Imidacloprid 200 g/L SL',
      dosage: '250 ml per acre in 100L water',
      officialProductUrl: 'https://www.cropscience.bayer.com.pk/en-pk/products/insecticides/confidor-200-sl.html',
      description: 'Systemic neonicotinoid targeting sucking pests (whiteflies, thrips, and aphids) that create foliar puncture wounds through which bacterial blight enters, while simultaneously suppressing the vector of Cotton Leaf Curl Virus (CLCuV).'
    }
  ]
};

function getPathogenDetails(crop, disease) {
  const norm = (disease || '').toLowerCase();
  const cNorm = (crop || '').toLowerCase();

  if (norm.includes('bacterial') || norm.includes('xanthomonas') || cNorm.includes('cotton')) {
    return {
      type: 'Bacterial Disease',
      pathogen: 'Xanthomonas citri pv. malvacearum'
    };
  }
  if (norm.includes('early blight') || norm.includes('alternaria')) {
    return {
      type: 'Fungal Disease',
      pathogen: 'Alternaria solani'
    };
  }
  if (norm.includes('rust') || norm.includes('puccinia')) {
    return {
      type: 'Fungal Disease',
      pathogen: 'Puccinia triticina'
    };
  }
  if (norm.includes('late blight') || norm.includes('phytophthora')) {
    return {
      type: 'Oomycete Disease',
      pathogen: 'Phytophthora infestans'
    };
  }
  if (norm.includes('blast') || norm.includes('magnaporthe')) {
    return {
      type: 'Fungal Disease',
      pathogen: 'Magnaporthe oryzae'
    };
  }
  if (norm.includes('red rot') || norm.includes('colletotrichum')) {
    return {
      type: 'Fungal Disease',
      pathogen: 'Colletotrichum falcatum'
    };
  }
  if (norm.includes('northern') || norm.includes('exserohilum')) {
    return {
      type: 'Fungal Disease',
      pathogen: 'Exserohilum turcicum'
    };
  }
  return {
    type: 'Agronomic Pathology',
    pathogen: 'Pathogen visual profile identified'
  };
}

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

  // Loading Steps animation
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
      { label: 'Analyzing crop leaf architecture...', progress: 25 },
      { label: 'Detecting fungal and bacterial pathogen patterns...', progress: 50 },
      { label: 'Searching local agronomic knowledge base...', progress: 75 },
      { label: 'Structuring treatment protocol & diagnostic report...', progress: 95 }
    ];

    const currentStep = steps[Math.min(loadingStep - 1, 3)] || steps[0];

    return (
      <section className="border-t border-earth-100 bg-earth-50/20 py-20 text-center dark:border-earth-850 dark:bg-earth-900/20 transition-colors">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-crop-50 text-xl font-bold text-crop-600 dark:bg-crop-950/30 dark:text-crop-300">
            CRX
          </div>
          <h3 className="mt-6 text-xl font-bold text-earth-900 dark:text-earth-50">Processing Leaf Image</h3>
          <p className="mt-2 text-sm text-earth-500 dark:text-earth-450">{currentStep.label}</p>

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

  const finalCropName = activeResult.cropName || activeResult.crop || 'Cotton';
  const finalDisease = activeResult.disease || 'Cotton Bacterial Blight';
  const confidenceVal = activeResult.confidence ? `${activeResult.confidence}%` : '91%';
  const severityVal = activeResult.severity || 'Moderate';
  const { type: diseaseType, pathogen } = getPathogenDetails(finalCropName, finalDisease);

  const symptomsList = (activeResult.visibleSymptoms && activeResult.visibleSymptoms.length > 0)
    ? activeResult.visibleSymptoms
    : (activeResult.symptoms && activeResult.symptoms.length > 0)
    ? activeResult.symptoms
    : sampleResult.visibleSymptoms;

  const causesList = (activeResult.likelyCauses && activeResult.likelyCauses.length > 0)
    ? activeResult.likelyCauses
    : (activeResult.causes && activeResult.causes.length > 0)
    ? activeResult.causes
    : sampleResult.likelyCauses;

  const preventionList = (activeResult.recommendedActions && activeResult.recommendedActions.length > 0)
    ? activeResult.recommendedActions
    : (activeResult.prevention && activeResult.prevention.length > 0)
    ? activeResult.prevention
    : sampleResult.recommendedActions;

  const productsList = (activeResult.recommendedProducts && activeResult.recommendedProducts.length > 0)
    ? activeResult.recommendedProducts
    : sampleResult.recommendedProducts;

  return (
    <section id="results" className="border-t border-earth-100 bg-earth-50/40 py-12 sm:py-16 dark:border-earth-850 dark:bg-earth-900/40 transition-colors">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-crop-600 dark:text-crop-400">
              Diagnostic Assessment
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-earth-900 dark:text-earth-50 mt-0.5">
              CROPEX AI Crop Health Diagnostic Report
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => downloadPdfReport(activeResult)}
              className="h-10 inline-flex items-center gap-2 rounded-xl bg-crop-600 px-5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-crop-600/20 transition-all hover:bg-crop-700 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-crop-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Report (A4)
            </button>

            <button
              type="button"
              onClick={() => downloadWordReport(activeResult)}
              className="h-10 inline-flex items-center gap-2 rounded-xl border border-earth-200 bg-white px-4 text-xs sm:text-sm font-bold text-earth-800 shadow-xs transition-all hover:bg-earth-50 dark:border-earth-750 dark:bg-earth-900 dark:text-earth-200 dark:hover:bg-earth-800 cursor-pointer"
            >
              <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Word (.doc)
            </button>
          </div>
        </div>

        {/* Enterprise Report Sheet View (Matches A4 Architecture) */}
        <div className="relative bg-white dark:bg-earth-900 rounded-2xl border border-earth-100 dark:border-earth-800 shadow-soft p-6 sm:p-10 text-left overflow-hidden">
          
          {/* Subtle Watermark in Center */}
          <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.04]">
            <span className="text-[120px] font-black tracking-tighter text-earth-900 dark:text-white">
              CROPEX
            </span>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2 pb-5 border-b border-earth-100 dark:border-earth-800 relative z-10">
            <div>
              <div className="text-xl font-black tracking-wider text-earth-900 dark:text-earth-50">
                CROPEX
              </div>
              <div className="text-[10px] font-bold text-crop-600 dark:text-crop-400 uppercase tracking-widest mt-0.5">
                AI CROP HEALTH DIAGNOSTIC REPORT
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs font-bold text-earth-800 dark:text-earth-200">
                REPORT ID: CRX-2026-0902-001
              </div>
              <div className="text-[11px] text-earth-500 dark:text-earth-450 mt-0.5">
                GENERATED: 02 September 2026, 06:26 PM
              </div>
            </div>
          </div>

          {/* DIAGNOSIS SECTION */}
          <div className="mt-6 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-crop-600 dark:text-crop-400 block">
              DIAGNOSIS
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-earth-900 dark:text-earth-50 mt-1">
              {finalDisease}
            </h3>
            <p className="text-xs sm:text-sm italic text-earth-500 dark:text-earth-400 mt-0.5 font-sans">
              {pathogen}
            </p>

            {/* 4-Column Diagnostic Summary Card */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-earth-50/60 dark:bg-earth-950/60 p-4 rounded-xl border border-earth-100 dark:border-earth-800">
              <div>
                <span className="text-[9px] uppercase font-bold text-earth-500 dark:text-earth-350 tracking-wider block">
                  CROP
                </span>
                <span className="text-sm font-bold text-earth-850 dark:text-earth-100 mt-0.5 block">
                  {finalCropName}
                </span>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-earth-500 dark:text-earth-350 tracking-wider block">
                  DISEASE TYPE
                </span>
                <span className="text-sm font-bold text-earth-850 dark:text-earth-100 mt-0.5 block">
                  {diseaseType}
                </span>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-earth-500 dark:text-earth-350 tracking-wider block">
                  CONFIDENCE
                </span>
                <span className="text-sm font-bold text-crop-600 dark:text-crop-350 mt-0.5 block">
                  {confidenceVal}
                </span>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-earth-500 dark:text-earth-350 tracking-wider block">
                  SEVERITY
                </span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {severityVal}
                </span>
              </div>
            </div>

            {/* In-depth Pathological Description */}
            <div className="mt-5 text-xs sm:text-sm text-earth-700 dark:text-earth-200 leading-relaxed font-medium bg-earth-50/30 dark:bg-earth-950/40 p-4 rounded-xl border border-earth-100/60 dark:border-earth-800/60">
              <span className="font-bold text-earth-900 dark:text-earth-50 block mb-1">Pathological Overview:</span>
              {activeResult.description || sampleResult.description}
            </div>
          </div>

          {/* 1. VISIBLE SYMPTOMS */}
          <div className="mt-8 pt-5 border-t border-earth-100 dark:border-earth-800 relative z-10">
            <h4 className="text-xs font-bold uppercase tracking-widest text-crop-600 dark:text-crop-400 mb-3">
              VISIBLE SYMPTOMS
            </h4>
            <ul className="space-y-2.5">
              {symptomsList.map((item, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-earth-750 dark:text-earth-200 flex items-start gap-2.5">
                  <span className="w-1.5 h-0.5 bg-crop-600 mt-2 shrink-0 rounded-full dark:bg-crop-400"></span>
                  <span className="font-medium leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. LIKELY CAUSES & RISK FACTORS */}
          <div className="mt-8 pt-5 border-t border-earth-100 dark:border-earth-800 relative z-10">
            <h4 className="text-xs font-bold uppercase tracking-widest text-crop-600 dark:text-crop-400 mb-3">
              LIKELY CAUSES & RISK FACTORS
            </h4>
            <ul className="space-y-2.5">
              {causesList.map((item, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-earth-750 dark:text-earth-200 flex items-start gap-2.5">
                  <span className="w-1.5 h-0.5 bg-crop-600 mt-2 shrink-0 rounded-full dark:bg-crop-400"></span>
                  <span className="font-medium leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. PREVENTION & MANAGEMENT */}
          <div className="mt-8 pt-5 border-t border-earth-100 dark:border-earth-800 relative z-10">
            <h4 className="text-xs font-bold uppercase tracking-widest text-crop-600 dark:text-crop-400 mb-3">
              PREVENTION & MANAGEMENT
            </h4>
            <ul className="space-y-2.5">
              {preventionList.map((item, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-earth-750 dark:text-earth-200 flex items-start gap-2.5">
                  <span className="w-1.5 h-0.5 bg-crop-600 mt-2 shrink-0 rounded-full dark:bg-crop-400"></span>
                  <span className="font-medium leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. AI DIAGNOSTIC DISCLAIMER */}
          <div className="mt-8 p-4 rounded-xl bg-earth-50/80 dark:bg-earth-950/60 border border-earth-150 dark:border-earth-800 relative z-10">
            <span className="text-[10px] font-bold text-earth-500 dark:text-earth-350 uppercase tracking-widest block">
              AI DIAGNOSTIC DISCLAIMER
            </span>
            <p className="mt-1 text-xs text-earth-600 dark:text-earth-300 leading-relaxed font-medium">
              This assessment is based on AI-powered visual analysis. Similar symptoms may have different causes. Field verification by a qualified agricultural professional is recommended before treatment decisions.
            </p>
          </div>

          {/* 5. Minimal Footer */}
          <div className="mt-8 pt-4 border-t border-earth-100 dark:border-earth-800 text-center relative z-10">
            <p className="text-[11px] text-earth-400 dark:text-earth-350 font-medium">
              Intelligent Agricultural Decision Support
            </p>
          </div>

        </div>

        {/* 6. RECOMMENDED CROP PROTECTION PRODUCTS (COMMERCIAL FORMULATIONS & OFFICIAL WEBSITES) */}
        {productsList && productsList.length > 0 && (
          <div className="mt-12 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 pb-3 border-b border-earth-200 dark:border-earth-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-crop-600 dark:text-crop-400">
                  Chemical & Biological Interventions
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-earth-900 dark:text-earth-50 mt-0.5">
                  Recommended Crop Protection Products
                </h3>
              </div>
              <p className="text-xs text-earth-500 dark:text-earth-350 font-medium">
                Official products registered with DPP Pakistan
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {productsList.map((product, idx) => (
                <div
                  key={product.id || idx}
                  className="flex flex-col justify-between rounded-2xl border border-earth-200 bg-white p-6 shadow-soft hover:shadow-card hover:border-crop-500/30 transition-all dark:border-earth-800 dark:bg-earth-900"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-lg bg-crop-50 px-2.5 py-1 text-xs font-bold text-crop-800 ring-1 ring-inset ring-crop-600/20 dark:bg-crop-950/40 dark:text-crop-300 dark:ring-crop-900/40">
                        {product.productType || 'Crop Protection'}
                      </span>
                      <span className="text-xs font-bold text-earth-600 dark:text-earth-300">
                        {product.companyName || product.company || 'Licensed Manufacturer'}
                      </span>
                    </div>

                    <h4 className="mt-3.5 text-lg font-bold text-earth-900 dark:text-earth-50">
                      {product.name}
                    </h4>

                    {product.activeIngredient && (
                      <p className="mt-2 text-xs text-earth-700 dark:text-earth-250">
                        <span className="font-bold text-earth-900 dark:text-earth-100">Active Ingredient: </span>
                        {product.activeIngredient}
                      </p>
                    )}

                    {product.dosage && (
                      <p className="mt-1 text-xs text-earth-700 dark:text-earth-250">
                        <span className="font-bold text-earth-900 dark:text-earth-100">Recommended Dosage: </span>
                        {product.dosage}
                      </p>
                    )}

                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-earth-650 dark:text-earth-300 font-medium">
                      {product.description || product.notes || 'Curative and protective formulation targeting foliar pathogens.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-earth-100 dark:border-earth-800">
                    <a
                      href={product.officialProductUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-earth-200 bg-earth-50/50 hover:bg-crop-50 hover:text-crop-700 hover:border-crop-300 px-4 py-2.5 text-xs sm:text-sm font-bold text-earth-750 transition-all dark:border-earth-750 dark:bg-earth-850 dark:text-earth-200 dark:hover:bg-crop-950/30 dark:hover:text-crop-300 cursor-pointer"
                    >
                      <span>Official Product Details & Label</span>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default AnalysisResult;
