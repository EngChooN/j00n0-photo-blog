'use client';

import type { Post } from '@/lib/types';
import { PhotoCard } from '@/components/molecules/PhotoCard';
import { EmptyState } from '@/components/molecules/EmptyState';

type Props = {
  posts: Post[];
  isLoading: boolean;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  hideProjectLabel?: boolean;
  getProjectIndexLabel?: (postId: string, index: number) => string;
  backToProjectId?: string;
};

export function PhotoGridPresenter({
  posts,
  isLoading,
  isAdmin,
  onDelete,
  hideProjectLabel,
  getProjectIndexLabel,
  backToProjectId,
}: Props) {
  if (isLoading) {
    return (
      <div className="py-32 text-center text-[10px] uppercase tracking-[0.3em] text-muted">
        Loading…
      </div>
    );
  }
  if (posts.length === 0) {
    return (
      <EmptyState
        title="No photographs yet."
        description="첫 사진을 올리면 이곳에 매거진처럼 펼쳐집니다."
      />
    );
  }
  const total = posts.length;
  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-12 md:gap-y-24">
      {posts.map((post, index) => (
        <PhotoCard
          key={post.id}
          post={post}
          index={index}
          displayNumber={total - index}
          isAdmin={isAdmin}
          onDelete={onDelete}
          hideProjectLabel={hideProjectLabel}
          projectIndexLabel={getProjectIndexLabel?.(post.id, index)}
          backToProjectId={backToProjectId}
        />
      ))}
    </div>
  );
}
