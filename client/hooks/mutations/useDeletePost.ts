import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { POSTS_QUERY_KEY } from '@/hooks/queries/usePosts';

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/posts/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
    },
  });
}
