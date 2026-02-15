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
}

export function getBlogPosts(locale: string): BlogPost[] {
  const dir = path.join(contentDirectory, locale);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '');
    const filePath = path.join(dir, filename);
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
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getBlogPost(
  locale: string,
  slug: string
): BlogPost | undefined {
  const filePath = path.join(contentDirectory, locale, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return undefined;

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

export function getAllBlogSlugs(locale: string): string[] {
  const dir = path.join(contentDirectory, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}
