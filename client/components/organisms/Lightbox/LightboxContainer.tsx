'use client';

import { useEffect } from 'react';
import { usePosts } from '@/hooks/queries/usePosts';
import { useLightboxStore } from '@/stores/lightboxStore';
import { LightboxPresenter } from './LightboxPresenter';

export function LightboxContainer() {
  const { data: posts } = usePosts();
  const isOpen = useLightboxStore((s) => s.isOpen);
  const postIndex = useLightboxStore((s) => s.postIndex);
  const photoIndex = useLightboxStore((s) => s.photoIndex);
  const close = useLightboxStore((s) => s.close);
  const setPhotoIndex = useLightboxStore((s) => s.setPhotoIndex);

  const post = isOpen && posts ? posts[postIndex] : null;
  const safePhotoIndex = post
    ? Math.min(Math.max(photoIndex, 0), post.photos.length - 1)
    : 0;

  useEffect(() => {
    if (isOpen && posts && !posts[postIndex]) close();
  }, [isOpen, posts, postIndex, close]);

  useEffect(() => {
    if (!isOpen || !post) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft' && safePhotoIndex > 0)
        setPhotoIndex(safePhotoIndex - 1);
      if (e.key === 'ArrowRight' && safePhotoIndex < post.photos.length - 1)
        setPhotoIndex(safePhotoIndex + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, post, safePhotoIndex, close, setPhotoIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!post) return null;

  return (
    <LightboxPresenter
      post={post}
      photoIndex={safePhotoIndex}
      onClose={close}
      onPhotoIndexChange={setPhotoIndex}
    />
  );
}
