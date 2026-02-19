import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/blog';

const SITE_URL = 'https://facelesschannel.net';
const SITE_NAME = 'FacelessHub';
const SITE_DESC = 'Actionable guides, tutorials, and strategies for faceless content creators.';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') ?? 'en';

  const posts = getBlogPosts(locale);

  const items = posts
    .slice(0, 20)
    .map((post) => {
      const postUrl = `${SITE_URL}/${locale}/blog/${post.slug}`;
      const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`;
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category><![CDATA[${post.category}]]></category>
      ${post.tags.map((tag) => `<tag><![CDATA[${tag}]]></tag>`).join('\n      ')}
      <enclosure url="${ogImage}" type="image/png" length="0" />
      <media:content url="${ogImage}" medium="image" />
    </item>`.trim();
    })
    .join('\n  ');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
>
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESC}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
    </image>
  ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
