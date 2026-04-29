import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Comment } from '@/lib/types';
import type { CommentInput } from '@/lib/validation';
import { COMMENTS_QUERY_KEY } from '@/hooks/queries/useComments';

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CommentInput) =>
      api.post<Comment>(`/posts/${postId}/comments`, input),
    onSuccess: (created) => {
      queryClient.setQueryData<Comment[]>(
        COMMENTS_QUERY_KEY(postId),
        (old) => [...(old ?? []), created],
      );
    },
  });
}
