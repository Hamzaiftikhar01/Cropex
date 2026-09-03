import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from './src/context/LanguageContext';
import WeatherView from './src/pages/WeatherView';
import './src/index.css';

const daily = [
  { date: '2026-09-04', tempMin: 28, tempMax: 42, precipitationProb: 5, precipitationSum: 0, conditionCode: 0, description: 'Clear Sky', et0: 6.4, uvIndex: 9.2 },
  { date: '2026-09-05', tempMin: 27, tempMax: 39, precipitationProb: 20, precipitationSum: 1, conditionCode: 2, description: 'Partly Cloudy', et0: 5.9, uvIndex: 8.4 },
  { date: '2026-09-06', tempMin: 26, tempMax: 36, precipitationProb: 45, precipitationSum: 4, conditionCode: 3, description: 'Overcast & Humid', et0: 5.1, uvIndex: 7.1 },
  { date: '2026-09-07', tempMin: 24, tempMax: 33, precipitationProb: 85, precipitationSum: 18, conditionCode: 65, description: 'Rainy', et0: 3.8, uvIndex: 5.0 },
  { date: '2026-09-08', tempMin: 23, tempMax: 31, precipitationProb: 90, precipitationSum: 26, conditionCode: 95, description: 'Thunderstorms', et0: 3.2, uvIndex: 4.2 },
  { date: '2026-09-09', tempMin: 22, tempMax: 30, precipitationProb: 60, precipitationSum: 8, conditionCode: 51, description: 'Light Drizzle', et0: 3.6, uvIndex: 5.4 },
  { date: '2026-09-10', tempMin: 3, tempMax: 29, precipitationProb: 15, precipitationSum: 0, conditionCode: 45, description: 'Foggy', et0: 4.0, uvIndex: 6.0 },
];

const weatherData = {
  current: { temp: 41, humidity: 84, windSpeed: 12, precipitation: 0, description: 'Extreme Heat', conditionCode: 0, surfacePressure: 1004 },
  daily,
};

const fieldProfile = { district: 'Faisalabad', cropType: 'Wheat' };
const refData = { districtCoordinates: { Faisalabad: { latitude: 31.4504, longitude: 73.135 } } };

function Harness() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState('en');

  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
  localStorage.setItem('cropex_language', lang);

  return (
    <div className="min-h-screen bg-earth-50 dark:bg-earth-950 p-6">
      <div className="mb-4 flex gap-3">
        <button onClick={() => setDark((d) => !d)} className="px-3 py-1.5 rounded bg-crop-600 text-white text-xs font-bold">
          {dark ? 'dark' : 'light'}
        </button>
        <button onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} className="px-3 py-1.5 rounded bg-earth-700 text-white text-xs font-bold">
          {lang}
        </button>
      </div>
      <LanguageProvider key={lang}>
        <WeatherView
          weatherData={weatherData}
          loading={false}
          error={null}
          isFallback
          isDegraded
          fieldProfile={fieldProfile}
          refData={refData}
        />
      </LanguageProvider>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Harness />
  </StrictMode>
);
