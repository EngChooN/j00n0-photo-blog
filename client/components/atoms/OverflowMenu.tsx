'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export type OverflowMenuItem = {
  label: string;
  destructive?: boolean;
} & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void }
);

type Props = {
  items: OverflowMenuItem[];
  variant?: 'dark' | 'light';
  ariaLabel?: string;
};

function MeatballIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-3.5 w-3.5"
    >
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

export function OverflowMenu({
  items,
  variant = 'dark',
  ariaLabel = 'More actions',
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(
    null,
  );

  // Close on outside click + Escape. Capture phase + stopImmediatePropagation
  // prevents the carousel's window-level Escape handler from also firing
  // (which would collapse the peek sheet when the user just wanted to close
  // the menu).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      // Ignore events on nodes that were detached before the handler ran.
      if (!target || !document.contains(target)) return;
      if (!containerRef.current?.contains(target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey, true);
    firstItemRef.current?.focus();
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey, true);
      firstItemRef.current = null;
    };
  }, [open]);

  const triggerColor =
    variant === 'dark'
      ? 'text-white/40 hover:text-white'
      : 'text-muted hover:text-ink';
  const surface =
    variant === 'dark'
      ? 'bg-zinc-900/95 border-white/10'
      : 'bg-paper border-line';
  const itemHover =
    variant === 'dark'
      ? 'hover:bg-white/10 focus-visible:bg-white/10'
      : 'hover:bg-line/50 focus-visible:bg-line/50';
  const itemColor = variant === 'dark' ? 'text-white/85' : 'text-ink';
  const destructiveColor =
    variant === 'dark' ? 'text-red-300' : 'text-red-600';

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center transition-colors ${triggerColor}`}
      >
        <MeatballIcon />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className={`absolute right-0 top-full z-50 mt-1 w-40 origin-top-right border py-1 shadow-lg ${surface}`}
        >
          {items.map((item, i) => {
            const className = `block w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.25em] transition-colors ${itemHover} ${item.destructive ? destructiveColor : itemColor}`;
            const setRef = (
              el: HTMLButtonElement | HTMLAnchorElement | null,
            ) => {
              if (i === 0) firstItemRef.current = el;
            };
            if ('href' in item && item.href) {
              return (
                <Link
                  key={item.label}
                  ref={setRef as (el: HTMLAnchorElement | null) => void}
                  role="menuitem"
                  href={item.href}
                  className={className}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <button
                key={item.label}
                ref={setRef as (el: HTMLButtonElement | null) => void}
                type="button"
                role="menuitem"
                className={className}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
