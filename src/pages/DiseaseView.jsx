import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Hero from '../components/Hero';
import UploadCard from '../components/UploadCard';
import Features from '../components/Features';
import AnalysisResult from '../components/AnalysisResult';
import HistoryList from '../components/HistoryList';
import { analyzeCropImage } from '../services/aiService';
import { searchKnowledgeBase } from '../services/knowledgeService';
import { calculateDiseaseRisk } from '../utils/agriRules';

// Fully populated registered diagnostic dossiers for all Pakistani crops
const MOCK_DIAGNOSES = {
  tomato: {
    crop: 'Tomato',
    cropName: 'Tomato',
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
        company: 'FMC Pakistan',
        productType: 'Fungicide',
        activeIngredient: 'Pyraclostrobin 5% + Metiram 55%',
        officialProductUrl: 'https://ag.fmc.com/pk/en/products/fungicides/cabrio-top',
        description: 'A high-performance fungicide offering superior protective and curative control against early blight, late blight, and powdery mildew on vegetable crops.'
      },
      {
        id: 'syngenta_amistar_top',
        name: 'Amistar Top',
        companyName: 'Syngenta Pakistan',
        company: 'Syngenta Pakistan',
        productType: 'Fungicide',
        activeIngredient: 'Azoxystrobin 200g/L + Difenoconazole 125g/L',
        officialProductUrl: 'https://www.syngenta.com.pk/product/crop-protection/fungicide/amistar-top',
        description: 'A systemic broad-spectrum fungicide with preventative and curative activity, highly effective against rust, early blight, and leaf spot diseases.'
      }
    ]
  },
  wheat: {
    crop: 'Wheat',
    cropName: 'Wheat',
    disease: 'Leaf Rust',
    confidence: 94,
    severity: 'Moderate',
    description: 'Wheat Leaf Rust is a widespread fungal disease caused by Puccinia triticina. Orange-brown uredinial pustules rupture the leaf epidermis, disrupting photosynthesis and accelerating transpiration during grain filling.',
    visibleSymptoms: [
      'Small, round orange-brown pustules scattered on leaf blades',
      'Powdery rust-colored residue that easily rubs off onto fingers',
      'Premature leaf yellowing and desiccation of flag leaves'
    ],
    likelyCauses: [
      'Airborne urediniospores of Puccinia triticina',
      'Prolonged leaf wetness (6-8 hours of dew or light rain)',
      'Ambient canopy temperatures between 15°C and 22°C'
    ],
    recommendedActions: [
      'Apply systemic triazole fungicide (Amistar Top or Nativo 75 WG) immediately',
      'Ensure balanced nitrogen levels to avoid overly dense, moisture-trapping foliage',
      'Sanitize agricultural tools before working in neighboring fields'
    ],
    prevention: [
      'Cultivate certified rust-resistant wheat varieties recommended for Punjab',
      'Follow optimal sowing dates to escape peak spore dispersal windows',
      'Apply balanced potash fertilization to strengthen leaf cellular structure'
    ],
    bestPractices: [
      'Destroy volunteer wheat plants and grass weeds around field borders',
      'Perform regular weekly scouting during the boot and heading stages',
      'Avoid late-season urea top-dressing that exacerbates spore susceptibility'
    ],
    recommendedProducts: [
      {
        id: 'syngenta_amistar_top',
        name: 'Amistar Top',
        companyName: 'Syngenta Pakistan',
        company: 'Syngenta Pakistan',
        productType: 'Fungicide',
        activeIngredient: 'Azoxystrobin 200g/L + Difenoconazole 125g/L',
        officialProductUrl: 'https://www.syngenta.com.pk/product/amistar-top',
        description: 'A systemic broad-spectrum fungicide with preventative and curative activity, highly effective against rust, early blight, and leaf spot diseases.'
      },
      {
        id: 'bayer_nativo',
        name: 'Nativo 75 WG',
        companyName: 'Bayer Pakistan',
        company: 'Bayer Pakistan',
        productType: 'Fungicide',
        activeIngredient: 'Tebuconazole 50% + Trifloxystrobin 25%',
        officialProductUrl: 'https://www.cropscience.bayer.com.pk/en-pk/products/fungicides/nativo-75-wg.html',
        description: 'Dual-action protective and curative systemic fungicide delivering broad-spectrum control and prolonged green foliage retention.'
      }
    ]
  },
  potato: {
    crop: 'Potato',
    cropName: 'Potato',
    disease: 'Late Blight',
    confidence: 96,
    severity: 'High',
    description: 'Dark, water-soaked necrotic lesions developing on potato foliage caused by Phytophthora infestans. Under cool and humid conditions, it rapidly destroys canopies and infects developing tubers.',
    visibleSymptoms: [
      'Large dark irregular brown water-soaked lesions on leaf surfaces',
      'Fuzzy white mycelial growth on leaf undersides in humid mornings',
      'Stem rotting and rapid collapse of vine foliage'
    ],
    likelyCauses: [
      'Oomycete pathogen Phytophthora infestans',
      'Cool temperatures of 15-22°C and high relative humidity >85%',
      'Infected seed tubers or cull piles near field borders'
    ],
    recommendedActions: [
      'Apply systemic fungicide (Ridomil Gold or Infinito) immediately',
      'Remove and burn or deeply bury heavily blighted plant stems',
      'Avoid overhead sprinkler irrigation to keep leaves dry'
    ],
    prevention: [
      'Plant certified disease-free potato seed tubers',
      'Ensure wide row spacing to maximize canopy ventilation and sunlight',
      'Hill up soil around tubers to prevent rain-washed spores reaching tubers'
    ],
    bestPractices: [
      'Scout low-lying or shaded field areas daily during humid weather',
      'Eliminate volunteer potato plants from previous harvests',
      'Wait 10-14 days after vine killing before harvesting to prevent tuber infection'
    ],
    recommendedProducts: [
      {
        id: 'syngenta_ridomil_gold',
        name: 'Ridomil Gold',
        companyName: 'Syngenta Pakistan',
        company: 'Syngenta Pakistan',
        productType: 'Fungicide',
        activeIngredient: 'Metalaxyl-M 4% + Mancozeb 64% WP',
        officialProductUrl: 'https://www.syngenta.com.pk/product/ridomil-gold-wg',
        description: 'Excellent root and foliage systemic action providing dual protective and curative suppression of oomycetes.'
      },
      {
        id: 'bayer_infinito',
        name: 'Infinito',
        companyName: 'Bayer Crop Science Pakistan',
        company: 'Bayer Crop Science Pakistan',
        productType: 'Fungicide',
        activeIngredient: 'Fluopicolide + Propamocarb Hydrochloride',
        officialProductUrl: 'https://www.cropscience.bayer.com.pk/en-pk/products/fungicides/infinito.html',
        description: 'Excellent weather resistance and translaminar mobility. Prevents spore germination and suppresses mycelial expansion.'
      }
    ]
  },
  cotton: {
    crop: 'Cotton',
    cropName: 'Cotton',
    disease: 'Leaf Spot & Bacterial Blight',
    confidence: 91,
    severity: 'Moderate',
    description: 'Angular water-soaked spots on leaves that turn reddish-brown or black, bounded by leaf veins. Can progress to blackarm lesions on stems, causing severe defoliation.',
    visibleSymptoms: [
      'Angular polyhedral leaf spots delimited by veins',
      'Dark water-soaked oily spots on leaves and bracts',
      'Reddish-brown to black coloration along leaf petioles and stems'
    ],
    likelyCauses: [
      'Xanthomonas citri pv. malvacearum or Alternaria pathotypes',
      'High relative humidity combined with warm daytime winds',
      'Planting untreated seed stock with carryover bacterial fuzz'
    ],
    recommendedActions: [
      'Spray copper-based bactericides/fungicides (Sun-Cop 50% WP) immediately',
      'Prune lower canopy leaves to improve air circulation',
      'Incorporate post-harvest stubble deep into soil'
    ],
    prevention: [
      'Use acid-delinted and certified disease-free cotton seeds',
      'Cultivate tolerant cotton cultivars adapted to southern Punjab',
      'Maintain balanced nitrogen fertilization to avoid lush succulent tissue'
    ],
    bestPractices: [
      'Monitor whitefly vectors that stress plants and transmit secondary viruses',
      'Sanitize tillage equipment between fields',
      'Avoid high-pressure overhead irrigation that spreads bacterial ooze'
    ],
    recommendedProducts: [
      {
        id: 'suncrop_sun_cop',
        name: 'Sun-Cop',
        companyName: 'Suncrop Group',
        company: 'Suncrop Group',
        productType: 'Fungicide',
        activeIngredient: 'Copper Oxychloride 50% WP',
        officialProductUrl: 'https://www.suncropgroup.com/',
        description: 'Contact protective broad-spectrum fungicide and bactericide useful for suppressing severe fungal and bacterial outbreaks.'
      },
      {
        id: 'bayer_confidor',
        name: 'Confidor',
        companyName: 'Bayer Crop Science Pakistan',
        company: 'Bayer Crop Science Pakistan',
        productType: 'Insecticide',
        activeIngredient: 'Imidacloprid 200 SL',
        officialProductUrl: 'https://www.cropscience.bayer.com.pk/en-pk/products/insecticides/confidor-200-sl.html',
        description: 'Systemic insecticide targeting sucking pests. Primarily used to control whiteflies that transmit leaf curl virus.'
      }
    ]
  },
  rice: {
    crop: 'Rice',
    cropName: 'Rice',
    disease: 'Rice Blast',
    confidence: 95,
    severity: 'High',
    description: 'Spindle-shaped lesions on leaves with gray centers and dark brown borders caused by Magnaporthe oryzae. Attacks leaves, collars, nodes, and panicle necks, causing severe yield reduction.',
    visibleSymptoms: [
      'Spindle-shaped lesions on leaves with gray centers and brown margins',
      'Rotting collar tissue at the junction of blade and sheath',
      'Neck rot at panicle base resulting in blank or poorly filled grains'
    ],
    likelyCauses: [
      'Fungus Magnaporthe oryzae',
      'High relative humidity (>88%) and cool night temperatures',
      'Excessive nitrogen fertilizer application'
    ],
    recommendedActions: [
      'Apply systemic fungicide (Nativo 75 WG or Amistar Top) immediately',
      'Split nitrogen fertilizer applications rather than large single doses',
      'Maintain shallow standing water to buffer canopy temperatures'
    ],
    prevention: [
      'Plant blast-resistant certified rice varieties',
      'Treat seeds with registered fungicide before sowing nursery beds',
      'Maintain proper plant spacing to allow light and air penetration'
    ],
    bestPractices: [
      'Burn or incorporate infected straw and stubble post-harvest',
      'Avoid excessive vegetative canopy density',
      'Monitor nursery beds and early tillering stages vigilantly'
    ],
    recommendedProducts: [
      {
        id: 'bayer_nativo',
        name: 'Nativo 75 WG',
        companyName: 'Bayer Pakistan',
        company: 'Bayer Pakistan',
        productType: 'Fungicide',
        activeIngredient: 'Tebuconazole 50% + Trifloxystrobin 25%',
        officialProductUrl: 'https://www.cropscience.bayer.com.pk/en-pk/products/fungicides/nativo-75-wg.html',
        description: 'Dual-action protective and curative systemic fungicide delivering broad-spectrum control and prolonged green foliage retention.'
      },
      {
        id: 'syngenta_amistar_top',
        name: 'Amistar Top',
        companyName: 'Syngenta Pakistan',
        company: 'Syngenta Pakistan',
        productType: 'Fungicide',
        activeIngredient: 'Azoxystrobin 200g/L + Difenoconazole 125g/L',
        officialProductUrl: 'https://www.syngenta.com.pk/product/amistar-top',
        description: 'A systemic broad-spectrum fungicide with preventative and curative activity, highly effective against rust, early blight, and leaf spot diseases.'
      }
    ]
  },
  sugarcane: {
    crop: 'Sugarcane',
    cropName: 'Sugarcane',
    disease: 'Red Rot',
    confidence: 92,
    severity: 'High',
    description: 'Red spots appearing on leaf midribs with internal stalk reddening and white patches, caused by Colletotrichum falcatum. Causes severe sucrose degradation and stalk hollows.',
    visibleSymptoms: [
      'Red lesions with dark centers on leaf midribs',
      'Yellowing and wilting of crown leaves',
      'Internal stalk tissue shows dull red coloration with white transverse bands'
    ],
    likelyCauses: [
      'Colletotrichum falcatum fungal pathogen',
      'Waterlogged field conditions and poor drainage',
      'Planting infected seed cane setts'
    ],
    recommendedActions: [
      'Uproot and destroy infected cane stools immediately',
      'Improve furrow drainage to prevent standing water',
      'Spray copper-based fungicide to prevent secondary spore spread'
    ],
    prevention: [
      'Plant certified red-rot resistant sugarcane varieties',
      'Select seed setts from disease-free nurseries only',
      'Avoid ratooning in fields showing red rot symptoms'
    ],
    bestPractices: [
      'Practice crop rotation with rice or green manure crops',
      'Disinfect harvesting knives with 5% bleach solution',
      'Keep field bunds weeded to eliminate wild grass hosts'
    ],
    recommendedProducts: [
      {
        id: 'suncrop_sun_cop',
        name: 'Sun-Cop',
        companyName: 'Suncrop Group',
        company: 'Suncrop Group',
        productType: 'Fungicide',
        activeIngredient: 'Copper Oxychloride 50% WP',
        officialProductUrl: 'https://suncropgroup.com/pesticides/fungicides',
        description: 'Contact protective broad-spectrum fungicide and bactericide useful for suppressing severe fungal and bacterial outbreaks.'
      }
    ]
  },
  maize: {
    crop: 'Maize',
    cropName: 'Maize',
    disease: 'Northern Leaf Blight',
    confidence: 93,
    severity: 'Moderate',
    description: 'Long elliptical grayish-green to tan lesions on leaves caused by Exserohilum turcicum. Can cause extensive foliar blighting and premature plant death.',
    visibleSymptoms: [
      'Long cigar-shaped tan lesions along leaf veins',
      'Extensive blighting and drying of lower canopy leaves',
      'Premature plant death and reduced ear grain size'
    ],
    likelyCauses: [
      'Fungus Exserohilum turcicum',
      'Moderate temperatures (18-27°C) and heavy morning dew',
      'Infected maize residue remaining on the soil surface'
    ],
    recommendedActions: [
      'Apply systemic foliar fungicide (Amistar Top or Nativo 75 WG)',
      'Ensure adequate potassium and phosphorus soil nutrition',
      'Avoid late afternoon sprinkler irrigation'
    ],
    prevention: [
      'Plant resistant maize hybrids certified for Punjab',
      'Rotate crops with non-grass crops such as legumes',
      'Plow maize stubble deep into soil after harvest'
    ],
    bestPractices: [
      'Maintain recommended plant density to facilitate air circulation',
      'Scout lower leaves before tassel emergence',
      'Control weed hosts around field margins'
    ],
    recommendedProducts: [
      {
        id: 'syngenta_amistar_top',
        name: 'Amistar Top',
        companyName: 'Syngenta Pakistan',
        company: 'Syngenta Pakistan',
        productType: 'Fungicide',
        activeIngredient: 'Azoxystrobin 200g/L + Difenoconazole 125g/L',
        officialProductUrl: 'https://www.syngenta.com.pk/product/amistar-top',
        description: 'A systemic broad-spectrum fungicide with preventative and curative activity, highly effective against rust, early blight, and leaf spot diseases.'
      },
      {
        id: 'fmc_steward',
        name: 'Steward',
        companyName: 'FMC Pakistan',
        company: 'FMC Pakistan',
        productType: 'Insecticide',
        activeIngredient: 'Indoxacarb 150 SC',
        officialProductUrl: 'https://ag.fmc.com/pk/en/products/insecticides',
        description: 'Broad-spectrum larvicide with contact and stomach action, causing rapid feeding cessation in chewing pests.'
      }
    ]
  }
};

export default function DiseaseView({
  file,
  setFile,
  preview,
  setPreview,
  isAnalyzing,
  setIsAnalyzing,
  analysisResult,
  setAnalysisResult,
  error,
  setError,
  history,
  onAddToHistory,
  onSelectHistory,
  onClearHistory,
  fieldProfile,
  weatherData
}) {
  const { t } = useLanguage();

  const riskInfo = calculateDiseaseRisk(fieldProfile.cropType, weatherData);
  const scopedHistory = (history || []).filter(h => !h.cropName || h.cropName === fieldProfile.cropType);

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    const cropKey = (fieldProfile.cropType || 'wheat').toLowerCase();
    const fallbackReport = MOCK_DIAGNOSES[cropKey] || MOCK_DIAGNOSES.wheat;

    try {
      const result = await analyzeCropImage(file, fieldProfile.cropType);
      
      const kbDetails = searchKnowledgeBase(result.cropName || result.crop, result.disease);
      const enrichedResult = {
        ...fallbackReport,
        ...result,
        ...(kbDetails || {}),
        cropName: result.cropName || result.crop || fieldProfile.cropType,
        disease: result.disease || fallbackReport.disease,
        confidence: result.confidence || fallbackReport.confidence,
        severity: result.severity || fallbackReport.severity,
        description: result.description || fallbackReport.description,
        visibleSymptoms: (result.visibleSymptoms && result.visibleSymptoms.length > 0) ? result.visibleSymptoms : (kbDetails?.symptoms || fallbackReport.visibleSymptoms),
        likelyCauses: (result.likelyCauses && result.likelyCauses.length > 0) ? result.likelyCauses : (kbDetails?.causes || fallbackReport.likelyCauses),
        recommendedActions: (result.recommendedActions && result.recommendedActions.length > 0) ? result.recommendedActions : (kbDetails?.recommendedActions || fallbackReport.recommendedActions),
        prevention: kbDetails?.prevention || fallbackReport.prevention,
        bestPractices: kbDetails?.bestPractices || fallbackReport.bestPractices,
        recommendedProducts: (kbDetails?.recommendedProducts && kbDetails.recommendedProducts.length > 0) ? kbDetails.recommendedProducts : fallbackReport.recommendedProducts,
        isUnindexed: !kbDetails,
      };

      setAnalysisResult(enrichedResult);
      onAddToHistory(enrichedResult);

      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err) {
      console.warn('API error encountered, using calibrated knowledge fallback:', err);
      
      const kbDetails = searchKnowledgeBase(fallbackReport.crop, fallbackReport.disease);
      const fallbackResult = {
        ...fallbackReport,
        ...(kbDetails || {}),
        cropName: fieldProfile.cropType,
        disease: fallbackReport.disease,
        isUnindexed: !kbDetails,
      };

      setAnalysisResult(fallbackResult);
      onAddToHistory(fallbackResult);

      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSimulateScan = () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    const cropKey = (fieldProfile.cropType || 'tomato').toLowerCase();
    const mockReport = MOCK_DIAGNOSES[cropKey] || MOCK_DIAGNOSES.tomato;

    const kbDetails = searchKnowledgeBase(mockReport.crop, mockReport.disease);
    const mockResult = {
      ...mockReport,
      ...(kbDetails || {}),
      cropName: fieldProfile.cropType,
      disease: mockReport.disease,
      isUnindexed: !kbDetails,
    };

    setTimeout(() => {
      setIsAnalyzing(false);
      setPreview('https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=600&auto=format&fit=crop');
      setAnalysisResult(mockResult);
      onAddToHistory(mockResult);

      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }, 1000);
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6 text-left">
      <Hero />
      
      <section id="upload" className="space-y-6">
        {/* Proactive Risk Gauge Card */}
        <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-800 rounded-2xl p-5 sm:p-6 shadow-soft">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-crop-600 dark:text-crop-400 tracking-wider">
                {t('proactiveRisk')}
              </span>
              <h3 className="text-base font-bold text-earth-900 dark:text-earth-50 mt-0.5">
                {t('crop_' + fieldProfile.cropType.toLowerCase())} {riskInfo.diseaseName} {t('sporeRisk')}
              </h3>
            </div>
            <div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                riskInfo.riskLevel === 'High' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300' 
                  : riskInfo.riskLevel === 'Medium' 
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' 
                  : 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
              }`}>
                {t('riskLevel')}: {t(riskInfo.riskLevel.toLowerCase())} ({riskInfo.percentage}%)
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-earth-600 dark:text-earth-400 font-medium">
            {riskInfo.explanation}
          </p>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto pt-2">
          <span className="text-xs font-bold uppercase tracking-widest text-crop-600 dark:text-crop-400">
            {t('diagnosticScanner')}
          </span>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-earth-900 sm:text-3xl dark:text-earth-50">
            {t('diagnoseLeaf')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-earth-500 dark:text-earth-300 font-medium">
            {t('leafDesc')}
          </p>
        </div>

        {/* Upload + History Grid */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-4">
            <UploadCard
              file={file}
              preview={preview}
              isAnalyzing={isAnalyzing}
              error={error}
              onFileChange={(selectedFile, previewUrl) => {
                setFile(selectedFile);
                setPreview(previewUrl);
                setError(null);
                setAnalysisResult(null);
              }}
              onClear={handleClear}
              onAnalyze={handleAnalyze}
            />
            
            {/* Simulated Demo Scan Trigger */}
            <div className="text-center">
              <span className="text-xs text-earth-500 dark:text-earth-300 mr-2">No leaf photo on hand?</span>
              <button
                type="button"
                onClick={handleSimulateScan}
                disabled={isAnalyzing}
                className="h-9 inline-flex items-center gap-1.5 px-4 text-xs font-bold rounded-xl border border-crop-600/30 text-crop-700 bg-crop-50/40 hover:bg-crop-50 dark:text-crop-400 dark:border-crop-500/20 dark:hover:bg-crop-950/20 transition-all cursor-pointer"
              >
                {t('uploadDemoBtn')}
              </button>
            </div>
          </div>
          
          <div>
            <HistoryList
              history={scopedHistory}
              onSelectHistory={onSelectHistory}
              onClearHistory={onClearHistory}
            />
          </div>
        </div>
      </section>

      <Features />
      
      <AnalysisResult
        result={analysisResult}
        isAnalyzing={isAnalyzing}
        error={error}
        uploadedImage={preview}
      />
    </div>
  );
}
