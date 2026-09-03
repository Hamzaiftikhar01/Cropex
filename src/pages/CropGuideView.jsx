import { useState, useEffect } from 'react';
import { cropGuidesData } from '../lib/cropGuidesData';
import CropTimeline from '../components/guides/CropTimeline';
import CropRequirements from '../components/guides/CropRequirements';
import { getLocalCropAdvice } from '../services/aiService';

export default function CropGuideView({ fieldProfile }) {
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [localAdvice, setLocalAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (selectedCropId && fieldProfile?.district) {
      const crop = cropGuidesData.find(c => c.id === selectedCropId);
      if (crop) {
        setLoadingAdvice(true);
        getLocalCropAdvice(crop.name, fieldProfile.district)
          .then(advice => {
            if (isMounted) {
              setLocalAdvice(advice);
              setLoadingAdvice(false);
            }
          })
          .catch(() => {
            if (isMounted) setLoadingAdvice(false);
          });
      }
    } else {
      setLocalAdvice('');
    }
    return () => { isMounted = false; };
  }, [selectedCropId, fieldProfile?.district]);

  const selectedCrop = selectedCropId 
    ? cropGuidesData.find(c => c.id === selectedCropId) 
    : null;

  if (selectedCrop) {
    return (
      <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Back Button & Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedCropId(null)}
            className="p-2 hover:bg-earth-100 dark:hover:bg-earth-800 rounded-xl transition-colors text-earth-600 dark:text-earth-300"
            aria-label="Back to grid"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-earth-900 dark:text-earth-50 tracking-tight">
              {selectedCrop.icon} {selectedCrop.name}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-earth-800 dark:text-earth-400 italic">
              {selectedCrop.scientificName} • {selectedCrop.season}
            </p>
          </div>
        </div>

        {/* Description & Local Advice */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-gradient-to-br from-earth-100 to-earth-50 dark:from-earth-800 dark:to-earth-900 rounded-2xl p-5 sm:p-6 border border-earth-200 dark:border-earth-700 shadow-sm">
            <p className="text-sm sm:text-base text-earth-800 dark:text-earth-200 leading-relaxed font-medium">
              {selectedCrop.description}
            </p>
          </div>
          
          {fieldProfile?.district && (
            <div className="lg:col-span-1 bg-brand-surface dark:bg-brand-primary/10 rounded-2xl p-5 border border-brand-primary/20 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-6xl opacity-10">📍</div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-crop-400 mb-3 flex items-center gap-2">
                <span className="text-sm">📍</span> Local Tip: {fieldProfile.district}
              </h3>
              {loadingAdvice ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-brand-primary/20 rounded w-full"></div>
                  <div className="h-3 bg-brand-primary/20 rounded w-5/6"></div>
                  <div className="h-3 bg-brand-primary/20 rounded w-4/6"></div>
                </div>
              ) : (
                <p className="text-sm text-earth-800 dark:text-earth-200 leading-relaxed font-medium">
                  {localAdvice}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Requirements */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-earth-800 dark:text-earth-100 mb-4 ml-1">
            Growth Requirements
          </h3>
          <CropRequirements reqs={selectedCrop.requirements} />
        </div>

        {/* Lifecycle & Threats Layout */}
        <div className="grid gap-8 lg:grid-cols-3 items-start pt-4">
          
          {/* Lifecycle Timeline */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-earth-800 dark:text-earth-100 mb-6 ml-1 flex items-center gap-2">
              <svg className="w-5 h-5 text-crop-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Agronomic Lifecycle
            </h3>
            <CropTimeline lifecycle={selectedCrop.lifecycle} />
          </div>

          {/* Threats / Pests */}
          <div className="lg:col-span-1 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-5 shadow-sm sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Major Threats & Pests
            </h3>
            <ul className="space-y-3">
              {selectedCrop.threats.map((threat, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-red-900 dark:text-red-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  {threat}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-red-600 dark:text-red-400 mt-5 opacity-80 leading-relaxed italic">
              *If you observe signs of these threats, use the AI Disease Scanner immediately for diagnosis.
            </p>
          </div>
          
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="space-y-6 text-left animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-earth-100 dark:border-earth-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-earth-900 dark:text-earth-50 tracking-tight font-sans">
            Crop Encyclopedia
          </h2>
          <p className="text-xs text-earth-800 dark:text-earth-300 mt-0.5 font-medium">
            Detailed agronomic cycles, requirements, and management guidelines.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cropGuidesData.map(crop => (
          <button
            key={crop.id}
            onClick={() => setSelectedCropId(crop.id)}
            className="group relative overflow-hidden bg-white dark:bg-earth-900 border border-earth-200 dark:border-earth-700 rounded-2xl p-6 text-left shadow-sm hover:shadow-lg hover:border-crop-400 dark:hover:border-crop-500 transition-all cursor-pointer flex flex-col justify-between h-48"
          >
            <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${crop.color} opacity-10 dark:opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
            
            <div>
              <div className="text-4xl mb-3 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 origin-bottom-left">
                {crop.icon}
              </div>
              <h3 className="text-xl font-bold text-earth-900 dark:text-earth-50 tracking-tight">{crop.name}</h3>
              <p className="text-xs font-semibold text-earth-500 dark:text-earth-400 italic mt-0.5">{crop.scientificName}</p>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-crop-600 dark:text-crop-400 bg-crop-50 dark:bg-crop-950/30 px-2 py-1 rounded-md">
                {crop.season.split(' ')[0]}
              </span>
              <span className="text-earth-400 group-hover:text-crop-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
