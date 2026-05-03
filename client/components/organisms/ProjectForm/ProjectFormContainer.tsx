'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  projectFormSchema,
  type ProjectFormInput,
} from '@/lib/validation';
import { useProject } from '@/hooks/queries/useProject';
import { useCreateProject } from '@/hooks/mutations/useCreateProject';
import { useUpdateProject } from '@/hooks/mutations/useUpdateProject';
import { useDeleteProject } from '@/hooks/mutations/useDeleteProject';
import { assetUrl } from '@/lib/api';
import { ProjectFormPresenter } from './ProjectFormPresenter';

type Props = { mode: 'create' } | { mode: 'edit'; projectId: string };

const DEFAULTS: ProjectFormInput = {
  title: '',
  concept: '',
  startDate: '',
  endDate: '',
  status: 'ongoing',
  isPublic: true,
};

export function ProjectFormContainer(props: Props) {
  const router = useRouter();
  const create = useCreateProject();
  const update = useUpdateProject();
  const remove = useDeleteProject();

  const [serverError, setServerError] = useState<string | undefined>();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverCleared, setCoverCleared] = useState(false);
  const [status, setStatus] = useState<'ongoing' | 'completed'>('ongoing');
  const [isPublic, setIsPublic] = useState(true);

  const editMode = props.mode === 'edit';
  const projectId = editMode ? props.projectId : '';

  const { data: existing, isLoading } = useProject(projectId);

  const form = useForm<ProjectFormInput>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (!editMode || !existing) return;
    form.reset({
      title: existing.title,
      concept: existing.concept ?? '',
      startDate: existing.startDate ?? '',
      endDate: existing.endDate ?? '',
      status: existing.status,
      isPublic: existing.isPublic,
    });
    setStatus(existing.status);
    setIsPublic(existing.isPublic);
    setCoverFile(null);
    setCoverCleared(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  const newPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile],
  );

  useEffect(() => {
    return () => {
      if (newPreview) URL.revokeObjectURL(newPreview);
    };
  }, [newPreview]);

  const coverPreview =
    newPreview ??
    (!coverCleared && existing?.coverPhotoUrl
      ? assetUrl(existing.coverPhotoUrl)
      : null);

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(undefined);
    const payload = { ...values, status, isPublic };
    try {
      const saved = editMode
        ? await update.mutateAsync({
            id: projectId,
            ...payload,
            coverImage: coverFile,
            clearCover: !coverFile && coverCleared,
          })
        : await create.mutateAsync({ ...payload, coverImage: coverFile });
      // Public detail page is anonymously fetched (RSC), so private projects
      // would 404 on /projects/[id]. Send admin to the index instead.
      router.push(saved.isPublic ? `/projects/${saved.id}` : '/projects');
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : '저장 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.';
      setServerError(msg);
    }
  });

  const onDelete = async () => {
    if (!editMode) return;
    if (!window.confirm('이 프로젝트를 삭제할까요? 소속된 글은 미할당으로 바뀝니다.'))
      return;
    try {
      await remove.mutateAsync(projectId);
      router.push('/projects');
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : '삭제에 실패했어요.';
      setServerError(msg);
    }
  };

  const onCoverChange = (file: File | null) => {
    setCoverFile(file);
    if (!file) setCoverCleared(true);
  };

  if (editMode && isLoading) {
    return (
      <div className="py-32 text-center text-[10px] uppercase tracking-[0.3em] text-muted">
        Loading…
      </div>
    );
  }

  return (
    <ProjectFormPresenter
      mode={props.mode}
      register={form.register}
      errors={form.formState.errors}
      status={status}
      isPublic={isPublic}
      onStatusChange={setStatus}
      onIsPublicChange={setIsPublic}
      coverPreview={coverPreview}
      onCoverChange={onCoverChange}
      onSubmit={onSubmit}
      onDiscard={() => router.push('/projects')}
      onDelete={editMode ? onDelete : undefined}
      isSubmitting={
        form.formState.isSubmitting || create.isPending || update.isPending
      }
      isDeleting={remove.isPending}
      serverError={serverError}
    />
  );
}
