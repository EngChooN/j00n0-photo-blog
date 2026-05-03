'use client';

import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { FormField } from '@/components/molecules/FormField';
import { Hairline } from '@/components/atoms/Hairline';
import { Label } from '@/components/atoms/Label';
import type { ProjectFormInput } from '@/lib/validation';

type Props = {
  mode: 'create' | 'edit';
  register: UseFormRegister<ProjectFormInput>;
  errors: FieldErrors<ProjectFormInput>;
  status: 'ongoing' | 'completed';
  isPublic: boolean;
  onStatusChange: (s: 'ongoing' | 'completed') => void;
  onIsPublicChange: (v: boolean) => void;
  coverPreview: string | null;
  onCoverChange: (file: File | null) => void;
  onSubmit: () => void;
  onDiscard: () => void;
  onDelete?: () => void;
  isSubmitting: boolean;
  isDeleting?: boolean;
  serverError?: string;
};

export function ProjectFormPresenter({
  mode,
  register,
  errors,
  status,
  isPublic,
  onStatusChange,
  onIsPublicChange,
  coverPreview,
  onCoverChange,
  onSubmit,
  onDiscard,
  onDelete,
  isSubmitting,
  isDeleting,
  serverError,
}: Props) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8 md:space-y-12">
      <div className="space-y-3">
        <Label>Cover (optional)</Label>
        {coverPreview ? (
          <div className="relative w-full max-w-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPreview}
              alt="Cover preview"
              className="aspect-[16/9] w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onCoverChange(null)}
              className="absolute right-2 top-2 inline-flex min-h-[28px] min-w-[28px] items-center justify-center bg-paper/90 text-[14px] text-ink hover:bg-paper"
              aria-label="Remove cover"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="flex aspect-[16/9] w-full max-w-md cursor-pointer items-center justify-center border border-dashed border-line bg-line/20 text-[10px] uppercase tracking-[0.3em] text-muted transition-colors hover:bg-line/40">
            + 커버 이미지 선택
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onCoverChange(file);
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>

      <Hairline />

      <div className="space-y-8">
        <FormField label="Title" htmlFor="title" error={errors.title?.message}>
          <Input
            id="title"
            invalid={!!errors.title}
            placeholder="Tokyo 2025"
            {...register('title')}
          />
        </FormField>
        <FormField
          label="Concept"
          htmlFor="concept"
          error={errors.concept?.message}
        >
          <Textarea
            id="concept"
            rows={4}
            invalid={!!errors.concept}
            placeholder="이 프로젝트가 어떤 흐름인지 한 단락으로…"
            {...register('concept')}
          />
        </FormField>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FormField
            label="Start date"
            htmlFor="startDate"
            error={errors.startDate?.message}
          >
            <Input
              id="startDate"
              type="date"
              invalid={!!errors.startDate}
              {...register('startDate')}
            />
          </FormField>
          <FormField
            label="End date"
            htmlFor="endDate"
            error={errors.endDate?.message}
          >
            <Input
              id="endDate"
              type="date"
              invalid={!!errors.endDate}
              {...register('endDate')}
            />
          </FormField>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex gap-6">
            {(['ongoing', 'completed'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusChange(s)}
                className={[
                  'text-[11px] uppercase tracking-[0.25em] transition-colors',
                  status === s ? 'text-ink underline underline-offset-4' : 'text-muted hover:text-ink',
                ].join(' ')}
              >
                {s === 'ongoing' ? 'Ongoing' : 'Completed'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Visibility</Label>
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => onIsPublicChange(true)}
              className={[
                'text-[11px] uppercase tracking-[0.25em] transition-colors',
                isPublic ? 'text-ink underline underline-offset-4' : 'text-muted hover:text-ink',
              ].join(' ')}
            >
              Public
            </button>
            <button
              type="button"
              onClick={() => onIsPublicChange(false)}
              className={[
                'text-[11px] uppercase tracking-[0.25em] transition-colors',
                !isPublic ? 'text-ink underline underline-offset-4' : 'text-muted hover:text-ink',
              ].join(' ')}
            >
              Private
            </button>
          </div>
        </div>
      </div>

      {serverError && (
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink/80">
          {serverError}
        </p>
      )}

      <Hairline />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            fullWidth
            className="md:w-auto"
          >
            {isSubmitting
              ? 'Saving…'
              : mode === 'create'
                ? 'Create project'
                : 'Save'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onDiscard}
            fullWidth
            className="md:w-auto"
          >
            Discard
          </Button>
        </div>
        {mode === 'edit' && onDelete && (
          <>
            <div className="my-1 h-px w-full bg-line md:hidden" />
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex min-h-[44px] items-center justify-center text-[11px] uppercase tracking-[0.25em] text-ink/40 transition-colors hover:text-red-600 disabled:opacity-40"
            >
              {isDeleting ? 'Deleting…' : 'Delete project'}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
