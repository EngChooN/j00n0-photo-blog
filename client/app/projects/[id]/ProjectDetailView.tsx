'use client';

import Link from 'next/link';
import { PageShell } from '@/components/templates/PageShell';
import { Hairline } from '@/components/atoms/Hairline';
import { PhotoGridPresenter } from '@/components/organisms/PhotoGrid/PhotoGridPresenter';
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
  const period = formatPeriod(project.startDate, project.endDate);
  const total = project.posts.length;

  return (
    <PageShell>
      <Link
        href="/projects"
        className="text-[11px] uppercase tracking-[0.25em] text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Projects
      </Link>

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
        isAdmin={false}
        onDelete={() => undefined}
        hideProjectLabel
        getProjectIndexLabel={(_postId, index) =>
          `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
        }
        backToProjectId={project.id}
      />
    </PageShell>
  );
}
