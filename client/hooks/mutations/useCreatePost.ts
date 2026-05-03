import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Post } from '@/lib/types';
import type { PostMetadataInput } from '@/lib/validation';
import { POSTS_QUERY_KEY } from '@/hooks/queries/usePosts';

export type CreatePostInput = PostMetadataInput & { files: File[] };

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePostInput): Promise<Post> => {
      const form = new FormData();
      form.append('title', input.title);
      if (input.caption) form.append('caption', input.caption);
      if (input.location) form.append('location', input.location);
      if (input.takenAt) form.append('takenAt', input.takenAt);
      if (input.projectId) form.append('projectId', input.projectId);
      input.files.forEach((file) => form.append('files', file));
      return api.postForm<Post>('/posts', form);
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      if (created.project) {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({
          queryKey: ['projects', created.project.id],
        });
      }
    },
  });
}
