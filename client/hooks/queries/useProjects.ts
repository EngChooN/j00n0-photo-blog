import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ProjectListItem } from '@/lib/types';

export const PROJECTS_QUERY_KEY = ['projects'] as const;

export function useProjects() {
  return useQuery<ProjectListItem[]>({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: () => api.get<ProjectListItem[]>('/projects'),
    staleTime: 1000 * 60 * 5,
  });
}
