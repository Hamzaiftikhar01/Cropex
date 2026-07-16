import Hero from '../components/Hero';
import UploadCard from '../components/UploadCard';
import Features from '../components/Features';
import AnalysisResult from '../components/AnalysisResult';
import HistoryList from '../components/HistoryList';
import { analyzeCropImage } from '../services/aiService';
import { searchKnowledgeBase } from '../services/knowledgeService';

function Home({
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
}) {

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // 1. Identify crop and disease via Groq Vision
      const aiResult = await analyzeCropImage(file);

      // Validate if image contains a crop
      if (aiResult.isCrop === false) {
        setError(aiResult.message || "Please upload a clear image of a crop or plant.");
        setIsAnalyzing(false);
        return;
      }

      const crop = aiResult.crop || 'Unknown';
      const disease = aiResult.disease || 'None';

      // 2. Fetch detailed information from local knowledge base
      const kbDetails = searchKnowledgeBase(crop, disease);

      // 3. Consolidate results with fallback for unindexed entries
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
            symptoms: aiResult.visibleSymptoms && aiResult.visibleSymptoms.length > 0
              ? aiResult.visibleSymptoms
              : ['Consult an agricultural extension worker for on-site inspection.'],
            causes: aiResult.likelyCauses && aiResult.likelyCauses.length > 0
              ? aiResult.likelyCauses
              : ['Unspecified or rare pathogen.'],
            prevention: aiResult.recommendedActions && aiResult.recommendedActions.length > 0
              ? aiResult.recommendedActions
              : ['Maintain general field sanitation.', 'Isolate affected plants if possible.'],
            bestPractices: ['Practice crop rotation.', 'Prune congested foliage.'],
            recommendedProducts: [],
            isUnindexed: true,
          };

      setAnalysisResult(mergedResult);
      
      // Save valid diagnostics to history
      onAddToHistory(mergedResult);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err) {
      console.error('Analysis error:', err);
      
      // Friendly messages for farmers
      let friendlyMessage = 'An unexpected error occurred. Please try again.';
      if (err.code === 'TIMEOUT') {
        friendlyMessage = 'The analysis request timed out. Please check your internet connection and try again.';
      } else if (err.code === 'PARSE_ERROR') {
        friendlyMessage = 'The AI response could not be parsed. Please re-upload a clear plant photo and try again.';
      } else if (err.code === 'MISSING_API_KEY') {
        friendlyMessage = 'Configuration Error: The AI service is missing its API key. Please check setup.';
      } else if (err.message && (err.message.includes('fetch') || err.message.includes('Network'))) {
        friendlyMessage = 'Could not establish connection to the AI analysis servers. Please check your network and try again.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      
      setError(friendlyMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <>
      <Hero />
      
      {/* Upload and History Grid Section */}
      <section id="upload" className="border-t border-earth-100 bg-earth-50/50 py-16 sm:py-24 dark:border-earth-850 dark:bg-earth-900/50 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-crop-600 dark:text-crop-400">
              Get Started
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-earth-900 sm:text-4xl dark:text-earth-50">
              Upload Your Crop Image
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-earth-500 dark:text-earth-450">
              Drag and drop or browse to upload a clear photo of the affected crop leaf or plant.
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
            </div>
            <div>
              <HistoryList
                history={history}
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
    </>
  );
}

export default Home;
