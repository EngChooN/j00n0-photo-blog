import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { LoginInput } from '@/lib/validation';
import { ME_QUERY_KEY, type MeResponse } from '@/hooks/queries/useMe';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => api.post<MeResponse>('/auth/login', input),
    onSuccess: (data) => {
      queryClient.setQueryData(ME_QUERY_KEY, data);
    },
  });
}
