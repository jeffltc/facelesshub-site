/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://facelesschannel.net',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/api/*', '/*/api/*'],
  alternateRefs: [
    { href: 'https://facelesschannel.net/en', hreflang: 'en' },
    { href: 'https://facelesschannel.net/zh', hreflang: 'zh' },
    { href: 'https://facelesschannel.net/ja', hreflang: 'ja' },
    { href: 'https://facelesschannel.net/ko', hreflang: 'ko' },
    { href: 'https://facelesschannel.net/de', hreflang: 'de' },
  ],
  transform: async (config, path) => {
    // Give blog posts higher priority and more frequent crawl
    if (path.includes('/blog/') && !path.endsWith('/blog')) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.85,
        lastmod: new Date().toISOString(),
        alternateRefs: config.alternateRefs ?? [],
      };
    }
    // Blog index and tool pages
    if (path.endsWith('/blog') || path.includes('/tools') || path.includes('/directory')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
        alternateRefs: config.alternateRefs ?? [],
      };
    }
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
  },
};
