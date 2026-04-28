'use client';

import { usePosts } from '@/hooks/queries/usePosts';
import { useDeletePost } from '@/hooks/mutations/useDeletePost';
import { useMe } from '@/hooks/queries/useMe';
import { useLightboxStore } from '@/stores/lightboxStore';
import { PhotoGridPresenter } from './PhotoGridPresenter';

export function PhotoGridContainer() {
  const { data, isLoading } = usePosts();
  const remove = useDeletePost();
  const { data: me } = useMe();
  const openLightbox = useLightboxStore((s) => s.open);
  const isAdmin = me?.role === 'admin';

  return (
    <PhotoGridPresenter
      posts={data ?? []}
      isLoading={isLoading}
      isAdmin={isAdmin}
      onDelete={(id) => {
        if (window.confirm('이 게시글을 삭제할까요?')) {
          remove.mutate(id);
        }
      }}
      onOpen={(postIndex, photoIndex = 0) => openLightbox(postIndex, photoIndex)}
    />
  );
}
