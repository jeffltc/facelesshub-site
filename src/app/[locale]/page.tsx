import { useTranslations, useLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { NewsletterForm } from '@/components/NewsletterForm';
import { getBlogPosts } from '@/lib/blog';

const SITE_URL = 'https://facelesschannel.net';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(t('title'))}&category=Strategy`;

  return {
    title: 'FacelessHub — Tools & Guides for Faceless YouTube Creators',
    description: t('subtitle'),
    openGraph: {
      title: 'FacelessHub — Build a Faceless Channel That Makes Money',
      description: t('subtitle'),
      url: `${SITE_URL}/${locale}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'FacelessHub',
      description: t('subtitle'),
      images: [ogImage],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        zh: `${SITE_URL}/zh`,
        ja: `${SITE_URL}/ja`,
        ko: `${SITE_URL}/ko`,
        de: `${SITE_URL}/de`,
      },
    },
  };
}

const featuredTools = [
  {
    slug: 'td-generator',
    icon: '✍️',
    titleEn: 'YouTube TD Generator',
    titleZh: 'YouTube TD 生成器',
    descEn: 'Generate SEO-optimized titles & descriptions with AI. Upload thumbnails for visual context.',
    descZh: '使用 AI 生成 SEO 优化的标题和描述，支持上传缩略图辅助生成。',
  },
  {
    slug: 'youtube-translator',
    icon: '🌐',
    titleEn: 'YouTube TD Translator',
    titleZh: 'YouTube TD 翻译器',
    descEn: 'Translate your YouTube titles & descriptions to 4+ languages with AI. One-click write-back.',
    descZh: '使用 AI 将 YouTube 标题和描述翻译为 4+ 种语言，一键写回 YouTube。',
  },
  {
    slug: 'thumbnail-analyzer',
    icon: '🎨',
    titleEn: 'Thumbnail Analyzer',
    titleZh: '缩略图分析器',
    descEn: 'AI-powered analysis of your YouTube thumbnails with actionable improvement suggestions.',
    descZh: '基于 AI 的 YouTube 缩略图分析，提供可操作的改进建议。',
  },
  {
    slug: 'niche-finder',
    icon: '🔍',
    titleEn: 'Niche Finder',
    titleZh: '细分领域查找器',
    descEn: 'Discover profitable faceless YouTube niches with low competition and high demand.',
    descZh: '发现低竞争、高需求的无脸 YouTube 盈利细分领域。',
  },
];

const CATEGORY_STYLES: Record<string, { gradient: string; icon: string }> = {
  Strategy:     { gradient: 'from-indigo-600/40 to-blue-800/30',   icon: '🎯' },
  Growth:       { gradient: 'from-emerald-600/40 to-teal-800/30',  icon: '📈' },
  Monetization: { gradient: 'from-amber-600/40 to-orange-800/30',  icon: '💰' },
  Tools:        { gradient: 'from-violet-600/40 to-purple-800/30', icon: '🛠️' },
};

const directoryCategories = [
  { slug: 'ai-voiceover', titleEn: 'AI Voiceover', titleZh: 'AI 配音', count: 12, icon: '🎙️' },
  { slug: 'video-editing', titleEn: 'Video Editing', titleZh: '视频编辑', count: 15, icon: '🎬' },
  { slug: 'thumbnail-design', titleEn: 'Thumbnail Design', titleZh: '缩略图设计', count: 8, icon: '🖼️' },
  { slug: 'script-writing', titleEn: 'Script & Writing', titleZh: '脚本与写作', count: 10, icon: '✍️' },
  { slug: 'stock-footage', titleEn: 'Stock Footage', titleZh: '素材库', count: 9, icon: '📹' },
  { slug: 'music-sfx', titleEn: 'Music & SFX', titleZh: '音乐与音效', count: 7, icon: '🎵' },
];

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const latestPosts = getBlogPosts(locale).slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tools"
                className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-medium rounded-lg px-8 py-3.5 transition-colors"
              >
                {t('hero.cta_tools')}
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center border border-border hover:border-primary text-text-primary font-medium rounded-lg px-8 py-3.5 transition-colors"
              >
                {t('hero.cta_blog')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            {t('sections.featured_tools')}
          </h2>
          <p className="text-text-secondary">
            {t('sections.featured_tools_desc')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}` as '/tools'}
              className="group block p-6 bg-surface border border-border rounded-xl hover:border-primary transition-colors"
            >
              <div className="text-3xl mb-4">{tool.icon}</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                {tool.titleEn}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {tool.descEn}
              </p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/tools"
            className="text-primary hover:text-primary-hover transition-colors text-sm font-medium"
          >
            {t('sections.view_all')} &rarr;
          </Link>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="bg-surface/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-3">
              {t('sections.latest_posts')}
            </h2>
            <p className="text-text-secondary">
              {t('sections.latest_posts_desc')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPosts.map((post) => {
              const { gradient, icon } = CATEGORY_STYLES[post.category] ?? { gradient: 'from-slate-600/40 to-slate-800/30', icon: '📝' };
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}` as '/blog'}
                  className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-primary transition-colors"
                >
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
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {post.readTime} min read
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/blog"
              className="text-primary hover:text-primary-hover transition-colors text-sm font-medium"
            >
              {t('sections.view_all')} &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Directory Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            {t('sections.directory_title')}
          </h2>
          <p className="text-text-secondary">
            {t('sections.directory_desc')}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {directoryCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/directory/${cat.slug}` as '/directory'}
              className="group flex flex-col items-center p-6 bg-surface border border-border rounded-xl hover:border-primary transition-colors text-center"
            >
              <span className="text-3xl mb-3">{cat.icon}</span>
              <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                {cat.titleEn}
              </h3>
              <span className="text-xs text-text-secondary mt-1">
                {cat.count} tools
              </span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/directory"
            className="text-primary hover:text-primary-hover transition-colors text-sm font-medium"
          >
            {t('sections.view_all')} &rarr;
          </Link>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              {t('newsletter.title')}
            </h2>
            <p className="text-text-secondary mb-8">
              {t('newsletter.description')}
            </p>
            <div className="flex justify-center">
              <NewsletterForm />
            </div>
            <p className="text-xs text-text-secondary mt-4">
              {t('newsletter.privacy')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
