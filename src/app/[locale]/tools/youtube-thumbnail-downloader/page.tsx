import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { YouTubeThumbnailDownloader } from '@/components/YouTubeThumbnailDownloader';

export async function generateMetadata() {
  const t = await getTranslations('yt_thumbnail');
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

export default function YouTubeThumbnailDownloaderPage() {
  const t = useTranslations('yt_thumbnail');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/tools"
        className="text-sm text-text-secondary hover:text-primary transition-colors mb-8 inline-block"
      >
        &larr; Back to Tools
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🖼️</span>
          <h1 className="text-3xl font-bold text-text-primary">
            {t('title')}
          </h1>
        </div>
        <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
          {t('subtitle')}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full">
            {t('badge_free')}
          </span>
          <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">
            {t('badge_resolutions')}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
            {t('badge_no_login')}
          </span>
        </div>
      </div>

      <YouTubeThumbnailDownloader />

      {/* Tips section */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {t('tips_title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['tip_1', 'tip_2', 'tip_3'] as const).map((key) => (
            <div
              key={key}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <p className="text-sm text-text-secondary leading-relaxed">
                {t(key)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'YouTube Thumbnail Downloader',
            description:
              'Download YouTube video thumbnails in all available resolutions — HD, SD, HQ, MQ, and default',
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
