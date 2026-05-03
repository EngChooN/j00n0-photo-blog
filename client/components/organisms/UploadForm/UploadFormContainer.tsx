'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  postMetadataSchema,
  type PostMetadataInput,
} from '@/lib/validation';
import { useCreatePost } from '@/hooks/mutations/useCreatePost';
import { useProjects } from '@/hooks/queries/useProjects';
import { UploadFormPresenter } from './UploadFormPresenter';

export function UploadFormContainer() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | undefined>();
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | undefined>();
  const [projectId, setProjectId] = useState('');
  const create = useCreatePost();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const form = useForm<PostMetadataInput>({
    resolver: zodResolver(postMetadataSchema),
    defaultValues: {
      title: '',
      caption: '',
      location: '',
      takenAt: '',
      projectId: '',
    },
  });

  const previews = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleAddFiles = (added: File[]) => {
    if (added.length === 0) return;
    setFileError(undefined);
    setFiles((prev) => [...prev, ...added]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(undefined);
    if (files.length === 0) {
      setFileError('사진을 1장 이상 선택해주세요');
      return;
    }
    try {
      await create.mutateAsync({ ...values, projectId, files });
      router.push('/');
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : '저장 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.';
      setServerError(msg);
    }
  });

  return (
    <UploadFormPresenter
      register={form.register}
      errors={form.formState.errors}
      previews={previews}
      onAddFiles={handleAddFiles}
      onRemoveFile={handleRemoveFile}
      fileError={fileError}
      onSubmit={onSubmit}
      isSubmitting={form.formState.isSubmitting || create.isPending}
      serverError={serverError}
      projects={projects ?? []}
      projectsLoading={projectsLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
    />
  );
}
