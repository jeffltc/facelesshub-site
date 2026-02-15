/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://facelesschannel.net',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  alternateRefs: [
    {
      href: 'https://facelesschannel.net/en',
      hreflang: 'en',
    },
    {
      href: 'https://facelesschannel.net/zh',
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
