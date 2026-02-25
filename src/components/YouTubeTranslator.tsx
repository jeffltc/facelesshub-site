'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { UpgradeModal } from './UpgradeModal';

interface ConnectedChannel {
  channel_id: string;
  channel_title: string;
  channel_thumbnail: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  defaultLanguage?: string;
  localizations?: Record<string, { title: string; description: string }>;
}

interface Translation {
  videoId: string;
  translatedTitle: string;
  translatedDescription: string;
}

interface Language {
  code: string;
  name: string;
}

interface QuotaInfo {
  dailyUsed: number;
  dailyLimit: number;
  dailyRemaining: number;
  poolUsed: number;
  poolLimit: number;
  poolRemaining: number;
}

type WriteBackResult = { success: boolean; error?: string; loading?: boolean };

export function YouTubeTranslator() {
  const { data: session, status: authStatus } = useSession();
  const t = useTranslations('yt_translator');

  // Videos
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [videosLoading, setVideosLoading] = useState(false);
  const [error, setError] = useState('');

  // Language settings
  const [savedLanguages, setSavedLanguages] = useState<string[]>([]);
  const [allLanguages, setAllLanguages] = useState<{ free: Language[]; premium: Language[] }>({
    free: [],
    premium: [],
  });
  const [maxLanguages, setMaxLanguages] = useState(2);
  const [userPlan, setUserPlan] = useState('free');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const addDropdownRef = useRef<HTMLDivElement>(null);

  // Quota
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);

  // Translations keyed by language code
  const [translationsByLang, setTranslationsByLang] = useState<Record<string, Translation[]>>({});
  const [translateStatus, setTranslateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Per-video active tab in results
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});

  // Write-back
  const [writeBackResults, setWriteBackResults] = useState<Record<string, WriteBackResult>>({});
  const [writeBackLoading, setWriteBackLoading] = useState(false);
  const [writeBackToast, setWriteBackToast] = useState<string | null>(null);

  // Auto write-back toggle
  const [autoWriteBack, setAutoWriteBack] = useState(false);

  // Confirm modal for re-translate
  const [overwriteModal, setOverwriteModal] = useState<{ fullyDone: number; total: number } | null>(null);
  const [pendingTranslate, setPendingTranslate] = useState(false);

  // Upgrade modal
  const [upgradeModal, setUpgradeModal] = useState<{
    used?: number; limit?: number; plan?: string; message?: string;
  } | null>(null);

  // Connected channels manager
  const [connectedChannels, setConnectedChannels] = useState<ConnectedChannel[]>([]);
  const [maxChannels, setMaxChannels] = useState(1);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [connectingChannel, setConnectingChannel] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  // Close add-language dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addDropdownRef.current && !addDropdownRef.current.contains(e.target as Node)) {
        setShowAddDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch quota info
  const fetchQuota = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch('/api/user/plan');
      if (!res.ok) return;
      const data = await res.json();
      const tq = data.translatorQuota;
      if (tq) {
        setQuotaInfo({
          dailyUsed: tq.dailyUsed,
          dailyLimit: tq.dailyLimit,
          dailyRemaining: Math.max(0, tq.dailyLimit - tq.dailyUsed),
          poolUsed: tq.poolUsed,
          poolLimit: tq.poolLimit,
          poolRemaining: Math.max(0, tq.poolLimit - tq.poolUsed),
        });
      }
    } catch {
      // silently ignore
    }
  }, [session?.user?.email]);

  // Fetch connected channels list
  const fetchConnectedChannels = useCallback(async () => {
    setChannelsLoading(true);
    try {
      const res = await fetch('/api/youtube/connected-channels');
      if (!res.ok) return;
      const data = await res.json();
      setConnectedChannels(data.channels ?? []);
      setMaxChannels(data.maxChannels ?? 1);
    } catch {
      // silently ignore
    } finally {
      setChannelsLoading(false);
    }
  }, []);

  // Fetch videos for a specific channel
  const fetchVideos = useCallback(async (channelId: string) => {
    setVideosLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/youtube/videos?channelId=${encodeURIComponent(channelId)}`);
      if (!res.ok) {
        const data = await res.json();
        if (data.code === 'CHANNEL_TOKEN_EXPIRED') {
          setError(t('channel_token_expired'));
        } else {
          throw new Error(data.error ?? 'Failed to fetch videos');
        }
        return;
      }
      const data = await res.json();
      setVideos(data.videos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setVideosLoading(false);
    }
  }, [t]);

  // Save channel selection to Supabase and reload videos
  const selectChannel = useCallback(async (channelId: string) => {
    setSelectedChannelId(channelId);
    setVideos([]);
    setSelectedIds(new Set());
    setTranslationsByLang({});
    await fetch('/api/translator/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedChannelId: channelId }),
    }).catch(() => null);
    fetchVideos(channelId);
  }, [fetchVideos]);

  // Add channel via OAuth popup
  const handleAddChannel = useCallback(async () => {
    if (connectedChannels.length >= maxChannels) {
      setUpgradeModal({ message: t('channel_limit_label', { count: connectedChannels.length, max: maxChannels }) });
      return;
    }

    setConnectingChannel(true);
    setError('');

    const popup = window.open(
      '/api/youtube/connect',
      '_blank',
      'width=500,height=650,popup=1,noopener=0'
    );

    if (!popup) {
      setError(t('popup_blocked'));
      setConnectingChannel(false);
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const { type, message } = event.data ?? {};
      if (type === 'CHANNEL_CONNECTED') {
        fetchConnectedChannels();
        setConnectingChannel(false);
      } else if (type === 'CHANNEL_CONNECT_ERROR') {
        setError(message === 'CHANNEL_LIMIT_EXCEEDED' ? t('channel_limit_label', { count: connectedChannels.length, max: maxChannels }) : t('channel_connect_error'));
        setConnectingChannel(false);
      }
      window.removeEventListener('message', onMessage);
      clearInterval(pollInterval);
    };

    window.addEventListener('message', onMessage);

    // Poll for popup close (user closed manually without completing)
    const pollInterval = setInterval(() => {
      if (popup.closed) {
        window.removeEventListener('message', onMessage);
        clearInterval(pollInterval);
        setConnectingChannel(false);
      }
    }, 500);
  }, [connectedChannels, maxChannels, fetchConnectedChannels, t]);

  // Remove a connected channel
  const handleRemoveChannel = useCallback(async (channelId: string) => {
    if (!window.confirm(t('remove_channel_confirm'))) return;

    const res = await fetch(
      `/api/youtube/connected-channels?channelId=${encodeURIComponent(channelId)}`,
      { method: 'DELETE' }
    );

    if (!res.ok) return;

    await fetchConnectedChannels();

    // If removed channel was active, clear state
    if (channelId === selectedChannelId) {
      setSelectedChannelId(null);
      setVideos([]);
      setTranslationsByLang({});
    }
  }, [selectedChannelId, fetchConnectedChannels, t]);

  useEffect(() => {
    if (!session?.user?.email) return;

    const init = async () => {
      setSettingsLoading(true);

      // Fetch settings and channels in parallel
      const [settingsData, channelsData] = await Promise.all([
        fetch('/api/translator/settings')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
        fetch('/api/youtube/connected-channels')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);

      // Apply settings
      if (settingsData) {
        const langs: string[] = settingsData.targetLanguages ?? [];
        setSavedLanguages(langs);
        setMaxLanguages(settingsData.maxLanguages ?? 2);
        setUserPlan(settingsData.plan ?? 'free');
        setAllLanguages(settingsData.availableLanguages ?? { free: [], premium: [] });

        // First-time user: persist the computed defaults so they stick on next load
        if (!settingsData.hasExistingSettings && langs.length > 0) {
          fetch('/api/translator/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetLanguages: langs }),
          }).catch(() => null);
        }
      }
      setSettingsLoading(false);

      // Apply connected channels
      const list: ConnectedChannel[] = channelsData?.channels ?? [];
      setConnectedChannels(list);
      setMaxChannels(channelsData?.maxChannels ?? 1);

      // Determine which channel to load
      const savedId: string | null = settingsData?.selectedChannelId ?? null;
      let channelToLoad: string | null = null;

      if (list.length > 0) {
        if (savedId && list.some((c) => c.channel_id === savedId)) {
          channelToLoad = savedId;
        } else {
          channelToLoad = list[0].channel_id;
          fetch('/api/translator/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedChannelId: channelToLoad }),
          }).catch(() => null);
        }
        setSelectedChannelId(channelToLoad);
        fetchVideos(channelToLoad);
      }
    };

    init();
    fetchQuota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  // Save languages to backend
  const saveLanguages = async (langs: string[]) => {
    try {
      await fetch('/api/translator/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLanguages: langs }),
      });
    } catch {
      // silently ignore
    }
  };

  const removeLanguage = (code: string) => {
    const updated = savedLanguages.filter((l) => l !== code);
    setSavedLanguages(updated);
    saveLanguages(updated);
  };

  const addLanguage = (code: string) => {
    if (savedLanguages.includes(code) || savedLanguages.length >= maxLanguages) return;
    const updated = [...savedLanguages, code];
    setSavedLanguages(updated);
    saveLanguages(updated);
    setShowAddDropdown(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === videos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(videos.map((v) => v.id)));
    }
  };

  // Count selected videos where ALL target languages already have YouTube localizations
  const countFullyTranslated = () => {
    return videos.filter((v) => {
      if (!selectedIds.has(v.id)) return false;
      if (!savedLanguages.length) return false;
      return savedLanguages.every((lang) => !!v.localizations?.[lang]);
    }).length;
  };

  const doTranslate = async (skipExisting = false) => {
    if (selectedIds.size === 0 || savedLanguages.length === 0) return;
    setTranslateStatus('loading');
    setTranslationsByLang({});
    setError('');
    setPendingTranslate(false);

    const allSelected = videos.filter((v) => selectedIds.has(v.id));

    // When skipping: exclude videos where ALL target languages already exist on YouTube
    const items = (skipExisting
      ? allSelected.filter((v) => !savedLanguages.every((lang) => !!v.localizations?.[lang]))
      : allSelected
    ).map((v) => ({ videoId: v.id, title: v.title, description: v.description }));

    if (items.length === 0) {
      setTranslateStatus('idle');
      return;
    }

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, targetLanguages: savedLanguages }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'PLAN_LIMIT_EXCEEDED') {
          setUpgradeModal({ plan: data.plan, message: data.error });
          setTranslateStatus('idle');
          return;
        }
        if (data.code === 'QUOTA_EXCEEDED') {
          setError(
            `Quota exceeded. Daily remaining: ${data.dailyRemaining}, Pool remaining: ${data.poolRemaining ?? 0}.`
          );
          setTranslateStatus('error');
          return;
        }
        throw new Error(data.error ?? 'Translation failed');
      }

      const freshTranslations: Record<string, Translation[]> = data.translations ?? {};
      setTranslationsByLang(freshTranslations);
      setTranslateStatus('success');

      // Auto write-back: use fresh data directly (state not yet flushed)
      if (autoWriteBack && Object.keys(freshTranslations).length > 0) {
        await executeWriteBack(freshTranslations);
      }

      // Update quota info
      if (data.dailyRemaining !== undefined) {
        setQuotaInfo((prev) =>
          prev
            ? {
                ...prev,
                dailyRemaining: data.dailyRemaining,
                poolRemaining: data.poolRemaining ?? prev.poolRemaining,
              }
            : prev
        );
      }

      // Set default active tab per video to first saved language
      if (savedLanguages.length > 0) {
        const tabs: Record<string, string> = {};
        items.forEach((item) => {
          tabs[item.videoId] = savedLanguages[0];
        });
        setActiveTabs(tabs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
      setTranslateStatus('error');
    }
  };

  const handleTranslate = () => {
    const fullyDone = countFullyTranslated();
    if (fullyDone > 0) {
      setOverwriteModal({ fullyDone, total: selectedIds.size });
    } else {
      doTranslate(false);
    }
  };

  // Core write-back logic — accepts translations directly to avoid stale-state issues
  const executeWriteBack = async (translations: Record<string, Translation[]>) => {
    if (!selectedChannelId) return;
    const langEntries = Object.entries(translations);
    if (langEntries.length === 0) return;

    setWriteBackLoading(true);
    setWriteBackResults({});

    const updates = langEntries.flatMap(([lang, trs]) =>
      trs.map((tr) => ({
        videoId: tr.videoId,
        language: lang,
        title: tr.translatedTitle,
        description: tr.translatedDescription,
      }))
    );

    try {
      const res = await fetch('/api/youtube/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: selectedChannelId, updates }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      const results: Record<string, WriteBackResult> = {};
      (data.results ?? []).forEach((r: { videoId: string; success: boolean; error?: string }) => {
        results[r.videoId] = { success: r.success, error: r.error };
      });
      setWriteBackResults(results);

      const succeeded = Object.values(results).filter((r) => r.success).length;
      const failed = Object.values(results).filter((r) => !r.success).length;
      const totalVideos = new Set(updates.map((u) => u.videoId)).size;

      if (failed === 0) {
        setWriteBackToast(t('write_success_toast', { count: succeeded || totalVideos }));
      } else {
        setWriteBackToast(t('write_partial_toast', { success: succeeded, failed }));
      }
      setTimeout(() => setWriteBackToast(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Write-back failed');
    } finally {
      setWriteBackLoading(false);
    }
  };

  const handleWriteBackAll = async () => {
    await executeWriteBack(translationsByLang);
  };


  const handleWriteBackOne = async (videoId: string) => {
    if (!selectedChannelId) return;

    const updates = Object.entries(translationsByLang)
      .filter(([, trs]) => trs.some((tr) => tr.videoId === videoId))
      .map(([lang, trs]) => {
        const tr = trs.find((tr) => tr.videoId === videoId)!;
        return { videoId, language: lang, title: tr.translatedTitle, description: tr.translatedDescription };
      });

    if (!updates.length) return;

    setWriteBackResults((prev) => ({ ...prev, [videoId]: { success: false, loading: true } }));

    try {
      const res = await fetch('/api/youtube/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: selectedChannelId, updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const ok = data.results?.[0]?.success !== false;
      setWriteBackResults((prev) => ({ ...prev, [videoId]: { success: ok, error: data.results?.[0]?.error } }));
    } catch (err) {
      setWriteBackResults((prev) => ({
        ...prev,
        [videoId]: { success: false, error: err instanceof Error ? err.message : 'Failed' },
      }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Build available languages for dropdown (not yet saved, accessible for plan)
  const availableToAdd = [...allLanguages.free, ...(userPlan !== 'free' ? allLanguages.premium : [])].filter(
    (lang) => !savedLanguages.includes(lang.code)
  );

  const langName = (code: string) => {
    return (
      [...allLanguages.free, ...allLanguages.premium].find((l) => l.code === code)?.name ?? code
    );
  };

  // Loading state
  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">🔐</div>
        <h2 className="text-2xl font-bold text-text-primary mb-3">{t('login_title')}</h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">{t('login_desc')}</p>
        <button
          onClick={() => signIn('google')}
          className="inline-flex items-center gap-3 bg-white text-gray-800 font-medium rounded-lg px-6 py-3 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {t('login_button')}
        </button>
      </div>
    );
  }

  const selectedCount = selectedIds.size;
  const hasTranslations = Object.keys(translationsByLang).length > 0;
  const totalDailyRemaining = quotaInfo?.dailyRemaining ?? 0;
  const totalPoolRemaining = quotaInfo?.poolRemaining ?? 0;
  const totalQuota = totalDailyRemaining + totalPoolRemaining;
  const canTranslate =
    selectedCount > 0 &&
    savedLanguages.length > 0 &&
    totalQuota >= selectedCount &&
    translateStatus !== 'loading';

  return (
    <div className="space-y-6">
      <UpgradeModal
        isOpen={!!upgradeModal}
        onClose={() => setUpgradeModal(null)}
        tool="translator"
        plan={upgradeModal?.plan}
        message={upgradeModal?.message}
      />

      {/* Re-translate confirm modal */}
      {overwriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-text-primary font-semibold text-lg">{t('overwrite_title')}</h3>
            <p className="text-text-secondary text-sm">
              {t('already_translated_desc', { count: overwriteModal.fullyDone, total: overwriteModal.total })}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setOverwriteModal(null)}
                className="px-4 py-2 text-sm text-text-secondary border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => { setOverwriteModal(null); doTranslate(true); }}
                className="px-4 py-2 text-sm border border-primary text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                {t('skip_existing', { count: overwriteModal.total - overwriteModal.fullyDone })}
              </button>
              <button
                onClick={() => { setOverwriteModal(null); doTranslate(false); }}
                className="px-4 py-2 text-sm bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                {t('translate_all_confirm', { count: overwriteModal.total })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write-back toast */}
      {writeBackToast && (
        <div className="fixed top-4 right-4 z-50 bg-success/90 text-white text-sm px-5 py-3 rounded-lg shadow-lg">
          {writeBackToast}
        </div>
      )}

      {/* User info bar */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          {session.user?.image && (
            <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
          )}
          <div>
            <p className="text-sm font-medium text-text-primary">{session.user?.name}</p>
            <p className="text-xs text-text-secondary">{session.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          {t('logout')}
        </button>
      </div>

      {/* Connected Channels manager */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">{t('manage_channels')}</span>
          <span className="text-xs text-text-secondary">
            {t('channel_limit_label', {
              count: connectedChannels.length,
              max: maxChannels,
            })}
            {' '}({userPlan} plan)
          </span>
        </div>

        {channelsLoading ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            {t('channel_label')}...
          </div>
        ) : (
          <div className="space-y-2">
            {connectedChannels.map((ch) => (
              <div
                key={ch.channel_id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  ch.channel_id === selectedChannelId
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-border/30'
                }`}
                onClick={() => selectChannel(ch.channel_id)}
              >
                {/* Radio indicator */}
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  ch.channel_id === selectedChannelId ? 'border-primary' : 'border-border'
                }`}>
                  {ch.channel_id === selectedChannelId && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                {ch.channel_thumbnail && (
                  <img src={ch.channel_thumbnail} alt="" className="w-7 h-7 rounded-full shrink-0" />
                )}
                <span className="flex-1 text-sm text-text-primary truncate">{ch.channel_title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveChannel(ch.channel_id);
                  }}
                  className="text-xs text-text-secondary hover:text-red-400 transition-colors px-2 py-1 border border-border rounded hover:border-red-400/50 shrink-0"
                >
                  {t('remove_channel')}
                </button>
              </div>
            ))}

            {connectedChannels.length === 0 && (
              <p className="text-sm text-text-secondary py-1">{t('no_videos')}</p>
            )}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={handleAddChannel}
            disabled={connectingChannel}
            className={`text-sm font-medium rounded-lg px-4 py-2 transition-colors ${
              connectedChannels.length >= maxChannels
                ? 'text-text-secondary border border-border hover:border-primary/50 hover:text-primary'
                : 'bg-primary hover:bg-primary-hover text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {connectingChannel ? t('connecting_channel') : t('add_channel')}
          </button>
        </div>
      </div>

      {/* A. Language Settings bar */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">{t('settings_languages')}</span>
          <span className="text-xs text-text-secondary">
            {t('language_limit', {
              used: savedLanguages.length,
              max: maxLanguages,
              plan: userPlan,
            })}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {settingsLoading ? (
            <span className="text-xs text-text-secondary">Loading...</span>
          ) : (
            <>
              {savedLanguages.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full"
                >
                  {langName(code)}
                  <button
                    onClick={() => removeLanguage(code)}
                    className="text-primary/60 hover:text-primary transition-colors leading-none"
                    aria-label={`Remove ${code}`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {savedLanguages.length < maxLanguages && (
                <div className="relative" ref={addDropdownRef}>
                  <button
                    onClick={() => setShowAddDropdown((v) => !v)}
                    className="text-sm text-text-secondary border border-border border-dashed rounded-full px-3 py-1 hover:border-primary hover:text-primary transition-colors"
                  >
                    {t('add_language')}
                  </button>

                  {showAddDropdown && (
                    <div className="absolute left-0 top-full mt-1 z-20 bg-surface border border-border rounded-lg shadow-lg min-w-[180px] max-h-60 overflow-y-auto">
                      {availableToAdd.length === 0 ? (
                        <p className="text-xs text-text-secondary p-3">No more available</p>
                      ) : (
                        availableToAdd.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => addLanguage(lang.code)}
                            className="w-full text-left text-sm text-text-primary px-3 py-2 hover:bg-primary/10 transition-colors"
                          >
                            {lang.name}
                          </button>
                        ))
                      )}
                      {userPlan === 'free' && allLanguages.premium.length > 0 && (
                        <div className="border-t border-border px-3 py-2">
                          <p className="text-xs text-text-secondary mb-1">Premium (upgrade)</p>
                          {allLanguages.premium.map((lang) => (
                            <button
                              key={lang.code}
                              disabled
                              className="w-full text-left text-sm text-text-secondary/50 py-1 cursor-not-allowed"
                            >
                              {lang.name} 🔒
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* B. Quota display + Translate controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Quota info */}
        <div className="flex-1 flex flex-wrap gap-3 text-sm">
          {quotaInfo ? (
            <>
              <span
                className={`${
                  quotaInfo.dailyRemaining === 0 ? 'text-red-400' : quotaInfo.dailyRemaining <= 1 ? 'text-orange-400' : 'text-text-secondary'
                }`}
              >
                {t('quota_today', {
                  remaining: quotaInfo.dailyRemaining,
                  limit: quotaInfo.dailyLimit,
                })}
              </span>
              {quotaInfo.poolLimit > 0 && (
                <span
                  className={`${
                    quotaInfo.poolRemaining === 0 ? 'text-red-400' : 'text-text-secondary'
                  }`}
                >
                  {t('quota_pool', {
                    remaining: quotaInfo.poolRemaining,
                    limit: quotaInfo.poolLimit,
                  })}
                </span>
              )}
              {totalQuota === 0 && (
                <span className="text-red-400 font-medium">{t('quota_none')}</span>
              )}
            </>
          ) : null}
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          {selectedCount > 0 && savedLanguages.length > 0 && (
            <span className="text-xs text-text-secondary">
              {t('quota_cost', { count: selectedCount })}
            </span>
          )}

          {/* Auto write-back toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoWriteBack}
              onChange={(e) => setAutoWriteBack(e.target.checked)}
              className="accent-primary w-4 h-4"
            />
            <span className="text-sm text-text-secondary whitespace-nowrap">
              {t('auto_write_back')}
            </span>
          </label>

          {/* Write All — only shown when auto write-back is OFF */}
          {!autoWriteBack && (
            <button
              onClick={handleWriteBackAll}
              disabled={writeBackLoading || !hasTranslations || !selectedChannelId}
              className={`font-medium rounded-lg px-4 py-2 transition-colors whitespace-nowrap text-sm border ${
                hasTranslations && !writeBackLoading
                  ? 'border-primary text-primary hover:bg-primary/10'
                  : 'border-border text-text-secondary opacity-40 cursor-not-allowed'
              }`}
            >
              {writeBackLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                  {t('writing_back')}
                </span>
              ) : (
                t('write_all_btn', {
                  count: new Set(
                    Object.values(translationsByLang).flatMap((trs) => trs.map((tr) => tr.videoId))
                  ).size,
                })
              )}
            </button>
          )}

          {/* Translate button — label changes based on auto write-back */}
          <button
            onClick={handleTranslate}
            disabled={!canTranslate}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-6 py-2 transition-colors whitespace-nowrap"
          >
            {translateStatus === 'loading' ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                {autoWriteBack ? t('writing_back') : t('translating')}
              </span>
            ) : autoWriteBack ? (
              t('translate_and_write', { count: selectedCount })
            ) : (
              t('translate_selected', { count: selectedCount })
            )}
          </button>
        </div>
      </div>

      {savedLanguages.length === 0 && !settingsLoading && (
        <div className="text-sm text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-2">
          {t('no_languages_saved')}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* C. Video list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            {t('your_videos')} ({videos.length})
          </h3>
          {videos.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-sm text-primary hover:text-primary-hover transition-colors"
            >
              {selectedIds.size === videos.length ? t('deselect_all') : t('select_all')}
            </button>
          )}
        </div>

        {videosLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-3 text-text-secondary">{t('loading_videos')}</span>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            {connectedChannels.length === 0 ? t('no_videos') : t('no_videos')}
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video) => {
              const isSelected = selectedIds.has(video.id);
              const videoTranslations = translationsByLang;
              const hasResult = savedLanguages.some((lang) => videoTranslations[lang]?.find((tr) => tr.videoId === video.id));
              const activeTab = activeTabs[video.id] ?? savedLanguages[0] ?? '';
              const activeTranslation = videoTranslations[activeTab]?.find((tr) => tr.videoId === video.id);
              const wbResult = writeBackResults[video.id];

              return (
                <div
                  key={video.id}
                  className={`bg-surface border rounded-xl overflow-hidden transition-colors ${
                    isSelected ? 'border-primary' : 'border-border'
                  }`}
                >
                  {/* Video row */}
                  <div
                    className="flex items-start gap-4 p-4 cursor-pointer"
                    onClick={() => toggleSelect(video.id)}
                  >
                    {/* Checkbox — stopPropagation to prevent double-toggle */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(video.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 accent-primary"
                    />
                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt=""
                        className="w-32 h-18 object-cover rounded shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-text-primary truncate">
                        {video.title}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {video.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs text-text-secondary">
                          {new Date(video.publishedAt).toLocaleDateString()}
                        </span>
                        {/* Per-language status chips */}
                        {savedLanguages.map((lang) => {
                          const isDone = !!video.localizations?.[lang];
                          return (
                            <span
                              key={lang}
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                isDone
                                  ? 'bg-success/15 text-success'
                                  : 'bg-border/50 text-text-secondary'
                              }`}
                            >
                              {isDone
                                ? t('lang_done', { lang: lang.toUpperCase() })
                                : t('lang_pending', { lang: lang.toUpperCase() })}
                            </span>
                          );
                        })}
                        {wbResult?.success && (
                          <span className="text-xs text-success">✓ Written</span>
                        )}
                        {wbResult && !wbResult.success && (
                          <span className="text-xs text-red-400" title={wbResult.error}>
                            ✗ Failed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* E. Translation results — per-video language tabs */}
                  {hasResult && (
                    <div className="border-t border-border bg-background/50">
                      {/* Language tabs + per-video write button */}
                      <div className="flex items-center justify-between px-4 pt-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {savedLanguages
                            .filter((lang) => videoTranslations[lang]?.find((tr) => tr.videoId === video.id))
                            .map((lang) => (
                              <button
                                key={lang}
                                onClick={() => setActiveTabs((prev) => ({ ...prev, [video.id]: lang }))}
                                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                                  activeTab === lang
                                    ? 'bg-primary text-white'
                                    : 'text-text-secondary hover:text-primary'
                                }`}
                              >
                                {langName(lang)}
                              </button>
                            ))}
                        </div>
                        {/* Per-video write-back — writes ALL language tabs for this video */}
                        {(() => {
                          const videoLangs = savedLanguages.filter(
                            (lang) => videoTranslations[lang]?.find((tr) => tr.videoId === video.id)
                          );
                          const vbResult = writeBackResults[video.id];
                          if (vbResult?.success) {
                            return (
                              <span className="text-xs text-success shrink-0">✓ {t('written')}</span>
                            );
                          }
                          return (
                            <button
                              onClick={() => handleWriteBackOne(video.id)}
                              disabled={!!vbResult?.loading || !selectedChannelId}
                              title={videoLangs.map(langName).join(', ')}
                              className="text-xs border border-border text-text-secondary hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed rounded px-2 py-1 transition-colors shrink-0 flex items-center gap-1"
                            >
                              {vbResult?.loading ? (
                                <>
                                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                                  {t('writing_video')}
                                </>
                              ) : (
                                t('write_video_btn', { count: videoLangs.length })
                              )}
                            </button>
                          );
                        })()}
                      </div>

                      {activeTranslation && (
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-accent uppercase">
                              {t('translation_result')}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${activeTranslation.translatedTitle}\n\n${activeTranslation.translatedDescription}`
                                )
                              }
                              className="text-xs text-text-secondary hover:text-primary transition-colors px-2 py-1 border border-border rounded"
                            >
                              {t('copy')}
                            </button>
                          </div>
                          <div>
                            <span className="text-xs text-text-secondary">{t('title_label')}:</span>
                            <p className="text-sm text-text-primary font-medium">
                              {activeTranslation.translatedTitle}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-text-secondary">{t('description')}:</span>
                            <p className="text-sm text-text-secondary whitespace-pre-line line-clamp-5">
                              {activeTranslation.translatedDescription}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
