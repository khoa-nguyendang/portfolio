import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { languages } from '@/i18n/translations';
import type { LangCode } from '@/i18n/translations';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface/50 hover:bg-surface-hover transition-colors text-sm"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase font-medium">{currentLang.code}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 max-h-80 overflow-y-auto rounded-xl glass-strong shadow-2xl z-50">
          <div className="p-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as LangCode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  language === lang.code
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-surface-hover text-text-muted hover:text-text'
                }`}
              >
                <span>{lang.nativeName}</span>
                <span className="text-xs uppercase text-text-dim">{lang.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
