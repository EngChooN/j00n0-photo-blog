'use client';

import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { FormField } from '@/components/molecules/FormField';
import type { GuestbookInput } from '@/lib/validation';

type Props = {
  register: UseFormRegister<GuestbookInput>;
  errors: FieldErrors<GuestbookInput>;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export function GuestbookFormPresenter({
  register,
  errors,
  onSubmit,
  isSubmitting,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid grid-cols-12 gap-6 border border-line p-6 md:p-10"
    >
      <div className="col-span-12 md:col-span-4">
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            invalid={!!errors.name}
            placeholder="Your name"
            {...register('name')}
          />
        </FormField>
      </div>
      <div className="col-span-12 md:col-span-8">
        <FormField label="Message" htmlFor="message" error={errors.message?.message}>
          <Textarea
            id="message"
            rows={4}
            invalid={!!errors.message}
            placeholder="Leave a few words…"
            {...register('message')}
          />
        </FormField>
      </div>
      <div className="col-span-12 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Sign'}
        </Button>
      </div>
    </form>
  );
}
