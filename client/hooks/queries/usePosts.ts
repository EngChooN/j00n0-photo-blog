import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Post } from '@/lib/types';

export const POSTS_QUERY_KEY = ['posts'] as const;

export function usePosts() {
  return useQuery<Post[]>({
    queryKey: POSTS_QUERY_KEY,
    queryFn: () => api.get<Post[]>('/posts'),
    staleTime: 1000 * 30,
  });
}
