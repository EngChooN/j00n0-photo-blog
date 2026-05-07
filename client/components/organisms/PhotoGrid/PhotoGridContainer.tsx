'use client';

import { usePosts } from '@/hooks/queries/usePosts';
import { PhotoGridPresenter } from './PhotoGridPresenter';

export function PhotoGridContainer() {
  const { data, isLoading } = usePosts();

  return <PhotoGridPresenter posts={data ?? []} isLoading={isLoading} />;
}
