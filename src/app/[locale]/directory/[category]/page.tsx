import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  directoryCategories,
  getCategory,
  getToolsByCategory,
} from '@/lib/data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return {};

  return {
    title: `Best ${cat.title} Tools for Faceless YouTube`,
    description: cat.description,
  };
}

export function generateStaticParams() {
  return directoryCategories.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const t = useTranslations('directory');
  const categoryTools = getToolsByCategory(category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/directory"
        className="text-sm text-text-secondary hover:text-primary transition-colors mb-8 inline-block"
      >
        &larr; {t('all_categories')}
      </Link>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{cat.icon}</span>
          <h1 className="text-3xl font-bold text-text-primary">{cat.title}</h1>
        </div>
        <p className="text-lg text-text-secondary">{cat.description}</p>
      </div>

      <div className="space-y-4">
        {categoryTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/directory/${category}/${tool.slug}` as '/directory'}
            className="group block p-6 bg-surface border border-border rounded-xl hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-text-primary group-hover:text-primary transition-colors mb-1">
                  {tool.name}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed mb-3">
                  {tool.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tool.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs bg-surface-hover text-text-secondary px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ml-6 text-right shrink-0">
                <div className="text-sm text-text-secondary mb-1">
                  {t('rating')}: {tool.rating}/5
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    tool.pricing === 'free'
                      ? 'text-success bg-success/10'
                      : tool.pricing === 'freemium'
                        ? 'text-accent bg-accent/10'
                        : 'text-secondary bg-secondary/10'
                  }`}
                >
                  {t(tool.pricing)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {categoryTools.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-secondary">
            No tools in this category yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
