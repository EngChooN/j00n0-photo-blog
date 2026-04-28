'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/atoms/Logo';
import { NavLink } from '@/components/molecules/NavLink';

type Props = {
  isAdmin: boolean;
  onLogout: () => void;
};

export function HeaderPresenter({ isAdmin, onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      setMenuVisible(false);
      return;
    }
    const id = requestAnimationFrame(() => setMenuVisible(true));
    return () => cancelAnimationFrame(id);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = original;
    };
  }, [menuOpen]);

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-12">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          <NavLink href="/">Journal</NavLink>
          <NavLink href="/guestbook">Guestbook</NavLink>
          {isAdmin && <NavLink href="/admin/upload">Upload</NavLink>}
          {isAdmin && (
            <button
              type="button"
              onClick={onLogout}
              className="text-[11px] uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-ink"
            >
              Logout
            </button>
          )}
        </nav>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-haspopup="dialog"
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-[5px] md:hidden"
        >
          <span className="h-px w-5 bg-ink" />
          <span className="h-px w-5 bg-ink" />
          <span className="h-px w-5 bg-ink" />
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={`fixed inset-0 z-40 flex flex-col bg-paper pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] transition-opacity duration-300 ease-editorial md:hidden ${
            menuVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="absolute right-0 top-[env(safe-area-inset-top)] flex min-h-[44px] min-w-[44px] items-center justify-center p-5 text-2xl font-light text-ink"
          >
            ×
          </button>
          <div className="flex flex-1 flex-col justify-center px-6">
            <p className="mb-10 text-[10px] uppercase tracking-[0.3em] text-muted">
              Navigation
            </p>
            <nav className="flex flex-col items-start gap-6">
              <Link
                href="/"
                autoFocus
                onClick={() => setMenuOpen(false)}
                className="display text-4xl font-light tracking-[-0.02em] text-ink"
              >
                Journal
              </Link>
              <Link
                href="/guestbook"
                onClick={() => setMenuOpen(false)}
                className="display text-4xl font-light tracking-[-0.02em] text-ink"
              >
                Guestbook
              </Link>
              {isAdmin && (
                <>
                  <div className="my-2 h-px w-8 bg-line" />
                  <Link
                    href="/admin/upload"
                    onClick={() => setMenuOpen(false)}
                    className="display text-4xl font-light tracking-[-0.02em] text-ink"
                  >
                    Upload
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="display text-4xl font-light tracking-[-0.02em] text-ink/60"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
