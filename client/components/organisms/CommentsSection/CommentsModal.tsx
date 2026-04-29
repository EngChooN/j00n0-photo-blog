'use client';

import { useEffect, useState } from 'react';
import { CommentsSection } from './CommentsSection';

type Props = {
  postId: string;
  open: boolean;
  onClose: () => void;
};

export function CommentsModal({ postId, open, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comments"
      className="fixed inset-0 z-[60]"
    >
      <button
        type="button"
        aria-label="Close comments"
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ease-editorial ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col overscroll-contain bg-black text-white/90 transition-transform duration-300 ease-editorial ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-6 py-5 md:px-8">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            Comments
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[11px] uppercase tracking-[0.25em] text-white/50 transition-colors hover:text-white"
          >
            Close ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <CommentsSection postId={postId} />
        </div>
      </aside>
    </div>
  );
}
