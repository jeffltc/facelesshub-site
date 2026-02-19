import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { tools } from '@/lib/data';

const SITE_URL = 'https://facelesschannel.net';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('tools');
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${SITE_URL}/${locale}/tools`,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/tools`,
      languages: {
        en: `${SITE_URL}/en/tools`,
        zh: `${SITE_URL}/zh/tools`,
        ja: `${SITE_URL}/ja/tools`,
        ko: `${SITE_URL}/ko/tools`,
        de: `${SITE_URL}/de/tools`,
      },
    },
  };
}

export default function ToolsPage() {
  const t = useTranslations('tools');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const isActive = tool.status === 'active';
          const cardClass =
            'group p-6 bg-surface border border-border rounded-xl transition-colors' +
            (isActive ? ' hover:border-primary cursor-pointer' : ' opacity-70 cursor-not-allowed');

          const inner = (
            <div className="flex items-start gap-4">
              <div className="text-4xl">{tool.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {tool.title}
                  </h2>
                  {tool.status === 'coming_soon' && (
                    <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                      {t('coming_soon')}
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  {tool.description}
                </p>
                <span className="text-xs text-text-secondary bg-surface-hover px-2 py-1 rounded">
                  {tool.category}
                </span>
              </div>
            </div>
          );

          return isActive ? (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className={cardClass}
            >
              {inner}
            </Link>
          ) : (
            <div key={tool.slug} className={cardClass}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
