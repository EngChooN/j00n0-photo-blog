'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Post } from '@/lib/types';
import { assetUrl } from '@/lib/api';
import { Carousel } from '@/components/molecules/Carousel';
import { useReveal } from '@/hooks/useReveal';

type Props = {
  post: Post;
  index: number;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onOpen?: (postIndex: number, photoIndex?: number) => void;
};

const layouts: { className: string; span: number }[] = [
  { className: 'col-span-12 md:col-span-8 md:col-start-3', span: 8 },
  { className: 'col-span-12 md:col-span-6 md:col-start-1', span: 6 },
  { className: 'col-span-12 md:col-span-5 md:col-start-7', span: 5 },
  { className: 'col-span-12 md:col-span-7 md:col-start-4', span: 7 },
  { className: 'col-span-12 md:col-span-4 md:col-start-2', span: 4 },
  { className: 'col-span-12 md:col-span-6 md:col-start-7', span: 6 },
];

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

export function PhotoCard({
  post,
  index,
  isAdmin,
  onDelete,
  onOpen,
}: Props) {
  const layout = layouts[index % layouts.length];
  const cover = post.photos[0];
  const photoCount = post.photos.length;
  const showCarousel = photoCount > 1 && layout.span >= 6;
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const coverImgRef = useRef<HTMLImageElement | null>(null);
  const [revealRef, revealed] = useReveal<HTMLElement>();

  useEffect(() => {
    const img = coverImgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setCoverLoaded(true);
    }
  }, []);

  if (!cover) return null;

  const articleClass = [
    'group',
    layout.className,
    'transition-[opacity,transform] duration-700 ease-editorial',
    revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
  ].join(' ');

  const figcaption = (
    <figcaption className="flex flex-col gap-2 px-1 md:flex-row md:items-baseline md:justify-between">
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
            No. {String(index + 1).padStart(2, '0')}
          </span>
          {post.location && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
              · {post.location}
            </span>
          )}
        </div>
        <h2 className="display text-xl leading-tight md:text-3xl">
          {post.title}
        </h2>
        {post.caption && (
          <p className="max-w-prose text-sm leading-relaxed text-ink/70">
            {post.caption}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
          {formatDate(post.takenAt || post.createdAt)}
        </span>
        {isAdmin && (
          <Link
            href={`/admin/edit/${post.id}`}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[10px] uppercase tracking-[0.3em] text-muted underline-offset-4 hover:text-ink hover:underline md:min-h-0 md:min-w-0"
          >
            Edit
          </Link>
        )}
        {isAdmin && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(post.id)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[10px] uppercase tracking-[0.3em] text-muted underline-offset-4 hover:text-ink hover:underline md:min-h-0 md:min-w-0"
          >
            Delete
          </button>
        )}
      </div>
    </figcaption>
  );

  if (showCarousel) {
    return (
      <article ref={revealRef} className={articleClass}>
        <figure className="space-y-5">
          <div className="bg-line/40">
            <Carousel
              photos={post.photos}
              index={carouselIndex}
              onIndexChange={setCarouselIndex}
              variant="light"
              onSlideClick={(photoIdx) => onOpen?.(index, photoIdx)}
            />
          </div>
          {figcaption}
        </figure>
      </article>
    );
  }

  return (
    <article ref={revealRef} className={articleClass}>
      <figure className="space-y-5">
        <button
          type="button"
          onClick={() => onOpen?.(index, 0)}
          aria-label={`Open ${post.title}`}
          className="relative block w-full overflow-hidden bg-line/40 cursor-zoom-in"
        >
          <div
            className={`transition-opacity duration-500 ease-editorial ${
              coverLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={coverImgRef}
              src={assetUrl(cover.src)}
              alt={post.title}
              width={cover.width}
              height={cover.height}
              className="h-auto w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.01]"
              loading="lazy"
              onLoad={() => setCoverLoaded(true)}
              onError={() => setCoverLoaded(true)}
            />
          </div>
          {photoCount > 1 && (
            <span className="absolute bottom-2 right-2 bg-ink/40 px-[6px] py-[3px] text-[10px] uppercase tracking-[0.2em] text-paper/80">
              1 / {photoCount}
            </span>
          )}
        </button>
        {figcaption}
      </figure>
    </article>
  );
}
