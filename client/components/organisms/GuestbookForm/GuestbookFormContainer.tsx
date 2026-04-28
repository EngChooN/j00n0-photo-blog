'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { guestbookSchema, type GuestbookInput } from '@/lib/validation';
import { useAddGuestbook } from '@/hooks/mutations/useAddGuestbook';
import { GuestbookFormPresenter } from './GuestbookFormPresenter';

export function GuestbookFormContainer() {
  const add = useAddGuestbook();
  const form = useForm<GuestbookInput>({
    resolver: zodResolver(guestbookSchema),
    defaultValues: { name: '', message: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await add.mutateAsync(values);
    form.reset({ name: '', message: '' });
  });

  return (
    <GuestbookFormPresenter
      register={form.register}
      errors={form.formState.errors}
      onSubmit={onSubmit}
      isSubmitting={form.formState.isSubmitting || add.isPending}
    />
  );
}
