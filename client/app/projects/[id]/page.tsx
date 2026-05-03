import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ProjectDetail } from '@/lib/types';
import { assetUrl } from '@/lib/api';
import { ProjectDetailView } from './ProjectDetailView';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

async function fetchProject(id: string): Promise<ProjectDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ProjectDetail;
  } catch {
    return null;
  }
}

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await fetchProject(id);
  if (!project) return { title: 'Not found', robots: { index: false } };

  const description = project.concept?.slice(0, 160) || project.title;
  const cover = project.coverPhotoUrl
    ? [{ url: assetUrl(project.coverPhotoUrl) }]
    : project.posts[0]?.photos[0]
      ? [{ url: assetUrl(project.posts[0].photos[0].src) }]
      : undefined;

  return {
    title: project.title,
    description,
    openGraph: {
      type: 'article',
      title: project.title,
      description,
      images: cover,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
      images: cover ? [cover[0].url] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { id } = await params;
  const project = await fetchProject(id);
  if (!project) notFound();

  return <ProjectDetailView project={project} />;
}
