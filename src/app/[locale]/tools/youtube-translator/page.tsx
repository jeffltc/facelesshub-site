import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SessionProvider } from '@/components/SessionProvider';
import { YouTubeTranslator } from '@/components/YouTubeTranslator';

export async function generateMetadata() {
  const t = await getTranslations('yt_translator');
  return {
    title: t('page_title'),
    description: t('page_desc'),
    openGraph: {
      title: t('page_title'),
      description: t('page_desc'),
      type: 'website',
    },
  };
}

export default function YouTubeTranslatorPage() {
  const t = useTranslations('yt_translator');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/tools"
        className="text-sm text-text-secondary hover:text-primary transition-colors mb-8 inline-block"
      >
        &larr; Back to Tools
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🌐</span>
          <h1 className="text-3xl font-bold text-text-primary">
            {t('title')}
          </h1>
        </div>
        <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
          {t('subtitle')}
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full">
            {t('badge_free')}
          </span>
          <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">
            {t('badge_languages')}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
            {t('badge_writeback')}
          </span>
        </div>
      </div>

      <SessionProvider>
        <YouTubeTranslator />
      </SessionProvider>

      {/* How it works */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {t('how_it_works')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', icon: '🔑', key: 'step_1' },
            { step: '2', icon: '🎯', key: 'step_2' },
            { step: '3', icon: '🚀', key: 'step_3' },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-surface border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-lg font-bold text-primary">
                  Step {item.step}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {t(item.key as 'step_1' | 'step_2' | 'step_3')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FTC Disclosure */}
      <p className="mt-10 text-xs text-text-secondary">
        {t('disclosure')}
      </p>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'YouTube TD Translator',
            description:
              'Translate YouTube video titles and descriptions to multiple languages using AI',
            applicationCategory: 'WebApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />
    </div>
  );
}
