import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { directoryCategories } from '@/lib/data';

export async function generateMetadata() {
  const t = await getTranslations('directory');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function DirectoryPage() {
  const t = useTranslations('directory');
  const st = useTranslations('sections');

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {directoryCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/directory/${category.slug}` as '/directory'}
            className="group block p-6 bg-surface border border-border rounded-xl hover:border-primary transition-colors"
          >
            <div className="text-4xl mb-4">{category.icon}</div>
            <h2 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
              {category.title}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {category.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                {t('tools_count', { count: category.toolCount })}
              </span>
              <span className="text-primary text-sm font-medium">
                {st('explore_category')} &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* JSON-LD BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://facelesshub.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Directory',
                item: 'https://facelesshub.com/directory',
              },
            ],
          }),
        }}
      />
    </div>
  );
}
