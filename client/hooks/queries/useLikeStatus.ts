import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { LikeStatus } from '@/lib/types';

export const LIKE_STATUS_QUERY_KEY = (postId: string) =>
  ['like-status', postId] as const;

export function useLikeStatus(postId: string, initialLikeCount = 0) {
  return useQuery<LikeStatus>({
    queryKey: LIKE_STATUS_QUERY_KEY(postId),
    queryFn: () => api.get<LikeStatus>(`/posts/${postId}/like`),
    // initialData is shown immediately to avoid a flash of empty count, but
    // initialDataUpdatedAt: 0 marks it as stale so React Query refetches on
    // mount to get the visitor's actual liked state and current total.
    initialData: { likeCount: initialLikeCount, liked: false },
    initialDataUpdatedAt: 0,
    staleTime: 1000 * 30,
  });
}
