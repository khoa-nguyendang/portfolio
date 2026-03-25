import { useLanguage } from '@/hooks/useLanguage';
import { translations } from './translations';
import { getYearsOfExperience } from '@/utils/career';

const globalVars: Record<string, string> = {
  years: String(getYearsOfExperience()),
  count: '5',
  acquired: '3',
};

export function useTranslation() {
  const { language } = useLanguage();

  function t(key: string, vars?: Record<string, string>): string {
    const lang = translations[language];
    let value = lang?.[key] ?? translations['en']?.[key] ?? key;

    const allVars = { ...globalVars, ...vars };
    for (const [k, v] of Object.entries(allVars)) {
      value = value.replaceAll(`{${k}}`, v);
    }

    return value;
  }

  return { t, language };
}

export { languages } from './translations';
export type { LangCode, LanguageOption } from './translations';
