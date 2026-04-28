'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  href: string;
  children: React.ReactNode;
  emphasis?: boolean;
};

export function NavLink({ href, children, emphasis }: Props) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={[
        'text-[11px] uppercase tracking-[0.2em] transition-colors',
        emphasis ? 'text-ink' : active ? 'text-ink' : 'text-ink/60 hover:text-ink',
      ].join(' ')}
    >
      {children}
    </Link>
  );
}
