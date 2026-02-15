'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';

export function TDGenerator() {
  const t = useTranslations('td_generator');

  const [referenceTDs, setReferenceTDs] = useState('');
  const [requirement, setRequirement] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'title' | 'desc' | 'all' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (file.size > 1024 * 1024) {
      setError(t('image_too_large'));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError(t('invalid_image'));
      return;
    }
    setError('');
    setImageName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleGenerate = async () => {
    if (!requirement.trim()) return;
    setStatus('loading');
    setError('');
    setGeneratedTitle('');
    setGeneratedDescription('');

    try {
      const res = await fetch('/api/generate-td', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceTDs: referenceTDs || undefined,
          requirement,
          image: image || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Generation failed');
      }

      const data = await res.json();
      setGeneratedTitle(data.title);
      setGeneratedDescription(data.description);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStatus('error');
    }
  };

  const copyToClipboard = async (text: string, type: 'title' | 'desc' | 'all') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Reference TDs */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t('reference_label')}
          <span className="text-text-secondary font-normal ml-1">
            ({t('optional')})
          </span>
        </label>
        <p className="text-xs text-text-secondary mb-2">{t('reference_hint')}</p>
        <textarea
          value={referenceTDs}
          onChange={(e) => setReferenceTDs(e.target.value)}
          rows={4}
          placeholder={t('reference_placeholder')}
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm"
        />
      </div>

      {/* Requirement */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t('requirement_label')}
          <span className="text-red-400 ml-1">*</span>
        </label>
        <p className="text-xs text-text-secondary mb-2">{t('requirement_hint')}</p>
        <textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          rows={3}
          placeholder={t('requirement_placeholder')}
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t('image_label')}
          <span className="text-text-secondary font-normal ml-1">
            ({t('optional')}, {t('image_limit')})
          </span>
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            image
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />

          {image ? (
            <div className="flex items-center gap-4">
              <img
                src={image}
                alt="Uploaded"
                className="w-24 h-16 object-cover rounded"
              />
              <div className="flex-1 text-left">
                <p className="text-sm text-text-primary font-medium truncate">
                  {imageName}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                    setImageName('');
                  }}
                  className="text-xs text-red-400 hover:text-red-300 mt-1"
                >
                  {t('remove_image')}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-2 opacity-50">🖼️</div>
              <p className="text-sm text-text-secondary">
                {t('image_drop_hint')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!requirement.trim() || status === 'loading'}
        className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-6 py-3.5 transition-colors text-base"
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            {t('generating')}
          </span>
        ) : (
          t('generate_button')
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {status === 'success' && generatedTitle && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 bg-primary/5 border-b border-border">
            <span className="text-sm font-medium text-primary">
              {t('result_label')}
            </span>
            <button
              onClick={() =>
                copyToClipboard(
                  `${generatedTitle}\n\n${generatedDescription}`,
                  'all'
                )
              }
              className={`text-xs px-3 py-1 rounded transition-colors ${
                copied === 'all'
                  ? 'bg-success/10 text-success'
                  : 'bg-surface border border-border text-text-secondary hover:text-primary hover:border-primary'
              }`}
            >
              {copied === 'all' ? t('copied') : t('copy_all')}
            </button>
          </div>

          {/* Title */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                {t('title_label')}
              </span>
              <button
                onClick={() => copyToClipboard(generatedTitle, 'title')}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${
                  copied === 'title'
                    ? 'text-success'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                {copied === 'title' ? t('copied') : t('copy')}
              </button>
            </div>
            <p className="text-lg font-semibold text-text-primary">
              {generatedTitle}
            </p>
            <span className="text-xs text-text-secondary mt-1 block">
              {generatedTitle.length} {t('characters')}
            </span>
          </div>

          {/* Description */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                {t('description_label')}
              </span>
              <button
                onClick={() => copyToClipboard(generatedDescription, 'desc')}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${
                  copied === 'desc'
                    ? 'text-success'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                {copied === 'desc' ? t('copied') : t('copy')}
              </button>
            </div>
            <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
              {generatedDescription}
            </p>
            <span className="text-xs text-text-secondary mt-2 block">
              {generatedDescription.length} {t('characters')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
