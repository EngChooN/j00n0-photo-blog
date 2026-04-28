import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GuestbookEntry } from '@/lib/types';
import { GUESTBOOK_QUERY_KEY } from '@/hooks/queries/useGuestbook';
import type { GuestbookInput } from '@/lib/validation';

export function useAddGuestbook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GuestbookInput) =>
      api.post<GuestbookEntry>('/guestbook', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUESTBOOK_QUERY_KEY });
    },
  });
}
