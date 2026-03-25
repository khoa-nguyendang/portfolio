import { SEOHead } from '@/components/SEOHead';
import { BlogList } from '@/components/BlogList';
import { useTranslation } from '@/i18n';

export default function BlogPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t('blog.page.title')}
        description={t('blog.page.description')}
        ogTitle={t('blog.page.title')}
        ogDescription={t('blog.page.description')}
      />

      <section className="py-20 bg-bg min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="gradient-text">{t('blog.title')}</span>
            </h1>
            <p className="text-text-muted max-w-xl mx-auto">
              {t('blog.subtitle')}
            </p>
          </div>

          <BlogList />
        </div>
      </section>
    </>
  );
}
