import { useTranslation } from '@/i18n';

export function LoadingSpinner() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label={t('loading')}>
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" />
        <p className="text-text-muted text-sm">{t('loading')}</p>
      </div>
    </div>
  );
}
