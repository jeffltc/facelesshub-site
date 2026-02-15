import { useTranslations, useLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getBlogPosts } from '@/lib/blog';

export async function generateMetadata() {
  const t = await getTranslations('blog');
  return {
    title: t('title'),
    description: t('description'),
  };
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
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}` as '/blog'}
              className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-primary transition-colors"
            >
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-4xl opacity-50">📝</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded">
                    {post.category}
                  </span>
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
                <div className="mt-4 text-sm text-text-secondary">
                  {post.date}
                </div>
              </div>
            </Link>
          ))}
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
    </div>
  );
}
