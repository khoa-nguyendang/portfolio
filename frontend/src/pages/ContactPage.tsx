import { Mail, MapPin, Github, Linkedin } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { ContactForm } from '@/components/ContactForm';
import { useTranslation } from '@/i18n';

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t('contact.page.title')}
        description={t('contact.page.description')}
        ogTitle={t('contact.page.title')}
        ogDescription={t('contact.page.description')}
      />

      <section className="py-20 bg-bg min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="gradient-text">{t('contact.title')}</span>
            </h1>
            <p className="text-text-muted max-w-xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact form */}
            <div className="lg:col-span-3">
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border/30">
                <ContactForm />
              </div>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-2">
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border/30 h-fit">
                <h2 className="font-bold text-text text-lg mb-6">
                  {t('contact.info.title')}
                </h2>

                <div className="space-y-5">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-text-muted text-sm font-medium">{t('contact.info.email')}</p>
                      <a
                        href="mailto:khoa.nguyendang@outlook.com"
                        className="text-text text-sm hover:text-primary transition-colors"
                      >
                        khoa.nguyendang@outlook.com
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-text-muted text-sm font-medium">{t('contact.info.location')}</p>
                      <p className="text-text text-sm">{t('contact.location.value')}</p>
                    </div>
                  </div>

                  {/* Social links */}
                  <div>
                    <p className="text-text-muted text-sm font-medium mb-3">{t('contact.info.social')}</p>
                    <div className="flex gap-3">
                      <a
                        href="https://github.com/khoa-nguyendang"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg bg-surface-hover hover:bg-primary/10 flex items-center justify-center transition-colors group"
                        aria-label="GitHub"
                      >
                        <Github className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                      </a>
                      <a
                        href="https://linkedin.com/in/khoa-nguyendang"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg bg-surface-hover hover:bg-primary/10 flex items-center justify-center transition-colors group"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
