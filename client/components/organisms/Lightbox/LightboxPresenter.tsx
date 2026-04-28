'use client';

import type { Post } from '@/lib/types';
import { Carousel } from '@/components/molecules/Carousel';
import { useFadeIn } from '@/hooks/useFadeIn';

type Props = {
  post: Post;
  photoIndex: number;
  onClose: () => void;
  onPhotoIndexChange: (index: number) => void;
};

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date
    .toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    .toUpperCase();
}

export function LightboxPresenter({
  post,
  photoIndex,
  onClose,
  onPhotoIndexChange,
}: Props) {
  const total = post.photos.length;
  const visible = useFadeIn();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
      className={`fixed inset-0 z-50 flex flex-col overscroll-none bg-black text-white/90 transition-opacity duration-300 ease-editorial ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden />

      <header className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-12">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
          {total > 1
            ? `${String(photoIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
            : post.title}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] uppercase tracking-[0.25em] text-white/50 transition-colors hover:text-white"
          aria-label="Close"
        >
          Close ✕
        </button>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-6 py-8 md:px-12">
        <Carousel
          photos={post.photos}
          index={photoIndex}
          onIndexChange={onPhotoIndexChange}
        />
      </div>

      <footer className="relative z-10 max-h-[150px] flex-shrink-0 overflow-y-auto overscroll-contain border-t border-white/10 px-6 py-6 md:max-h-[200px] md:px-12">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <div className="space-y-1">
            <h2 className="display text-xl leading-tight text-white md:text-3xl">
              {post.title}
            </h2>
            {post.caption && (
              <p className="max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                {post.caption}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[10px] uppercase tracking-[0.3em] text-white/40">
            {post.location && <span>{post.location}</span>}
            <span>{formatDate(post.takenAt || post.createdAt)}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
