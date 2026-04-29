import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Post } from '@/lib/types';
import { assetUrl } from '@/lib/api';
import { PostDetailCarousel } from './PostDetailCarousel';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

async function fetchPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as Post;
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
  const post = await fetchPost(id);
  if (!post) return { title: 'Not found' };

  const description = post.caption?.slice(0, 160) || post.title;
  const cover = post.photos[0];
  const ogImage = cover ? [{ url: assetUrl(cover.src) }] : undefined;

  return {
    title: post.title,
    description,
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      images: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: ogImage ? [ogImage[0].url] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { id } = await params;
  const post = await fetchPost(id);
  if (!post) notFound();

  return <PostDetailCarousel post={post} />;
}
