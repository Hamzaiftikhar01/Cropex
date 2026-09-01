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

// Known-good cached mock diagnostics per crop for demo fallback safety
const MOCK_DIAGNOSES = {
  wheat: {
    crop: 'Wheat',
    disease: 'Leaf Rust',
    confidence: 94,
    severity: 'Moderate',
    description: 'Identified orange-brown pustules scattered across the leaf blade. This is indicative of Wheat Leaf Rust caused by Puccinia triticina.',
    visibleSymptoms: ['Small, round orange-brown pustules', 'Powdery residue on leaf blade', 'Yellowing leaf margins'],
    likelyCauses: ['Puccinia triticina fungal spores', 'Prolonged dew or light rainfall', 'Susceptible cultivar choice'],
    recommendedActions: ['Apply Amistar Top or Nativo fungicide spray', 'Ensure balanced nitrogen levels to avoid lush foliage', 'Sanitize tools before working on other fields'],
    analysisSummary: 'Identified Wheat Leaf Rust. Preventative or curative spraying recommended immediately.'
  },
  tomato: {
    crop: 'Tomato',
    disease: 'Late Blight',
    confidence: 97,
    severity: 'High',
    description: 'Dark, water-soaked lesions developing on leaves, with white fungal growth on the underside under humid conditions. Typical of Phytophthora infestans (Late Blight).',
    visibleSymptoms: ['Large dark irregular brown lesions on leaves', 'Fuzzy white mold on leaf underside', 'Stem rot starting to form'],
    likelyCauses: ['Phytophthora infestans oomycete', 'Average humidity >85%', 'Mild temperatures of 15-22°C'],
    recommendedActions: ['Apply Nativo or similar systemic fungicide immediately', 'Remove and bury/burn heavily infested plant tissues', 'Avoid overhead sprinkler watering'],
    analysisSummary: 'Tomato Late Blight detected. Immediate chemical spray and foliage pruning required to prevent total crop loss.'
  },
  potato: {
    crop: 'Potato',
    disease: 'Late Blight',
    confidence: 96,
    severity: 'High',
    description: 'Dark, water-soaked lesions developing on foliage. Typical of Phytophthora infestans (Late Blight) impacting tuber yield.',
    visibleSymptoms: ['Large dark irregular brown lesions on leaf surfaces', 'Fuzzy white mycelium on leaf underside', 'Tuber decay symptoms starting'],
    likelyCauses: ['Phytophthora infestans fungus', 'Cool, wet temperatures (15-22°C)', 'High relative humidity >85%'],
    recommendedActions: ['Apply Nativo or copper-based systemic fungicide immediately', 'Improve row spacing for foliage aeration', 'Remove volunteer plants from previous harvest'],
    analysisSummary: 'Potato Late Blight infection confirmed. Immediate fungicide spray and foliage aeration required.'
  },
  cotton: {
    crop: 'Cotton',
    disease: 'Leaf Spot',
    confidence: 91,
    severity: 'Moderate',
    description: 'Angular, water-soaked spots on leaves that turn brown or black. Lesions may follow veins, causing defoliation in cotton crops.',
    visibleSymptoms: ['Angular leaf spots delimited by veins', 'Dark water-soaked leaf spots', 'Reddish-brown coloration along leaf petiole'],
    likelyCauses: ['Alternaria or Xanthomonas pathotype bacteria', 'High relative humidity and warm winds', 'Planting untreated seeds'],
    recommendedActions: ['Spray copper-based bactericides or fungicides', 'Prune crop canopy to improve wind ventilation', 'Incorporate post-harvest stubble deep into soil'],
    analysisSummary: 'Cotton Leaf Spot disease detected. Copper sprays and field sanitation recommended.'
  },
  rice: {
    crop: 'Rice',
    disease: 'Rice Blast',
    confidence: 95,
    severity: 'High',
    description: 'Spindle-shaped lesions on leaves with gray centers and brown borders. Typical of Magnaporthe oryzae (Rice Blast).',
    visibleSymptoms: ['Spindle-shaped lesions with gray centers', 'Brown margins around leaf wounds', 'Collar rot starting to manifest'],
    likelyCauses: ['Magnaporthe oryzae fungus', 'High relative humidity >88%', 'Excessive nitrogen fertilizer application'],
    recommendedActions: ['Apply systemic fungicide like Amistar Top', 'Apply nitrogen in split doses', 'Keep water level optimal to protect plant crowns'],
    analysisSummary: 'Rice Blast detected on leaves. Monitor collars and necks; spray immediately.'
  },
  sugarcane: {
    crop: 'Sugarcane',
    disease: 'Red Rot',
    confidence: 92,
    severity: 'High',
    description: 'Red spots appearing on the midrib of leaves, with red coloration inside the stalk when split open. Caused by Colletotrichum falcatum.',
    visibleSymptoms: ['Red spots on leaf midribs', 'Red lesions inside stalk', 'Sour smell from affected stems'],
    likelyCauses: ['Colletotrichum falcatum fungus', 'Waterlogged field conditions', 'Infected seed cane pieces'],
    recommendedActions: ['Grow resistant sugarcane cultivars', 'Ensure proper soil drainage', 'Discard infected seed canes before planting'],
    analysisSummary: 'Sugarcane Red Rot risk detected. Drainage improvement and seed cane screening recommended.'
  },
  maize: {
    crop: 'Maize',
    disease: 'Northern Leaf Blight',
    confidence: 93,
    severity: 'Moderate',
    description: 'Long, elliptical, grayish-green to tan lesions on leaves. Caused by Exserohilum turcicum.',
    visibleSymptoms: ['Long cigar-shaped tan lesions', 'Leaf tissue wilting', 'Premature plant death'],
    likelyCauses: ['Exserohilum turcicum fungus', 'Moderate temperatures (18-27°C) and heavy dew', 'Infected crop residue left on surface'],
    recommendedActions: ['Grow resistant maize hybrids', 'Rotate crop with non-grasses', 'Apply registered foliar fungicides if severe'],
    analysisSummary: 'Northern Corn Leaf Blight detected. Crop rotation and resistant hybrids recommended.'
  }
};

// Generic healthy mock for fallback
const MOCK_HEALTHY = {
  disease: 'None (Healthy)',
  confidence: 98,
  severity: 'Low',
  description: 'The plant leaves look healthy with active green pigmentation and zero visual signs of active fungal or bacterial damage.',
  visibleSymptoms: ['No visible symptoms'],
  likelyCauses: ['Optimal fertilizer and moisture balance', 'Healthy seed stock'],
  recommendedActions: ['Maintain regular watering', 'Prune lower yellowing leaves to preserve plant energy'],
  analysisSummary: 'The crop is healthy.'
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
  const { t, language } = useLanguage();
  const riskInfo = calculateDiseaseRisk(fieldProfile.cropType, weatherData, language);

  // Filters history by active profile's crop type
  const scopedHistory = history.filter(
    (item) => (item.crop || '').toLowerCase() === fieldProfile.cropType.toLowerCase()
  );

  // Live Vision Analysis Call
  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const aiResult = await analyzeCropImage(file);

      if (aiResult.isCrop === false) {
        setError(aiResult.message || 'Please upload a clear image of a crop or plant.');
        setIsAnalyzing(false);
        return;
      }

      const crop = aiResult.crop || 'Unknown';
      const disease = aiResult.disease || 'None';
      const kbDetails = searchKnowledgeBase(crop, disease);

      const mergedResult = kbDetails
        ? {
            ...aiResult,
            ...kbDetails,
            cropName: kbDetails.cropName || crop,
            disease: kbDetails.disease || disease,
            isUnindexed: false,
          }
        : {
            ...aiResult,
            cropName: crop,
            disease: disease,
            description: aiResult.description || `We identified this plant condition, but detailed recommendations are not yet indexed in our local offline database.`,
            symptoms: aiResult.visibleSymptoms && aiResult.visibleSymptoms.length > 0 ? aiResult.visibleSymptoms : ['Consult agricultural experts for details.'],
            causes: aiResult.likelyCauses && aiResult.likelyCauses.length > 0 ? aiResult.likelyCauses : ['Unspecified agent.'],
            prevention: aiResult.recommendedActions && aiResult.recommendedActions.length > 0 ? aiResult.recommendedActions : ['Maintain sanitation.'],
            bestPractices: ['Practice crop rotation.'],
            recommendedProducts: [],
            isUnindexed: true,
          };

      setAnalysisResult(mergedResult);
      onAddToHistory(mergedResult);

      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'An unexpected error occurred during crop analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mock Analysis Simulator
  const handleSimulateScan = () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    // Pick mock result matching the crop
    const cropKey = fieldProfile.cropType.toLowerCase();
    const mockReport = MOCK_DIAGNOSES[cropKey] || {
      ...MOCK_HEALTHY,
      crop: fieldProfile.cropType,
      cropName: fieldProfile.cropType
    };

    // Pre-populate knowledge details
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
      // Simulate leaf photo
      setPreview('https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=300&auto=format&fit=crop');
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
    <div className="text-left">
      <Hero />
      
      <section id="upload" className="border-t border-earth-100 bg-earth-50/50 py-12 sm:py-16 dark:border-earth-850 dark:bg-earth-900/50 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Proactive Risk Gauge Card */}
          <div className="mb-8 bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-850 rounded-2xl p-5 shadow-soft">
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
            <p className="text-xs sm:text-sm text-earth-600 dark:text-earth-400">
              {riskInfo.explanation}
            </p>
          </div>

          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-crop-600 dark:text-crop-400">
              {t('diagnosticScanner')}
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-earth-900 sm:text-3xl dark:text-earth-50">
              {t('diagnoseLeaf')}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-earth-500 dark:text-earth-450">
              {t('leafDesc')}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 items-start">
            <div className="lg:col-span-2">
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
              <div className="mt-4 text-center">
                <span className="text-xs text-earth-500 dark:text-earth-450 mr-2">No leaf photo on hand?</span>
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-crop-600/30 text-crop-700 bg-crop-50/20 hover:bg-crop-50 dark:text-crop-400 dark:border-crop-500/20 dark:hover:bg-crop-950/20 transition-all cursor-pointer"
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
