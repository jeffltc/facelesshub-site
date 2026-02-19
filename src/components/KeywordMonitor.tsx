'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';

interface MonitorConfig {
  id: string;
  keyword: string;
  ratio_min: number;
  notify_email: string;
  label: string | null;
  active: boolean;
  created_at: string;
}

export function KeywordMonitor() {
  const { data: session, status } = useSession();

  const [configs, setConfigs]     = useState<MonitorConfig[]>([]);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // Form state
  const [keyword, setKeyword]         = useState('');
  const [ratioMin, setRatioMin]       = useState(10);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [label, setLabel]             = useState('');

  // Pre-fill email from session
  useEffect(() => {
    if (session?.user?.email && !notifyEmail) {
      setNotifyEmail(session.user.email);
    }
  }, [session]);

  // Load existing configs
  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      fetch('/api/monitor/configs')
        .then(r => r.json())
        .then(data => setConfigs(Array.isArray(data) ? data : []))
        .catch(() => setError('Failed to load monitors'))
        .finally(() => setLoading(false));
    }
  }, [status]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!keyword.trim()) { setError('Please enter a keyword.'); return; }
    if (!notifyEmail.trim()) { setError('Please enter a notification email.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/monitor/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, ratio_min: ratioMin, notify_email: notifyEmail, label }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to add monitor'); return; }
      setConfigs(prev => [data, ...prev]);
      setKeyword('');
      setLabel('');
      setSuccess(`Monitor for "${data.keyword}" added! First results will arrive tomorrow at 9:00 AM (UTC+8).`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, kw: string) {
    if (!confirm(`Delete monitor for "${kw}"?`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/monitor/configs/${id}`, { method: 'DELETE' });
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
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Sign in to Start Monitoring</h2>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          Connect your Google account to create keyword monitors. No YouTube permissions required — just your email for notifications.
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

  // ── Logged in ──────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Whitelist notice */}
      <div className="flex gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <span className="text-amber-400 text-xl shrink-0">⚠️</span>
        <div className="text-sm">
          <p className="font-medium text-amber-300 mb-1">Add sender to your whitelist to avoid missing emails</p>
          <p className="text-amber-400/80">
            Daily reports are sent from{' '}
            <span className="font-mono bg-amber-500/10 px-1 rounded">zhangjue88@gmail.com</span>.
            Please add it to your contacts or mark it as "not spam" so reports land in your inbox.
          </p>
        </div>
      </div>

      {/* Add monitor form */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold text-text-primary mb-5">Add a Keyword Monitor</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Keyword <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="e.g. dog sleep"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
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
                Only alert when views ≥ {ratioMin}× subscribers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Label <span className="text-text-secondary font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Pet niche research"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-primary"
              />
            </div>
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

        <p className="text-xs text-text-secondary mt-4">
          Free plan: up to 3 keyword monitors per account. Results delivered daily at 9:00 AM (UTC+8).
          Only new, previously-unseen videos are included each day.
        </p>
      </div>

      {/* Existing configs */}
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4">Your Monitors</h2>

        {loading ? (
          <p className="text-text-secondary text-sm">Loading...</p>
        ) : configs.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary text-sm">
            No monitors yet. Add one above to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {configs.map(cfg => (
              <div
                key={cfg.id}
                className="flex items-center justify-between gap-4 bg-surface border border-border rounded-xl px-5 py-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">
                      {cfg.label || cfg.keyword}
                      {cfg.label && (
                        <span className="ml-2 text-xs font-normal text-text-secondary">
                          ({cfg.keyword})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Views ≥ {cfg.ratio_min}× subs &nbsp;·&nbsp; {cfg.notify_email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cfg.id, cfg.keyword)}
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
