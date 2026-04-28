import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Post } from '@/lib/types';
import { POSTS_QUERY_KEY } from './usePosts';

export function useGetPost(id: string | undefined) {
  return useQuery({
    queryKey: POSTS_QUERY_KEY,
    queryFn: () => api.get<Post[]>('/posts'),
    staleTime: 1000 * 30,
    enabled: !!id,
    select: (posts) => posts.find((p) => p.id === id),
  });
}
