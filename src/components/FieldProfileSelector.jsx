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
    lastIrrigatedDaysAgo: 3, // Set to 3 to trigger "Irrigate Now" for sandy soil (interval=3)
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

  const profileDesc = language === 'ur' 
    ? (activeProfile.descriptionUr || activeProfile.description) 
    : language === 'pa' 
    ? (activeProfile.descriptionPa || activeProfile.description) 
    : activeProfile.description;

  return (
    <div className="bg-earth-50 border border-earth-100 rounded-2xl p-5 shadow-soft dark:bg-earth-900 dark:border-earth-850 transition-all text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <span className="text-xs font-semibold text-crop-600 dark:text-crop-400 uppercase tracking-wider">
            {t('farmProfile')}
          </span>
          <h3 className="text-lg font-bold text-earth-900 dark:text-earth-50 flex items-center gap-2 mt-0.5">
            {profileName}
          </h3>
        </div>
        <button
          onClick={() => {
            setEditForm(activeProfile);
            setIsEditing(!isEditing);
          }}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-crop-600 text-white hover:bg-crop-700 transition-colors shadow-sm cursor-pointer"
        >
          {isEditing ? t('cancel') : t('modifyProfile')}
        </button>
      </div>

      {!isEditing ? (
        <div>
          {/* Active profile quick specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-earth-100 dark:bg-earth-950 dark:border-earth-800">
            <div>
              <div className="text-[10px] text-earth-450 dark:text-earth-500 uppercase font-semibold">{t('cropType')}</div>
              <div className="text-sm font-bold text-earth-800 dark:text-earth-200">
                {t('crop_' + activeProfile.cropType.toLowerCase())}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-earth-450 dark:text-earth-500 uppercase font-semibold">{t('district')}</div>
              <div className="text-sm font-bold text-earth-800 dark:text-earth-200">
                {t('dist_' + activeProfile.district.toLowerCase())}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-earth-450 dark:text-earth-500 uppercase font-semibold">{t('sowingDate')}</div>
              <div className="text-sm font-bold text-earth-800 dark:text-earth-200">{activeProfile.sowingDate}</div>
            </div>
            <div>
              <div className="text-[10px] text-earth-450 dark:text-earth-500 uppercase font-semibold">{t('soilType')}</div>
              <div className="text-sm font-bold text-earth-800 dark:text-earth-200">
                {t('soil_' + activeProfile.soilType.toLowerCase())}
              </div>
            </div>
          </div>
          {profileDesc && (
            <p className="mt-2 text-xs italic text-earth-500 dark:text-earth-450">
              * {profileDesc}
            </p>
          )}

          {/* Quick Demo Switchers */}
          <div className="mt-4 pt-4 border-t border-earth-100 dark:border-earth-805">
            <span className="text-xs font-bold text-earth-450 dark:text-earth-500 block mb-2">
              {t('switchPreset')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_PROFILES.map((p) => {
                const displayName = language === 'ur' ? p.nameUr : language === 'pa' ? p.namePa : p.name;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectDemo(p)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      activeProfile.id === p.id
                        ? 'border-crop-500 bg-crop-50/40 text-crop-800 dark:bg-crop-950/20 dark:text-crop-300'
                        : 'border-earth-100 hover:bg-earth-100/50 text-earth-600 dark:border-earth-800 dark:hover:bg-earth-800/40 dark:text-earth-300'
                    }`}
                  >
                    <div className="font-bold">
                      {displayName}
                    </div>
                    <div className="opacity-75 mt-0.5">
                      {t('dist_' + p.district.toLowerCase())} • {t('soil_' + p.soilType.toLowerCase())}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveCustom} className="space-y-4 pt-3 border-t border-earth-100 dark:border-earth-805">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
            {/* Crop Select */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-earth-500 dark:text-earth-400 mb-1">
                {t('cropType')}
              </label>
              <select
                value={editForm.cropType}
                onChange={(e) => setEditForm({ ...editForm, cropType: e.target.value })}
                className="w-full bg-white dark:bg-earth-950 text-sm border border-earth-200 dark:border-earth-800 rounded-xl p-2.5 focus:outline-none focus:border-crop-500 focus:ring-1 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>{t('crop_' + c.toLowerCase())}</option>
                ))}
              </select>
            </div>

            {/* Location Select */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-earth-500 dark:text-earth-400 mb-1">
                {t('district')}
              </label>
              <select
                value={editForm.district}
                onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                className="w-full bg-white dark:bg-earth-950 text-sm border border-earth-200 dark:border-earth-800 rounded-xl p-2.5 focus:outline-none focus:border-crop-500 focus:ring-1 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{t('dist_' + d.toLowerCase())}</option>
                ))}
              </select>
            </div>

            {/* Sowing Date */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-earth-500 dark:text-earth-400 mb-1">
                {t('sowingDate')}
              </label>
              <input
                type="date"
                value={editForm.sowingDate}
                onChange={(e) => setEditForm({ ...editForm, sowingDate: e.target.value })}
                className="w-full bg-white dark:bg-earth-950 text-sm border border-earth-200 dark:border-earth-800 rounded-xl p-2 focus:outline-none focus:border-crop-500 focus:ring-1 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
              />
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-earth-500 dark:text-earth-400 mb-1">
                {t('soilType')}
              </label>
              <select
                value={editForm.soilType}
                onChange={(e) => setEditForm({ ...editForm, soilType: e.target.value })}
                className="w-full bg-white dark:bg-earth-950 text-sm border border-earth-200 dark:border-earth-800 rounded-xl p-2.5 focus:outline-none focus:border-crop-500 focus:ring-1 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
              >
                {SOILS.map((s) => (
                  <option key={s} value={s}>{t('soil_' + s.toLowerCase())}</option>
                ))}
              </select>
            </div>

            {/* Last Irrigated */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-earth-500 dark:text-earth-400 mb-1">
                {t('lastIrrigated')}
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={editForm.lastIrrigatedDaysAgo ?? 3}
                onChange={(e) => setEditForm({ ...editForm, lastIrrigatedDaysAgo: parseInt(e.target.value) || 0 })}
                className="w-full bg-white dark:bg-earth-950 text-sm border border-earth-200 dark:border-earth-800 rounded-xl p-2 focus:outline-none focus:border-crop-500 focus:ring-1 focus:ring-crop-500 text-earth-800 dark:text-earth-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-earth-200 hover:bg-earth-100 rounded-xl text-xs font-semibold text-earth-660 dark:border-earth-800 dark:hover:bg-earth-800 dark:text-earth-300 transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-crop-600 text-white hover:bg-crop-700 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              {t('saveProfile')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
