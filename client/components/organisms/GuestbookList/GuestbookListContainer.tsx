'use client';

import { useGuestbook } from '@/hooks/queries/useGuestbook';
import { useDeleteGuestbook } from '@/hooks/mutations/useDeleteGuestbook';
import { useMe } from '@/hooks/queries/useMe';
import { GuestbookListPresenter } from './GuestbookListPresenter';

export function GuestbookListContainer() {
  const { data, isLoading } = useGuestbook();
  const remove = useDeleteGuestbook();
  const { data: me } = useMe();
  const isAdmin = me?.role === 'admin';

  return (
    <GuestbookListPresenter
      entries={data ?? []}
      isLoading={isLoading}
      isAdmin={isAdmin}
      onDelete={(id) => {
        if (window.confirm('이 메시지를 삭제할까요?')) {
          remove.mutate(id);
        }
      }}
    />
  );
}
