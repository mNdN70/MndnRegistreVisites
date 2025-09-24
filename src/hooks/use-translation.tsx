"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ca from '@/lib/locales/ca.json';
import es from '@/lib/locales/es.json';
import en from '@/lib/locales/en.json';

const translations = { ca, es, en };

type Language = 'ca' | 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getStoredLanguage = (): Language | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('visitwise-language') as Language;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ca');

  useEffect(() => {
    const storedLang = getStoredLanguage();
    if (storedLang && translations[storedLang]) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('visitwise-language', lang);
    }
    setLanguageState(lang);
  };

  const t = useCallback((key: string): string => {
    return translations[language][key as keyof typeof translations[Language]] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
