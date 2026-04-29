import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { LikeStatus } from '@/lib/types';
import { LIKE_STATUS_QUERY_KEY } from '@/hooks/queries/useLikeStatus';

export function useToggleLike(postId: string) {
  const queryClient = useQueryClient();
  const key = LIKE_STATUS_QUERY_KEY(postId);

  return useMutation({
    mutationFn: async (currentlyLiked: boolean): Promise<LikeStatus> => {
      if (currentlyLiked) {
        return api.delete<LikeStatus>(`/posts/${postId}/like`);
      }
      return api.post<LikeStatus>(`/posts/${postId}/like`);
    },
    onMutate: async (currentlyLiked) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<LikeStatus>(key);
      if (previous) {
        queryClient.setQueryData<LikeStatus>(key, {
          liked: !currentlyLiked,
          likeCount: Math.max(
            0,
            previous.likeCount + (currentlyLiked ? -1 : 1),
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(key, data);
    },
  });
}
