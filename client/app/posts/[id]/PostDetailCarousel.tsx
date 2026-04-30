'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Carousel } from '@/components/molecules/Carousel';
import { LikeButton } from '@/components/atoms/LikeButton';
import { CommentsButton } from '@/components/atoms/CommentsButton';
import { ShareButton } from '@/components/atoms/ShareButton';
import { ExifLines } from '@/components/atoms/ExifLines';
import { CommentsModal } from '@/components/organisms/CommentsSection';
import { useFadeIn } from '@/hooks/useFadeIn';
import type { Post } from '@/lib/types';

type Props = {
  post: Post;
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

export function PostDetailCarousel({ post }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [shareLabel, setShareLabel] = useState<'Share' | 'Copied!' | 'Failed'>(
    'Share',
  );
  const [commentsOpen, setCommentsOpen] = useState(false);
  const visible = useFadeIn();
  const total = post.photos.length;

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

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  return (
    <div
      className={`fixed inset-0 z-50 overscroll-none bg-black text-white/90 transition-opacity duration-300 ease-editorial ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <section className="flex h-screen flex-col">
        <header className="relative z-10 flex flex-shrink-0 items-center gap-4 border-b border-white/10 px-6 py-5 md:gap-6 md:px-12">
          <span className="min-w-0 flex-1 truncate text-[10px] uppercase tracking-[0.3em] text-white/40">
            {total > 1
              ? `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
              : post.title}
          </span>
          <Link
            href="/"
            className="flex-shrink-0 text-[11px] uppercase tracking-[0.25em] text-white/50 transition-colors hover:text-white"
            aria-label="Back to journal"
          >
            ← Back
          </Link>
        </header>

        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 py-4 md:px-12 md:py-8">
          <Carousel
            photos={post.photos}
            index={index}
            onIndexChange={setIndex}
          />
        </div>

        {post.photos[index]?.exif && (
          <div className="relative z-10 flex-shrink-0 border-t border-white/10 px-6 py-2 md:px-12 md:py-3">
            <ExifLines exif={post.photos[index].exif} />
          </div>
        )}

        <footer className="relative z-10 max-h-[160px] flex-shrink-0 overflow-y-auto overscroll-contain border-t border-white/10 px-6 py-4 md:max-h-[240px] md:px-12 md:py-6">
          <div className="mx-auto max-w-[1100px] space-y-2">
            <h2 className="display text-xl leading-tight text-white md:text-3xl">
              {post.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/40">
              {post.location && <span>{post.location}</span>}
              {post.location && <span aria-hidden>·</span>}
              <span>{formatDate(post.takenAt || post.createdAt)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
              <LikeButton postId={post.id} initialLikeCount={post.likeCount} />
              <CommentsButton
                postId={post.id}
                onClick={() => setCommentsOpen(true)}
              />
              <ShareButton label={shareLabel} onClick={handleShare} />
            </div>
            {post.caption && (
              <p className="max-w-prose whitespace-pre-wrap pt-1 text-sm leading-relaxed text-white/70">
                {post.caption}
              </p>
            )}
          </div>
        </footer>
      </section>

      <CommentsModal
        postId={post.id}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </div>
  );
}
