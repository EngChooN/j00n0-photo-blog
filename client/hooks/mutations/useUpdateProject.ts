import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ProjectListItem } from '@/lib/types';
import type { ProjectFormInput } from '@/lib/validation';
import { PROJECTS_QUERY_KEY } from '@/hooks/queries/useProjects';
import { projectQueryKey } from '@/hooks/queries/useProject';

export type UpdateProjectInput = ProjectFormInput & {
  id: string;
  coverImage?: File | null;
  clearCover?: boolean;
};

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      coverImage,
      clearCover,
      ...values
    }: UpdateProjectInput): Promise<ProjectListItem> => {
      const form = new FormData();
      form.append('title', values.title);
      form.append('concept', values.concept ?? '');
      form.append('startDate', values.startDate ?? '');
      form.append('endDate', values.endDate ?? '');
      form.append('status', values.status);
      form.append('isPublic', String(values.isPublic));
      if (coverImage) form.append('coverImage', coverImage);
      else if (clearCover) form.append('clearCover', 'true');
      return api.patchForm<ProjectListItem>(`/projects/${id}`, form);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: projectQueryKey(updated.id) });
    },
  });
}
