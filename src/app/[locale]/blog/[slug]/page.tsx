import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getBlogPost, getBlogPosts, getAllBlogSlugs } from '@/lib/blog';
import { MDXContent } from '@/components/MDXContent';

const SITE_URL = 'https://facelesschannel.net';

export async function generateStaticParams() {
  const locales = ['en', 'zh'];
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    const slugs = getAllBlogSlugs(locale);
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);
  if (!post) return {};

  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      url: `${SITE_URL}/${locale}/blog/${slug}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog/${slug}`,
      languages: {
        en: `${SITE_URL}/en/blog/${slug}`,
        zh: `${SITE_URL}/zh/blog/${slug}`,
      },
    },
  };
}

function getCategoryStyle(category: string): {
  gradient: string;
  icon: string;
} {
  const map: Record<string, { gradient: string; icon: string }> = {
    Strategy:    { gradient: 'from-indigo-600/40 to-blue-700/30',  icon: '🎯' },
    Growth:      { gradient: 'from-emerald-600/40 to-teal-700/30', icon: '📈' },
    Monetization:{ gradient: 'from-amber-600/40 to-orange-700/30', icon: '💰' },
    Tools:       { gradient: 'from-violet-600/40 to-purple-700/30',icon: '🛠️' },
  };
  return map[category] ?? { gradient: 'from-slate-600/40 to-slate-700/30', icon: '📝' };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);
  if (!post) notFound();

  const t = await getTranslations('blog');
  const allPosts = getBlogPosts(locale);
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  const { gradient, icon } = getCategoryStyle(post.category);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Back link */}
      <Link
        href="/blog"
        className="text-sm text-text-secondary hover:text-primary transition-colors mb-8 inline-block"
      >
        &larr; {t('back')}
      </Link>

      {/* Cover image */}
      <div
        className={`w-full h-64 sm:h-80 rounded-2xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center mb-10 relative overflow-hidden`}
      >
        {/* Decorative grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <span className="text-7xl mb-3 relative z-10">{icon}</span>
        <span className="text-xs font-semibold text-white/60 uppercase tracking-widest relative z-10">
          {post.category}
        </span>
      </div>

      {/* Article header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href={`/blog/category/${post.category.toLowerCase()}` as '/blog'}
            className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded hover:bg-accent/20 transition-colors"
          >
            {post.category}
          </Link>
          <span className="text-sm text-text-secondary">
            {t('read_time', { minutes: post.readTime })}
          </span>
          <span className="text-sm text-text-secondary">{post.date}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4 leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-text-secondary">{post.excerpt}</p>
      </header>

      {/* Article content */}
      <div className="prose prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-primary prose-strong:text-text-primary prose-code:text-accent">
        <MDXContent source={post.content} />
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-surface border border-border px-3 py-1 rounded-full text-text-secondary"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-border">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            {t('related')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((rp) => {
              const rpStyle = getCategoryStyle(rp.category);
              return (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}` as '/blog'}
                  className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-primary transition-colors"
                >
                  <div
                    className={`h-24 bg-gradient-to-br ${rpStyle.gradient} flex items-center justify-center`}
                  >
                    <span className="text-3xl">{rpStyle.icon}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                      {rp.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                      {rp.excerpt}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            image: `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`,
            url: `${SITE_URL}/${locale}/blog/${slug}`,
            author: {
              '@type': 'Organization',
              name: 'FacelessHub',
              url: SITE_URL,
            },
            publisher: {
              '@type': 'Organization',
              name: 'FacelessHub',
              url: SITE_URL,
              logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/logo.png`,
              },
            },
            keywords: post.tags.join(', '),
          }),
        }}
      />
    </article>
  );
}
