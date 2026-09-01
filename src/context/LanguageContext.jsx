import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Support 'en' | 'ur' | 'pa'
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem('cropex_language');
    return (stored === 'ur' || stored === 'pa') ? stored : 'en';
  });

  useEffect(() => {
    localStorage.setItem('cropex_language', language);
  }, [language]);

  const toggleLanguage = () => {
    // Cycles through: en -> ur -> pa -> en
    setLanguage((prev) => {
      if (prev === 'en') return 'ur';
      if (prev === 'ur') return 'pa';
      return 'en';
    });
  };

  const t = (key, replacements = {}) => {
    if (!key) return '';
    const dict = translations[language] || translations['en'];
    let val = dict[key] || translations['en'][key] || key;
    
    // Replace placeholder tokens (e.g. {temp} with replacements.temp)
    Object.keys(replacements).forEach((placeholder) => {
      val = val.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
    });
    return val;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
