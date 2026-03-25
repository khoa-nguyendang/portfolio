import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { LangCode } from '@/i18n/translations';

const STORAGE_KEY = 'portfolio-lang';
const DEFAULT_LANG: LangCode = 'en';

interface LanguageContextValue {
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANG,
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LangCode>(DEFAULT_LANG);

  // Apply stored language after hydration to avoid SSR mismatch.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null;
      if (stored) setLanguageState(stored);
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = useCallback((lang: LangCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
