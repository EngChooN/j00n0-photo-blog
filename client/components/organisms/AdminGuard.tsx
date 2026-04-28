'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMe } from '@/hooks/queries/useMe';

type Props = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: me, isLoading } = useMe();
  const isAdmin = me?.role === 'admin';

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [isLoading, isAdmin, pathname, router]);

  if (isLoading || !isAdmin) {
    return (
      <div className="py-32 text-center text-[10px] uppercase tracking-[0.3em] text-muted">
        Checking access…
      </div>
    );
  }
  return <>{children}</>;
}
