import { useTranslations, useLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getBlogPosts } from '@/lib/blog';

const SITE_URL = 'https://facelesschannel.net';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${SITE_URL}/${locale}/blog`,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog`,
      languages: {
        en: `${SITE_URL}/en/blog`,
        zh: `${SITE_URL}/zh/blog`,
      },
    },
  };
}

const CATEGORY_STYLES: Record<string, { gradient: string; icon: string }> = {
  Strategy:     { gradient: 'from-indigo-600/40 to-blue-800/30',   icon: '🎯' },
  Growth:       { gradient: 'from-emerald-600/40 to-teal-800/30',  icon: '📈' },
  Monetization: { gradient: 'from-amber-600/40 to-orange-800/30',  icon: '💰' },
  Tools:        { gradient: 'from-violet-600/40 to-purple-800/30', icon: '🛠️' },
};

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] ?? { gradient: 'from-slate-600/40 to-slate-800/30', icon: '📝' };
}

export default function BlogPage() {
  const t = useTranslations('blog');
  const st = useTranslations('sections');
  const locale = useLocale();
  const posts = getBlogPosts(locale);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const { gradient, icon } = getCategoryStyle(post.category);
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}` as '/blog'}
                className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-primary transition-colors"
              >
                {/* Cover */}
                <div
                  className={`h-48 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center relative overflow-hidden`}
                >
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                  <span className="text-5xl mb-2 relative z-10">{icon}</span>
                  <span className="text-xs font-semibold text-white/50 uppercase tracking-widest relative z-10">
                    {post.category}
                  </span>
                </div>

                {/* Meta */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Link
                      href={`/blog/category/${post.category.toLowerCase()}` as '/blog'}
                      className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded hover:bg-accent/20 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {post.category}
                    </Link>
                    <span className="text-xs text-text-secondary">
                      {t('read_time', { minutes: post.readTime })}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 text-xs text-text-secondary">
                    {post.date}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-text-secondary text-lg mb-4">
            No posts yet. Check back soon!
          </p>
          <Link
            href="/"
            className="text-primary hover:text-primary-hover transition-colors"
          >
            &larr; {st('view_all')}
          </Link>
        </div>
      )}

      {/* JSON-LD ItemList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'FacelessHub Blog',
            description: 'Actionable guides for faceless content creators',
            url: `${SITE_URL}/${locale}/blog`,
            blogPost: posts.slice(0, 10).map((p) => ({
              '@type': 'BlogPosting',
              headline: p.title,
              description: p.excerpt,
              datePublished: p.date,
              url: `${SITE_URL}/${locale}/blog/${p.slug}`,
              keywords: p.tags.join(', '),
            })),
          }),
        }}
      />
    </div>
  );
}
