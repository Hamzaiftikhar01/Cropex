import { useEffect, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';
import { downloadPdfReport } from '../utils/pdfGenerator';
import { downloadWordReport } from '../utils/docGenerator';
import ExpertEscalationModal from './ExpertEscalationModal';
import { speakText, stopSpeaking } from '../lib/voiceService';

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
      id: 'syngenta_amistar_top',
      name: 'Amistar Top',
      companyName: 'Syngenta Pakistan Ltd',
      company: 'Syngenta Pakistan Ltd',
      productType: 'Systemic Fungicide',
      activeIngredient: 'Azoxystrobin 200 g/L + Difenoconazole 125 g/L SC',
      dosage: '200 ml in 100–120 liters of water / acre',
      labelDosageAcre: '200 ml in 100–120 liters of water per acre',
      dppRegistrationNo: 'DPP-PK/F-1042/2018',
      phiDays: 30,
      whoToxicityClass: 'Class III (Slightly Hazardous)',
      protectiveEquipment: ['Nitrile chemical gloves', 'Face mask (N95/FFP2)', 'Eye goggles', 'Rubber boots'],
      officialUrl: 'https://www.syngenta.com.pk/product/crop-protection/amistar-top-02',
      officialProductUrl: 'https://www.syngenta.com.pk/product/crop-protection/amistar-top-02',
      url: 'https://www.syngenta.com.pk/product/crop-protection/amistar-top-02',
      description: 'Systemic dual-action fungicide registered with DPP Pakistan for preventative and curative control of foliar pathogens.'
    },
    {
      id: 'fmc_cabrio_top',
      name: 'Cabrio Top 60 WG',
      companyName: 'FMC United (Pvt) Ltd Pakistan',
      company: 'FMC United (Pvt) Ltd Pakistan',
      productType: 'Broad-Spectrum Fungicide',
      activeIngredient: 'Pyraclostrobin 5% + Metiram 55% WG',
      dosage: '300 g in 100 liters of water / acre',
      labelDosageAcre: '300 g in 100 liters of water per acre',
      dppRegistrationNo: 'DPP-PK/F-0912/2017',
      phiDays: 5,
      whoToxicityClass: 'Class III (Slightly Hazardous)',
      protectiveEquipment: ['Nitrile gloves', 'Particulate mask', 'Safety goggles', 'Rubber boots'],
      officialUrl: 'https://ag.fmc.com/pk/en/products/fungicides/cabrio-top',
      officialProductUrl: 'https://ag.fmc.com/pk/en/products/fungicides/cabrio-top',
      url: 'https://ag.fmc.com/pk/en/products/fungicides/cabrio-top',
      description: 'Broad-spectrum fungicide registered with DPP Pakistan offering plant health physiological effects alongside fungal suppression.'
    }
  ]
};

/**
 * Resolves verified live official website links for FMC and Syngenta Pakistan products.
 */
export function resolveOfficialProductUrl(product) {
  if (!product) return '#';
  const rawUrl = (product.officialUrl || product.officialProductUrl || product.official_url || product.url || '').trim();
  const nameLower = (product.name || '').toLowerCase();
  const companyLower = (product.company || product.companyName || product.manufacturer || '').toLowerCase();

  // Syngenta Pakistan Verified Product Routing
  if (companyLower.includes('syngenta') || rawUrl.includes('syngenta.com.pk') || (product.id && product.id.startsWith('syngenta_'))) {
    if (nameLower.includes('amistar') || rawUrl.includes('amistar')) {
      return 'https://www.syngenta.com.pk/product/crop-protection/amistar-top-02';
    }
    if (nameLower.includes('tilt') || rawUrl.includes('tilt')) {
      return 'https://www.syngenta.com.pk/product/crop-protection/tilt-250-ec-01';
    }
    if (nameLower.includes('score') || rawUrl.includes('score')) {
      return 'https://www.syngenta.com.pk/product/crop-protection/score-250-ec-01';
    }
    if (nameLower.includes('polo') || rawUrl.includes('polo')) {
      return 'https://www.syngenta.com.pk/product/crop-protection/polo-500-sc-01';
    }
    if (nameLower.includes('match') || rawUrl.includes('match')) {
      return 'https://www.syngenta.com.pk/product/match';
    }
    if (nameLower.includes('ridomil') || rawUrl.includes('ridomil')) {
      return 'https://www.syngenta.com.pk/product/crop-protection/fungicides';
    }
    if (rawUrl && rawUrl.startsWith('http')) return rawUrl;
    return 'https://www.syngenta.com.pk/product/crop-protection';
  }

  // FMC Pakistan Verified Product Routing
  if (companyLower.includes('fmc') || rawUrl.includes('fmc.com') || (product.id && product.id.startsWith('fmc_'))) {
    if (nameLower.includes('cabrio') || rawUrl.includes('cabrio')) {
      return 'https://ag.fmc.com/pk/en/products/fungicides/cabrio-top';
    }
    if (nameLower.includes('talstar') || rawUrl.includes('talstar')) {
      return 'https://ag.fmc.com/pk/en/products/insecticides/talstar';
    }
    if (nameLower.includes('ferterra') || rawUrl.includes('ferterra')) {
      return 'https://ag.fmc.com/pk/en/products/insecticides/ferterra';
    }
    if (nameLower.includes('coragen') || rawUrl.includes('coragen')) {
      return 'https://ag.fmc.com/pk/en/products/insecticides/coragen';
    }
    if (nameLower.includes('steward') || rawUrl.includes('steward')) {
      return 'https://ag.fmc.com/pk/en/products/insecticides';
    }
    if (rawUrl && rawUrl.startsWith('http')) return rawUrl;
    return 'https://ag.fmc.com/pk/en/products';
  }

  if (rawUrl && rawUrl.startsWith('http')) return rawUrl;

  return `https://www.google.com/search?q=${encodeURIComponent(
    (product.name || 'Pesticide') + ' ' + (product.companyName || product.company || 'Pakistan') + ' agricultural label DPP'
  )}`;
}

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
  const [isEscalationOpen, setIsEscalationOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isDemo = !result && !isAnalyzing && !error;

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

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

  const rawProducts = (activeResult.dppRegisteredProducts && activeResult.dppRegisteredProducts.length > 0)
    ? activeResult.dppRegisteredProducts
    : (activeResult.recommendedProducts && activeResult.recommendedProducts.length > 0)
    ? activeResult.recommendedProducts
    : sampleResult.recommendedProducts;

  // User requirement: Only display products of FMC and Syngenta (verified scrapper compatibility)
  const isFmcOrSyngenta = (p) => {
    if (!p) return false;
    const comp = (p.company || p.companyName || p.manufacturer || '').toLowerCase();
    if (comp.includes('syngenta') || comp.includes('fmc')) return true;
    const id = (p.id || '').toLowerCase();
    if (id.startsWith('syngenta') || id.startsWith('fmc')) return true;
    const url = (p.officialUrl || p.officialProductUrl || p.official_url || p.url || '').toLowerCase();
    if (url.includes('syngenta') || url.includes('fmc.com')) return true;
    return false;
  };

  const productsList = (rawProducts || []).filter(isFmcOrSyngenta);


  const numericConfidence = typeof activeResult.confidence === 'number'
    ? activeResult.confidence
    : parseInt(activeResult.confidence, 10) || 91;
  const isHighSeverity = activeResult.severity === 'High';
  const isLowConfidence = numericConfidence < 70;
  const needsEscalation = Boolean(activeResult.requiresExpertEscalation || isHighSeverity || isLowConfidence);

  const handleToggleAudioReport = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    const primaryProduct = productsList[0];
    const speechSummary = `تشخیص برائے ${finalCropName}۔ بیماری: ${finalDisease}۔ شدت: ${severityVal}، یقین: ${confidenceVal}۔ تجویز کردہ رجسٹرڈ دوا: ${primaryProduct?.name || 'محکمہ زراعت سے تصدیق شدہ دوا'}۔ خوراک: ${primaryProduct?.labelDosageAcre || primaryProduct?.dosage || 'لیبل کے مطابق'}۔ حفاظتی وقفہ: ${primaryProduct?.phiDays ? primaryProduct.phiDays + ' دن' : 'ہدایات کے مطابق'}۔ سپرے کے دوران دستانے اور حفاظتی ماسک کا استعمال لازمی کریں۔`;

    speakText(speechSummary, {
      lang: 'ur',
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const isInvalidImage = activeResult && (activeResult.isCrop === false || activeResult.isAgriculturalCrop === false || activeResult.disease_id === 'invalid_image');

  if (isInvalidImage) {
    return (
      <section id="results" className="border-t border-amber-200/60 bg-amber-50/40 py-12 sm:py-16 dark:border-amber-900/40 dark:bg-amber-950/20 transition-colors">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-amber-200 bg-white p-6 sm:p-8 shadow-xl shadow-amber-900/5 dark:border-amber-800/60 dark:bg-earth-900 transition-colors">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Agricultural Guardrail Alert • غیر زرعی تصویر کی نشاندہی
                </div>
                <h3 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-earth-900 dark:text-earth-50">
                  Non-Agricultural Image Detected
                </h3>
                <p className="mt-2 text-sm sm:text-base text-earth-700 dark:text-earth-300 leading-relaxed">
                  {activeResult.error || activeResult.rejectionReason || 'The uploaded photo was not recognized as an agricultural crop, leaf, stem, or plant tissue. CropMedic AI only diagnoses crop health and plant pathologies.'}
                </p>
                <p className="mt-2 text-sm sm:text-base font-medium text-earth-800 dark:text-earth-200 font-urdu leading-relaxed" dir="rtl">
                  {activeResult.error_ur || activeResult.rejectionReasonUr || 'براہ کرم فصل کی پتی، تنے، یا پھل کی واضح تصویر اپ لوڈ کریں۔ یہ تصویر زراعت یا فصل سے متعلق نہیں ہے۔'}
                </p>

                {/* Helpful Guidelines Card */}
                <div className="mt-6 rounded-2xl border border-earth-200/80 bg-earth-50/80 p-5 dark:border-earth-800 dark:bg-earth-850">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-earth-800 dark:text-earth-200">
                    Photo Guidelines for Agricultural Diagnostics / فوٹو گائیڈ لائنز
                  </h4>
                  <ul className="mt-3 space-y-2.5 text-xs sm:text-sm text-earth-700 dark:text-earth-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-crop-600 dark:text-crop-400 shrink-0 mt-0.5" />
                      <span><strong>Agricultural Plants Only:</strong> Upload visible leaves, stems, or fruits of field crops (wheat, cotton, rice, sugarcane, maize, potato, mango, citrus).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-crop-600 dark:text-crop-400 shrink-0 mt-0.5" />
                      <span><strong>Close-up & Focused:</strong> Capture symptomatic lesions, pustules, or insect damage in natural daylight without heavy shadows or blur.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-crop-600 dark:text-crop-400 shrink-0 mt-0.5" />
                      <span><strong>Avoid Non-Agricultural Objects:</strong> Do not upload photos of humans, animals, furniture, vehicles, indoor objects, or documents.</span>
                    </li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href="#upload"
                    onClick={(e) => {
                      e.preventDefault();
                      const uploadCard = document.getElementById('upload');
                      if (uploadCard) {
                        uploadCard.scrollIntoView({ behavior: 'smooth' });
                      }
                      const fileInput = document.querySelector('input[type="file"]');
                      if (fileInput) fileInput.click();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-crop-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-crop-600/20 hover:bg-crop-500 transition-all cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                    Upload Valid Crop Photo (تصویر تبدیل کریں)
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const uploadCard = document.getElementById('upload');
                      if (uploadCard) uploadCard.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-earth-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-earth-700 hover:bg-earth-50 dark:border-earth-700 dark:bg-earth-800 dark:text-earth-200 dark:hover:bg-earth-750 transition-all cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Back to Upload Area
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

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

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Phase 6: Voice Readout Button */}
            <button
              type="button"
              onClick={handleToggleAudioReport}
              className={`h-10 inline-flex items-center gap-2 rounded-xl px-4 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-200'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  <span>Stop Voice (آواز بند کریں)</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span>Listen (رپورٹ سنیں)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsEscalationOpen(true)}
              className="h-10 inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-xs sm:text-sm font-bold text-amber-900 shadow-xs transition-all hover:bg-amber-100 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/60 cursor-pointer"
            >
              <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Talk to an Expert</span>
              {needsEscalation && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => downloadPdfReport(activeResult)}
              className="h-10 inline-flex items-center gap-2 rounded-xl bg-crop-600 px-4 sm:px-5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-crop-600/20 transition-all hover:bg-crop-700 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-crop-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Report (A4)
            </button>

            <button
              type="button"
              onClick={() => downloadWordReport(activeResult)}
              className="h-10 inline-flex items-center gap-2 rounded-xl border border-earth-200 bg-white px-3.5 sm:px-4 text-xs sm:text-sm font-bold text-earth-800 shadow-xs transition-all hover:bg-earth-50 dark:border-earth-750 dark:bg-earth-900 dark:text-earth-200 dark:hover:bg-earth-800 cursor-pointer"
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

            {/* Phase 5: Critical Safety Warning Banner if banned substances detected */}
            {activeResult.safetyWarnings && activeResult.safetyWarnings.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/40 dark:bg-red-950/30">
                <div className="flex items-start gap-3">
                  <span className="p-1.5 rounded-lg bg-red-600 text-white shrink-0 mt-0.5 text-xs font-bold">DANGER</span>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-300">
                      Prohibited Chemical Alert (Pakistan DPP Blacklist)
                    </h5>
                    {activeResult.safetyWarnings.map((warn, wIdx) => (
                      <p key={wIdx} className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium leading-relaxed">
                        {warn}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Phase 5: Expert Escalation Recommendation Card */}
            {needsEscalation && (
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-300 dark:border-amber-700/60 dark:bg-amber-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                      Expert Escalation Recommended ({isLowConfidence ? `Low Confidence: ${confidenceVal}` : 'High Severity Alert'})
                    </h5>
                    <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                      AI visual analysis indicates high risk or borderline certainty. Before applying high-potency chemical sprays, consult certified agricultural extension officers or send a WhatsApp referral.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEscalationOpen(true)}
                  className="shrink-0 text-xs font-bold px-3.5 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition shadow-sm cursor-pointer whitespace-nowrap"
                >
                  Connect with Expert
                </button>
              </div>
            )}
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

          {/* Phase 3: Grounded RAG Knowledge Base Advisory */}
          {activeResult.groundedTreatment && (
            <div className="mt-8 pt-5 border-t border-earth-100 dark:border-earth-800 relative z-10 bg-crop-50/30 dark:bg-crop-950/20 p-4 rounded-xl border border-crop-200/50 dark:border-crop-800/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-crop-100 text-crop-800 dark:bg-crop-900/40 dark:text-crop-300">
                  VERIFIED ADVISORY
                </span>
                <span className="text-[10px] text-earth-500 dark:text-earth-400 font-medium">
                  Source: {activeResult.groundedTreatment.source}
                </span>
              </div>
              <h4 className="text-sm font-bold text-earth-900 dark:text-earth-100 mb-1">
                {activeResult.groundedTreatment.title}
              </h4>
              <p className="text-xs sm:text-sm text-earth-700 dark:text-earth-200 leading-relaxed">
                {activeResult.groundedTreatment.guidance}
              </p>
              {activeResult.groundedTreatment.guidance_ur && (
                <p className="mt-2 text-xs text-earth-600 dark:text-earth-300 leading-relaxed text-right" dir="rtl">
                  {activeResult.groundedTreatment.guidance_ur}
                </p>
              )}
            </div>
          )}

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
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-lg bg-crop-50 px-2.5 py-1 text-xs font-bold text-crop-800 ring-1 ring-inset ring-crop-600/20 dark:bg-crop-950/40 dark:text-crop-300 dark:ring-crop-900/40">
                        {product.productType || 'Crop Protection'}
                      </span>
                      <span className="text-xs font-bold text-earth-600 dark:text-earth-300">
                        {product.companyName || product.company || 'Licensed Manufacturer'}
                      </span>
                    </div>

                    <h4 className="mt-3 text-lg font-bold text-earth-900 dark:text-earth-50">
                      {product.name}
                    </h4>

                    {/* Phase 5: DPP Registration & PHI Tags */}
                    <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                      {product.dppRegistrationNo && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300">
                          ✓ DPP: {product.dppRegistrationNo}
                        </span>
                      )}
                      {product.phiDays && (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300">
                          ⏱ {product.phiDays}d PHI
                        </span>
                      )}
                      {product.whoToxicityClass && (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-850 dark:text-slate-300">
                          ☣ {product.whoToxicityClass}
                        </span>
                      )}
                    </div>

                    {product.activeIngredient && (
                      <p className="mt-2 text-xs text-earth-700 dark:text-earth-250">
                        <span className="font-bold text-earth-900 dark:text-earth-100">Active Ingredient: </span>
                        {product.activeIngredient}
                      </p>
                    )}

                    {/* Official Label Dosage Per Acre */}
                    {(product.labelDosageAcre || product.dosage) && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-crop-50/50 dark:bg-crop-950/30 border border-crop-200/50 dark:border-crop-800/40">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-crop-800 dark:text-crop-300 block">
                          Official DPP Label Dosage:
                        </span>
                        <span className="text-xs font-bold text-earth-900 dark:text-earth-100 mt-0.5 block">
                          {product.labelDosageAcre || product.dosage}
                        </span>
                      </div>
                    )}

                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-earth-650 dark:text-earth-300 font-medium">
                      {product.description || product.notes || 'Curative and protective formulation targeting foliar pathogens.'}
                    </p>

                    {/* Protective Equipment PPE */}
                    {product.protectiveEquipment && product.protectiveEquipment.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-earth-100 dark:border-earth-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block mb-1">
                          Mandatory PPE:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {product.protectiveEquipment.map((ppe, pIdx) => (
                            <span key={pIdx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-earth-100 dark:bg-earth-800 text-earth-750 dark:text-earth-250">
                              • {ppe}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-earth-100 dark:border-earth-800">
                    <a
                      href={resolveOfficialProductUrl(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
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

        {/* Phase 5: Expert Escalation Modal */}
        <ExpertEscalationModal
          isOpen={isEscalationOpen}
          onClose={() => setIsEscalationOpen(false)}
          diagnosis={activeResult}
        />

      </div>
    </section>
  );
}

export default AnalysisResult;
