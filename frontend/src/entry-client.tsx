import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { LanguageProvider } from '@/hooks/useLanguage';
import './main.css';

hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </BrowserRouter>
);
