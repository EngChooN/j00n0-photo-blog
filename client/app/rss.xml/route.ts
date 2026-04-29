import { NextResponse } from 'next/server';
import type { Post } from '@/lib/types';
import { assetUrl } from '@/lib/api';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://j00n0-photo-blog.vercel.app';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

const SITE_TITLE = 'j00n0__ — Photo Journal';
const SITE_DESCRIPTION =
  '도시, 빛, 그리고 잠시 멈춘 순간들. j00n0__의 사진 일지.';
const FEED_LANG = 'ko';

export const revalidate = 1800;

async function fetchPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/posts`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    return (await res.json()) as Post[];
  } catch {
    return [];
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function buildItem(post: Post): string {
  const url = `${SITE_URL}/posts/${post.id}`;
  const cover = post.photos[0];
  const coverUrl = cover ? assetUrl(cover.src) : null;
  const captionHtml = post.caption
    ? post.caption
        .split('\n')
        .map((line) => `<p>${escapeXml(line)}</p>`)
        .join('')
    : '';
  const imgHtml = coverUrl
    ? `<p><img src="${escapeXml(coverUrl)}" alt="${escapeXml(post.title)}" /></p>`
    : '';
  const descriptionHtml = `${imgHtml}${captionHtml}`;

  const enclosure = coverUrl
    ? `<enclosure url="${escapeXml(coverUrl)}" type="image/webp" />`
    : '';

  return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description>${cdata(descriptionHtml)}</description>
      ${enclosure}
    </item>`;
}

export async function GET() {
  const posts = await fetchPosts();
  const lastBuildDate =
    posts[0]?.createdAt ? new Date(posts[0].createdAt).toUTCString() : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>${FEED_LANG}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(`${SITE_URL}/rss.xml`)}" rel="self" type="application/rss+xml" />
    ${posts.map(buildItem).join('')}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400',
    },
  });
}
