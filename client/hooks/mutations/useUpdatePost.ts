import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Post } from '@/lib/types';
import type { PostMetadataInput } from '@/lib/validation';
import { POSTS_QUERY_KEY } from '@/hooks/queries/usePosts';

export type UpdatePostInput = PostMetadataInput & {
  id: string;
  addedFiles: File[];
  removedPhotoIds: string[];
};

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      addedFiles,
      removedPhotoIds,
      ...metadata
    }: UpdatePostInput): Promise<Post> => {
      const form = new FormData();
      form.append('title', metadata.title);
      form.append('caption', metadata.caption ?? '');
      form.append('location', metadata.location ?? '');
      form.append('takenAt', metadata.takenAt ?? '');
      // "" clears the assignment server-side, "<id>" sets it.
      form.append('projectId', metadata.projectId ?? '');
      addedFiles.forEach((file) => form.append('addedFiles', file));
      removedPhotoIds.forEach((photoId) =>
        form.append('removedPhotoIds', photoId),
      );
      return api.patchForm<Post>(`/posts/${id}`, form);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Post[]>(POSTS_QUERY_KEY, (old) =>
        old?.map((p) => (p.id === updated.id ? updated : p)) ?? [updated],
      );
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      // Project membership may have changed — bust both summary and detail.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
