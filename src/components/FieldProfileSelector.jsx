import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Edit2 } from 'lucide-react';

export default function FieldProfileSelector({ activeProfile, onProfileChange, refData }) {
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(activeProfile);

  const DEMO_PROFILES = refData?.demoProfiles || [];
  const CROPS = refData?.cropNames || ['Wheat'];
  const DISTRICTS = refData?.districtNames || ['Faisalabad'];
  const SOILS = refData?.soilNames || ['Loamy'];

  const handleSelectDemo = (e) => {
    const profileId = e.target.value;
    const profile = DEMO_PROFILES.find(p => p.id === profileId);
    if (profile) {
      onProfileChange(profile);
      setEditForm(profile);
      setIsEditing(false);
    }
  };

  const handleSaveCustom = (e) => {
    e.preventDefault();
    onProfileChange({
      ...editForm,
      id: 'custom',
      name: `Custom: ${editForm.district} ${editForm.cropType}`,
      nameUr: `کسٹم: ${t('dist_' + editForm.district.toLowerCase())} ${t('crop_' + editForm.cropType.toLowerCase())}`,
      namePa: `کسٹم: ${t('dist_' + editForm.district.toLowerCase())} ${t('crop_' + editForm.cropType.toLowerCase())}`,
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
    <div className="bg-transparent mb-4 transition-all text-left">
      {/* Top Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-high truncate">
            {profileName}
          </span>
          <span className="text-neutral-low hidden md:inline">•</span>
          <span className="text-[13px] text-neutral-high hidden md:inline truncate">
            {t('crop_' + activeProfile.cropType.toLowerCase())} · {t('dist_' + activeProfile.district.toLowerCase())} · {t('soil_' + activeProfile.soilType.toLowerCase())} · {activeProfile.lastIrrigatedDaysAgo ?? 3} {t('daysAgo')}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <select 
            value={activeProfile.id === 'custom' ? '' : activeProfile.id}
            onChange={handleSelectDemo}
            className="h-8 px-2 text-xs font-semibold bg-neutral-fill border border-neutral-border text-neutral-high rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="" disabled>{t('farmProfile')} ▾</option>
            {DEMO_PROFILES.map(p => (
              <option key={p.id} value={p.id}>
                {language === 'ur' ? p.nameUr : language === 'pa' ? p.namePa : p.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setEditForm(activeProfile);
              setIsEditing(!isEditing);
            }}
            className={`h-8 px-3 rounded-md text-xs font-semibold border transition-colors shrink-0 cursor-pointer ${
              isEditing
                ? 'bg-semantic-high/10 text-semantic-high border-semantic-high'
                : 'border-neutral-border text-neutral-high hover:bg-neutral-fill'
            }`}
          >
            {isEditing ? t('cancel') : <><Edit2 size={12} className="inline mr-1" aria-hidden="true" /> {t('modifyProfile')}</>}
          </button>
        </div>
      </div>

      {/* Mobile details (shows if screen is too small for inline) */}
      <div className="md:hidden mt-1 text-[13px] text-neutral-high">
         {t('crop_' + activeProfile.cropType.toLowerCase())} · {t('dist_' + activeProfile.district.toLowerCase())} · {t('soil_' + activeProfile.soilType.toLowerCase())} · {activeProfile.lastIrrigatedDaysAgo ?? 3} {t('daysAgo')}
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSaveCustom} className="mt-4 p-4 bg-neutral-surface border border-neutral-border rounded-xl shadow-hover space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-medium mb-1.5">
                {t('cropType')}
              </label>
              <select
                value={editForm.cropType}
                onChange={(e) => setEditForm({ ...editForm, cropType: e.target.value })}
                className="w-full h-10 bg-neutral-fill text-[15px] border border-neutral-border rounded-lg px-3 font-medium text-neutral-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>{t('crop_' + c.toLowerCase())}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-medium mb-1.5">
                {t('district')}
              </label>
              <select
                value={editForm.district}
                onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                className="w-full h-10 bg-neutral-fill text-[15px] border border-neutral-border rounded-lg px-3 font-medium text-neutral-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{t('dist_' + d.toLowerCase())}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-medium mb-1.5">
                {t('soilType')}
              </label>
              <select
                value={editForm.soilType}
                onChange={(e) => setEditForm({ ...editForm, soilType: e.target.value })}
                className="w-full h-10 bg-neutral-fill text-[15px] border border-neutral-border rounded-lg px-3 font-medium text-neutral-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {SOILS.map((s) => (
                  <option key={s} value={s}>{t('soil_' + s.toLowerCase())}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-neutral-medium mb-1.5">
                {t('lastIrrigated')} ({t('daysAgo')})
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={editForm.lastIrrigatedDaysAgo ?? 3}
                onChange={(e) => setEditForm({ ...editForm, lastIrrigatedDaysAgo: parseInt(e.target.value) || 0 })}
                className="w-full h-10 bg-neutral-fill text-[15px] border border-neutral-border rounded-lg px-3 font-medium text-neutral-high focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="h-9 px-4 rounded-lg text-sm font-semibold border border-neutral-border text-neutral-high hover:bg-neutral-fill cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-lg text-sm font-semibold bg-brand-primary hover:bg-brand-primary/90 text-neutral-surface cursor-pointer transition-colors"
            >
              {t('saveProfile')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
