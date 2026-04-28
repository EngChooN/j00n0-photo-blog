'use client';

import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { FormField } from '@/components/molecules/FormField';
import { PhotoStrip } from '@/components/molecules/PhotoStrip';
import type { PostMetadataInput } from '@/lib/validation';

type Props = {
  register: UseFormRegister<PostMetadataInput>;
  errors: FieldErrors<PostMetadataInput>;
  previews: string[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  fileError?: string;
  onSubmit: () => void;
  isSubmitting: boolean;
  serverError?: string;
};

export function UploadFormPresenter({
  register,
  errors,
  previews,
  onAddFiles,
  onRemoveFile,
  fileError,
  onSubmit,
  isSubmitting,
  serverError,
}: Props) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8 md:space-y-12">
      <div>
        <PhotoStrip
          existing={[]}
          newPreviews={previews}
          onRemoveExisting={() => undefined}
          onRemoveNew={onRemoveFile}
          onAddFiles={onAddFiles}
        />
        {fileError && (
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-ink/80">
            {fileError}
          </p>
        )}
      </div>
      <div className="space-y-8">
        <FormField label="Title" htmlFor="title" error={errors.title?.message}>
          <Input
            id="title"
            invalid={!!errors.title}
            placeholder="A morning in Seoul"
            {...register('title')}
          />
        </FormField>
        <FormField
          label="Location"
          htmlFor="location"
          error={errors.location?.message}
        >
          <Input
            id="location"
            invalid={!!errors.location}
            placeholder="Seongsu, Seoul"
            {...register('location')}
          />
        </FormField>
        <FormField
          label="Taken at"
          htmlFor="takenAt"
          error={errors.takenAt?.message}
        >
          <Input
            id="takenAt"
            type="date"
            invalid={!!errors.takenAt}
            {...register('takenAt')}
          />
        </FormField>
        <FormField
          label="Caption"
          htmlFor="caption"
          error={errors.caption?.message}
        >
          <Textarea
            id="caption"
            rows={5}
            invalid={!!errors.caption}
            placeholder="A few words about this photograph…"
            {...register('caption')}
          />
        </FormField>
        {serverError && (
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink/80">
            {serverError}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Publishing…' : 'Publish'}
        </Button>
      </div>
    </form>
  );
}
