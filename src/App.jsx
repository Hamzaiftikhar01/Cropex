import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SettingsModal from './components/SettingsModal';
import FieldProfileSelector, { DEMO_PROFILES } from './components/FieldProfileSelector';

// Import views
import DashboardView from './pages/DashboardView';
import WeatherView from './pages/WeatherView';
import DiseaseView from './pages/DiseaseView';
import IrrigationView from './pages/IrrigationView';
import YieldView from './pages/YieldView';
import AuthView from './pages/AuthView';

// Import hooks and services
import { useWeatherData } from './hooks/useWeatherData';
import { useLanguage } from './context/LanguageContext';
import { getDeterministicAdvice, getRephrasedAdvice } from './services/farmAdvisor';

function App() {
  const { language } = useLanguage();
  const [currentView, setCurrentView] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Auth Session State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cropex_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('cropcare_dark_mode') === 'true';
  });

  // Global Field Profile State
  const [fieldProfile, setFieldProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('cropex_field_profile');
      return stored ? JSON.parse(stored) : DEMO_PROFILES[0];
    } catch {
      return DEMO_PROFILES[0];
    }
  });

  // Weather coordinates fetch
  const { weatherData, loading: weatherLoading, error: weatherError, isFallback: weatherIsFallback } = useWeatherData(fieldProfile.district);

  // AI Farm Advisor states
  const [advice, setAdvice] = useState(null);
  const [adviceLoading, setAdviceLoading] = useState(false);

  // Fetch / Compute Farm Advisor Recommendations dynamically
  useEffect(() => {
    if (!weatherData) return;

    let active = true;
    const fetchAdvice = async () => {
      setAdviceLoading(true);
      const baseAdvice = getDeterministicAdvice(fieldProfile, weatherData, language);
      
      if (!active) return;
      setAdvice(baseAdvice);

      const finalAdvice = await getRephrasedAdvice(baseAdvice, language);
      
      if (active) {
        setAdvice(finalAdvice);
        setAdviceLoading(false);
      }
    };

    fetchAdvice();

    return () => {
      active = false;
    };
  }, [fieldProfile, weatherData, language]);

  // History state
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('cropcare_analysis_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Diagnostic Scan states
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

  // Sync field profile state to localStorage
  useEffect(() => {
    localStorage.setItem('cropex_field_profile', JSON.stringify(fieldProfile));
  }, [fieldProfile]);

  const handleToggleDarkMode = () => setDarkMode((prev) => !prev);

  // Flush diagnostic scanning state on profile switches
  const handleProfileChange = (newProfile) => {
    if (newProfile.cropType !== fieldProfile.cropType) {
      setFile(null);
      setPreview(null);
      setAnalysisResult(null);
      setError(null);
    }
    setFieldProfile(newProfile);

    // Sync changes to active User profile
    if (currentUser) {
      const updatedUser = { ...currentUser, profile: newProfile };
      setCurrentUser(updatedUser);
      localStorage.setItem('cropex_current_user', JSON.stringify(updatedUser));

      try {
        const db = JSON.parse(localStorage.getItem('cropex_users_db') || '[]');
        const idx = db.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (idx !== -1) {
          db[idx] = updatedUser;
          localStorage.setItem('cropex_users_db', JSON.stringify(db));
        }
      } catch (err) {
        console.error('Error syncing user database:', err);
      }
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('cropex_current_user', JSON.stringify(user));
    if (user.profile) {
      setFieldProfile(user.profile);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cropex_current_user');
  };

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
      const updated = [newItem, ...prev].slice(0, 15);
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
    setPreview(null);
    setFile(null);
    setCurrentView('disease');
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Auth Routing Gate: Render login/signup interface if not authenticated
  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-earth-900 transition-colors duration-200 dark:bg-earth-950 dark:text-earth-100">
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenSettings={() => setSettingsOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Global Field Profile Selector (Always visible for easy demo customization) */}
        <FieldProfileSelector 
          activeProfile={fieldProfile}
          onProfileChange={handleProfileChange}
        />

        {/* Navigation router for Module Views */}
        <div>
          {currentView === 'dashboard' && (
            <DashboardView 
              fieldProfile={fieldProfile}
              weatherData={weatherData}
              loading={weatherLoading}
              onNavigate={setCurrentView}
              advice={advice}
              adviceLoading={adviceLoading}
            />
          )}

          {currentView === 'weather' && (
            <WeatherView 
              weatherData={weatherData}
              loading={weatherLoading}
              error={weatherError}
              isFallback={weatherIsFallback}
              fieldProfile={fieldProfile}
            />
          )}

          {currentView === 'disease' && (
            <DiseaseView
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
              fieldProfile={fieldProfile}
              weatherData={weatherData}
            />
          )}

          {currentView === 'irrigation' && (
            <IrrigationView 
              fieldProfile={fieldProfile}
              weatherData={weatherData}
              onProfileChange={handleProfileChange}
            />
          )}

          {currentView === 'yield' && (
            <YieldView 
              key={fieldProfile.id} // Forces local state sandbox overrides reset on profile switches
              fieldProfile={fieldProfile}
              weatherData={weatherData}
            />
          )}
        </div>
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
