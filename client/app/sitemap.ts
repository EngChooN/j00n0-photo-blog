import type { MetadataRoute } from 'next';
import type { Post } from '@/lib/types';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://j00n0-photo-blog.vercel.app';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

export const revalidate = 3600;

async function fetchPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/posts`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return (await res.json()) as Post[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchPosts();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${SITE_URL}/guestbook`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.id}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticEntries, ...postEntries];
}
