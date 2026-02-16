'use client';

import { useState, useEffect, useCallback } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

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

type TranslateStatus = 'idle' | 'loading' | 'success' | 'error';
type WriteBackEntry = { state: 'idle' | 'loading' | 'success' | 'error'; error?: string };
type WriteBackStatus = Record<string, WriteBackEntry>;

export function YouTubeTranslator() {
  const { data: session, status: authStatus } = useSession();
  const t = useTranslations('yt_translator');

  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetLang, setTargetLang] = useState('zh');
  const [freeLangs, setFreeLangs] = useState<Language[]>([]);
  const [premiumLangs, setPremiumLangs] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [translateStatus, setTranslateStatus] = useState<TranslateStatus>('idle');
  const [writeBackStatus, setWriteBackStatus] = useState<WriteBackStatus>({});
  const [videosLoading, setVideosLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch supported languages
  useEffect(() => {
    fetch('/api/translate')
      .then((r) => r.json())
      .then((data) => {
        setFreeLangs(data.free ?? []);
        setPremiumLangs(data.premium ?? []);
      })
      .catch(() => {});
  }, []);

  // Fetch videos when authenticated
  const fetchVideos = useCallback(async () => {
    if (!session?.accessToken) return;
    setVideosLoading(true);
    setError('');
    try {
      const res = await fetch('/api/youtube/videos');
      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();
      setVideos(data.videos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setVideosLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchVideos();
    }
  }, [session?.accessToken, fetchVideos]);

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

  const handleTranslate = async () => {
    if (selectedIds.size === 0) return;
    setTranslateStatus('loading');
    setTranslations([]);
    setError('');

    const items = videos
      .filter((v) => selectedIds.has(v.id))
      .map((v) => ({
        videoId: v.id,
        title: v.title,
        description: v.description,
      }));

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, targetLanguage: targetLang }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Translation failed');
      }

      const data = await res.json();
      setTranslations(data.translations ?? []);
      setTranslateStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
      setTranslateStatus('error');
    }
  };

  const handleWriteBack = async (videoId: string) => {
    const translation = translations.find((t) => t.videoId === videoId);
    if (!translation) return;

    setWriteBackStatus((prev) => ({ ...prev, [videoId]: { state: 'loading' } }));

    try {
      const res = await fetch('/api/youtube/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [
            {
              videoId,
              language: targetLang,
              title: translation.translatedTitle,
              description: translation.translatedDescription,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      const result = data.results?.[0];
      if (result?.success) {
        setWriteBackStatus((prev) => ({ ...prev, [videoId]: { state: 'success' } }));
      } else {
        throw new Error(result?.error ?? 'Write-back failed');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Write-back failed';
      setWriteBackStatus((prev) => ({ ...prev, [videoId]: { state: 'error', error: msg } }));
    }
  };

  const handleWriteBackAll = async () => {
    for (const tr of translations) {
      await handleWriteBack(tr.videoId);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Not authenticated
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
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          {t('login_title')}
        </h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          {t('login_desc')}
        </p>
        <button
          onClick={() => signIn('google')}
          className="inline-flex items-center gap-3 bg-white text-gray-800 font-medium rounded-lg px-6 py-3 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t('login_button')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User info bar */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt=""
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <p className="text-sm font-medium text-text-primary">
              {session.user?.name}
            </p>
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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-text-primary mb-1">
            {t('target_language')}
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full sm:w-auto bg-surface border border-border text-text-primary rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
          >
            {freeLangs.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
            {premiumLangs.length > 0 && (
              <optgroup label={t('premium_languages')}>
                {premiumLangs.map((lang) => (
                  <option key={lang.code} value={lang.code} disabled>
                    {lang.name} 🔒
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleTranslate}
            disabled={selectedIds.size === 0 || translateStatus === 'loading'}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-6 py-2 transition-colors"
          >
            {translateStatus === 'loading' ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                {t('translating')}
              </span>
            ) : (
              t('translate_selected', { count: selectedIds.size })
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Video list */}
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
              {selectedIds.size === videos.length
                ? t('deselect_all')
                : t('select_all')}
            </button>
          )}
        </div>

        {videosLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-3 text-text-secondary">
              {t('loading_videos')}
            </span>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            {t('no_videos')}
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video) => {
              const translation = translations.find(
                (tr) => tr.videoId === video.id
              );
              const wb = writeBackStatus[video.id] ?? { state: 'idle' };
              const wbStatus = wb.state;

              return (
                <div
                  key={video.id}
                  className={`bg-surface border rounded-xl overflow-hidden transition-colors ${
                    selectedIds.has(video.id)
                      ? 'border-primary'
                      : 'border-border'
                  }`}
                >
                  {/* Video row */}
                  <div
                    className="flex items-start gap-4 p-4 cursor-pointer"
                    onClick={() => toggleSelect(video.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(video.id)}
                      onChange={() => toggleSelect(video.id)}
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
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-text-secondary">
                          {new Date(video.publishedAt).toLocaleDateString()}
                        </span>
                        {video.localizations && (
                          <span className="text-xs text-accent">
                            🌐{' '}
                            {Object.keys(video.localizations).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Translation result */}
                  {translation && (
                    <div className="border-t border-border bg-background/50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-accent uppercase">
                          {t('translation_result')}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              copyToClipboard(
                                `${translation.translatedTitle}\n\n${translation.translatedDescription}`
                              )
                            }
                            className="text-xs text-text-secondary hover:text-primary transition-colors px-2 py-1 border border-border rounded"
                          >
                            {t('copy')}
                          </button>
                          <button
                            onClick={() => handleWriteBack(video.id)}
                            disabled={wbStatus === 'loading' || wbStatus === 'success'}
                            className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                              wbStatus === 'success'
                                ? 'bg-success/10 text-success'
                                : wbStatus === 'error'
                                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                  : 'bg-primary/10 text-primary hover:bg-primary/20'
                            } disabled:opacity-50`}
                          >
                            {wbStatus === 'loading'
                              ? t('writing')
                              : wbStatus === 'success'
                                ? t('written')
                                : wbStatus === 'error'
                                  ? t('retry')
                                  : t('write_to_youtube')}
                          </button>
                        </div>
                      </div>
                      {wb.error && (
                        <div className="mb-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
                          {wb.error}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-text-secondary">
                            {t('title')}:
                          </span>
                          <p className="text-sm text-text-primary font-medium">
                            {translation.translatedTitle}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-text-secondary">
                            {t('description')}:
                          </span>
                          <p className="text-sm text-text-secondary whitespace-pre-line line-clamp-5">
                            {translation.translatedDescription}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Batch write-back */}
      {translations.length > 0 && (
        <div className="flex items-center justify-between bg-surface border border-border rounded-lg p-4">
          <p className="text-sm text-text-primary">
            {t('batch_write_desc', { count: translations.length })}
          </p>
          <button
            onClick={handleWriteBackAll}
            className="bg-primary hover:bg-primary-hover text-white font-medium rounded-lg px-6 py-2 transition-colors text-sm"
          >
            {t('write_all_to_youtube')}
          </button>
        </div>
      )}
    </div>
  );
}
