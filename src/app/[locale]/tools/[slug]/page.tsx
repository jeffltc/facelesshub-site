import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { tools, getToolBySlug } from '@/lib/data';

const SITE_URL = 'https://facelesschannel.net';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const title = `${tool.title} — Free Tool for Faceless Creators`;
  const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(tool.title)}&category=${encodeURIComponent(tool.category)}`;

  return {
    title,
    description: tool.description,
    openGraph: {
      title,
      description: tool.description,
      type: 'website',
      url: `${SITE_URL}/${locale}/tools/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: tool.description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/tools/${slug}`,
      languages: {
        en: `${SITE_URL}/en/tools/${slug}`,
        zh: `${SITE_URL}/zh/tools/${slug}`,
        ja: `${SITE_URL}/ja/tools/${slug}`,
        ko: `${SITE_URL}/ko/tools/${slug}`,
        de: `${SITE_URL}/de/tools/${slug}`,
      },
    },
  };
}

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const t = await getTranslations('tools');

  // Coming-soon-specific feature previews
  const comingSoonFeatures: Record<string, { icon: string; text: string }[]> = {
    'thumbnail-analyzer': [
      { icon: '🎯', text: 'CTR score based on composition, contrast, and text placement' },
      { icon: '📱', text: 'Mobile preview — see how your thumbnail looks at 100×56px' },
      { icon: '🔥', text: 'Heat map showing where viewers\' eyes land first' },
      { icon: '✏️', text: 'Specific improvement suggestions with before/after examples' },
      { icon: '📊', text: 'Benchmark against top-performing thumbnails in your niche' },
    ],
    'script-generator': [
      { icon: '🪝', text: 'AI-generated hooks tuned for your niche and target audience' },
      { icon: '📐', text: 'Structured scripts with intro, main body, and CTA sections' },
      { icon: '🎙️', text: 'Adjustable tone: educational, conversational, or authoritative' },
      { icon: '🔑', text: 'Keyword integration for SEO-friendly spoken content' },
      { icon: '⚡', text: 'Full 10-minute script draft in under 30 seconds' },
    ],
    'niche-finder': [
      { icon: '📈', text: 'CPM data for 100+ niches so you can optimize for ad revenue' },
      { icon: '🔍', text: 'Competition score — how hard it is to rank in each niche' },
      { icon: '🚀', text: 'Trending niches flagged before they reach peak saturation' },
      { icon: '🎯', text: 'Sub-niche suggestions for narrow, high-converting audiences' },
      { icon: '💡', text: 'Content gap analysis: topics competitors haven\'t covered yet' },
    ],
    'title-optimizer': [
      { icon: '🔡', text: 'A/B title variants generated from a single idea — pick the best' },
      { icon: '📊', text: 'Predicted CTR score based on title structure and keyword strength' },
      { icon: '🔎', text: 'SEO keyword density check with suggested improvements' },
      { icon: '📏', text: 'Character count and truncation preview for mobile and desktop' },
      { icon: '✨', text: 'Emotional trigger analysis — curiosity, urgency, specificity' },
    ],
  };

  const features = comingSoonFeatures[slug] ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/tools"
        className="text-sm text-text-secondary hover:text-primary transition-colors mb-8 inline-block"
      >
        &larr; Back to Tools
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{tool.icon}</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-text-secondary bg-surface-hover px-2 py-1 rounded">
                {tool.category}
              </span>
              <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                {t('coming_soon')}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-text-primary">{tool.title}</h1>
          </div>
        </div>
        <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
          {tool.description}
        </p>
      </div>

      {/* Coming soon CTA */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 rounded-2xl p-8 text-center mb-16">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-xl font-bold text-text-primary mb-2">This Tool Is Coming Soon</h2>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          We're building {tool.title} right now. Subscribe to get notified the moment it launches — plus early access.
        </p>
        <Link
          href="/newsletter"
          className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-medium rounded-lg px-6 py-3 transition-colors"
        >
          Notify Me on Launch →
        </Link>
      </div>

      {/* Feature preview */}
      {features.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-2">What to Expect</h2>
          <p className="text-text-secondary mb-6">Here's what {tool.title} will do when it launches:</p>
          <div className="space-y-3">
            {features.map((f) => (
              <div key={f.text} className="flex items-start gap-4 bg-surface border border-border rounded-xl p-4">
                <span className="text-xl shrink-0">{f.icon}</span>
                <p className="text-sm text-text-secondary leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related active tools */}
      <section className="pt-10 border-t border-border">
        <h2 className="text-xl font-bold text-text-primary mb-6">Available Tools You Can Use Now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools
            .filter((t) => t.status === 'active')
            .map((at) => (
              <Link
                key={at.slug}
                href={`/tools/${at.slug}` as '/tools'}
                className="group flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:border-primary transition-colors"
              >
                <span className="text-3xl">{at.icon}</span>
                <div>
                  <p className="font-semibold text-text-primary group-hover:text-primary transition-colors text-sm">
                    {at.title}
                  </p>
                  <p className="text-xs text-text-secondary line-clamp-1">{at.description}</p>
                </div>
              </Link>
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
            name: tool.title,
            description: tool.description,
            applicationCategory: 'WebApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/PreOrder',
            },
          }),
        }}
      />
    </div>
  );
}
