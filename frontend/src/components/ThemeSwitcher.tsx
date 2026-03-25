import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';

const options: { value: Theme; icon: typeof Sun; labelKey: string }[] = [
  { value: 'light', icon: Sun, labelKey: 'theme.light' },
  { value: 'dark', icon: Moon, labelKey: 'theme.dark' },
  { value: 'system', icon: Monitor, labelKey: 'theme.system' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 p-0.5">
      {options.map(({ value, icon: Icon, labelKey }) => {
        const label = t(labelKey);
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`rounded-md p-1.5 transition-colors ${
              theme === value
                ? 'bg-primary/20 text-primary'
                : 'text-text-muted hover:text-text'
            }`}
            title={label}
            aria-label={`${label} theme`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
