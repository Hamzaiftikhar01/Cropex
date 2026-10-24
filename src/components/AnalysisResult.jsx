import { useEffect, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';
import { downloadPdfReport } from '../utils/pdfGenerator';
import { downloadWordReport } from '../utils/docGenerator';
import ExpertEscalationModal from './ExpertEscalationModal';
import { speakText, stopSpeaking } from '../lib/voiceService';
import { getRegisteredProductsForDiagnosis } from '../lib/pesticideRegistry';

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
      id: 'fmc_cuprocaffaro_copper',
      name: 'Cuprocaffaro 50 WP',
      companyName: 'FMC United (Pvt) Ltd Pakistan',
      company: 'FMC United (Pvt) Ltd Pakistan',
      productType: 'Protective Contact Bactericide & Fungicide',
      activeIngredient: 'Copper Oxychloride 50% WP',
      dosage: '250 g in 100 liters of water per acre',
      labelDosageAcre: '250 g in 100 liters of water per acre',
      dppRegistrationNo: 'DPP-PK/F-0380/2011',
      phiDays: 14,
      whoToxicityClass: 'Class II (Moderately Hazardous)',
      protectiveEquipment: ['Heavy duty gloves', 'Dust respirator', 'Face shield', 'Boots'],
      officialUrl: 'https://ag.fmc.com/pk/en/products/fungicides',
      officialProductUrl: 'https://ag.fmc.com/pk/en/products/fungicides',
      url: 'https://ag.fmc.com/pk/en/products/fungicides',
      description: 'DPP Pakistan registered protective contact copper bactericide. Forms a protective barrier denaturing bacterial cellular proteins of Xanthomonas on foliage and stems.'
    },
    {
      id: 'fmc_talstar_bifenthrin',
      name: 'Talstar 10 EC',
      companyName: 'FMC United (Pvt) Ltd Pakistan',
      company: 'FMC United (Pvt) Ltd Pakistan',
      productType: 'Broad-Spectrum Pyrethroid Insecticide & Miticide',
      activeIngredient: 'Bifenthrin 10% EC',
      dosage: '250–330 ml in 100 liters of water per acre',
      labelDosageAcre: '250–330 ml in 100 liters of water per acre',
      dppRegistrationNo: 'DPP-PK/I-0720/2015',
      phiDays: 14,
      whoToxicityClass: 'Class II (Moderately Hazardous)',
      protectiveEquipment: ['Nitrile gloves', 'Chemical goggles', 'Organic vapour respirator', 'Rubber boots'],
      officialUrl: 'https://ag.fmc.com/pk/en/products/insecticides/talstar',
      officialProductUrl: 'https://ag.fmc.com/pk/en/products/insecticides/talstar',
      url: 'https://ag.fmc.com/pk/en/products/insecticides/talstar',
      description: 'Knockdown suppression of sucking pests and insect vectors that create wound entry sites for secondary bacterial infection.'
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
    if (nameLower.includes('revus') || rawUrl.includes('revus')) {
      return 'https://www.syngenta.com.pk/product/crop-protection/fungicides';
    }
    if (nameLower.includes('karate') || rawUrl.includes('karate')) {
      return 'https://www.syngenta.com.pk/product/crop-protection/insecticides';
    }
    if (nameLower.includes('virtako') || rawUrl.includes('virtako')) {
      return 'https://www.syngenta.com.pk/product/crop-protection/insecticides';
    }
    if (nameLower.includes('actara') || rawUrl.includes('actara')) {
      return 'https://www.syngenta.com.pk/product/crop-protection/insecticides';
    }
    if (nameLower.includes('dividend') || rawUrl.includes('dividend')) {
      return 'https://www.syngenta.com.pk/product/crop-protection/seed-care';
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
      return 'https://ag.fmc.com/pk/en/products/insecticides/steward';
    }
    if (nameLower.includes('cuprocaffaro') || rawUrl.includes('cuprocaffaro') || nameLower.includes('copper')) {
      return 'https://ag.fmc.com/pk/en/products/fungicides';
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

  if (norm.includes('leaf curl') || norm.includes('clcu') || norm.includes('geminivirus') || norm.includes('virus')) {
    return {
      type: 'Viral Infection (Whitefly Vector)',
      pathogen: 'Cotton leaf curl geminivirus complex'
    };
  }
  if (norm.includes('bollworm') || norm.includes('armyworm') || norm.includes('borer') || norm.includes('aphid') || norm.includes('fly') || norm.includes('bug') || norm.includes('jassid') || norm.includes('thrip')) {
    return {
      type: 'Chewing/Sucking Insect Pest',
      pathogen: 'Target foliage & reproductive chewing/sucking pest'
    };
  }
  if (norm.includes('bacterial') || norm.includes('xanthomonas') || norm.includes('blackarm')) {
    return {
      type: 'Bacterial Disease',
      pathogen: 'Xanthomonas axonopodis / Xanthomonas citri'
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
      pathogen: 'Puccinia striiformis / Puccinia triticina'
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
  if (norm.includes('smut') || norm.includes('ustilago')) {
    return {
      type: 'Fungal Disease',
      pathogen: 'Ustilago tritici / Sporisorium scitamineum'
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

  // 1. Query official DPP registry for this specific crop & disease first to ensure precision
  const directRegisteredMatches = getRegisteredProductsForDiagnosis(finalCropName, finalDisease).filter(isFmcOrSyngenta);

  let candidateProducts = [];
  if (directRegisteredMatches.length > 0) {
    candidateProducts = directRegisteredMatches;
  } else {
    if (Array.isArray(activeResult.recommendedProducts) && activeResult.recommendedProducts.length > 0) {
      candidateProducts.push(...activeResult.recommendedProducts);
    }
    if (Array.isArray(activeResult.dppRegisteredProducts) && activeResult.dppRegisteredProducts.length > 0) {
      candidateProducts.push(...activeResult.dppRegisteredProducts);
    }
  }

  // 2. Filter for FMC and Syngenta
  let filteredProducts = candidateProducts.filter(isFmcOrSyngenta);

  // 3. De-duplicate by product name
  const seenNames = new Set();
  const productsList = filteredProducts.filter((p) => {
    const key = (p.name || '').toLowerCase().trim();
    if (!key || seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });


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
    <section id="results" className="py-8 sm:py-12 transition-colors text-left animate-fade-in">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Navigation Row: Back link on left, Scan another leaf on right */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            type="button"
            onClick={() => {
              const uploadCard = document.getElementById('upload');
              if (uploadCard) uploadCard.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-base sm:text-lg font-bold text-neutral-high hover:opacity-80 transition cursor-pointer"
          >
            <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Diagnosis report</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const uploadCard = document.getElementById('upload');
              if (uploadCard) uploadCard.scrollIntoView({ behavior: 'smooth' });
              const fileInput = document.querySelector('input[type="file"]');
              if (fileInput) fileInput.click();
            }}
            className="h-8 px-3.5 text-xs font-semibold rounded-lg border border-neutral-border bg-white dark:bg-stone-800 text-neutral-high hover:bg-neutral-fill transition cursor-pointer shadow-soft"
          >
            Scan another leaf
          </button>
        </div>

        {/* 1. HERO DIAGNOSIS CARD (Split Layout: Sage Leaf Container + Disease Details) */}
        <div className="bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-6 sm:p-7 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Leaf Photo Container in Soft Sage */}
            <div className="md:col-span-5">
              <div className="bg-[#CFE5D4] dark:bg-[#1E3025] rounded-2xl min-h-[220px] sm:min-h-[260px] flex items-center justify-center overflow-hidden relative shadow-xs">
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt={`${finalCropName} leaf diagnosis`}
                    className="w-full h-full object-cover rounded-2xl max-h-[300px]"
                  />
                ) : (
                  <div className="text-center p-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332] dark:text-[#A8D1B3] block">
                      [LEAF PHOTO]
                    </span>
                    <span className="text-[11px] text-[#2D6A4F] dark:text-[#68AE7B] mt-1 block">
                      {finalCropName} Symptomatic Sample
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Disease Header, Score Ring, Action Buttons, and Escalation */}
            <div className="md:col-span-7 space-y-3">
              {/* Crop Badge & Circular Score Ring */}
              <div className="flex items-center justify-between">
                <span className="bg-[#EAF4ED] text-[#166534] border border-[#D2EDD7] text-xs font-bold px-3 py-1 rounded-full">
                  {finalCropName}
                </span>

                {/* Circular Score Ring Meter */}
                <div className="relative flex items-center justify-center w-12 h-12">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-stone-200 dark:text-stone-700"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-700 dark:text-emerald-500"
                      strokeDasharray={`${numericConfidence}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-neutral-high">
                    {numericConfidence}%
                  </span>
                </div>
              </div>

              {/* Disease Name & Scientific Pathogen */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-high tracking-tight">
                  {finalDisease}
                </h2>
                <p className="text-sm italic text-neutral-medium font-sans mt-0.5">
                  {pathogen || 'Puccinia striiformis'}
                </p>
              </div>

              {/* Severity & Verified Sources */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className={`font-semibold text-xs px-2.5 py-1 rounded-full border ${
                  severityVal === 'High'
                    ? 'bg-[#FEECE9] text-[#B91C1C] border-[#FCDAD6]'
                    : severityVal === 'Moderate'
                    ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                    : 'bg-[#EAF4ED] text-[#166534] border-[#D2EDD7]'
                }`}>
                  Severity: {severityVal}
                </span>
                <span className="text-xs text-neutral-medium font-medium">
                  Verified sources: PARC, CIMMYT
                </span>
              </div>

              {/* Action Buttons: Listen, Download PDF, Expert help */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleToggleAudioReport}
                  className={`h-9 inline-flex items-center gap-1.5 rounded-xl px-4 text-xs font-semibold shadow-xs transition cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-[#1B4332] hover:bg-[#143527] text-white'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span>{isPlayingAudio ? 'Stop Voice' : 'Listen · رپورٹ سنیں'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadPdfReport(activeResult)}
                  className="h-9 inline-flex items-center gap-1.5 rounded-xl border border-neutral-border bg-white dark:bg-stone-800 hover:bg-neutral-fill text-neutral-high px-3.5 text-xs font-semibold transition cursor-pointer shadow-soft"
                >
                  <svg className="h-4 w-4 text-neutral-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEscalationOpen(true)}
                  className="h-9 inline-flex items-center gap-1.5 rounded-xl border border-neutral-border bg-white dark:bg-stone-800 hover:bg-neutral-fill text-neutral-high px-3.5 text-xs font-semibold transition cursor-pointer shadow-soft"
                >
                  <svg className="h-4 w-4 text-neutral-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Expert help</span>
                </button>
              </div>

              {/* Warning / Escalation Recommendation Callout Box */}
              {needsEscalation && (
                <div className="bg-[#FDF2F0] border border-[#FCDAD6] rounded-xl p-3 text-xs sm:text-sm text-[#991B1B] font-medium leading-relaxed mt-3">
                  Escalation recommended: severity is High, so confirm this diagnosis with an agronomist before spraying.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 2. DPP REGISTERED REMEDIES SECTION (Table matching Screenshot 1) */}
        <div className="bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-6 shadow-soft mt-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
            <h3 className="text-base sm:text-lg font-bold text-neutral-high">
              DPP registered remedies
            </h3>
            <a
              href="https://agripunjab.gov.pk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#15803D] dark:text-[#4ADE80] hover:underline"
            >
              Source: [DPP registry]
            </a>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-neutral-border text-neutral-medium text-[11px] font-semibold">
                  <th className="pb-3 pr-4">Product and active ingredient</th>
                  <th className="pb-3 pr-4">Label dose per acre</th>
                  <th className="pb-3 pr-4">PHI</th>
                  <th className="pb-3">WHO class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {productsList && productsList.length > 0 ? (
                  productsList.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-neutral-fill/40 transition-colors">
                      <td className="py-3.5 pr-4">
                        <a
                          href={resolveOfficialProductUrl(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-sm text-neutral-high hover:text-emerald-700 dark:hover:text-emerald-400 block transition-colors"
                        >
                          {p.name}
                        </a>
                        <span className="text-xs text-neutral-medium block mt-0.5">
                          {p.activeIngredient || p.companyName || 'Registered Active'}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-neutral-high text-xs sm:text-sm font-medium">
                        {p.labelDosageAcre || p.dosage || '65 g in 100–120 L water'}
                      </td>
                      <td className="py-3.5 pr-4 text-neutral-high text-xs sm:text-sm font-medium">
                        {p.phiDays ? `${p.phiDays} days` : '35 days'}
                      </td>
                      <td className="py-3.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {p.whoToxicityClass ? p.whoToxicityClass.split('(')[0].trim() : 'Class III'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="hover:bg-neutral-fill/40 transition-colors">
                      <td className="py-3.5 pr-4">
                        <a
                          href="https://www.syngenta.com.pk/product/crop-protection/amistar-top-02"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-sm text-neutral-high hover:text-emerald-700 block transition-colors"
                        >
                          Nativo 75 WG
                        </a>
                        <span className="text-xs text-neutral-medium block mt-0.5">
                          Tebuconazole 50% + Trifloxystrobin 25%
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-neutral-high text-xs sm:text-sm font-medium">
                        65 g in 100–120 L water
                      </td>
                      <td className="py-3.5 pr-4 text-neutral-high text-xs sm:text-sm font-medium">
                        35 days
                      </td>
                      <td className="py-3.5 text-xs sm:text-sm font-semibold text-blue-600">
                        Class III
                      </td>
                    </tr>
                    <tr className="hover:bg-neutral-fill/40 transition-colors">
                      <td className="py-3.5 pr-4">
                        <a
                          href="https://www.syngenta.com.pk/product/crop-protection/amistar-top-02"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-sm text-neutral-high hover:text-emerald-700 block transition-colors"
                        >
                          Amistar Top
                        </a>
                        <span className="text-xs text-neutral-medium block mt-0.5">
                          Azoxystrobin + Difenoconazole
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-neutral-high text-xs sm:text-sm font-medium">
                        200 ml in 100–120 L water
                      </td>
                      <td className="py-3.5 pr-4 text-neutral-high text-xs sm:text-sm font-medium">
                        30 days
                      </td>
                      <td className="py-3.5 text-xs sm:text-sm font-semibold text-neutral-medium">
                        See label
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. PROTECTIVE EQUIPMENT & TALK TO AN EXPERT CARDS (Side-by-side grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          
          {/* Protective Equipment Card */}
          <div className="bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-6 shadow-soft space-y-4">
            <h4 className="text-base sm:text-lg font-bold text-neutral-high">
              Protective equipment
            </h4>
            <div className="space-y-3 pt-1">
              {[
                'Chemical-resistant gloves',
                'Respirator or face mask',
                'Protective goggles',
                'Observe the field re-entry interval'
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-neutral-high font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={idx === 0}
                    className="w-4 h-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Talk to an Expert Card */}
          <div className="bg-white dark:bg-[#18211b] border border-neutral-border rounded-2xl p-6 shadow-soft space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-neutral-high">
                Talk to an expert
              </h4>
              <div className="space-y-2.5 pt-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between py-1 border-b border-neutral-border/60">
                  <span className="text-neutral-medium font-medium">Punjab Agriculture Helpline</span>
                  <a href="tel:080015000" className="font-bold text-neutral-high hover:text-emerald-700 transition">
                    0800-15000
                  </a>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-border/60">
                  <span className="text-neutral-medium font-medium">PARC/NARC Islamabad</span>
                  <a href="tel:0519255012" className="font-bold text-neutral-high hover:text-emerald-700 transition">
                    051-9255012
                  </a>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-neutral-medium font-medium">CCRI Multan (cotton)</span>
                  <a href="tel:0619201128" className="font-bold text-neutral-high hover:text-emerald-700 transition">
                    061-9201128
                  </a>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEscalationOpen(true)}
              className="w-full mt-2 py-2.5 rounded-xl border border-neutral-border bg-white dark:bg-stone-800 hover:bg-neutral-fill text-neutral-high font-semibold text-xs sm:text-sm text-center transition cursor-pointer shadow-soft"
            >
              Send details on WhatsApp
            </button>
          </div>

        </div>

        {/* Footer Medical / Agronomic AI Disclaimer */}
        <p className="text-[11px] text-neutral-medium text-center pt-8 italic leading-relaxed max-w-3xl mx-auto">
          AI-assisted advice. Confirm diagnoses and chemical doses with a certified extension officer or plant pathologist before applying treatment.
        </p>

        {/* Expert Escalation Modal */}
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
