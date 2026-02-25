'use client';

import { useState, useEffect, useMemo } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';
import type { FeedItem } from '@/app/api/feed/route';

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function SourceBadge({ type }: { type: 'keyword' | 'competitor' }) {
  if (type === 'keyword') {
    return (
      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
        Keyword
      </span>
    );
  }
  return (
    <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">
      Competitor
    </span>
  );
}

function VideoCard({ v }: { v: FeedItem }) {
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
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {v.duration_s}s
        </span>
        <span className="absolute top-2 left-2 bg-green-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {v.ratio >= 100 ? `${Math.round(v.ratio)}x` : `${v.ratio.toFixed(1)}x`}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Source badge + label */}
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge type={v.source_type} />
          <span className="text-xs text-text-secondary truncate">{v.source_label}</span>
        </div>

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
          <span className="ml-auto">{new Date(v.published_at).toLocaleDateString()}</span>
        </div>
      </div>
    </a>
  );
}

function CompetitorUpsell() {
  return (
    <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-8 text-center">
      <div className="text-3xl mb-3">📊</div>
      <h3 className="font-semibold text-text-primary mb-2">Track Competitor Channels</h3>
      <p className="text-text-secondary text-sm mb-4 max-w-sm mx-auto">
        Upgrade to Pro to monitor competitor channels and see their viral Shorts alongside your keyword discoveries.
      </p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-1 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg px-5 py-2 text-sm transition-colors"
      >
        Upgrade to Pro →
      </Link>
    </div>
  );
}

type TabType = 'all' | 'keyword' | 'competitor';

export function UnifiedFeed() {
  const { status } = useSession();
  const [items, setItems]   = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [tab, setTab]       = useState<TabType>('all');
  const [sort, setSort]     = useState<'date' | 'ratio'>('date');
  const [competitorLocked, setCompetitorLocked] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    fetch('/api/feed')
      .then(r => r.json())
      .then(data => {
        setItems(Array.isArray(data.items) ? data.items : []);
        setCompetitorLocked(data.competitorLocked ?? false);
      })
      .catch(() => setError('Failed to load feed'))
      .finally(() => setLoading(false));
  }, [status]);

  const filtered = useMemo(() => {
    let base = items;
    if (tab === 'keyword') base = items.filter(v => v.source_type === 'keyword');
    if (tab === 'competitor') base = items.filter(v => v.source_type === 'competitor');
    return [...base].sort((a, b) =>
      sort === 'ratio'
        ? b.ratio - a.ratio
        : new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
    );
  }, [items, tab, sort]);

  const keywordCount    = items.filter(v => v.source_type === 'keyword').length;
  const competitorCount = items.filter(v => v.source_type === 'competitor').length;

  // ── Not logged in ──────────────────────────────────────
  if (status === 'unauthenticated') {
    return (
      <div className="bg-surface border border-border rounded-2xl p-10 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Sign in to View Your Feed</h2>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          Your personal discovery feed — all viral Shorts from your monitors in one place.
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
              <div className="h-3 bg-border rounded w-20" />
              <div className="h-4 bg-border rounded w-full" />
              <div className="h-3 bg-border rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Source tabs */}
        <div className="flex gap-2 flex-wrap">
          {(
            [
              { id: 'all' as const, label: `All (${items.length})` },
              { id: 'keyword' as const, label: `Keyword (${keywordCount})` },
              { id: 'competitor' as const, label: `Competitor (${competitorCount})` },
            ] satisfies { id: TabType; label: string }[]
          ).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                tab === t.id
                  ? 'bg-primary border-primary text-white'
                  : 'border-border text-text-secondary hover:border-primary/50 hover:text-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto flex gap-2">
          {(['date', 'ratio'] as const).map(s => (
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
      {items.length > 0 && (
        <p className="text-xs text-text-secondary">
          {filtered.length} video{filtered.length !== 1 ? 's' : ''}
          {tab !== 'all' && ` in ${tab} tab`}
        </p>
      )}

      {/* Competitor upsell if locked and on competitor tab */}
      {tab === 'competitor' && competitorLocked && <CompetitorUpsell />}

      {/* Grid */}
      {tab === 'competitor' && competitorLocked ? null : filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-text-secondary text-sm">
            {items.length === 0
              ? 'No videos yet. Your feed will populate after the first daily scan (9:00 AM UTC+8).'
              : `No videos in the ${tab} tab.`}
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/tools/keyword-monitor" className="text-sm text-primary hover:underline">
              Keyword monitors →
            </Link>
            <Link href="/tools/competitor-monitor" className="text-sm text-primary hover:underline">
              Competitor monitors →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(v => (
            <VideoCard key={`${v.source_type}:${v.source_label}:${v.video_id}`} v={v} />
          ))}
        </div>
      )}

      {/* Competitor upsell below grid when on "all" tab */}
      {tab === 'all' && competitorLocked && <CompetitorUpsell />}
    </div>
  );
}
