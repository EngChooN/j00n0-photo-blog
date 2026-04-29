'use client';

import { useLikeStatus } from '@/hooks/queries/useLikeStatus';
import { useToggleLike } from '@/hooks/mutations/useToggleLike';

type Props = {
  postId: string;
  initialLikeCount?: number;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 transition-transform duration-200 ease-editorial"
    >
      <path d="M12 21s-7-4.35-9.5-9C1.5 9 3 5 7 5c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 5.5 4 4.5 7-2.5 4.65-9.5 9-9.5 9z" />
    </svg>
  );
}

export function LikeButton({ postId, initialLikeCount = 0 }: Props) {
  const { data } = useLikeStatus(postId, initialLikeCount);
  const toggle = useToggleLike(postId);
  const liked = data?.liked ?? false;
  const count = data?.likeCount ?? initialLikeCount;

  return (
    <button
      type="button"
      onClick={() => toggle.mutate(liked)}
      disabled={toggle.isPending}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike this post' : 'Like this post'}
      className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] transition-colors ${
        liked ? 'text-white' : 'text-white/40 hover:text-white'
      }`}
    >
      <HeartIcon filled={liked} />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
