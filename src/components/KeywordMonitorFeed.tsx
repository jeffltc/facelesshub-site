'use client';

import { useState, useEffect, useMemo } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';

interface FeedVideo {
  video_id: string;
  keyword: string;
  title: string;
  channel_title: string;
  thumbnail_url: string;
  view_count: number;
  sub_count: number;
  ratio: number;
  duration_s: number;
  published_at: string;
  sent_at: string;
  config_label: string | null;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function VideoCard({ v }: { v: FeedVideo }) {
  const url = `https://www.youtube.com/shorts/${v.video_id}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-background overflow-hidden">
        <img
          src={v.thumbnail_url}
          alt={v.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {v.duration_s}s
        </span>
        {/* Ratio badge */}
        <span className="absolute top-2 left-2 bg-green-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {v.ratio >= 100 ? `${Math.round(v.ratio)}x` : `${v.ratio.toFixed(1)}x`}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Keyword tag */}
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full w-fit">
          {v.keyword}
        </span>

        {/* Title */}
        <p className="text-sm font-medium text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {v.title}
        </p>

        {/* Channel */}
        <p className="text-xs text-text-secondary truncate">{v.channel_title}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-auto pt-1.5 text-xs text-text-secondary">
          <span className="text-green-400 font-semibold">{fmt(v.view_count)} views</span>
          <span>{fmt(v.sub_count)} subs</span>
          <span className="ml-auto">{v.published_at}</span>
        </div>
      </div>
    </a>
  );
}

export function KeywordMonitorFeed() {
  const { status } = useSession();
  const [videos, setVideos] = useState<FeedVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('all');
  const [sort, setSort] = useState<'date' | 'ratio'>('date');

  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    fetch('/api/monitor/feed')
      .then((r) => r.json())
      .then((data) => setVideos(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load feed'))
      .finally(() => setLoading(false));
  }, [status]);

  const keywords = useMemo(
    () => ['all', ...new Set(videos.map((v) => v.keyword))],
    [videos]
  );

  const filtered = useMemo(() => {
    const base = keyword === 'all' ? videos : videos.filter((v) => v.keyword === keyword);
    return [...base].sort((a, b) =>
      sort === 'ratio'
        ? b.ratio - a.ratio
        : new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
    );
  }, [videos, keyword, sort]);

  // ── Not logged in ──────────────────────────────────────
  if (status === 'unauthenticated') {
    return (
      <div className="bg-surface border border-border rounded-2xl p-10 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Sign in to View Your Feed</h2>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          Your personal feed of discovered viral Shorts — sign in to access it.
        </p>
        <button
          onClick={() => signIn('google')}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg px-6 py-3 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (status === 'loading' || loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-video bg-border" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-border rounded w-16" />
              <div className="h-4 bg-border rounded w-full" />
              <div className="h-3 bg-border rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Keyword filter */}
        <div className="flex gap-2 flex-wrap">
          {keywords.map((kw) => (
            <button
              key={kw}
              onClick={() => setKeyword(kw)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                keyword === kw
                  ? 'bg-primary border-primary text-white'
                  : 'border-border text-text-secondary hover:border-primary/50 hover:text-text-primary'
              }`}
            >
              {kw === 'all' ? 'All keywords' : kw}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto flex gap-2">
          {(['date', 'ratio'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                sort === s
                  ? 'bg-surface border-primary text-primary'
                  : 'border-border text-text-secondary hover:border-primary/50'
              }`}
            >
              {s === 'date' ? 'Newest' : 'Highest ratio'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {videos.length > 0 && (
        <p className="text-xs text-text-secondary">
          {filtered.length} video{filtered.length !== 1 ? 's' : ''}
          {keyword !== 'all' && ` for "${keyword}"`}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-text-secondary text-sm">
            {videos.length === 0
              ? 'No videos yet. Your feed will populate after the first daily scan (9:00 AM UTC+8).'
              : `No videos for "${keyword}".`}
          </p>
          <Link
            href="/tools/keyword-monitor"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Manage monitors →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <VideoCard key={`${v.keyword}:${v.video_id}`} v={v} />
          ))}
        </div>
      )}
    </div>
  );
}
