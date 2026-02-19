'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

type Step = 'upload' | 'draw' | 'result';

export function ObjectRemover() {
  const t = useTranslations('object_remover');

  const [step, setStep] = useState<Step>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [brushSize, setBrushSize] = useState(30);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const undoStack = useRef<ImageData[]>([]);
  const isDrawing = useRef(false);

  // Initialize canvas with black background when image loads
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    undoStack.current = [];
  }, []);

  useEffect(() => {
    if (step === 'draw' && imgRef.current?.complete) {
      initCanvas();
    }
  }, [step, initCanvas]);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const paintAt = (x: number, y: number) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    isDrawing.current = true;
    const pos = getCanvasPos(e);
    paintAt(pos.x, pos.y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const pos = getCanvasPos(e);
    paintAt(pos.x, pos.y);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    isDrawing.current = true;
    const pos = getCanvasPos(e);
    paintAt(pos.x, pos.y);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const pos = getCanvasPos(e);
    paintAt(pos.x, pos.y);
  };

  const handleTouchEnd = () => {
    isDrawing.current = false;
  };

  const handleUndo = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const snap = undoStack.current.pop();
    if (snap) ctx.putImageData(snap, 0, 0);
  };

  const handleResetMask = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    undoStack.current = [];
  };

  const handleRemove = () => {
    const canvas = canvasRef.current!;
    canvas.toBlob(async (maskBlob) => {
      if (!maskBlob || !imageFile) return;
      setLoading(true);
      setErrorMsg('');

      try {
        const form = new FormData();
        form.append('image', imageFile);
        form.append('mask', maskBlob, 'mask.png');

        const res = await fetch('/api/object-remover', {
          method: 'POST',
          body: form,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? t('error_generic'));
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setStep('result');
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : t('error_generic'));
      } finally {
        setLoading(false);
      }
    }, 'image/png');
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(t('upload_too_large'));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrorMsg(t('upload_invalid'));
      return;
    }
    setErrorMsg('');
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setStep('draw');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleEditAgain = () => {
    setResultUrl(null);
    setStep('draw');
    // Canvas will re-init on next render via useEffect
  };

  const handleNewImage = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setImageFile(null);
    setImageUrl(null);
    setResultUrl(null);
    setErrorMsg('');
    undoStack.current = [];
    setStep('upload');
  };

  // ---- RENDER ----

  if (step === 'upload') {
    return (
      <div className="space-y-4">
        <div
          className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="text-5xl mb-4">🖼️</div>
          <p className="text-base font-medium text-text-primary mb-2">
            {t('upload_label')}
          </p>
          <p className="text-sm text-text-secondary">{t('upload_hint')}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-400">{errorMsg}</p>
        )}
      </div>
    );
  }

  if (step === 'draw') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">{t('draw_hint')}</p>

        {/* Canvas area */}
        <div className="relative inline-block w-full rounded-xl overflow-hidden border border-border bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageUrl!}
            alt="Original"
            className="block w-full h-auto select-none"
            onLoad={initCanvas}
            draggable={false}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-50 cursor-crosshair touch-none"
            style={{ mixBlendMode: 'screen' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <label className="text-sm text-text-secondary whitespace-nowrap">
              {t('brush_size')}: {brushSize}px
            </label>
            <input
              type="range"
              min={10}
              max={80}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUndo}
              disabled={undoStack.current.length === 0}
              className="px-3 py-1.5 text-sm border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-primary transition-colors disabled:opacity-40"
            >
              {t('undo')}
            </button>
            <button
              onClick={handleResetMask}
              className="px-3 py-1.5 text-sm border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
            >
              {t('reset_mask')}
            </button>
          </div>
        </div>

        {errorMsg && (
          <p className="text-sm text-red-400">{errorMsg}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleNewImage}
            className="px-4 py-2.5 text-sm border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
          >
            {t('new_image')}
          </button>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="flex-1 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('removing') : t('remove_button')}
          </button>
        </div>
      </div>
    );
  }

  // step === 'result'
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">{t('result_title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">{t('before')}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl!}
            alt="Before"
            className="w-full rounded-xl border border-border"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">{t('after')}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl!}
            alt="After"
            className="w-full rounded-xl border border-border"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={resultUrl!}
          download="removed.png"
          className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          {t('download')}
        </a>
        <button
          onClick={handleEditAgain}
          className="px-4 py-2.5 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
        >
          {t('edit_again')}
        </button>
        <button
          onClick={handleNewImage}
          className="px-4 py-2.5 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
        >
          {t('new_image')}
        </button>
      </div>
    </div>
  );
}
