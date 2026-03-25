import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'portfolio-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
}

export function useTheme() {
  // Start with 'system' for SSR-safe hydration. The inline script in
  // index.html already applied the correct class before React loads.
  const [theme, setThemeState] = useState<Theme>('system');

  // Read stored preference after hydration.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) {
      setThemeState(stored);
      applyTheme(getResolvedTheme(stored));
    }
  }, []);

  const resolved = getResolvedTheme(theme);

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  // Listen for system theme changes when in 'system' mode.
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(getSystemTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  return { theme, resolved, setTheme };
}
