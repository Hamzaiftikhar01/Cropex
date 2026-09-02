import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const CROPS = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Potato', 'Tomato'];
const DISTRICTS = ['Faisalabad', 'Bahawalpur', 'Multan', 'Sargodha', 'Hyderabad'];
const SOILS = ['Sandy', 'Loamy', 'Clay'];

export default function AuthView({ onLoginSuccess }) {
  const { t, language, toggleLanguage } = useLanguage();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'setup_profile'

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
  const [signedUpUserEmail, setSignedUpUserEmail] = useState('');

  // Fetch local db of accounts
  const getUsersDB = () => {
    try {
      const db = localStorage.getItem('cropex_users_db');
      return db ? JSON.parse(db) : [];
    } catch {
      return [];
    }
  };

  const saveUsersDB = (db) => {
    localStorage.setItem('cropex_users_db', JSON.stringify(db));
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) return;

    const db = getUsersDB();
    const user = db.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);

    if (!user) {
      setErrorMsg(t('incorrectCredentials'));
      return;
    }

    if (!user.hasCompletedProfile) {
      setSignedUpUserEmail(user.email);
      setMode('setup_profile');
    } else {
      onLoginSuccess(user);
    }
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password || !fullName || !phone) return;

    const db = getUsersDB();
    const exists = db.some(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (exists) {
      setErrorMsg(t('emailExists'));
      return;
    }

    const newUser = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
      district,
      hasCompletedProfile: false,
      profile: null
    };

    saveUsersDB([...db, newUser]);
    setSignedUpUserEmail(newUser.email);
    setMode('setup_profile');
  };

  const handleProfileSetupSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const db = getUsersDB();
    const userIndex = db.findIndex(u => u.email === signedUpUserEmail);

    if (userIndex === -1) {
      setErrorMsg('User session expired. Please sign up again.');
      setMode('signup');
      return;
    }

    const user = db[userIndex];
    const profile = {
      id: 'custom-farmer-' + Math.random().toString(36).substr(2, 9),
      name: `👤 ${user.fullName}'s Farm`,
      nameUr: `👤 ${user.fullName} کا فارم`,
      namePa: `👤 ${user.fullName} دا فارم`,
      cropType,
      district: user.district,
      sowingDate,
      soilType,
      lastIrrigatedDaysAgo: lastIrrigated,
      description: 'Farmer custom field environment.',
      descriptionUr: 'کسان کی فراہم کردہ ترتیبات۔',
      descriptionPa: 'کسان دی فراہم کردہ ترتیبات۔'
    };

    user.profile = profile;
    user.hasCompletedProfile = true;
    db[userIndex] = user;

    saveUsersDB(db);
    onLoginSuccess(user);
  };

  const getLanguageLabel = () => {
    if (language === 'en') return '🇺🇸 EN';
    if (language === 'ur') return '🇵🇰 اردو';
    return '🇵🇰 پنجابی';
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
          {getLanguageLabel()}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-crop-600 text-2xl text-white shadow-sm shadow-crop-600/30">
            🌱
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
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300">
              ⚠️ {errorMsg}
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
                className="w-full h-10 mt-1 inline-flex items-center justify-center bg-crop-600 hover:bg-crop-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-crop-600/30 cursor-pointer transition-colors"
              >
                {t('signIn')}
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
                className="w-full h-10 mt-1 inline-flex items-center justify-center bg-crop-600 hover:bg-crop-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-crop-600/30 cursor-pointer transition-colors"
              >
                {t('nextSetup')} →
              </button>

              <p className="mt-3 text-center text-xs text-earth-500 dark:text-earth-300 font-medium">
                {t('alreadyAccount')}{' '}
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
                <h3 className="text-lg font-bold text-earth-900 dark:text-earth-50">{t('setupFarmTitle')}</h3>
                <p className="text-xs text-earth-500 dark:text-earth-300 mt-0.5">{t('setupFarmDesc')}</p>
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
                className="w-full h-10 mt-1 inline-flex items-center justify-center bg-crop-600 hover:bg-crop-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-crop-600/30 cursor-pointer transition-colors"
              >
                {t('finishSetup')}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
