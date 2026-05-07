'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/templates/PageShell';
import { Hairline } from '@/components/atoms/Hairline';
import { OverflowMenu } from '@/components/atoms/OverflowMenu';
import { PhotoGridPresenter } from '@/components/organisms/PhotoGrid/PhotoGridPresenter';
import { useMe } from '@/hooks/queries/useMe';
import { useDeleteProject } from '@/hooks/mutations/useDeleteProject';
import { assetUrl } from '@/lib/api';
import type { ProjectDetail } from '@/lib/types';

type Props = {
  project: ProjectDetail;
};

function formatPeriod(start: string | null, end: string | null) {
  if (!start && !end) return '';
  if (start && end) return `${start} – ${end}`;
  return start ?? end ?? '';
}

export function ProjectDetailView({ project }: Props) {
  const router = useRouter();
  const { data: me } = useMe();
  const isOwner = me?.role === 'admin';
  const deleteProject = useDeleteProject();
  const period = formatPeriod(project.startDate, project.endDate);
  const total = project.posts.length;

  const handleDelete = () => {
    if (
      !window.confirm(
        '이 프로젝트를 삭제할까요? 포함된 게시글은 삭제되지 않습니다.',
      )
    ) {
      return;
    }
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        // /projects is server-rendered — refresh forces it to re-fetch
        // without the deleted entry.
        router.push('/projects');
        router.refresh();
      },
    });
  };

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="text-[11px] uppercase tracking-[0.25em] text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          ← Projects
        </Link>
        {isOwner && (
          <OverflowMenu
            variant="light"
            items={[
              {
                label: 'Edit',
                href: `/admin/projects/${project.id}/edit`,
              },
              {
                label: 'Delete',
                destructive: true,
                onClick: handleDelete,
              },
            ]}
          />
        )}
      </div>

      <header className="space-y-6 pt-6 md:space-y-8 md:pt-10">
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-line/40">
          {project.coverPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={assetUrl(project.coverPhotoUrl)}
              alt={project.title}
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6">
              <span className="display text-center text-3xl text-muted/60 md:text-6xl">
                {project.title}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted">
            <span
              className={
                project.status === 'ongoing' ? 'text-ink' : 'text-muted'
              }
            >
              {project.status === 'ongoing' ? 'Ongoing' : 'Completed'}
            </span>
            {period && <span aria-hidden className="text-muted/40">·</span>}
            {period && <span>{period}</span>}
            {!project.isPublic && (
              <>
                <span aria-hidden className="text-muted/40">·</span>
                <span className="text-muted/70">Private</span>
              </>
            )}
          </div>
          <h1 className="display text-4xl leading-tight md:text-7xl">
            {project.title}
          </h1>
          {project.concept && (
            <p className="max-w-2xl whitespace-pre-wrap pt-2 text-sm leading-relaxed text-ink/70 md:text-base">
              {project.concept}
            </p>
          )}
        </div>
      </header>

      <Hairline className="my-12 md:my-20" />

      <PhotoGridPresenter
        posts={project.posts.map((p) => ({ ...p, project: null }))}
        isLoading={false}
        hideProjectLabel
        getProjectIndexLabel={(_postId, index) =>
          `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
        }
        backToProjectId={project.id}
      />
    </PageShell>
  );
}
