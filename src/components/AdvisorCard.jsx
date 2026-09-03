import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Bot } from 'lucide-react';

export default function AdvisorCard({ advice, loading, fieldProfile, weatherData }) {
  const { t, language } = useLanguage();
  const [showSecondary, setShowSecondary] = useState(false);

  if (loading || !advice) {
    return (
      <div className="bg-neutral-surface dark:bg-earth-900 border border-neutral-border dark:border-earth-800 rounded-2xl p-5 sm:p-6 shadow-soft animate-pulse flex flex-col gap-3">
        <div className="h-4 w-32 bg-neutral-fill dark:bg-earth-800 rounded-lg"></div>
        <div className="h-8 w-3/4 bg-neutral-fill dark:bg-earth-800 rounded-lg"></div>
        <div className="h-4 w-5/6 bg-neutral-fill dark:bg-earth-800 rounded-lg"></div>
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
        cardBorder: 'border-semantic-high border-[1.5px]',
        badgeBg: 'bg-semantic-high text-neutral-surface',
        bulletColor: 'bg-semantic-high',
        textColor: 'text-semantic-high',
        label: t('high')
      };
    }
    if (level === 'medium') {
      return {
        cardBorder: 'border-semantic-medium border-[1.5px]',
        badgeBg: 'bg-semantic-medium text-neutral-surface',
        bulletColor: 'bg-semantic-medium',
        textColor: 'text-semantic-medium',
        label: t('medium')
      };
    }
    return {
      cardBorder: 'border-semantic-low border-[1.5px]',
      badgeBg: 'bg-semantic-low text-neutral-surface',
      bulletColor: 'bg-semantic-low',
      textColor: 'text-semantic-low',
      label: t('low')
    };
  };

  const style = getUrgencyStyles(advice.urgency);

  return (
    <div className={`p-5 sm:p-6 rounded-2xl bg-neutral-surface dark:bg-earth-900 shadow-soft transition-all duration-200 flex flex-col justify-between ${style.cardBorder}`}>
      <div>
        {/* Header Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full relative shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.bulletColor}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${style.bulletColor}`}></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-medium">
              {t('verdictTitle')}
            </span>
            <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-xs ${style.badgeBg}`}>
              {style.label}
            </span>
            {advice.source === 'llm' && (
              <span className="text-[9px] bg-brand-surface text-brand-primary px-2 py-0.5 rounded-full font-bold shadow-xs">
                <Bot size={16} className="inline mr-1" aria-hidden="true" /> AI
              </span>
            )}
          </div>
        </div>

        {/* Actionable Headline (The Hero) */}
        <h3 className="text-xl sm:text-2xl font-bold text-neutral-high dark:text-earth-50 tracking-tight leading-tight mt-2">
          {headline}
        </h3>

        {/* Explainable Reasoning */}
        <div className="mt-4 pt-3 text-left">
          <p className="text-sm sm:text-base text-neutral-medium dark:text-earth-300 leading-relaxed max-w-3xl">
            <span className="font-semibold text-neutral-high dark:text-earth-100">{t('whyTitle')}: </span>
            {reasoning}
          </p>
        </div>
      </div>

      {/* Secondary Signals Dropdown */}
      {renderedSecondaryNotes && renderedSecondaryNotes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-neutral-border dark:border-earth-800 text-left">
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-high dark:text-earth-200 hover:bg-neutral-fill dark:hover:bg-earth-800 py-1.5 px-2 -ml-2 rounded-lg transition-colors focus:outline-none cursor-pointer w-full sm:w-auto"
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${showSecondary ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>{showSecondary ? t('hideSignals') : t('showSignals')}</span>
          </button>
          
          {showSecondary && (
            <div className="mt-4 pt-4 border-t border-neutral-border dark:border-earth-800">
              <ul className="space-y-2">
                {renderedSecondaryNotes.map((note, idx) => (
                  <li key={idx} className="text-sm text-neutral-medium dark:text-earth-300 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neutral-medium dark:bg-earth-500 shrink-0"></span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
