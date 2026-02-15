'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const localeNames: Record<string, string> = {
  en: 'EN',
  zh: '中文',
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const nextLocale = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;

  function handleSwitch() {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <button
      onClick={handleSwitch}
      className="px-3 py-1.5 text-xs font-medium text-text-secondary border border-border rounded-lg hover:border-primary hover:text-primary transition-colors"
      aria-label={`Switch to ${localeNames[nextLocale]}`}
    >
      {localeNames[nextLocale]}
    </button>
  );
}
