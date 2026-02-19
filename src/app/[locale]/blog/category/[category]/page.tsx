import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getBlogPosts, getAllBlogSlugs } from '@/lib/blog';

const SITE_URL = 'https://facelesschannel.net';

const CATEGORY_META: Record<string, { label: string; description: string }> = {
  strategy:     { label: 'Strategy',     description: 'Channel strategy, niche selection, and growth tactics for faceless creators.' },
  growth:       { label: 'Growth',       description: 'Proven techniques for growing your faceless YouTube channel faster.' },
  monetization: { label: 'Monetization', description: 'Revenue strategies and monetization guides for faceless YouTube channels.' },
  tools:        { label: 'Tools',        description: 'Reviews and comparisons of AI tools for faceless content creators.' },
};

const CATEGORY_STYLES: Record<string, { gradient: string; icon: string }> = {
  Strategy:     { gradient: 'from-indigo-600/40 to-blue-800/30',   icon: '🎯' },
  Growth:       { gradient: 'from-emerald-600/40 to-teal-800/30',  icon: '📈' },
  Monetization: { gradient: 'from-amber-600/40 to-orange-800/30',  icon: '💰' },
  Tools:        { gradient: 'from-violet-600/40 to-purple-800/30', icon: '🛠️' },
};

export async function generateStaticParams() {
  const locales = ['en', 'zh', 'ja', 'ko', 'de'];
  const params: { locale: string; category: string }[] = [];
  for (const locale of locales) {
    for (const cat of Object.keys(CATEGORY_META)) {
      params.push({ locale, category: cat });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  const meta = CATEGORY_META[category.toLowerCase()];
  if (!meta) return {};

  return {
    title: `${meta.label} — FacelessHub Blog`,
    description: meta.description,
    openGraph: {
      title: `${meta.label} Articles — FacelessHub`,
      description: meta.description,
      url: `${SITE_URL}/${locale}/blog/category/${category}`,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog/category/${category}`,
      languages: {
        en: `${SITE_URL}/en/blog/category/${category}`,
        zh: `${SITE_URL}/zh/blog/category/${category}`,
        ja: `${SITE_URL}/ja/blog/category/${category}`,
        ko: `${SITE_URL}/ko/blog/category/${category}`,
        de: `${SITE_URL}/de/blog/category/${category}`,
      },
    },
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  const meta = CATEGORY_META[category.toLowerCase()];
  if (!meta) notFound();

  const t = await getTranslations('blog');
  const allPosts = getBlogPosts(locale);
  const posts = allPosts.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );

  const label = meta.label;
  const { gradient, icon } = CATEGORY_STYLES[label] ?? {
    gradient: 'from-slate-600/40 to-slate-800/30',
    icon: '📝',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8">
        <Link href="/blog" className="hover:text-primary transition-colors">
          {t('title')}
        </Link>
        <span>/</span>
        <span className="text-text-primary">{label}</span>
      </nav>

      {/* Category header */}
      <div className="flex items-center gap-4 mb-12">
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl`}
        >
          {icon}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{label}</h1>
          <p className="text-text-secondary mt-1">{meta.description}</p>
        </div>
      </div>

      {/* Posts grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}` as '/blog'}
              className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-primary transition-colors"
            >
              <div
                className={`h-40 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center relative overflow-hidden`}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
                <span className="text-4xl relative z-10">{icon}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-text-secondary">
                    {t('read_time', { minutes: post.readTime })}
                  </span>
                  <span className="text-xs text-text-secondary">·</span>
                  <span className="text-xs text-text-secondary">{post.date}</span>
                </div>
                <h2 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-text-secondary line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-text-secondary text-center py-20">
          No posts in this category yet.
        </p>
      )}

      {/* Back link */}
      <div className="mt-12 text-center">
        <Link
          href="/blog"
          className="text-primary hover:text-primary-hover transition-colors text-sm font-medium"
        >
          &larr; {t('back')}
        </Link>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${label} — FacelessHub Blog`,
            description: meta.description,
            url: `${SITE_URL}/${locale}/blog/category/${category}`,
            hasPart: posts.map((p) => ({
              '@type': 'BlogPosting',
              headline: p.title,
              url: `${SITE_URL}/${locale}/blog/${p.slug}`,
              datePublished: p.date,
            })),
          }),
        }}
      />
    </div>
  );
}
