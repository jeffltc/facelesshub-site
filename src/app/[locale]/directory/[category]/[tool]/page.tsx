import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  directoryCategories,
  directoryTools,
  getCategory,
  getDirectoryTool,
} from '@/lib/data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}) {
  const { category, tool: toolSlug } = await params;
  const tool = getDirectoryTool(category, toolSlug);
  if (!tool) return {};

  return {
    title: `${tool.name} Review - Best for Faceless YouTube`,
    description: tool.description,
  };
}

export function generateStaticParams() {
  return directoryTools.map((t) => ({
    category: t.category,
    tool: t.slug,
  }));
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}) {
  const { category, tool: toolSlug } = await params;
  const tool = getDirectoryTool(category, toolSlug);
  const cat = getCategory(category);
  if (!tool || !cat) notFound();

  const t = useTranslations('directory');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
        <Link href="/directory" className="hover:text-primary transition-colors">
          {t('title')}
        </Link>
        <span>/</span>
        <Link
          href={`/directory/${category}` as '/directory'}
          className="hover:text-primary transition-colors"
        >
          {cat.title}
        </Link>
        <span>/</span>
        <span className="text-text-primary">{tool.name}</span>
      </nav>

      <div className="bg-surface border border-border rounded-xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              {tool.name}
            </h1>
            <p className="text-text-secondary leading-relaxed">
              {tool.description}
            </p>
          </div>
          <span
            className={`text-sm font-medium px-3 py-1 rounded shrink-0 ${
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

        {/* Rating */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(tool.rating)
                    ? 'text-yellow-400'
                    : 'text-border'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-text-secondary text-sm">{tool.rating}/5</span>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            Key Features
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {tool.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-success shrink-0"
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
                <span className="text-sm text-text-secondary">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-primary hover:bg-primary-hover text-white font-medium rounded-lg px-6 py-3 transition-colors"
        >
          {t('visit')}
          <svg
            className="ml-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      {/* Affiliate disclosure */}
      <p className="mt-6 text-xs text-text-secondary">
        Disclosure: Some links on this page may be affiliate links. We may earn
        a commission at no extra cost to you if you make a purchase through these
        links. We only recommend tools we genuinely believe in.
      </p>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: tool.name,
            description: tool.description,
            url: tool.url,
            applicationCategory: 'WebApplication',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: tool.rating,
              bestRating: 5,
              ratingCount: 1,
            },
          }),
        }}
      />
    </div>
  );
}
