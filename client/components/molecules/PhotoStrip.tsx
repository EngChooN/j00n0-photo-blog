'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Photo } from '@/lib/types';
import { assetUrl } from '@/lib/api';

type Props = {
  existing: Photo[];
  newPreviews: string[];
  onRemoveExisting: (id: string) => void;
  onRemoveNew: (index: number) => void;
  onAddFiles: (files: File[]) => void;
};

export function PhotoStrip({
  existing,
  newPreviews,
  onRemoveExisting,
  onRemoveNew,
  onAddFiles,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    if (!previewSrc) {
      setPreviewVisible(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewSrc(null);
    };
    window.addEventListener('keydown', onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = requestAnimationFrame(() => setPreviewVisible(true));
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = original;
    };
  }, [previewSrc]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {existing.map((photo) => {
          const url = assetUrl(photo.src);
          return (
            <div
              key={photo.id}
              className="relative h-32 w-32 overflow-hidden border border-line bg-line/30 md:h-48 md:w-48"
            >
              <button
                type="button"
                onClick={() => setPreviewSrc(url)}
                aria-label="Preview photo"
                className="block h-full w-full cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
              <button
                type="button"
                onClick={() => onRemoveExisting(photo.id)}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center bg-ink text-[12px] text-paper hover:bg-ink/80 md:h-6 md:w-6"
              >
                ×
              </button>
            </div>
          );
        })}
        {newPreviews.map((url, index) => (
          <div
            key={url}
            className="relative h-32 w-32 overflow-hidden border border-ink/40 bg-line/30 md:h-48 md:w-48"
          >
            <button
              type="button"
              onClick={() => setPreviewSrc(url)}
              aria-label="Preview photo"
              className="block h-full w-full cursor-zoom-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
            <button
              type="button"
              onClick={() => onRemoveNew(index)}
              aria-label="Remove photo"
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center bg-ink text-[12px] text-paper hover:bg-ink/80 md:h-6 md:w-6"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-32 items-center justify-center border border-dashed border-ink/40 text-[10px] uppercase tracking-[0.2em] text-muted hover:border-ink hover:text-ink md:h-48 md:w-48"
        >
          + Add
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const list = e.target.files;
          if (!list || list.length === 0) return;
          onAddFiles(Array.from(list));
          e.target.value = '';
        }}
      />

      {previewSrc &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Photo preview"
            className={`fixed inset-0 z-50 flex flex-col bg-black text-white/90 transition-opacity duration-300 ease-editorial ${
              previewVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <header className="relative z-10 flex items-center justify-end border-b border-white/10 px-6 py-5 md:px-12">
              <button
                type="button"
                onClick={() => setPreviewSrc(null)}
                aria-label="Close preview"
                className="text-[11px] uppercase tracking-[0.25em] text-white/50 transition-colors hover:text-white"
              >
                Close ✕
              </button>
            </header>
            <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-8 md:px-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt=""
                className="max-h-[calc(100vh-10rem)] max-w-full object-contain"
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
