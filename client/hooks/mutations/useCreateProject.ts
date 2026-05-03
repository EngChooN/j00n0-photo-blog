import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ProjectListItem } from '@/lib/types';
import type { ProjectFormInput } from '@/lib/validation';
import { PROJECTS_QUERY_KEY } from '@/hooks/queries/useProjects';

export type CreateProjectInput = ProjectFormInput & { coverImage?: File | null };

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput): Promise<ProjectListItem> => {
      const form = new FormData();
      form.append('title', input.title);
      if (input.concept) form.append('concept', input.concept);
      if (input.startDate) form.append('startDate', input.startDate);
      if (input.endDate) form.append('endDate', input.endDate);
      form.append('status', input.status);
      form.append('isPublic', String(input.isPublic));
      if (input.coverImage) form.append('coverImage', input.coverImage);
      return api.postForm<ProjectListItem>('/projects', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}
