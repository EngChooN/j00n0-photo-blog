'use client';

import type { GuestbookEntry } from '@/lib/types';
import { GuestbookItem } from '@/components/molecules/GuestbookItem';
import { EmptyState } from '@/components/molecules/EmptyState';

type Props = {
  entries: GuestbookEntry[];
  isLoading: boolean;
  isAdmin: boolean;
  onDelete: (id: string) => void;
};

export function GuestbookListPresenter({
  entries,
  isLoading,
  isAdmin,
  onDelete,
}: Props) {
  if (isLoading) {
    return (
      <div className="py-24 text-center text-[10px] uppercase tracking-[0.3em] text-muted">
        Loading…
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <EmptyState
        title="아직 남겨진 메시지가 없어요."
        description="첫 메시지를 남겨주세요."
      />
    );
  }
  return (
    <div>
      {entries.map((entry) => (
        <GuestbookItem
          key={entry.id}
          entry={entry}
          showDelete={isAdmin}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
