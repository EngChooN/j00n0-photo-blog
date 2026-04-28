/**
 * One-shot migration: SQLite (Post+Photo schema) -> Postgres + Supabase Storage.
 * Skips Posts whose title+createdAt already exist in Postgres (idempotent).
 * Run: npx tsx scripts/migrate-sqlite.ts <path-to-sqlite.db>
 */
import 'dotenv/config';
import Database from 'better-sqlite3';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

type SqlitePost = {
  id: string;
  title: string;
  caption: string;
  location: string;
  takenAt: string;
  createdAt: number;
};

type SqlitePhoto = {
  id: string;
  postId: string;
  src: string;
  width: number;
  height: number;
  position: number;
  createdAt: number;
};

async function main() {
  const dbPath = process.argv[2];
  if (!dbPath) {
    console.error('Usage: npx tsx scripts/migrate-sqlite.ts <sqlite-path>');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'photos';
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!supabaseUrl || !supabaseKey) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    process.exit(1);
  }

  const sqlite = new Database(dbPath, { readonly: true });
  const posts = sqlite
    .prepare('SELECT * FROM Post ORDER BY createdAt ASC')
    .all() as SqlitePost[];
  const photosByPost = new Map<string, SqlitePhoto[]>();
  for (const ph of sqlite
    .prepare('SELECT * FROM Photo ORDER BY position ASC')
    .all() as SqlitePhoto[]) {
    const list = photosByPost.get(ph.postId) ?? [];
    list.push(ph);
    photosByPost.set(ph.postId, list);
  }

  console.log(`Source: ${posts.length} posts`);

  const prisma = new PrismaClient();
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const publicBase = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}`;

  let migrated = 0;
  for (const post of posts) {
    const createdAt = new Date(Number(post.createdAt));
    const dup = await prisma.post.findFirst({
      where: { title: post.title, createdAt },
      select: { id: true },
    });
    if (dup) {
      console.log(`  skip ${post.title}: already in Postgres`);
      continue;
    }

    const photos = photosByPost.get(post.id) ?? [];
    if (photos.length === 0) {
      console.warn(`  skip ${post.title}: no photos`);
      continue;
    }

    const photoCreates: {
      src: string;
      width: number;
      height: number;
      position: number;
      createdAt: Date;
    }[] = [];

    let allUploaded = true;
    for (const ph of photos) {
      const filename = ph.src.replace(/^\/uploads\//, '');
      const localPath = join(uploadsDir, filename);
      let buffer: Buffer;
      try {
        buffer = await readFile(localPath);
      } catch {
        console.warn(`  missing file ${localPath}, aborting ${post.title}`);
        allUploaded = false;
        break;
      }
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filename, buffer, {
          contentType: 'image/webp',
          upsert: true,
        });
      if (error) {
        console.warn(`  upload err for ${filename}: ${error.message}`);
        allUploaded = false;
        break;
      }
      photoCreates.push({
        src: `${publicBase}/${filename}`,
        width: ph.width,
        height: ph.height,
        position: ph.position,
        createdAt: new Date(Number(ph.createdAt)),
      });
    }
    if (!allUploaded) continue;

    await prisma.post.create({
      data: {
        title: post.title,
        caption: post.caption,
        location: post.location,
        takenAt: post.takenAt,
        createdAt,
        photos: { create: photoCreates },
      },
    });
    migrated += 1;
    console.log(`  ✔ ${post.title} (${photoCreates.length} photo(s))`);
  }

  console.log(`Done: ${migrated}/${posts.length} migrated.`);
  await prisma.$disconnect();
  sqlite.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
