import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PROJECTS_QUERY_KEY } from '@/hooks/queries/useProjects';
import { POSTS_QUERY_KEY } from '@/hooks/queries/usePosts';

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ ok: true }>(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      // Posts that belonged to the project now have project: null.
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
    },
  });
}
