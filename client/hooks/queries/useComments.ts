import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Comment } from '@/lib/types';

export const COMMENTS_QUERY_KEY = (postId: string) =>
  ['comments', postId] as const;

export function useComments(postId: string) {
  return useQuery<Comment[]>({
    queryKey: COMMENTS_QUERY_KEY(postId),
    queryFn: () => api.get<Comment[]>(`/posts/${postId}/comments`),
    staleTime: 1000 * 30,
  });
}
