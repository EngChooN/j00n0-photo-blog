'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validation';
import { useLogin } from '@/hooks/mutations/useLogin';
import { useMe } from '@/hooks/queries/useMe';
import { loadLoginPrefs, persistLoginPrefs } from '@/lib/loginPrefs';
import { ApiError } from '@/lib/api';
import { LoginFormPresenter } from './LoginFormPresenter';

function resolveNextPath(next: string | null) {
  if (!next) return '/';
  // Block protocol-relative URLs (//evil.com) and backslash tricks (/\evil.com).
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return '/';
  }
  return next;
}

export function LoginFormContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const { data: me, isLoading: isMeLoading } = useMe();
  const [authError, setAuthError] = useState<string | undefined>();
  const [saveId, setSaveId] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    const prefs = loadLoginPrefs();
    if (prefs.savedUsername) {
      setValue('username', prefs.savedUsername);
      setSaveId(true);
    }
    setAutoLogin(prefs.autoLogin);
    setHydrated(true);
  }, [setValue]);

  useEffect(() => {
    if (!hydrated || !autoLogin || !me) return;
    router.replace(resolveNextPath(searchParams.get('next')));
  }, [hydrated, autoLogin, me, router, searchParams]);

  const handleSaveIdChange = (next: boolean) => {
    setSaveId(next);
    if (!next) setAutoLogin(false);
  };

  const handleAutoLoginChange = (next: boolean) => {
    setAutoLogin(next);
  };

  const onSubmit = handleSubmit(async (values) => {
    setAuthError(undefined);
    try {
      await login.mutateAsync(values);
      persistLoginPrefs({ username: values.username, saveId, autoLogin });
      router.replace(resolveNextPath(searchParams.get('next')));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setAuthError('아이디 또는 비밀번호가 올바르지 않아요');
        return;
      }
      setAuthError('로그인 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.');
    }
  });

  if (!hydrated) return null;
  // Only block render on the /me roundtrip when auto-login may redirect away.
  if (autoLogin && (isMeLoading || me)) return null;

  return (
    <LoginFormPresenter
      register={register}
      errors={errors}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting || login.isPending}
      authError={authError}
      saveId={saveId}
      autoLogin={autoLogin}
      onSaveIdChange={handleSaveIdChange}
      onAutoLoginChange={handleAutoLoginChange}
    />
  );
}
