import { ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';

export function Hero() {
  const { t } = useTranslation();

  return (
    <section
      className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden"
      aria-label="Hero"
    >
      {/* Floating shapes */}
      <div className="floating-shape" aria-hidden="true" />
      <div className="floating-shape" aria-hidden="true" />
      <div className="floating-shape" aria-hidden="true" />
      <div className="floating-shape" aria-hidden="true" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Avatar */}
        <div className="mb-8 fade-in">
          <div className="relative inline-block">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-[3px] bg-gradient-to-br from-primary via-accent to-primary animate-spin-slow">
              <img
                src="/Avatar_01.jpg"
                alt="Khoa Nguyen Dang"
                className="w-full h-full rounded-full object-cover border-4 border-bg"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full border-4 border-bg flex items-center justify-center">
              <span className="text-white text-xs">&#10003;</span>
            </div>
          </div>
        </div>

        <p className="text-primary font-medium text-sm sm:text-base mb-4 tracking-wider uppercase fade-in" style={{ animationDelay: '0.1s' }}>
          {t('hero.greeting')}
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 fade-in" style={{ animationDelay: '0.2s' }}>
          <span className="gradient-text">{t('hero.name')}</span>
        </h1>

        <h2
          className="text-lg sm:text-xl md:text-2xl text-text-muted font-medium mb-4 fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          {t('hero.title')}
        </h2>

        <p
          className="text-text-dim text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in" style={{ animationDelay: '0.5s' }}>
          <a
            href="#experience"
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 pulse-glow"
          >
            {t('hero.cta.work')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-border hover:border-primary/50 text-text font-medium rounded-xl hover:bg-surface/50 transition-all duration-300"
          >
            <Mail className="w-4 h-4" />
            {t('hero.cta.contact')}
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 fade-in" style={{ animationDelay: '0.8s' }} aria-hidden="true">
        <div className="w-6 h-10 rounded-full border-2 border-text-dim flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 bg-text-dim rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
