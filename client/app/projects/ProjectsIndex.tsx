'use client';

import { useProjects } from '@/hooks/queries/useProjects';
import { ProjectCard } from '@/components/molecules/ProjectCard';
import { EmptyState } from '@/components/molecules/EmptyState';

export function ProjectsIndex() {
  const { data, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="py-32 text-center text-[10px] uppercase tracking-[0.3em] text-muted">
        Loading…
      </div>
    );
  }
  const projects = data ?? [];
  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet."
        description="첫 프로젝트를 만들어보세요."
      />
    );
  }

  const ongoing = projects.filter((p) => p.status === 'ongoing');
  const completed = projects.filter((p) => p.status === 'completed');

  return (
    <div className="space-y-12">
      {ongoing.length > 0 && (
        <section>
          {ongoing.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </section>
      )}
      {completed.length > 0 && (
        <section className="space-y-3 pt-4">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted">
            Completed
          </p>
          <div>
            {completed.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
