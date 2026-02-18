'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Quality {
  key: string;
  label: string;
  size: string;
}

const QUALITIES: Quality[] = [
  { key: 'maxresdefault', label: 'HD', size: '1280×720' },
  { key: 'sddefault', label: 'SD', size: '640×480' },
  { key: 'hqdefault', label: 'HQ', size: '480×360' },
  { key: 'mqdefault', label: 'MQ', size: '320×180' },
  { key: 'default', label: 'Default', size: '120×90' },
];

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function YouTubeThumbnailDownloader() {
  const t = useTranslations('yt_thumbnail');
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [failedQualities, setFailedQualities] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = extractVideoId(url.trim());
    if (!id) {
      setError(t('invalid_url'));
      setVideoId(null);
      return;
    }
    setError('');
    setFailedQualities(new Set());
    setVideoId(id);
  }

  function handleImageError(key: string) {
    setFailedQualities((prev) => new Set([...prev, key]));
  }

  async function handleDownload(key: string) {
    if (!videoId) return;
    setDownloading((prev) => new Set([...prev, key]));
    try {
      const res = await fetch(
        `/api/thumbnail?videoId=${encodeURIComponent(videoId)}&quality=${encodeURIComponent(key)}`
      );
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `thumbnail-${videoId}-${key}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // silently ignore — user can retry
    } finally {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  const visibleQualities = videoId
    ? QUALITIES.filter((q) => !failedQualities.has(q.key))
    : [];

  return (
    <div className="space-y-8">
      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="yt-url"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            {t('input_label')}
          </label>
          <div className="flex gap-3">
            <input
              id="yt-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('input_placeholder')}
              className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              {t('get_button')}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}
        </div>
      </form>

      {/* Thumbnail grid */}
      {videoId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUALITIES.map((q) => {
            if (failedQualities.has(q.key)) return null;
            const isDownloading = downloading.has(q.key);
            const imgSrc = `https://img.youtube.com/vi/${videoId}/${q.key}.jpg`;

            return (
              <div
                key={q.key}
                className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative bg-black aspect-video">
                  <img
                    src={imgSrc}
                    alt={`${q.label} thumbnail`}
                    className="w-full h-full object-contain"
                    onError={() => handleImageError(q.key)}
                  />
                </div>

                {/* Card footer */}
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {q.label}
                    </span>
                    <span className="text-xs text-text-secondary">{q.size}</span>
                  </div>
                  <button
                    onClick={() => handleDownload(q.key)}
                    disabled={isDownloading}
                    className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? t('downloading') : t('download')}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Show message if all failed */}
          {visibleQualities.length === 0 && (
            <p className="col-span-full text-center text-text-secondary text-sm py-8">
              {t('not_available')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
