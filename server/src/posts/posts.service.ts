import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { join } from 'node:path';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

const MAX_DIMENSION = 2400;
const MAX_FILES_PER_POST = 20;

type ProcessedFile = {
  src: string;
  width: number;
  height: number;
  absolutePath: string;
};

@Injectable()
export class PostsService {
  private readonly uploadDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.uploadDir = join(
      process.cwd(),
      this.config.get<string>('UPLOAD_DIR', 'uploads'),
    );
  }

  list() {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { photos: { orderBy: { position: 'asc' } } },
    });
  }

  async create(files: Express.Multer.File[], dto: CreatePostDto) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one photo is required');
    }
    if (files.length > MAX_FILES_PER_POST) {
      throw new BadRequestException(
        `A post can have at most ${MAX_FILES_PER_POST} photos`,
      );
    }

    const processed = await this.writeFiles(files);

    try {
      const post = await this.prisma.post.create({
        data: {
          title: dto.title,
          caption: dto.caption ?? '',
          location: dto.location ?? '',
          takenAt: dto.takenAt ?? '',
          photos: {
            create: processed.map((p, index) => ({
              src: p.src,
              width: p.width,
              height: p.height,
              position: index,
            })),
          },
        },
        include: { photos: { orderBy: { position: 'asc' } } },
      });
      return post;
    } catch (error) {
      await this.unlinkAll(processed.map((p) => p.absolutePath));
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdatePostDto,
    addedFiles: Express.Multer.File[],
  ) {
    const existing = await this.prisma.post.findUnique({
      where: { id },
      include: { photos: true },
    });
    if (!existing) throw new NotFoundException('Post not found');

    const removedIds = Array.from(
      new Set(
        (dto.removedPhotoIds ?? []).filter((rid) =>
          existing.photos.some((p) => p.id === rid),
        ),
      ),
    );
    const remainingCount = existing.photos.length - removedIds.length;
    if (remainingCount + addedFiles.length === 0) {
      throw new BadRequestException('A post must have at least one photo');
    }
    if (remainingCount + addedFiles.length > MAX_FILES_PER_POST) {
      throw new BadRequestException(
        `A post can have at most ${MAX_FILES_PER_POST} photos`,
      );
    }

    const removedPhotos = existing.photos.filter((p) =>
      removedIds.includes(p.id),
    );
    const maxPosition = existing.photos.reduce(
      (max, p) => (p.position > max ? p.position : max),
      -1,
    );

    const processed = addedFiles.length
      ? await this.writeFiles(addedFiles)
      : [];

    let updated;
    try {
      updated = await this.prisma.$transaction(async (tx) => {
        if (removedIds.length) {
          await tx.photo.deleteMany({
            where: { id: { in: removedIds }, postId: id },
          });
        }
        await tx.post.update({
          where: { id },
          data: {
            ...(dto.title !== undefined && { title: dto.title }),
            ...(dto.caption !== undefined && { caption: dto.caption }),
            ...(dto.location !== undefined && { location: dto.location }),
            ...(dto.takenAt !== undefined && { takenAt: dto.takenAt }),
            ...(processed.length && {
              photos: {
                create: processed.map((p, i) => ({
                  src: p.src,
                  width: p.width,
                  height: p.height,
                  position: maxPosition + 1 + i,
                })),
              },
            }),
          },
        });
        return tx.post.findUniqueOrThrow({
          where: { id },
          include: { photos: { orderBy: { position: 'asc' } } },
        });
      });
    } catch (error) {
      await this.unlinkAll(processed.map((p) => p.absolutePath));
      throw error;
    }

    // DB is the source of truth; clean up disk after commit succeeds.
    await this.unlinkAll(removedPhotos.map((p) => this.srcToPath(p.src)));
    return updated;
  }

  async remove(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { photos: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.post.delete({ where: { id } });
    await this.unlinkAll(post.photos.map((p) => this.srcToPath(p.src)));
    return { ok: true };
  }

  private async writeFiles(
    files: Express.Multer.File[],
  ): Promise<ProcessedFile[]> {
    for (const f of files) {
      if (!f.mimetype.startsWith('image/')) {
        throw new BadRequestException('Only image files are allowed');
      }
    }
    await mkdir(this.uploadDir, { recursive: true });

    const results = await Promise.allSettled(
      files.map((f) => this.processOne(f)),
    );
    const successes = results
      .filter(
        (r): r is PromiseFulfilledResult<ProcessedFile> =>
          r.status === 'fulfilled',
      )
      .map((r) => r.value);
    const firstFailure = results.find(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );
    if (firstFailure) {
      await this.unlinkAll(successes.map((p) => p.absolutePath));
      const reason = firstFailure.reason;
      if (reason instanceof BadRequestException) throw reason;
      throw new BadRequestException(
        '이미지 파일이 손상되었거나 형식이 올바르지 않아요',
      );
    }
    return successes;
  }

  private async processOne(
    file: Express.Multer.File,
  ): Promise<ProcessedFile> {
    const output = await sharp(file.buffer, { failOn: 'none' })
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    const filename = `${Date.now()}-${randomUUID()}.webp`;
    const absolutePath = join(this.uploadDir, filename);
    await writeFile(absolutePath, output.data);
    return {
      src: `/uploads/${filename}`,
      width: output.info.width,
      height: output.info.height,
      absolutePath,
    };
  }

  private srcToPath(src: string): string {
    return join(this.uploadDir, src.replace(/^\/uploads\//, ''));
  }

  private async unlinkAll(paths: string[]) {
    await Promise.allSettled(paths.map((p) => unlink(p)));
  }
}
