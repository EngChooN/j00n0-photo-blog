'use client';

import { useComments } from '@/hooks/queries/useComments';

type Props = {
  postId: string;
  onClick: () => void;
};

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
      className="h-3.5 w-3.5"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function CommentsButton({ postId, onClick }: Props) {
  const { data } = useComments(postId);
  const count = data?.length ?? 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Comments (${count})`}
      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-white/40 underline-offset-4 transition-colors hover:text-white hover:underline"
    >
      <SpeechBubbleIcon />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
