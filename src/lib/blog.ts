import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content', 'blog');

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: number;
  category: string;
  coverImage?: string;
  tags: string[];
  content: string;
  /** True when this post is being served in fallback locale (en shown to zh user) */
  isFallback?: boolean;
}

function parsePost(filePath: string, slug: string): BlogPost {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  return {
    slug,
    title: data.title ?? slug,
    excerpt: data.excerpt ?? '',
    date: data.date ?? '',
    readTime: data.readTime ?? Math.ceil(content.split(/\s+/).length / 200),
    category: data.category ?? 'General',
    coverImage: data.coverImage,
    tags: data.tags ?? [],
    content,
  };
}

/**
 * Returns all posts for the given locale.
 * If locale !== 'en', any slugs present in 'en' but missing in locale
 * are included as fallback (English) posts so the list is always complete.
 */
export function getBlogPosts(locale: string): BlogPost[] {
  const localeDir = path.join(contentDirectory, locale);
  const enDir = path.join(contentDirectory, 'en');

  const localeSlugs = new Set(
    fs.existsSync(localeDir)
      ? fs.readdirSync(localeDir).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''))
      : []
  );

  // Always include en slugs as the canonical set
  const enSlugs = fs.existsSync(enDir)
    ? fs.readdirSync(enDir).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''))
    : [];

  const posts: BlogPost[] = [];

  for (const slug of enSlugs) {
    if (localeSlugs.has(slug)) {
      // Prefer locale-specific file
      const post = parsePost(path.join(localeDir, `${slug}.mdx`), slug);
      posts.push(post);
    } else if (locale !== 'en') {
      // Fall back to en version
      const post = parsePost(path.join(enDir, `${slug}.mdx`), slug);
      posts.push({ ...post, isFallback: true });
    }
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Returns a single post. Falls back to 'en' if the locale version doesn't exist.
 */
export function getBlogPost(
  locale: string,
  slug: string
): BlogPost | undefined {
  const localePath = path.join(contentDirectory, locale, `${slug}.mdx`);
  if (fs.existsSync(localePath)) {
    return parsePost(localePath, slug);
  }
  // Fallback to English
  if (locale !== 'en') {
    const enPath = path.join(contentDirectory, 'en', `${slug}.mdx`);
    if (fs.existsSync(enPath)) {
      return { ...parsePost(enPath, slug), isFallback: true };
    }
  }
  return undefined;
}

/**
 * Returns all slugs for a locale, including en-only slugs (for generateStaticParams).
 */
export function getAllBlogSlugs(locale: string): string[] {
  const localeDir = path.join(contentDirectory, locale);
  const enDir = path.join(contentDirectory, 'en');

  const slugSet = new Set<string>();

  if (fs.existsSync(localeDir)) {
    fs.readdirSync(localeDir).filter((f) => f.endsWith('.mdx')).forEach((f) => slugSet.add(f.replace(/\.mdx$/, '')));
  }
  // Always include en slugs so zh routes are generated for en-only posts
  if (fs.existsSync(enDir)) {
    fs.readdirSync(enDir).filter((f) => f.endsWith('.mdx')).forEach((f) => slugSet.add(f.replace(/\.mdx$/, '')));
  }

  return Array.from(slugSet);
}
