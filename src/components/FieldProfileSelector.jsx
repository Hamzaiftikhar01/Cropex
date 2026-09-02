import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const DEMO_PROFILES = [
  {
    id: 'wheat-faisalabad',
    name: '🌾 Profile A: Faisalabad Wheat',
    nameUr: '🌾 گندم: فیصل آباد فارم',
    namePa: '🌾 کنک: فیصل آباد فارم',
    cropType: 'Wheat',
    district: 'Faisalabad',
    sowingDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 75);
      return d.toISOString().split('T')[0];
    })(),
    soilType: 'Loamy',
    lastIrrigatedDaysAgo: 4,
    description: 'Optimal sowing window, loamy soil. Yield potential is high.',
    descriptionUr: 'کاشت کا مناسب ترین وقت اور میرا مٹی۔ پیداوار کا بہترین امکان۔',
    descriptionPa: 'کاشت دا ٹھیک ویلا تے میرا مٹی۔ چنگی پیداوار دی امید اے۔'
  },
  {
    id: 'tomato-bahawalpur',
    name: '🍅 Profile B: Bahawalpur Tomato',
    nameUr: '🍅 ٹماٹر: بہاولپور فارم',
    namePa: '🍅 ٹماٹر: بہاولپور فارم',
    cropType: 'Tomato',
    district: 'Bahawalpur',
    sowingDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 60);
      return d.toISOString().split('T')[0];
    })(),
    soilType: 'Clay',
    lastIrrigatedDaysAgo: 7,
    description: 'Humid & cool weather triggering Late Blight Risk.',
    descriptionUr: 'نمی سے بھرا معتدل موسم جس کی وجہ سے جھلساؤ کا خطرہ زیادہ ہے۔',
    descriptionPa: 'نمی والا معتدل موسم جس دی وجہ توں جھلساؤ دا خطرہ زیادہ اے۔'
  },
  {
    id: 'cotton-multan',
    name: '🌿 Profile C: Multan Cotton',
    nameUr: '🌿 کپاس: ملتان فارم',
    namePa: '🌿 کپاس: ملتان فارم',
    cropType: 'Cotton',
    district: 'Multan',
    sowingDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 45);
      return d.toISOString().split('T')[0];
    })(),
    soilType: 'Sandy',
    lastIrrigatedDaysAgo: 3,
    description: 'Extreme dry heat, sandy soil. Requires frequent irrigation.',
    descriptionUr: 'شدید خشک گرمی اور ریتیلی مٹی۔ پانی کی فوری ضرورت۔',
    descriptionPa: 'شدید خشک گرمی تے ریتلی مٹی۔ پانی دی فوری لوڑ اے۔'
  }
];

const CROPS = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Potato', 'Tomato'];
const DISTRICTS = ['Faisalabad', 'Bahawalpur', 'Multan', 'Sargodha', 'Hyderabad'];
const SOILS = ['Sandy', 'Loamy', 'Clay'];

export default function FieldProfileSelector({ activeProfile, onProfileChange }) {
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(activeProfile);

  const handleSelectDemo = (profile) => {
    onProfileChange(profile);
    setEditForm(profile);
    setIsEditing(false);
  };

  const handleSaveCustom = (e) => {
    e.preventDefault();
    onProfileChange({
      ...editForm,
      id: 'custom',
      name: `👤 Custom: ${editForm.district} ${editForm.cropType}`,
      nameUr: `👤 کسٹم: ${t('dist_' + editForm.district.toLowerCase())} ${t('crop_' + editForm.cropType.toLowerCase())}`,
      namePa: `👤 کسٹم: ${t('dist_' + editForm.district.toLowerCase())} ${t('crop_' + editForm.cropType.toLowerCase())}`,
      description: 'Custom farmer-defined environment configuration.',
      descriptionUr: 'کسان کی فراہم کردہ ترتیبات۔',
      descriptionPa: 'کسان دی فراہم کردہ ترتیبات۔'
    });
    setIsEditing(false);
  };

  const profileName = language === 'ur' 
    ? (activeProfile.nameUr || activeProfile.name) 
    : language === 'pa' 
    ? (activeProfile.namePa || activeProfile.name) 
    : activeProfile.name;

  return (
    <div className="bg-white dark:bg-earth-900 border border-earth-100 dark:border-earth-800 rounded-2xl p-5 sm:p-6 shadow-soft transition-all text-left">
      
      {/* Top Header: Active Profile & Presets Quick Switch */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-earth-100 dark:border-earth-800">
        
        {/* Active Farm Status Badge */}
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 rounded-full relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crop-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-crop-600"></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-crop-700 dark:text-crop-400 uppercase tracking-wider">
                {t('farmProfile')}
              </span>
              <span className="text-xs text-earth-400">•</span>
              <span className="text-xs font-semibold text-earth-500 dark:text-earth-400">
                {t('dist_' + activeProfile.district.toLowerCase())}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-earth-900 dark:text-earth-50 tracking-tight mt-0.5">
              {profileName}
            </h3>
          </div>
        </div>

        {/* Quick Presets Segmented Control Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          {DEMO_PROFILES.map((p) => {
            const isActive = activeProfile.id === p.id;
            const shortName = language === 'ur' 
              ? (p.id === 'wheat-faisalabad' ? '🌾 A: گندم' : p.id === 'tomato-bahawalpur' ? '🍅 B: ٹماٹر' : '🌿 C: کپاس')
              : language === 'pa'
              ? (p.id === 'wheat-faisalabad' ? '🌾 A: کنک' : p.id === 'tomato-bahawalpur' ? '🍅 B: ٹماٹر' : '🌿 C: کپاس')
              : (p.id === 'wheat-faisalabad' ? '🌾 Preset A' : p.id === 'tomato-bahawalpur' ? '🍅 Preset B' : '🌿 Preset C');

            return (
              <button
                key={p.id}
                onClick={() => handleSelectDemo(p)}
                className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-crop-600 text-white shadow-sm shadow-crop-600/30 font-extrabold'
                    : 'bg-earth-50 hover:bg-earth-100 text-earth-700 dark:bg-earth-850 dark:hover:bg-earth-800 dark:text-earth-300 border border-earth-200/60 dark:border-earth-750'
                }`}
              >
                {shortName}
              </button>
            );
          })}

          <button
            onClick={() => {
              setEditForm(activeProfile);
              setIsEditing(!isEditing);
            }}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold border transition-colors shrink-0 cursor-pointer flex items-center justify-center ${
              isEditing
                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900'
                : 'border-earth-200 text-earth-600 hover:bg-earth-50 dark:border-earth-800 dark:text-earth-300 dark:hover:bg-earth-850'
            }`}
          >
            {isEditing ? t('cancel') : `⚙️ ${t('modifyProfile')}`}
          </button>
        </div>
      </div>

      {/* Details View (When not editing) */}
      {!isEditing ? (
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-earth-50/70 dark:bg-earth-950/60 p-3 rounded-xl border border-earth-100 dark:border-earth-850 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-earth-500 dark:text-earth-350 uppercase tracking-wider block">
              {t('cropType')}
            </span>
            <span className="text-xs sm:text-sm font-bold text-earth-850 dark:text-earth-100 mt-1">
              {t('crop_' + activeProfile.cropType.toLowerCase())}
            </span>
          </div>

          <div className="bg-earth-50/70 dark:bg-earth-950/60 p-3 rounded-xl border border-earth-100 dark:border-earth-850 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-earth-500 dark:text-earth-350 uppercase tracking-wider block">
              {t('district')}
            </span>
            <span className="text-xs sm:text-sm font-bold text-earth-850 dark:text-earth-100 mt-1">
              {t('dist_' + activeProfile.district.toLowerCase())}
            </span>
          </div>

          <div className="bg-earth-50/70 dark:bg-earth-950/60 p-3 rounded-xl border border-earth-100 dark:border-earth-850 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-earth-500 dark:text-earth-350 uppercase tracking-wider block">
              {t('soilType')}
            </span>
            <span className="text-xs sm:text-sm font-bold text-earth-850 dark:text-earth-100 mt-1">
              {t('soil_' + activeProfile.soilType.toLowerCase())}
            </span>
          </div>

          <div className="bg-earth-50/70 dark:bg-earth-950/60 p-3 rounded-xl border border-earth-100 dark:border-earth-850 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-earth-500 dark:text-earth-350 uppercase tracking-wider block">
              {t('lastIrrigated')}
            </span>
            <span className="text-xs sm:text-sm font-bold text-earth-850 dark:text-earth-100 mt-1">
              {activeProfile.lastIrrigatedDaysAgo ?? 3} {t('daysAgo')}
            </span>
          </div>
        </div>
      ) : (
        /* Edit Form with Unified Heights and Gaps */
        <form onSubmit={handleSaveCustom} className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-[10px] uppercase font-bold text-earth-500 dark:text-earth-400 mb-1.5">
                {t('cropType')}
              </label>
              <select
                value={editForm.cropType}
                onChange={(e) => setEditForm({ ...editForm, cropType: e.target.value })}
                className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3 font-semibold text-earth-800 dark:text-earth-200 focus:outline-none focus:ring-2 focus:ring-crop-500"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>{t('crop_' + c.toLowerCase())}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-earth-500 dark:text-earth-400 mb-1.5">
                {t('district')}
              </label>
              <select
                value={editForm.district}
                onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3 font-semibold text-earth-800 dark:text-earth-200 focus:outline-none focus:ring-2 focus:ring-crop-500"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{t('dist_' + d.toLowerCase())}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-earth-500 dark:text-earth-400 mb-1.5">
                {t('soilType')}
              </label>
              <select
                value={editForm.soilType}
                onChange={(e) => setEditForm({ ...editForm, soilType: e.target.value })}
                className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3 font-semibold text-earth-800 dark:text-earth-200 focus:outline-none focus:ring-2 focus:ring-crop-500"
              >
                {SOILS.map((s) => (
                  <option key={s} value={s}>{t('soil_' + s.toLowerCase())}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-earth-500 dark:text-earth-400 mb-1.5">
                {t('lastIrrigated')} ({t('daysAgo')})
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={editForm.lastIrrigatedDaysAgo ?? 3}
                onChange={(e) => setEditForm({ ...editForm, lastIrrigatedDaysAgo: parseInt(e.target.value) || 0 })}
                className="w-full h-10 bg-white dark:bg-earth-950 text-xs sm:text-sm border border-earth-200 dark:border-earth-800 rounded-xl px-3 font-semibold text-earth-800 dark:text-earth-200 focus:outline-none focus:ring-2 focus:ring-crop-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-earth-100 dark:border-earth-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="h-9 px-4 rounded-xl text-xs font-bold border border-earth-200 dark:border-earth-800 hover:bg-earth-100 dark:hover:bg-earth-800 cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-xl text-xs font-bold bg-crop-600 hover:bg-crop-700 text-white shadow-sm shadow-crop-600/30 cursor-pointer transition-colors"
            >
              {t('saveProfile')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
