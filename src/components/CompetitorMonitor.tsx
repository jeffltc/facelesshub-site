'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';

interface CompetitorConfig {
  id: string;
  channel_id: string;
  channel_title: string;
  channel_url: string;
  ratio_min: number;
  notify_email: string;
  label: string | null;
  active: boolean;
  created_at: string;
}

interface ChannelPreview {
  channelId: string;
  channelTitle: string;
  subscriberCount: number;
  thumbnailUrl: string;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function CompetitorMonitor() {
  const { data: session, status } = useSession();

  const [configs, setConfigs]     = useState<CompetitorConfig[]>([]);
  const [plan, setPlan]           = useState<string>('free');
  const [maxMonitors, setMaxMonitors] = useState<number>(0);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // Resolve form state
  const [channelInput, setChannelInput] = useState('');
  const [resolving, setResolving]       = useState(false);
  const [resolveError, setResolveError] = useState('');
  const [preview, setPreview]           = useState<ChannelPreview | null>(null);

  // Monitor form state
  const [ratioMin, setRatioMin]       = useState(10);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [label, setLabel]             = useState('');

  useEffect(() => {
    if (session?.user?.email && !notifyEmail) {
      setNotifyEmail(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      fetch('/api/competitor/configs')
        .then(r => r.json())
        .then(data => {
          setConfigs(Array.isArray(data.configs) ? data.configs : []);
          if (data.plan) setPlan(data.plan);
          if (data.maxCompetitorMonitors !== undefined) setMaxMonitors(data.maxCompetitorMonitors);
        })
        .catch(() => setError('Failed to load competitor monitors'))
        .finally(() => setLoading(false));
    }
  }, [status]);

  async function handleResolve() {
    setResolveError('');
    setPreview(null);
    if (!channelInput.trim()) { setResolveError('Please enter a channel URL or @handle.'); return; }
    setResolving(true);
    try {
      const res = await fetch(`/api/competitor/resolve?url=${encodeURIComponent(channelInput.trim())}`);
      const data = await res.json();
      if (!res.ok) { setResolveError(data.error || 'Failed to resolve channel'); return; }
      setPreview(data);
    } catch {
      setResolveError('Network error. Please try again.');
    } finally {
      setResolving(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!preview) { setError('Please resolve a channel first.'); return; }
    if (!notifyEmail.trim()) { setError('Please enter a notification email.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/competitor/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId:    preview.channelId,
          channelTitle: preview.channelTitle,
          channelUrl:   channelInput.trim(),
          ratioMin,
          notifyEmail,
          label,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to add monitor'); return; }
      setConfigs(prev => [data, ...prev]);
      setChannelInput('');
      setPreview(null);
      setLabel('');
      setSuccess(`Competitor monitor for "${data.channel_title}" added! First results will arrive at the next daily scan.`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete competitor monitor for "${title}"?`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/competitor/configs/${id}`, { method: 'DELETE' });
      setConfigs(prev => prev.filter(c => c.id !== id));
    } catch {
      setError('Failed to delete monitor.');
    } finally {
      setDeletingId(null);
    }
  }

  // ── Not logged in ──────────────────────────────────────
  if (status === 'unauthenticated') {
    return (
      <div className="bg-surface border border-border rounded-2xl p-10 text-center">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Sign in to Track Competitors</h2>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          Connect your Google account to monitor competitor channels and get alerts when their videos go viral.
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

  if (status === 'loading') {
    return (
      <div className="bg-surface border border-border rounded-2xl p-10 text-center text-text-secondary">
        Loading...
      </div>
    );
  }

  // ── All plans ─────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Channel resolve */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold text-text-primary mb-5">Add a Competitor Channel</h2>

        {/* Step 1: Resolve channel */}
        <div className="space-y-3 mb-5">
          <label className="block text-sm font-medium text-text-secondary">
            Channel URL or @handle
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={channelInput}
              onChange={e => { setChannelInput(e.target.value); setPreview(null); setResolveError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleResolve()}
              placeholder="e.g. @mrbeasi or youtube.com/channel/UCxxx"
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleResolve}
              disabled={resolving}
              className="inline-flex items-center gap-1 bg-surface-hover border border-border hover:border-primary text-text-primary font-medium rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50"
            >
              {resolving ? 'Looking up...' : 'Resolve →'}
            </button>
          </div>
          {resolveError && <p className="text-sm text-red-400">{resolveError}</p>}
        </div>

        {/* Channel preview */}
        {preview && (
          <div className="flex items-center gap-4 bg-background border border-primary/30 rounded-xl p-4 mb-5">
            {preview.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.thumbnailUrl}
                alt={preview.channelTitle}
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="font-semibold text-text-primary">{preview.channelTitle}</p>
              <p className="text-xs text-text-secondary">{fmt(preview.subscriberCount)} subscribers</p>
              <p className="text-xs text-green-400 mt-0.5">Channel found ✓</p>
            </div>
          </div>
        )}

        {/* Step 2: Monitor form */}
        {preview && (
          <form onSubmit={handleAdd} className="space-y-4 border-t border-border pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Views ÷ Subscribers Minimum
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5} max={50} step={5}
                    value={ratioMin}
                    onChange={e => setRatioMin(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-text-primary font-bold w-12 text-right">{ratioMin}x</span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Alert when any Short has ≥ {ratioMin}× views vs their subs
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Notification Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={e => setNotifyEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Label <span className="text-text-secondary font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Top competitor, Niche leader"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-green-400">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-lg px-5 py-2.5 text-sm transition-colors"
            >
              {submitting ? 'Adding...' : '+ Add Monitor'}
            </button>
          </form>
        )}

        <p className="text-xs text-text-secondary mt-4">
          Plan: <span className="capitalize text-primary font-medium">{plan}</span>
          {' '}· {configs.length}/{maxMonitors >= 20 ? '∞' : maxMonitors} competitor monitors active.{' '}
          Results delivered daily at 9:00 AM (UTC+8).
        </p>
      </div>

      {/* Link to feed */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">Your Competitor Monitors</h2>
        <Link
          href="/account/feed"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View unified feed →
        </Link>
      </div>

      {/* Existing configs */}
      <div>
        {loading ? (
          <p className="text-text-secondary text-sm">Loading...</p>
        ) : configs.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary text-sm">
            No competitor monitors yet. Add one above to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {configs.map(cfg => (
              <div
                key={cfg.id}
                className="flex items-center justify-between gap-4 bg-surface border border-border rounded-xl px-5 py-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">
                      {cfg.label || cfg.channel_title}
                      {cfg.label && (
                        <span className="ml-2 text-xs font-normal text-text-secondary">
                          ({cfg.channel_title})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Views ≥ {cfg.ratio_min}× subs &nbsp;·&nbsp; {cfg.notify_email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cfg.id, cfg.channel_title)}
                  disabled={deletingId === cfg.id}
                  className="shrink-0 text-xs text-text-secondary hover:text-red-400 disabled:opacity-50 transition-colors px-2 py-1"
                >
                  {deletingId === cfg.id ? '...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
