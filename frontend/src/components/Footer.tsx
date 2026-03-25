import { Link } from 'react-router-dom';
import { Github, Linkedin, Heart } from 'lucide-react';
import { useTranslation } from '@/i18n';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/30 bg-bg-alt" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-lg">
                KD
              </div>
              <span className="font-semibold text-text">Khoa Dang</span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-text mb-4">{t('footer.quicklinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-text-muted hover:text-primary text-sm transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-text-muted hover:text-primary text-sm transition-colors">
                  {t('nav.blog')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-text-muted hover:text-primary text-sm transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-text mb-4">{t('contact.info.social')}</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com/khoa-nguyendang"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-text-muted" />
              </a>
              <a
                href="https://linkedin.com/in/khoa-nguyendang"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-text-muted" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-dim text-sm">
            &copy; {year} Khoa Nguyen Dang. {t('footer.rights')}
          </p>
          <p className="text-text-dim text-xs flex items-center gap-1">
            {t('footer.built')}
            <Heart className="w-3 h-3 text-error inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
