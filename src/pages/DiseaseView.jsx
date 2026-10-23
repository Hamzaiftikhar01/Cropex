import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Hero from '../components/Hero';
import UploadCard from '../components/UploadCard';
import Features from '../components/Features';
import AnalysisResult from '../components/AnalysisResult';
import HistoryList from '../components/HistoryList';
import { analyzeCropImage } from '../services/aiService';
import { searchDiseaseByName, getMockDiagnosis } from '../lib/referenceData';
import { getRegisteredProductsForDiagnosis } from '../lib/pesticideRegistry';
import { calculateDiseaseRisk } from '../utils/agriRules';
import { BookOpen, Wifi } from 'lucide-react';
import {
  isDeviceOnline,
  getOfflineQueue,
  addScanToOfflineQueue,
  syncOfflineQueue,
  clearOfflineQueue,
  getLocalQuickFirstAid,
  onNetworkChange,
} from '../lib/offlineQueue';

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
  weatherData,
  refData
}) {
  const { t } = useLanguage();
  const [offlineScans, setOfflineScans] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    setOfflineScans(getOfflineQueue());
    const cleanup = onNetworkChange(() => {
      setOfflineScans(getOfflineQueue());
    });
    return cleanup;
  }, []);

  const handleSyncOffline = async () => {
    if (offlineScans.length === 0 || isSyncing) return;
    setIsSyncing(true);
    setSyncMessage('Syncing pending scans with cloud AI...');
    try {
      const results = await syncOfflineQueue((done, total) => {
        setSyncMessage(`Synced ${done}/${total} scans...`);
      });
      const successful = results.filter(r => r.success);
      setOfflineScans(getOfflineQueue());
      setSyncMessage(`Successfully synced ${successful.length} of ${results.length} scans!`);
      setTimeout(() => setSyncMessage(''), 4000);
    } catch {
      setSyncMessage('Failed to sync offline scans. Please check your connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  const riskInfo = calculateDiseaseRisk(fieldProfile.cropType, weatherData);
  const scopedHistory = (history || []).filter(h => !h.crop || h.crop === fieldProfile.cropType);

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    const fallbackReport = getMockDiagnosis(refData, fieldProfile.cropType);
    // Phase 2: pass crop hint so VLM uses scoped prompt
    const cropHint = fieldProfile.cropType?.toLowerCase();

    // Phase 6: Offline field scan detection and local queueing
    if (!isDeviceOnline()) {
      addScanToOfflineQueue({
        image: preview,
        cropHint,
        cropName: fieldProfile.cropType,
        district: fieldProfile.district,
      });
      setOfflineScans(getOfflineQueue());
      const quickHelp = getLocalQuickFirstAid(cropHint);
      setIsAnalyzing(false);
      setAnalysisResult({
        cropName: fieldProfile.cropType,
        disease: 'Saved to Offline Queue (آف لائن محفوظ)',
        confidence: 100,
        severity: 'Moderate',
        description: 'آپ کا انٹرنیٹ منقطع ہے۔ یہ تصویر اور فیلڈ ڈیٹا آپ کے فون پر محفوظ کر دیا گیا ہے۔ انٹرنیٹ بحال ہوتے ہی خودکار طور پر سرور سے تفصیلی تشخیص سنک ہو جائے گی۔',
        visibleSymptoms: quickHelp?.commonDiseases?.[0]?.symptoms || ['Visual leaf symptoms saved for sync.'],
        likelyCauses: ['Offline rural connection'],
        recommendedActions: [
          quickHelp?.commonDiseases?.[0]?.emergencyFirstAid || 'Maintain good drainage and isolate affected plants.',
          'Connect to mobile network or Wi-Fi to synchronize with AI diagnostic server.',
        ],
        recommendedProducts: [],
      });
      return;
    }

    try {
      const result = await analyzeCropImage(file, cropHint);
      
      const kbDetails = searchDiseaseByName(refData, result.cropName || result.crop, result.disease);
      const enrichedResult = {
        ...(fallbackReport || {}),
        ...result,
        ...(kbDetails || {}),
        cropName: result.cropName || result.crop || fieldProfile.cropType,
        disease: result.disease || fallbackReport?.disease || 'Unknown',
        confidence: result.confidence || fallbackReport?.confidence || 85,
        severity: result.severity || fallbackReport?.severity || 'Moderate',
        description: result.description || fallbackReport?.description || '',
        visibleSymptoms: (result.visibleSymptoms && result.visibleSymptoms.length > 0) ? result.visibleSymptoms : (kbDetails?.symptoms || fallbackReport?.visibleSymptoms || []),
        likelyCauses: (result.likelyCauses && result.likelyCauses.length > 0) ? result.likelyCauses : (kbDetails?.causes || fallbackReport?.likelyCauses || []),
        recommendedActions: (result.recommendedActions && result.recommendedActions.length > 0) ? result.recommendedActions : (kbDetails?.recommendedActions || fallbackReport?.recommendedActions || []),
        prevention: kbDetails?.prevention || fallbackReport?.prevention || [],
        bestPractices: kbDetails?.bestPractices || fallbackReport?.bestPractices || [],
        recommendedProducts: (kbDetails?.recommendedProducts && kbDetails.recommendedProducts.length > 0) ? kbDetails.recommendedProducts : (fallbackReport?.recommendedProducts || []),
        isUnindexed: !kbDetails,
        // Phase 2: preserve escalation fields from aiService
        needsEscalation: result.needsEscalation || false,
        escalationActions: result.escalationActions || [],
        disease_id: result.disease_id || null,
        // Phase 3: preserve RAG verified sources & grounded treatment
        verifiedSources: result.verifiedSources || [],
        groundedTreatment: result.groundedTreatment || null,
        dppRegisteredProducts:
          result.dppRegisteredProducts ||
          getRegisteredProductsForDiagnosis(result.cropName || fieldProfile.cropType, result.disease),
      };

      setAnalysisResult(enrichedResult);
      onAddToHistory(enrichedResult);

      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err) {
      console.warn('API error encountered, using calibrated knowledge fallback:', err);
      
      const kbDetails = searchDiseaseByName(refData, fallbackReport?.crop, fallbackReport?.disease);
      const fallbackDpp = getRegisteredProductsForDiagnosis(fieldProfile.cropType, fallbackReport?.disease);
      const fallbackResult = {
        ...(fallbackReport || {}),
        ...(kbDetails || {}),
        cropName: fieldProfile.cropType,
        disease: fallbackReport?.disease || 'Unknown',
        isUnindexed: !kbDetails,
        dppRegisteredProducts: fallbackDpp.length > 0 ? fallbackDpp : undefined,
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

    const mockReport = getMockDiagnosis(refData, fieldProfile.cropType);
    const kbDetails = searchDiseaseByName(refData, mockReport?.crop, mockReport?.disease);
    const mockDpp = getRegisteredProductsForDiagnosis(fieldProfile.cropType, mockReport?.disease);
    const mockResult = {
      ...(mockReport || {}),
      ...(kbDetails || {}),
      cropName: fieldProfile.cropType,
      disease: mockReport?.disease || 'Unknown',
      isUnindexed: !kbDetails,
      dppRegisteredProducts: mockDpp.length > 0 ? mockDpp : undefined,
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

          {riskInfo.literatureCitation && (
            <div className="mt-3 pt-2.5 border-t border-earth-100 dark:border-earth-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-earth-500 dark:text-earth-400">
              <span className="font-mono flex items-center gap-1.5">
                <BookOpen size={13} className="text-crop-600 dark:text-crop-400 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-earth-700 dark:text-earth-300">Standard:</span> {riskInfo.literatureCitation}
              </span>
              {riskInfo.epidemiologyThreshold && (
                <span className="text-[10px] bg-earth-50 dark:bg-earth-800/60 border border-earth-200 dark:border-earth-700 px-2 py-0.5 rounded text-earth-650 dark:text-earth-350">
                  {riskInfo.epidemiologyThreshold}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto pt-2">
          <span className="text-xs font-bold uppercase tracking-widest text-crop-600 dark:text-crop-400">
            {t('diagnosticScanner')}
          </span>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-earth-900 sm:text-3xl dark:text-earth-50">
            {t('diagnoseLeaf')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-earth-800 dark:text-earth-300 font-medium">
            {t('leafDesc')}
          </p>
        </div>

        {/* Upload + History Grid */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-4">
            {/* Phase 6: Rural Offline Scans Queued Banner */}
            {offlineScans.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-soft animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm">
                    {offlineScans.length}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-earth-900 dark:text-earth-100 flex items-center gap-2">
                      <span>Offline Scans Queued (آف لائن محفوظ اسکینز)</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {offlineScans.length} Pending
                      </span>
                    </h4>
                    <p className="text-xs text-earth-600 dark:text-earth-400 mt-0.5">
                      {syncMessage || 'Field scans saved locally without internet. Click sync to process with AI when online.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleSyncOffline}
                    disabled={isSyncing}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Wifi size={14} className={isSyncing ? 'animate-pulse' : ''} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Scans (سنک کریں)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearOfflineQueue();
                      setOfflineScans([]);
                    }}
                    disabled={isSyncing}
                    className="px-3 py-2 text-xs font-medium text-earth-600 hover:text-earth-900 dark:text-earth-400 dark:hover:text-earth-200 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

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
              <span className="text-xs text-earth-800 dark:text-earth-300 mr-2">{t('noLeafPhoto')}</span>
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

      {/* Phase 2: Low-confidence escalation banner */}
      {analysisResult?.needsEscalation && (
        <div
          id="escalation-banner"
          className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700/50 p-5 space-y-3"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5" aria-hidden="true">⚠️</span>
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Low Confidence — Verification Recommended
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                The AI returned a confidence of {analysisResult.confidence}% — below the 70% threshold for a reliable diagnosis.
              </p>
            </div>
          </div>
          <ul className="space-y-1 pl-2">
            {(analysisResult.escalationActions || []).map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                <span className="mt-0.5 text-amber-500">→</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
