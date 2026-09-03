import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SettingsModal from './components/SettingsModal';
import FieldProfileSelector from './components/FieldProfileSelector';
import Chatbot from './components/Chatbot';

// Import views
import DashboardView from './pages/DashboardView';
import WeatherView from './pages/WeatherView';
import DiseaseView from './pages/DiseaseView';
import YieldView from './pages/YieldView';
import AuthView from './pages/AuthView';
import CropGuideView from './pages/CropGuideView';

// Import hooks and services
import { useWeatherData } from './hooks/useWeatherData';
import { useLanguage } from './context/LanguageContext';
import { getDeterministicAdvice, getRephrasedAdvice } from './services/farmAdvisor';
import { supabase } from './lib/supabase';
import { loadReferenceData } from './lib/referenceData';
import { Sprout } from 'lucide-react';

// Fallback default profile in case DB is empty
const FALLBACK_PROFILE = {
  id: 'wheat-faisalabad',
  name: 'Profile A: Faisalabad Wheat',
  cropType: 'Wheat',
  district: 'Faisalabad',
  sowingDate: (() => { const d = new Date(); d.setDate(d.getDate() - 75); return d.toISOString().split('T')[0]; })(),
  soilType: 'Loamy',
  lastIrrigatedDaysAgo: 4,
  description: 'Optimal sowing window, loamy soil.'
};

function App() {
  const { language } = useLanguage();
  const [currentView, setCurrentView] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Auth Session State
  const [currentUser, setCurrentUser] = useState(null);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Reference data from Supabase
  const [refData, setRefData] = useState(null);

  // Theme state — dark is the default until the user opts out
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('cropcare_dark_mode');
    return stored === null ? true : stored === 'true';
  });

  // Global Field Profile State
  const [fieldProfile, setFieldProfile] = useState(FALLBACK_PROFILE);

  // Weather coordinates fetch
  const { weatherData, loading: weatherLoading, error: weatherError, isFallback: weatherIsFallback, isDegraded: weatherIsDegraded } = useWeatherData(fieldProfile.district, refData?.districtCoordinates);

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
  const [history, setHistory] = useState([]);

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

  // Sync RTL direction on document element
  useEffect(() => {
    if (language === 'ur' || language === 'pa') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  // Load reference data from Supabase on boot
  useEffect(() => {
    loadReferenceData().then(data => {
      setRefData(data);
      // Set default profile from demo profiles if available
      if (data.demoProfiles.length > 0) {
        setFieldProfile(data.demoProfiles[0]);
      }
    }).catch(err => {
      console.error('Failed to load reference data:', err);
    });
  }, []);

  // Supabase Auth Listener & Initial Data Fetch
  useEffect(() => {
    const fetchUserData = async (userId) => {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileData && profileData.field_profile) {
        const fp = { ...profileData.field_profile };
        if (fp.last_irrigated_at) {
          const diff = Date.now() - new Date(fp.last_irrigated_at).getTime();
          fp.lastIrrigatedDaysAgo = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        }
        setFieldProfile(fp);
        setNeedsProfileSetup(false);
        setCurrentUser(prev => prev ? { ...prev, fullName: profileData.full_name || '' } : prev);
      } else if (profileData) {
        setCurrentUser(prev => prev ? { ...prev, fullName: profileData.full_name || '' } : prev);
        setNeedsProfileSetup(true);
      } else {
        setNeedsProfileSetup(true);
      }

      // Fetch history
      const { data: historyData } = await supabase
        .from('analysis_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(15);
      
      if (historyData) {
        const formattedHistory = historyData.map(h => ({
          id: h.id,
          date: new Date(h.created_at).toLocaleString(),
          crop: h.crop_name,
          disease: h.disease,
          confidence: h.confidence,
          severity: h.severity,
          fullResult: h.full_result
        }));
        setHistory(formattedHistory);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchUserData(session.user.id);
      }
      setSessionLoading(false);
    }).catch((err) => {
      console.error('Session fetch failed:', err);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchUserData(session.user.id);
      } else {
        setCurrentUser(null);
        if (refData?.demoProfiles?.length > 0) {
          setFieldProfile(refData.demoProfiles[0]);
        } else {
          setFieldProfile(FALLBACK_PROFILE);
        }
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleToggleDarkMode = () => setDarkMode((prev) => !prev);

  // Flush diagnostic scanning state on profile switches
  const handleProfileChange = async (newProfile) => {
    if (newProfile.cropType !== fieldProfile.cropType) {
      setFile(null);
      setPreview(null);
      setAnalysisResult(null);
      setError(null);
    }
    setFieldProfile(newProfile);

    // Sync changes to active User profile in Supabase
    if (currentUser) {
      await supabase
        .from('profiles')
        .update({ field_profile: newProfile })
        .eq('id', currentUser.id);
    }
  };

  const handleLoginSuccess = () => {
    // Session login is inherently handled by onAuthStateChange listener
    setNeedsProfileSetup(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleAddToHistory = async (result) => {
    const cropName = result.cropName || result.crop || 'Unknown';
    const diseaseName = result.disease || 'None';
    const conf = result.confidence || 0;
    const sev = result.severity || 'Low';
    
    const fullRes = {
      ...result,
      recommendedProducts: result.recommendedProducts || []
    };

    if (currentUser) {
      const { data, error } = await supabase
        .from('analysis_history')
        .insert([{
          user_id: currentUser.id,
          crop_name: cropName,
          disease: diseaseName,
          confidence: conf,
          severity: sev,
          full_result: fullRes
        }])
        .select();
        
      if (data && data[0]) {
        const newItem = {
          id: data[0].id,
          date: new Date(data[0].created_at).toLocaleString(),
          crop: data[0].crop_name,
          disease: data[0].disease,
          confidence: data[0].confidence,
          severity: data[0].severity,
          fullResult: data[0].full_result
        };
        setHistory((prev) => [newItem, ...prev].slice(0, 15));
      } else if (error) {
        console.error('Failed to add to history:', error);
      }
    }
  };

  const handleClearHistory = async () => {
    if (currentUser) {
      const { error } = await supabase
        .from('analysis_history')
        .delete()
        .eq('user_id', currentUser.id);
      
      if (!error) {
        setHistory([]);
      } else {
        console.error('Failed to clear history:', error);
      }
    }
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

  // Auth Routing Gate
  if (sessionLoading || !refData) {
    return <div className="min-h-screen bg-earth-50 dark:bg-earth-950 flex items-center justify-center"><Sprout size={48} className="text-crop-600 dark:text-crop-400 animate-spin" aria-hidden="true" /></div>;
  }

  if (!currentUser || needsProfileSetup) {
    return <AuthView onLoginSuccess={handleLoginSuccess} refData={refData} currentUser={currentUser} />;
  }

  return (
    <div className={`relative min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="field-backdrop print:hidden" aria-hidden="true" />

      {/* Navbar hidden when printing to act as a clean PDF report */}
      <div className="relative z-10 print:hidden">
        <Navbar
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenSettings={() => setSettingsOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 print:mt-0 print:pt-4 print:px-0 space-y-6">
        
        <FieldProfileSelector 
          activeProfile={fieldProfile}
          onProfileChange={handleProfileChange}
          refData={refData}
        />

        <div>
          {currentView === 'dashboard' && (
            <DashboardView 
              fieldProfile={fieldProfile}
              weatherData={weatherData}
              loading={weatherLoading}
              onNavigate={setCurrentView}
              advice={advice}
              adviceLoading={adviceLoading}
              onProfileChange={handleProfileChange}
            />
          )}

          {currentView === 'weather' && (
            <WeatherView 
              weatherData={weatherData}
              loading={weatherLoading}
              error={weatherError}
              isFallback={weatherIsFallback}
              isDegraded={weatherIsDegraded}
              fieldProfile={fieldProfile}
              refData={refData}
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
              refData={refData}
            />
          )}

          {currentView === 'guides' && (
            <CropGuideView fieldProfile={fieldProfile} />
          )}

          {currentView === 'yield' && (
            <YieldView 
              key={fieldProfile.id}
              fieldProfile={fieldProfile}
              weatherData={weatherData}
            />
          )}
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onClearHistory={handleClearHistory}
        historyCount={history.length}
      />

      {/* Floating Chatbot */}
      <Chatbot fieldProfile={fieldProfile} weatherData={weatherData} />
    </div>
  );
}

export default App;
