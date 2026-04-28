import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';

export type MeResponse = { username: string; role: 'admin' };

export const ME_QUERY_KEY = ['me'] as const;

export function useMe() {
  return useQuery<MeResponse | null>({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      try {
        return await api.get<MeResponse>('/auth/me');
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 1000 * 60,
    retry: false,
  });
}
