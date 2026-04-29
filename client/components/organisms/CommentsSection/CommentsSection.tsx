'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commentSchema, type CommentInput } from '@/lib/validation';
import { useComments } from '@/hooks/queries/useComments';
import { useAddComment } from '@/hooks/mutations/useAddComment';
import { useDeleteComment } from '@/hooks/mutations/useDeleteComment';
import { useMe } from '@/hooks/queries/useMe';
import { ApiError } from '@/lib/api';

type Props = {
  postId: string;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CommentsSection({ postId }: Props) {
  const { data: comments, isLoading } = useComments(postId);
  const add = useAddComment(postId);
  const remove = useDeleteComment(postId);
  const { data: me } = useMe();
  const isAdmin = me?.role === 'admin';
  const [error, setError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { name: '', body: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(undefined);
    try {
      await add.mutateAsync(values);
      reset({ name: values.name, body: '' });
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        return;
      }
      setError('댓글을 보내지 못했어요. 잠시 후 다시 시도해주세요.');
    }
  });

  return (
    <section id="comments" className="px-6 py-10 md:px-8">
      {comments && comments.length > 0 && (
        <header className="mb-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            {comments.length} comment{comments.length === 1 ? '' : 's'}
          </span>
        </header>
      )}

      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-5 border-b border-white/10 pb-10"
      >
        <div className="space-y-2">
          <label
            htmlFor="comment-name"
            className="block text-[10px] uppercase tracking-[0.3em] text-white/40"
          >
            Name
          </label>
          <input
            id="comment-name"
            type="text"
            placeholder="익명"
            {...register('name')}
            className="w-full border-b border-white/15 bg-transparent py-2 text-sm text-white placeholder:text-white/30 focus:border-white focus:outline-none"
          />
          {errors.name && (
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="comment-body"
            className="block text-[10px] uppercase tracking-[0.3em] text-white/40"
          >
            Comment
          </label>
          <textarea
            id="comment-body"
            rows={4}
            placeholder="이 글에 한 마디를 남겨보세요"
            {...register('body')}
            className="w-full resize-none border-b border-white/15 bg-transparent py-2 text-sm leading-relaxed text-white placeholder:text-white/30 focus:border-white focus:outline-none"
          />
          {errors.body && (
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
              {errors.body.message}
            </p>
          )}
        </div>
        {error && (
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
            {error}
          </p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || add.isPending}
            className="border border-white/40 px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-white/80 transition-colors hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {add.isPending ? 'Sending…' : 'Post comment'}
          </button>
        </div>
      </form>

      <div className="mt-10 space-y-8">
        {isLoading && (
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            Loading…
          </p>
        )}
        {!isLoading && comments && comments.length === 0 && (
          <p className="text-sm text-white/50">
            아직 댓글이 없어요. 첫 번째로 남겨주세요.
          </p>
        )}
        {comments?.map((comment) => (
          <article
            key={comment.id}
            className="flex flex-col gap-2 border-b border-white/5 pb-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-medium text-white">
                  {comment.name}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                  {formatDateTime(comment.createdAt)}
                </span>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('이 댓글을 삭제할까요?')) {
                      remove.mutate(comment.id);
                    }
                  }}
                  className="text-[10px] uppercase tracking-[0.3em] text-white/35 underline-offset-4 hover:text-white hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">
              {comment.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
