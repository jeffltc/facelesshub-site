import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function generateMetadata() {
  const t = await getTranslations('about');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function AboutPage() {
  const t = useTranslations('about');
  const nt = useTranslations('newsletter');

  const offers = [
    { key: 'offer_tools', icon: '🛠️' },
    { key: 'offer_blog', icon: '📖' },
    { key: 'offer_directory', icon: '📂' },
    { key: 'offer_newsletter', icon: '📬' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          {t('mission_title')}
        </h2>
        <p className="text-text-secondary leading-relaxed text-lg">
          {t('mission')}
        </p>
      </section>

      {/* What we offer */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {t('what_we_offer')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.key}
              className="flex items-start gap-3 p-4 bg-surface border border-border rounded-xl"
            >
              <span className="text-2xl">{offer.icon}</span>
              <p className="text-text-secondary text-sm leading-relaxed">
                {t(offer.key)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-surface border border-border rounded-xl p-10">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          {nt('title')}
        </h2>
        <p className="text-text-secondary mb-6">{nt('description')}</p>
        <Link
          href="/newsletter"
          className="inline-flex items-center bg-primary hover:bg-primary-hover text-white font-medium rounded-lg px-8 py-3 transition-colors"
        >
          {nt('button')}
        </Link>
      </section>
    </div>
  );
}
