'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Carousel } from '@/components/molecules/Carousel';
import { LikeButton } from '@/components/atoms/LikeButton';
import { CommentsButton } from '@/components/atoms/CommentsButton';
import { ShareButton } from '@/components/atoms/ShareButton';
import { ExifLines } from '@/components/atoms/ExifLines';
import { CommentsSection } from '@/components/organisms/CommentsSection';
import type { Post } from '@/lib/types';

type Props = {
  post: Post;
};

const PEEK_H = 180;

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

export function PostDetailCarousel({ post }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromProjectId = searchParams.get('fromProject');
  // Only honor ?fromProject=xxx if the post actually belongs to that project —
  // otherwise the URL is stale or tampered, fall back to plain Back.
  const backToProject =
    fromProjectId && post.project?.id === fromProjectId ? post.project : null;
  const backHref = backToProject ? `/projects/${backToProject.id}` : '/';
  const backLabel = backToProject
    ? `← ${backToProject.title}`
    : '← Back';

  const [index, setIndex] = useState(0);
  const [shareLabel, setShareLabel] = useState<'Share' | 'Copied!' | 'Failed'>(
    'Share',
  );
  const [maxH, setMaxH] = useState(640);
  const [height, setHeight] = useState(PEEK_H);
  const [dragging, setDragging] = useState(false);
  const total = post.photos.length;
  const currentPhoto = post.photos[index];

  const startY = useRef(0);
  const baseHeight = useRef(PEEK_H);
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calc = () =>
      setMaxH(Math.min(Math.round(window.innerHeight * 0.7), 640));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (height > PEEK_H) setHeight(PEEK_H);
        else router.push(backHref);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, height, backHref]);

  const toggle = () =>
    setHeight((h) => (h > (PEEK_H + maxH) / 2 ? PEEK_H : maxH));

  const onHandlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return; // mouse → handled on pointer up
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    baseHeight.current = height;
    setDragging(true);
  };

  const onHandlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientY - startY.current;
    const newH = Math.max(
      PEEK_H,
      Math.min(maxH, baseHeight.current - delta),
    );
    setHeight(newH);
  };

  const onHandlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') {
      toggle();
      return;
    }
    if (!dragging) return;
    setDragging(false);
    const totalDelta = e.clientY - startY.current;
    const abs = Math.abs(totalDelta);
    if (abs < 5) {
      toggle(); // tap
    } else if (abs > 50) {
      setHeight(totalDelta < 0 ? maxH : PEEK_H); // committed swipe
    } else {
      setHeight(baseHeight.current); // ambiguous → snap back
    }
  };

  const onHandleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  const openComments = () => {
    setHeight(maxH);
    // Wait for the sheet expand transition (300ms) before scrolling so the
    // target row is actually inside the visible viewport.
    setTimeout(() => {
      commentsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 320);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const description = post.caption?.slice(0, 160) || undefined;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: description, url });
        return;
      } catch {
        // user cancelled or share failed; fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareLabel('Copied!');
    } catch {
      setShareLabel('Failed');
    }
    setTimeout(() => setShareLabel('Share'), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white/90">
      <header className="relative z-10 flex flex-shrink-0 items-center justify-between border-b border-white/10 px-6 py-4 md:px-12">
        <Link
          href={backHref}
          className="text-[11px] uppercase tracking-[0.25em] text-white/50 transition-colors hover:text-white"
        >
          {backLabel}
        </Link>
        {total > 1 && (
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            {String(index + 1).padStart(2, '0')} /{' '}
            {String(total).padStart(2, '0')}
          </span>
        )}
      </header>

      <div className="relative z-0 flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <Carousel
          photos={post.photos}
          index={index}
          onIndexChange={setIndex}
        />
      </div>

      {currentPhoto?.exif && (
        <div className="relative z-10 flex-shrink-0 border-t border-white/10 px-6 py-2 md:px-12 md:py-3">
          <ExifLines exif={currentPhoto.exif} />
        </div>
      )}

      <div
        className={`relative z-20 flex flex-shrink-0 flex-col border-t border-white/10 bg-black ${
          dragging ? '' : 'transition-[height] duration-300 ease-editorial'
        }`}
        style={{ height: `${height}px` }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={height > PEEK_H ? '글 접기' : '글 펼치기'}
          aria-expanded={height > (PEEK_H + maxH) / 2}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onKeyDown={onHandleKeyDown}
          className="flex flex-shrink-0 cursor-grab touch-none select-none items-center justify-center py-3 text-white/40 transition-colors hover:text-white active:cursor-grabbing"
        >
          <span className="block h-1 w-10 rounded-full bg-white/30 transition-colors hover:bg-white/60" />
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6 md:px-12">
          <div className="mx-auto max-w-[900px] space-y-3">
            <h1 className="display text-xl leading-tight text-white md:text-3xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/40">
              {post.location && <span>{post.location}</span>}
              {post.location && <span aria-hidden>·</span>}
              <span>{formatDate(post.takenAt || post.createdAt)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-[10px] uppercase tracking-[0.3em] text-white/40">
              <LikeButton postId={post.id} initialLikeCount={post.likeCount} />
              <CommentsButton postId={post.id} onClick={openComments} />
              <ShareButton label={shareLabel} onClick={handleShare} />
            </div>
            {post.caption && (
              <p className="whitespace-pre-wrap pt-2 text-sm leading-relaxed text-white/80 md:text-base">
                {post.caption}
              </p>
            )}

            <div ref={commentsRef} className="border-t border-white/10 pt-4">
              <CommentsSection postId={post.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
