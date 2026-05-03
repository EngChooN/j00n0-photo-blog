'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  postMetadataSchema,
  type PostMetadataInput,
} from '@/lib/validation';
import { useGetPost } from '@/hooks/queries/useGetPost';
import { useUpdatePost } from '@/hooks/mutations/useUpdatePost';
import { useDeletePost } from '@/hooks/mutations/useDeletePost';
import { useProjects } from '@/hooks/queries/useProjects';
import { EditFormPresenter } from './EditFormPresenter';

type Props = { postId: string };

export function EditFormContainer({ postId }: Props) {
  const router = useRouter();
  const { data: post, isSuccess, isLoading } = useGetPost(postId);
  const update = useUpdatePost();
  const remove = useDeletePost();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [serverError, setServerError] = useState<string | undefined>();
  const [projectId, setProjectId] = useState('');

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

  useEffect(() => {
    if (!post) return;
    form.reset({
      title: post.title,
      caption: post.caption,
      location: post.location,
      takenAt: post.takenAt,
      projectId: post.project?.id ?? '',
    });
    setProjectId(post.project?.id ?? '');
    setRemovedIds(new Set());
    setNewFiles([]);
    // Resets bound to the post identity, not on every cache update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  useEffect(() => {
    if (isSuccess && !post) router.replace('/');
  }, [isSuccess, post, router]);

  const newPreviews = useMemo(
    () => newFiles.map((f) => URL.createObjectURL(f)),
    [newFiles],
  );

  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  const visibleExisting = useMemo(
    () => (post?.photos ?? []).filter((p) => !removedIds.has(p.id)),
    [post, removedIds],
  );

  const handleRemoveExisting = (id: string) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleAddFiles = (added: File[]) => {
    if (added.length === 0) return;
    setNewFiles((prev) => [...prev, ...added]);
  };

  const handleRemoveNew = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(undefined);
    if (!post) return;
    if (visibleExisting.length + newFiles.length === 0) {
      setServerError('사진은 최소 1장이 필요해요');
      return;
    }
    try {
      await update.mutateAsync({
        id: post.id,
        ...values,
        projectId,
        addedFiles: newFiles,
        removedPhotoIds: Array.from(removedIds),
      });
      router.push('/');
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : '저장 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.';
      setServerError(msg);
    }
  });

  const onDelete = async () => {
    if (!post) return;
    if (!window.confirm('이 게시글을 삭제할까요?')) return;
    try {
      await remove.mutateAsync(post.id);
      router.push('/');
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : '삭제에 실패했어요.';
      setServerError(msg);
    }
  };

  if (isLoading || !post) {
    return (
      <div className="py-32 text-center text-[10px] uppercase tracking-[0.3em] text-muted">
        Loading…
      </div>
    );
  }

  return (
    <EditFormPresenter
      register={form.register}
      errors={form.formState.errors}
      existing={visibleExisting}
      newPreviews={newPreviews}
      onRemoveExisting={handleRemoveExisting}
      onRemoveNew={handleRemoveNew}
      onAddFiles={handleAddFiles}
      onSubmit={onSubmit}
      onDiscard={() => router.push('/')}
      onDelete={onDelete}
      isSubmitting={form.formState.isSubmitting || update.isPending}
      isDeleting={remove.isPending}
      serverError={serverError}
      projects={projects ?? []}
      projectsLoading={projectsLoading}
      projectId={projectId}
      onProjectChange={setProjectId}
    />
  );
}
