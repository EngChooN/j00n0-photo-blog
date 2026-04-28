import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ME_QUERY_KEY } from '@/hooks/queries/useMe';
import { clearAutoLogin } from '@/lib/loginPrefs';

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: true }>('/auth/logout'),
    onSuccess: () => {
      clearAutoLogin();
      queryClient.setQueryData(ME_QUERY_KEY, null);
    },
  });
}
