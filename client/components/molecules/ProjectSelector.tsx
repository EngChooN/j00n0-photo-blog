'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ProjectListItem } from '@/lib/types';
import { Label } from '@/components/atoms/Label';

type Props = {
  value: string;
  onChange: (value: string) => void;
  projects: ProjectListItem[];
  isLoading?: boolean;
};

export function ProjectSelector({
  value,
  onChange,
  projects,
  isLoading,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = value
    ? projects.find((p) => p.id === value)
    : null;

  return (
    <div className="space-y-2">
      <Label>Project (optional)</Label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex w-full items-center justify-between border-b border-line bg-transparent py-3 text-left text-sm transition-colors focus:border-ink focus:outline-none"
        >
          <span className={selected ? 'text-ink' : 'text-muted/60'}>
            {selected ? selected.title : '— 해당 없음'}
          </span>
          <span aria-hidden className="text-[10px] text-muted">
            {open ? '▲' : '▼'}
          </span>
        </button>
        {open && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-auto border border-line bg-paper shadow-lg"
          >
            <li>
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className={[
                  'flex w-full items-center px-4 py-3 text-left text-sm transition-colors hover:bg-line/30',
                  value === '' ? 'text-ink' : 'text-muted/70',
                ].join(' ')}
              >
                — 해당 없음
              </button>
            </li>
            {isLoading ? (
              <li className="px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-muted">
                Loading…
              </li>
            ) : projects.length === 0 ? (
              <li className="px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-muted">
                프로젝트가 아직 없어요
              </li>
            ) : (
              projects.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(p.id);
                      setOpen(false);
                    }}
                    className={[
                      'flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-line/30',
                      value === p.id ? 'text-ink' : 'text-ink/80',
                    ].join(' ')}
                  >
                    <span className="truncate">{p.title}</span>
                    {!p.isPublic && (
                      <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
                        Private
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <Link
        href="/admin/projects/new"
        className="inline-block text-[10px] uppercase tracking-[0.3em] text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        + 새 프로젝트 만들기
      </Link>
    </div>
  );
}
