import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { tools, getToolBySlug } from '@/lib/data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  return {
    title: `${tool.title} - Free Tool for Faceless Creators`,
    description: tool.description,
  };
}

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const t = useTranslations('tools');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/tools"
        className="text-sm text-text-secondary hover:text-primary transition-colors mb-8 inline-block"
      >
        &larr; Back to Tools
      </Link>

      <div className="bg-surface border border-border rounded-xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-5xl">{tool.icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              {tool.title}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-text-secondary bg-surface-hover px-2 py-1 rounded">
                {tool.category}
              </span>
              {tool.status === 'coming_soon' && (
                <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                  {t('coming_soon')}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-text-secondary leading-relaxed text-lg mb-8">
          {tool.description}
        </p>

        {tool.status === 'coming_soon' ? (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
            <p className="text-text-primary font-medium mb-2">
              This tool is under development
            </p>
            <p className="text-text-secondary text-sm">
              Subscribe to our newsletter to get notified when it launches.
            </p>
          </div>
        ) : (
          <div className="bg-background rounded-lg p-8 border border-border">
            {/* Tool UI will go here */}
            <p className="text-text-secondary text-center">
              Tool interface loading...
            </p>
          </div>
        )}
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: tool.title,
            description: tool.description,
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
