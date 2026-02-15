import { MDXRemote } from 'next-mdx-remote/rsc';

export function MDXContent({ source }: { source: string }) {
  return <MDXRemote source={source} />;
}
