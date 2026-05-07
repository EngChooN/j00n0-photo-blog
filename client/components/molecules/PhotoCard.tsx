'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Post } from '@/lib/types';
import { assetUrl } from '@/lib/api';
import { useReveal } from '@/hooks/useReveal';

type Props = {
  post: Post;
  index: number;
  displayNumber: number;
  hideProjectLabel?: boolean;
  projectIndexLabel?: string;
  backToProjectId?: string;
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

// Outline-only — LikeButton owns the filled variant on the detail sheet.
function HeartIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <path d="M12 21s-7-4.35-9.5-9C1.5 9 3 5 7 5c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 5.5 4 4.5 7-2.5 4.65-9.5 9-9.5 9z" />
    </svg>
  );
}

function SpeechBubbleIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function PhotoCard({
  post,
  index,
  displayNumber,
  hideProjectLabel,
  projectIndexLabel,
  backToProjectId,
}: Props) {
  const layout = layouts[index % layouts.length];
  const cover = post.photos[0];
  const photoCount = post.photos.length;
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

  const href = backToProjectId
    ? `/posts/${post.id}?fromProject=${backToProjectId}`
    : `/posts/${post.id}`;
  const numberLabel = projectIndexLabel
    ? projectIndexLabel
    : `No. ${String(displayNumber).padStart(2, '0')}`;

  const articleClass = [
    'group',
    'relative',
    layout.className,
    'transition-[opacity,transform] duration-700 ease-editorial',
    revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
  ].join(' ');

  return (
    <article ref={revealRef} className={articleClass}>
      <figure className="space-y-5">
        <div className="relative w-full overflow-hidden bg-line/40">
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
              className="h-auto w-full object-cover transition-all duration-700 ease-editorial group-hover:scale-[1.01] group-hover:brightness-95"
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
        </div>
        <figcaption className="flex flex-col gap-2 px-1">
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
                {numberLabel}
              </span>
              {post.location && (
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
                  · {post.location}
                </span>
              )}
              {!hideProjectLabel && post.project && (
                <span className="relative z-10 inline-block max-w-[12ch] truncate text-[10px] uppercase tracking-[0.3em] text-muted">
                  ·{' '}
                  <Link
                    href={`/projects/${post.project.id}`}
                    className="underline-offset-4 hover:text-ink hover:underline"
                  >
                    {post.project.title}
                  </Link>
                </span>
              )}
            </div>
            <div className="inline-flex items-baseline gap-3">
              <h2 className="display text-xl leading-tight transition-colors duration-200 ease-editorial group-hover:text-ink/100 md:text-3xl">
                {post.title}
              </h2>
              <span
                aria-hidden
                className="text-base text-muted transition-transform duration-300 ease-editorial group-hover:translate-x-1 md:text-xl"
              >
                →
              </span>
            </div>
            {post.caption && (
              <p className="max-w-prose text-sm leading-relaxed text-ink/70 transition-colors duration-200 ease-editorial group-hover:text-ink/85">
                {post.caption}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
              {formatDate(post.takenAt || post.createdAt)}
            </span>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-muted/60 tabular-nums">
              <span className="inline-flex items-center gap-1">
                <HeartIcon />
                <span>{post.likeCount}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpeechBubbleIcon />
                <span>{post.commentCount}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <EyeIcon />
                <span>{post.viewCount}</span>
              </span>
            </div>
          </div>
        </figcaption>
      </figure>
      <Link
        href={href}
        aria-label={`Open ${post.title}`}
        className="absolute inset-0 cursor-pointer"
      >
        <span className="sr-only">{post.title}</span>
      </Link>
    </article>
  );
}
