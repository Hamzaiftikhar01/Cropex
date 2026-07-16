import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './components/About';
import Contact from './components/Contact';
import SettingsModal from './components/SettingsModal';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Theme state persisted to localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('cropcare_dark_mode') === 'true';
  });

  // History state persisted to localStorage (do not store images to save space)
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('cropcare_analysis_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Home view diagnostic states lifted up to keep single source of truth
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cropcare_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cropcare_dark_mode', 'false');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleAddToHistory = (result) => {
    const date = new Date().toLocaleString();
    const newItem = {
      date,
      crop: result.cropName || result.crop || 'Unknown',
      disease: result.disease || 'None',
      confidence: result.confidence || 0,
      severity: result.severity || 'Low',
      fullResult: {
        ...result,
        recommendedProducts: result.recommendedProducts || []
      }
    };
    
    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 10);
      localStorage.setItem('cropcare_analysis_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    localStorage.removeItem('cropcare_analysis_history');
    setHistory([]);
  };

  const handleSelectHistory = (fullResult) => {
    setAnalysisResult(fullResult);
    // Since images aren't saved to history, clear the preview image so it displays the diagnosis clearly
    setPreview(null);
    setFile(null);
    setCurrentView('home');
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-earth-900 transition-colors duration-200 dark:bg-earth-950 dark:text-earth-100">
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            file={file}
            setFile={setFile}
            preview={preview}
            setPreview={setPreview}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
            analysisResult={analysisResult}
            setAnalysisResult={setAnalysisResult}
            error={error}
            setError={setError}
            history={history}
            onAddToHistory={handleAddToHistory}
            onSelectHistory={handleSelectHistory}
            onClearHistory={handleClearHistory}
          />
        )}
        {currentView === 'about' && <About />}
        {currentView === 'contact' && <Contact />}
      </main>

      <Footer />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onClearHistory={handleClearHistory}
        historyCount={history.length}
      />
    </div>
  );
}

export default App;
