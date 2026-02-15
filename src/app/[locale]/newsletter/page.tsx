import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { NewsletterForm } from '@/components/NewsletterForm';

export async function generateMetadata() {
  const t = await getTranslations('newsletter_page');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function NewsletterPage() {
  const t = useTranslations('newsletter_page');
  const nt = useTranslations('newsletter');

  const benefits = [
    t('benefit_1'),
    t('benefit_2'),
    t('benefit_3'),
    t('benefit_4'),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Benefits */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            What you&apos;ll get:
          </h2>
          <ul className="space-y-4">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-success shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-text-secondary">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div className="bg-surface border border-border rounded-xl p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            {nt('title')}
          </h2>
          <NewsletterForm />
          <p className="text-xs text-text-secondary mt-4">{nt('privacy')}</p>
        </div>
      </div>
    </div>
  );
}
