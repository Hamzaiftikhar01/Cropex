import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speakInSelectedLanguage, stopVoice } from '../utils/voicePlayer';

export default function AdvisorCard({ advice, loading, fieldProfile, weatherData }) {
  const { t, language } = useLanguage();
  const [showSecondary, setShowSecondary] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Stop playback on unmount or when language/profile changes
  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, []);

  useEffect(() => {
    stopVoice();
    setIsPlaying(false);
  }, [language, fieldProfile]);

  if (loading || !advice) {
    return (
      <div className="bg-white border border-earth-100 dark:bg-earth-900 dark:border-earth-850 rounded-2xl p-5 shadow-soft animate-pulse flex flex-col gap-3">
        <div className="h-4 w-32 bg-earth-200 dark:bg-earth-800 rounded"></div>
        <div className="h-6 w-3/4 bg-earth-200 dark:bg-earth-800 rounded"></div>
        <div className="h-4 w-5/6 bg-earth-200 dark:bg-earth-800 rounded"></div>
      </div>
    );
  }

  // Resolve translations dynamically
  let headline = '';
  let reasoning = '';

  if (advice.source === 'llm') {
    headline = advice.headline;
    reasoning = advice.reasoning;
  } else {
    // Layer 1 translations with token replacements
    const replacedData = advice.reasoningData ? { ...advice.reasoningData } : {};
    if (advice.reasoningData && advice.reasoningData.soilKey) {
      replacedData.soil = t(advice.reasoningData.soilKey);
    }
    headline = t(advice.headlineKey, advice.reasoningData || {});
    reasoning = t(advice.reasoningKey, replacedData);
  }

  // Translate secondary signals
  const renderedSecondaryNotes = (advice.secondaryNotes || []).map((note) => {
    if (!note || !note.data) return '';
    const interpolated = { ...note.data };
    if (note.data.soilKey) {
      interpolated.soil = t(note.data.soilKey);
    }
    if (note.data.verdict) {
      const v = note.data.verdict;
      if (v === 'Irrigate Now') {
        interpolated.verdict = language === 'ur' ? 'ابھی پانی دیں' : language === 'pa' ? 'اج ای پانی دیو' : 'Irrigate Now';
      } else if (v === 'Irrigate in 2 Days') {
        interpolated.verdict = language === 'ur' ? '2 دن میں پانی دیں' : language === 'pa' ? '2 دن وچ پانی دیو' : 'Irrigate in 2 Days';
      } else {
        interpolated.verdict = t('soilAdequate');
      }
    }
    if (note.data.level) {
      interpolated.level = t(note.data.level.toLowerCase());
    }
    if (note.data.disease) {
      interpolated.disease = note.data.disease;
    }
    return t(note.key, interpolated);
  }).filter(Boolean);

  const getUrgencyStyles = (level) => {
    if (level === 'high') {
      return {
        cardBg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-900 dark:text-red-300',
        badgeBg: 'bg-red-600 text-white',
        bulletColor: 'bg-red-600',
        label: t('high')
      };
    }
    if (level === 'medium') {
      return {
        cardBg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-300',
        badgeBg: 'bg-amber-500 text-white',
        bulletColor: 'bg-amber-500',
        label: t('medium')
      };
    }
    return {
      cardBg: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-900 dark:text-green-300',
      badgeBg: 'bg-green-600 text-white',
      bulletColor: 'bg-green-600',
      label: t('low')
    };
  };

  const style = getUrgencyStyles(advice.urgency);

  // Trigger natural condition-aware voice in Urdu, Punjabi, or English
  const handleToggleSpeak = () => {
    if (isPlaying) {
      stopVoice();
      setIsPlaying(false);
      return;
    }

    const cropLabel = fieldProfile ? t('crop_' + fieldProfile.cropType.toLowerCase()) : '';
    const distLabel = fieldProfile ? t('dist_' + fieldProfile.district.toLowerCase()) : '';

    let textToSpeak = '';

    if (language === 'ur') {
      const intro = `السلام علیکم کسان بھائی۔ ضلع ${distLabel} میں آپ کی ${cropLabel} کی فصل کے لیے کراپیکس کی تفصیلی رپورٹ۔ `;
      const main = `${headline}۔ ${reasoning}۔ `;
      const sec = renderedSecondaryNotes.length > 0 ? `دیگر اہم اشارے: ${renderedSecondaryNotes.join('۔ ')}۔ ` : '';
      const outro = `کراپیکس کے ساتھ اپنی فصل کو محفوظ بنائیں۔`;
      textToSpeak = `${intro} ${main} ${sec} ${outro}`;
    } else if (language === 'pa') {
      const intro = `السلام علیکم کسان بھائیو۔ ضلع ${distLabel} وچ تواڈی ${cropLabel} دی فصل لئی کراپیکس دی رپورٹ۔ `;
      const main = `${headline}۔ ${reasoning}۔ `;
      const sec = renderedSecondaryNotes.length > 0 ? `ہور اہم اشارے: ${renderedSecondaryNotes.join('۔ ')}۔ ` : '';
      const outro = `کراپیکس نال اپنی فصل نوں محفوظ بناؤ۔`;
      textToSpeak = `${intro} ${main} ${sec} ${outro}`;
    } else {
      const intro = `Hello Farmer! Here is your Cropex intelligence report for ${cropLabel} in ${distLabel}. `;
      const main = `${headline}. ${reasoning}. `;
      const sec = renderedSecondaryNotes.length > 0 ? `Additional signals: ${renderedSecondaryNotes.join('. ')}. ` : '';
      const outro = `Stay protected with Cropex.`;
      textToSpeak = `${intro} ${main} ${sec} ${outro}`;
    }

    speakInSelectedLanguage({
      text: textToSpeak.trim(),
      language,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  };

  const getVoiceButtonLabel = () => {
    if (isPlaying) {
      if (language === 'ur') return 'روکیں (Stop)';
      if (language === 'pa') return 'روکو (Stop)';
      return 'Stop Voice';
    }
    if (language === 'ur') return '🔊 اردو میں سنیں';
    if (language === 'pa') return '🔊 پنجابی وچ سنو';
    return '🔊 Listen in English';
  };

  return (
    <div className={`p-5 rounded-2xl border-2 shadow-soft transition-all duration-200 flex flex-col justify-between ${style.cardBg}`}>
      <div>
        {/* Header Indicator */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.bulletColor}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${style.bulletColor}`}></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
              {t('verdictTitle')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm ${style.badgeBg}`}>
              {style.label}
            </span>
            {advice.source === 'llm' && (
              <span className="text-[9px] bg-crop-600/10 text-crop-800 dark:bg-crop-400/20 dark:text-crop-300 px-2 py-0.5 rounded-full font-bold shadow-sm">
                🤖 AI Rephrased
              </span>
            )}
            
            {/* Multilingual Voice Speaker Button */}
            <button
              type="button"
              onClick={handleToggleSpeak}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer shadow-sm ${
                isPlaying 
                  ? 'bg-red-600 text-white border-red-700 animate-pulse' 
                  : 'bg-white/90 dark:bg-earth-900/90 border-current/30 hover:bg-white dark:hover:bg-earth-900 hover:scale-105'
              }`}
              title={isPlaying ? "Stop Voice Output" : "Listen Detailed Recommendation"}
              aria-label="Toggle Voice Out Loud"
            >
              {isPlaying ? (
                <>
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                  <span>{getVoiceButtonLabel()}</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span>{getVoiceButtonLabel()}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actionable Headline */}
        <h3 className="text-lg sm:text-xl font-black leading-tight tracking-tight">
          {headline}
        </h3>

        {/* Explainable Reasoning */}
        <div className="mt-4 pt-3.5 border-t border-current/10">
          <h4 className="text-xs uppercase font-bold tracking-wider opacity-75">
            {t('whyTitle')}
          </h4>
          <p className="mt-1 text-sm font-medium leading-relaxed">
            {reasoning}
          </p>
        </div>
      </div>

      {/* Secondary Signals Dropdown */}
      {renderedSecondaryNotes && renderedSecondaryNotes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-current/10 text-left">
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            className="flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
          >
            <span>{showSecondary ? '▼' : '▶'}</span>
            <span>{showSecondary ? t('hideSignals') : t('showSignals')}</span>
          </button>
          
          {showSecondary && (
            <ul className="mt-3.5 space-y-2.5 pl-3.5 list-disc text-xs font-semibold leading-relaxed border-l-2 border-current/20">
              {renderedSecondaryNotes.map((note, idx) => (
                <li key={idx} className="opacity-90">{note}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
