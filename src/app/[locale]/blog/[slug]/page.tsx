import { notFound } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getBlogPost, getBlogPosts, getAllBlogSlugs } from '@/lib/blog';
import { MDXContent } from '@/components/MDXContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);
  if (!post) return {};

  const t = await getTranslations('blog');
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
    alternates: {
      canonical: `https://facelesshub.com/${locale}/blog/${slug}`,
      languages: {
        en: `/en/blog/${slug}`,
        zh: `/zh/blog/${slug}`,
      },
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);
  if (!post) notFound();

  const t = useTranslations('blog');
  const allPosts = getBlogPosts(locale);
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Back link */}
      <Link
        href="/blog"
        className="text-sm text-text-secondary hover:text-primary transition-colors mb-8 inline-block"
      >
        &larr; {t('back')}
      </Link>

      {/* Article header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded">
            {post.category}
          </span>
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
            {relatedPosts.map((rp) => (
              <Link
                key={rp.slug}
                href={`/blog/${rp.slug}` as '/blog'}
                className="group block p-4 bg-surface border border-border rounded-xl hover:border-primary transition-colors"
              >
                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                  {rp.title}
                </h3>
                <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                  {rp.excerpt}
                </p>
              </Link>
            ))}
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
            author: {
              '@type': 'Organization',
              name: 'FacelessHub',
            },
            publisher: {
              '@type': 'Organization',
              name: 'FacelessHub',
            },
          }),
        }}
      />
    </article>
  );
}
