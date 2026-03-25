import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { useTranslation } from '@/i18n';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead title={`404 - ${t('notfound.title')}`} description={t('notfound.description')} />

      <section className="min-h-[80vh] flex items-center justify-center bg-bg">
        <div className="text-center px-4">
          <h1 className="text-8xl sm:text-9xl font-bold gradient-text mb-4">404</h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-text mb-4">
            {t('notfound.title')}
          </h2>
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            {t('notfound.description')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            {t('notfound.back')}
          </Link>
        </div>
      </section>
    </>
  );
}
