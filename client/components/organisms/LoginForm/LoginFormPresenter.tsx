'use client';

import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import type { LoginInput } from '@/lib/validation';

type Props = {
  register: UseFormRegister<LoginInput>;
  errors: FieldErrors<LoginInput>;
  onSubmit: () => void;
  isSubmitting: boolean;
  authError?: string;
  saveId: boolean;
  autoLogin: boolean;
  onSaveIdChange: (value: boolean) => void;
  onAutoLoginChange: (value: boolean) => void;
};

export function LoginFormPresenter({
  register,
  errors,
  onSubmit,
  isSubmitting,
  authError,
  saveId,
  autoLogin,
  onSaveIdChange,
  onAutoLoginChange,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-8"
    >
      <FormField label="Username" htmlFor="username" error={errors.username?.message}>
        <Input
          id="username"
          autoComplete="username"
          autoFocus
          invalid={!!errors.username}
          {...register('username')}
        />
      </FormField>
      <FormField label="Password" htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          invalid={!!errors.password}
          {...register('password')}
        />
      </FormField>
      <div className="flex flex-col gap-2 text-[11px] uppercase tracking-[0.2em] text-ink/80">
        <label htmlFor="save-id" className="flex items-center gap-2 cursor-pointer">
          <input
            id="save-id"
            type="checkbox"
            checked={saveId}
            onChange={(e) => onSaveIdChange(e.target.checked)}
            className="h-3.5 w-3.5 accent-ink"
          />
          아이디 저장
        </label>
        <label
          htmlFor="auto-login"
          className={`flex items-center gap-2 ${saveId ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
        >
          <input
            id="auto-login"
            type="checkbox"
            checked={autoLogin}
            disabled={!saveId}
            onChange={(e) => onAutoLoginChange(e.target.checked)}
            className="h-3.5 w-3.5 accent-ink"
          />
          자동 로그인
        </label>
      </div>
      {authError && (
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink/80">
          {authError}
        </p>
      )}
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
}
