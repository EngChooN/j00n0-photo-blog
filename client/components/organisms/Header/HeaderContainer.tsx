'use client';

import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/queries/useMe';
import { useLogout } from '@/hooks/mutations/useLogout';
import { HeaderPresenter } from './HeaderPresenter';

export function HeaderContainer() {
  const router = useRouter();
  const { data: me, isLoading } = useMe();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push('/');
  };

  return (
    <HeaderPresenter
      isAdmin={!isLoading && me?.role === 'admin'}
      onLogout={handleLogout}
    />
  );
}
