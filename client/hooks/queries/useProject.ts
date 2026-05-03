import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ProjectDetail } from '@/lib/types';

export const projectQueryKey = (id: string) => ['projects', id] as const;

export function useProject(id: string) {
  return useQuery<ProjectDetail>({
    queryKey: projectQueryKey(id),
    queryFn: () => api.get<ProjectDetail>(`/projects/${id}`),
    staleTime: 1000 * 30,
    enabled: Boolean(id),
  });
}
