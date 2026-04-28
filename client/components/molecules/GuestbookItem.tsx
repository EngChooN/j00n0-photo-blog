'use client';

import type { GuestbookEntry } from '@/lib/types';

type Props = {
  entry: GuestbookEntry;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d
    .toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase();
}

export function GuestbookItem({ entry, showDelete, onDelete }: Props) {
  return (
    <article className="grid grid-cols-12 gap-6 border-t border-line py-8">
      <div className="col-span-12 md:col-span-3">
        <p className="display text-xl leading-tight">{entry.name}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted">
          {formatDate(entry.createdAt)}
        </p>
      </div>
      <div className="col-span-12 md:col-span-8">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/85">
          {entry.message}
        </p>
      </div>
      <div className="col-span-12 md:col-span-1 md:text-right">
        {showDelete && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="text-[10px] uppercase tracking-[0.3em] text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
