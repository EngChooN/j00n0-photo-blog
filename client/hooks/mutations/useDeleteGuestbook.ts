import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { GUESTBOOK_QUERY_KEY } from '@/hooks/queries/useGuestbook';

export function useDeleteGuestbook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/guestbook/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUESTBOOK_QUERY_KEY });
    },
  });
}
