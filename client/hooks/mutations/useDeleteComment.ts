import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Comment } from '@/lib/types';
import { COMMENTS_QUERY_KEY } from '@/hooks/queries/useComments';

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/comments/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Comment[]>(
        COMMENTS_QUERY_KEY(postId),
        (old) => (old ?? []).filter((c) => c.id !== id),
      );
    },
  });
}
