'use client';

import Link from 'next/link';
import { assetUrl } from '@/lib/api';
import type { ProjectListItem } from '@/lib/types';

type Props = {
  project: ProjectListItem;
};

function formatPeriod(start: string | null, end: string | null) {
  if (!start && !end) return '';
  if (start && end) return `${start} – ${end}`;
  return start ?? end ?? '';
}

export function ProjectCard({ project }: Props) {
  const period = formatPeriod(project.startDate, project.endDate);
  const postCount = project._count.posts;

  return (
    <article className="group relative grid grid-cols-12 gap-4 border-b border-line py-8 md:gap-8 md:py-12">
      <div className="col-span-5 md:col-span-4">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-line/40">
          {project.coverPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={assetUrl(project.coverPhotoUrl)}
              alt={project.title}
              className="h-full w-full object-cover transition-all duration-700 ease-editorial group-hover:brightness-95"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-4">
              <span className="display text-center text-base text-muted/60 md:text-lg">
                {project.title}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-7 flex flex-col justify-center gap-3 md:col-span-8 md:gap-4">
        <div className="flex items-baseline gap-3">
          <span
            className={[
              'text-[10px] uppercase tracking-[0.3em]',
              project.status === 'ongoing' ? 'text-ink' : 'text-muted',
            ].join(' ')}
          >
            {project.status === 'ongoing' ? 'Ongoing' : 'Completed'}
          </span>
          {!project.isPublic && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted/70">
              · Private
            </span>
          )}
        </div>
        <div className="inline-flex items-baseline gap-3">
          <h2 className="display text-2xl leading-tight transition-colors duration-200 ease-editorial group-hover:text-ink/100 md:text-5xl">
            {project.title}
          </h2>
          <span
            aria-hidden
            className="text-base text-muted transition-transform duration-300 ease-editorial group-hover:translate-x-1 md:text-xl"
          >
            →
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted">
          {period && <span>{period}</span>}
          {period && <span aria-hidden className="text-muted/40">·</span>}
          <span>
            {postCount} {postCount === 1 ? 'work' : 'works'}
          </span>
        </div>
        {project.concept && (
          <p className="line-clamp-2 max-w-prose text-sm leading-relaxed text-ink/70">
            {project.concept}
          </p>
        )}
      </div>
      <Link
        href={`/projects/${project.id}`}
        aria-label={`Open ${project.title}`}
        className="absolute inset-0 cursor-pointer"
      >
        <span className="sr-only">{project.title}</span>
      </Link>
    </article>
  );
}
