/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://facelesshub.com',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  alternateRefs: [
    {
      href: 'https://facelesshub.com/en',
      hreflang: 'en',
    },
    {
      href: 'https://facelesshub.com/zh',
      hreflang: 'zh',
    },
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [],
  },
};
