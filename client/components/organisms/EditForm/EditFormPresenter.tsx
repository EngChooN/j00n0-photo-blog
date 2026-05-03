'use client';

import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Textarea } from '@/components/atoms/Textarea';
import { FormField } from '@/components/molecules/FormField';
import { PhotoStrip } from '@/components/molecules/PhotoStrip';
import { ProjectSelector } from '@/components/molecules/ProjectSelector';
import { Hairline } from '@/components/atoms/Hairline';
import type { Photo, ProjectListItem } from '@/lib/types';
import type { PostMetadataInput } from '@/lib/validation';

type Props = {
  register: UseFormRegister<PostMetadataInput>;
  errors: FieldErrors<PostMetadataInput>;
  existing: Photo[];
  newPreviews: string[];
  onRemoveExisting: (id: string) => void;
  onRemoveNew: (index: number) => void;
  onAddFiles: (files: File[]) => void;
  onSubmit: () => void;
  onDiscard: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
  isDeleting: boolean;
  serverError?: string;
  projects: ProjectListItem[];
  projectsLoading: boolean;
  projectId: string;
  onProjectChange: (id: string) => void;
};

export function EditFormPresenter({
  register,
  errors,
  existing,
  newPreviews,
  onRemoveExisting,
  onRemoveNew,
  onAddFiles,
  onSubmit,
  onDiscard,
  onDelete,
  isSubmitting,
  isDeleting,
  serverError,
  projects,
  projectsLoading,
  projectId,
  onProjectChange,
}: Props) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8 md:space-y-12">
      <div className="space-y-3">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
          Photos
        </span>
        <PhotoStrip
          existing={existing}
          newPreviews={newPreviews}
          onRemoveExisting={onRemoveExisting}
          onRemoveNew={onRemoveNew}
          onAddFiles={onAddFiles}
        />
      </div>

      <Hairline />

      <div className="space-y-8">
        <FormField label="Title" htmlFor="title" error={errors.title?.message}>
          <Input
            id="title"
            invalid={!!errors.title}
            {...register('title')}
          />
        </FormField>
        <ProjectSelector
          projects={projects}
          isLoading={projectsLoading}
          value={projectId}
          onChange={onProjectChange}
        />
        <FormField
          label="Location"
          htmlFor="location"
          error={errors.location?.message}
        >
          <Input
            id="location"
            invalid={!!errors.location}
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
            {...register('caption')}
          />
        </FormField>
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
            {isSubmitting ? 'Saving…' : 'Save'}
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
        <div className="my-1 h-px w-full bg-line md:hidden" />
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="inline-flex min-h-[44px] items-center justify-center text-[11px] uppercase tracking-[0.25em] text-ink/40 transition-colors hover:text-red-600 disabled:opacity-40"
        >
          {isDeleting ? 'Deleting…' : 'Delete post'}
        </button>
      </div>
    </form>
  );
}
