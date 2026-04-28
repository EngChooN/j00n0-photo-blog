import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GuestbookEntry } from '@/lib/types';

export const GUESTBOOK_QUERY_KEY = ['guestbook'] as const;

export function useGuestbook() {
  return useQuery<GuestbookEntry[]>({
    queryKey: GUESTBOOK_QUERY_KEY,
    queryFn: () => api.get<GuestbookEntry[]>('/guestbook'),
    staleTime: 1000 * 30,
  });
}
