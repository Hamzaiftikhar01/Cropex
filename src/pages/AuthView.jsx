import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { Languages, Sprout, AlertTriangle } from 'lucide-react';

export default function AuthView({ onLoginSuccess, refData, currentUser }) {
  const CROPS = refData?.cropNames || ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Potato', 'Tomato'];
  const DISTRICTS = refData?.districtNames || ['Faisalabad', 'Bahawalpur', 'Multan', 'Sargodha', 'Hyderabad'];
  const SOILS = refData?.soilNames || ['Sandy', 'Loamy', 'Clay'];
  const { t, language, toggleLanguage } = useLanguage();
  const [mode, setMode] = useState(currentUser ? 'setup_profile' : 'signin'); // 'signin' | 'signup' | 'setup_profile'

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Faisalabad');

  // Profile setup states
  const [cropType, setCropType] = useState('Wheat');
  const [soilType, setSoilType] = useState('Loamy');
  const [sowingDate, setSowingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 60);
    return d.toISOString().split('T')[0];
  });
  const [lastIrrigated, setLastIrrigated] = useState(3);

  // Status indicators
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data?.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        setRegisteredUserId(data.user.id);
        setMode('setup_profile');
      } else {
        onLoginSuccess({
          id: data.user.id,
          email: data.user.email,
          fullName: profile.full_name,
          profile: profile.field_profile
        });
      }
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password || !fullName || !phone) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data?.user) {
      setRegisteredUserId(data.user.id);
      setMode('setup_profile');
    }
  };

  const handleProfileSetupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const targetUserId = registeredUserId || currentUser?.id;
    const targetEmail = email || currentUser?.email || '';

    if (!targetUserId) {
      setErrorMsg('User session expired. Please sign up again.');
      setMode('signup');
      return;
    }

    const irrigationDate = new Date();
    irrigationDate.setDate(irrigationDate.getDate() - parseInt(lastIrrigated));

    const fieldProfile = {
      id: 'custom-farmer-' + Math.random().toString(36).substr(2, 9),
      name: `${fullName}'s Farm`,
      nameUr: `${fullName} کا فارم`,
      namePa: `${fullName} دا فارم`,
      cropType,
      district,
      sowingDate,
      soilType,
      lastIrrigatedDaysAgo: parseInt(lastIrrigated), // Keep for backward compatibility during current session
      last_irrigated_at: irrigationDate.toISOString(),
      description: 'Farmer custom field environment.',
      descriptionUr: 'کسان کی فراہم کردہ ترتیبات۔',
      descriptionPa: 'کسان دی فراہم کردہ ترتیبات۔'
    };

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          id: targetUserId,
          email: targetEmail.trim(),
          full_name: fullName.trim(),
          phone: phone.trim(),
          field_profile: fieldProfile
        }
      ]);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    onLoginSuccess({
      id: targetUserId,
      email: targetEmail.trim(),
      fullName: fullName.trim(),
      profile: fieldProfile
    });
  };

  const getLanguageLabel = () => {
    if (language === 'en') return 'EN';
    if (language === 'ur') return 'اردو';
    return 'پنجابی';
  };

  return (
    <div className="min-h-screen bg-earth-50 dark:bg-earth-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-left transition-colors duration-200">
      
      {/* Language Toggle in Top Corner */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={toggleLanguage}
          className="h-9 px-3 inline-flex items-center justify-center rounded-xl border border-earth-200 bg-white text-xs font-bold text-earth-700 shadow-soft hover:bg-earth-50 hover:text-earth-950 dark:border-earth-800 dark:bg-earth-900 dark:text-earth-300 dark:hover:bg-earth-850 cursor-pointer transition-colors"
        >
          <Languages size={14} className="mr-1 inline" aria-hidden="true" /> {getLanguageLabel()}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-crop-600 text-white shadow-sm shadow-crop-600/30">
            <Sprout size={28} aria-hidden="true" />
          </span>
        </div>
        <h2 className="mt-3 text-center text-3xl font-black tracking-tight text-earth-900 dark:text-earth-50">
          Crop<span className="text-crop-600 dark:text-crop-400">ex</span>
        </h2>
        <p className="mt-1 text-center text-xs text-earth-500 dark:text-earth-300 uppercase tracking-widest font-bold">
          Hackathon Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 shadow-soft border border-earth-100 sm:rounded-2xl sm:px-8 dark:bg-earth-900 dark:border-earth-800">
          
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300 break-words">
              <AlertTriangle size={14} className="inline mr-1" aria-hidden="true" /> {errorMsg}
            </div>
          )}

          {/* SIGN IN VIEW */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <h3 className="text-lg font-bold text-earth-900 dark:text-earth-50">{t('signIn')}</h3>
              
              <div>
                <label className="block text-xs font-semibold text-earth-700 dark:text-earth-300 mb-1.5">
                  {t('email')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3.5 focus:outline-none focus:ring-2 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 dark:text-earth-300 mb-1.5">
                  {t('password')}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3.5 focus:outline-none focus:ring-2 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-1 inline-flex items-center justify-center bg-crop-600 hover:bg-crop-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-crop-600/30 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '...' : t('signIn')}
              </button>

              <p className="mt-3 text-center text-xs text-earth-500 dark:text-earth-300 font-medium">
                {t('noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('signup');
                  }}
                  className="text-crop-600 dark:text-crop-400 font-bold hover:underline cursor-pointer"
                >
                  {t('signUp')}
                </button>
              </p>
            </form>
          )}

          {/* SIGN UP VIEW */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <h3 className="text-lg font-bold text-earth-900 dark:text-earth-50">{t('signUp')}</h3>

              <div>
                <label className="block text-xs font-semibold text-earth-700 dark:text-earth-300 mb-1">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3.5 focus:outline-none focus:ring-2 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 dark:text-earth-300 mb-1">
                  {t('email')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3.5 focus:outline-none focus:ring-2 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-earth-700 dark:text-earth-300 mb-1">
                    {t('phone')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3.5 focus:outline-none focus:ring-2 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-earth-700 dark:text-earth-300 mb-1">
                    {t('district')}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{t('dist_' + d.toLowerCase())}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 dark:text-earth-300 mb-1">
                  {t('password')}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3.5 focus:outline-none focus:ring-2 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-1 inline-flex items-center justify-center bg-crop-600 hover:bg-crop-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-crop-600/30 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '...' : t('nextSetup')} →
              </button>

              <p className="mt-3 text-center text-xs text-earth-500 dark:text-earth-300 font-medium">
                {t('haveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('signin');
                  }}
                  className="text-crop-600 dark:text-crop-400 font-bold hover:underline cursor-pointer"
                >
                  {t('signIn')}
                </button>
              </p>
            </form>
          )}

          {/* SETUP PROFILE VIEW */}
          {mode === 'setup_profile' && (
            <form onSubmit={handleProfileSetupSubmit} className="space-y-3.5">
              <div>
                <h3 className="text-lg font-bold text-earth-900 dark:text-earth-50">{t('setupProfileTitle')}</h3>
                <p className="text-xs text-earth-500 dark:text-earth-300 mt-0.5">{t('setupProfileSubtitle')}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-earth-700 dark:text-earth-300 mb-1">
                    {t('cropType')}
                  </label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
                  >
                    {CROPS.map((c) => (
                      <option key={c} value={c}>{t('crop_' + c.toLowerCase())}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-earth-700 dark:text-earth-300 mb-1">
                    {t('soilType')}
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
                  >
                    {SOILS.map((s) => (
                      <option key={s} value={s}>{t('soil_' + s.toLowerCase())}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 dark:text-earth-300 mb-1">
                  {t('sowingDate')}
                </label>
                <input
                  type="date"
                  required
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3.5 focus:outline-none focus:ring-2 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 dark:text-earth-300 mb-1">
                  {t('lastIrrigated')} ({t('daysAgo')})
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  required
                  value={lastIrrigated}
                  onChange={(e) => setLastIrrigated(parseInt(e.target.value) || 0)}
                  className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3.5 focus:outline-none focus:ring-2 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-1 inline-flex items-center justify-center bg-crop-600 hover:bg-crop-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-crop-600/30 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '...' : t('saveAndContinue')}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
