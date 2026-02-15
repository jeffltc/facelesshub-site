import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-text-primary mb-2">
        {t('not_found')}
      </h2>
      <p className="text-text-secondary mb-8 max-w-md">
        {t('not_found_desc')}
      </p>
      <Link
        href="/"
        className="bg-primary hover:bg-primary-hover text-white rounded-lg px-6 py-3 transition-colors"
      >
        {t('go_home')}
      </Link>
    </div>
  );
}
