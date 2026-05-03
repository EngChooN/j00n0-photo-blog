import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { StorageService } from '@/storage/storage.service';
import sharp from 'sharp';
import exifr from 'exifr';
import { randomUUID } from 'node:crypto';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

const MAX_DIMENSION = 2400;
const MAX_FILES_PER_POST = 20;

type ExifData = {
  camera?: string;
  lens?: string;
  shutterSpeed?: string;
  aperture?: string;
  iso?: number;
  focalLength?: string;
};

type ProcessedFile = {
  src: string;
  width: number;
  height: number;
  exif: ExifData | null;
  takenAtFromExif: string | null;
};

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async list(isAdmin: boolean) {
    const posts = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        photos: { orderBy: { position: 'asc' } },
        project: { select: { id: true, title: true, isPublic: true } },
      },
    });
    return posts.map((p) => maskProject(p, isAdmin));
  }

  async getOne(id: string, isAdmin: boolean) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { position: 'asc' } },
        project: { select: { id: true, title: true, isPublic: true } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return maskProject(post, isAdmin);
  }

  async like(postId: string, visitorIpHash: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.prisma.likeRecord.findUnique({
      where: { postId_visitorIpHash: { postId, visitorIpHash } },
    });
    if (existing) {
      const current = await this.prisma.post.findUniqueOrThrow({
        where: { id: postId },
        select: { likeCount: true },
      });
      return { likeCount: current.likeCount, liked: true };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.likeRecord.create({
        data: { postId, visitorIpHash },
      });
      return tx.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      });
    });
    return { likeCount: updated.likeCount, liked: true };
  }

  async unlike(postId: string, visitorIpHash: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.prisma.likeRecord.findUnique({
      where: { postId_visitorIpHash: { postId, visitorIpHash } },
    });
    if (!existing) {
      const current = await this.prisma.post.findUniqueOrThrow({
        where: { id: postId },
        select: { likeCount: true },
      });
      return { likeCount: current.likeCount, liked: false };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.likeRecord.delete({
        where: { postId_visitorIpHash: { postId, visitorIpHash } },
      });
      return tx.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      });
    });
    return {
      likeCount: Math.max(0, updated.likeCount),
      liked: false,
    };
  }

  async hasLiked(postId: string, visitorIpHash: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { likeCount: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    const record = await this.prisma.likeRecord.findUnique({
      where: { postId_visitorIpHash: { postId, visitorIpHash } },
    });
    return { likeCount: post.likeCount, liked: !!record };
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

    const projectAssignment = await this.resolveProjectAssignment(
      dto.projectId,
    );
    const processed = await this.uploadFiles(files);

    // Multipart forms always send strings, so blank takenAt arrives as "".
    // On create, treat blank as "not provided" and fall back to EXIF.
    // (update keeps the user's blank verbatim — see below.)
    const dtoTakenAt = dto.takenAt?.trim();
    const takenAt = dtoTakenAt || processed[0]?.takenAtFromExif || '';

    try {
      const created = await this.prisma.post.create({
        data: {
          title: dto.title,
          caption: dto.caption ?? '',
          location: dto.location ?? '',
          takenAt,
          ...projectAssignment,
          photos: {
            create: processed.map((p, index) => ({
              src: p.src,
              width: p.width,
              height: p.height,
              position: index,
              exif: p.exif ?? undefined,
            })),
          },
        },
        include: {
          photos: { orderBy: { position: 'asc' } },
          project: { select: { id: true, title: true, isPublic: true } },
        },
      });
      return maskProject(created, true);
    } catch (error) {
      await this.storage.remove(processed.map((p) => p.src));
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

    const projectAssignment = await this.resolveProjectAssignment(
      dto.projectId,
    );
    const processed = addedFiles.length
      ? await this.uploadFiles(addedFiles)
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
            // On update, the user's takenAt is passed through verbatim — blank
            // means "clear it". EXIF auto-fill applies on create only.
            ...(dto.takenAt !== undefined && { takenAt: dto.takenAt }),
            ...projectAssignment,
            ...(processed.length && {
              photos: {
                create: processed.map((p, i) => ({
                  src: p.src,
                  width: p.width,
                  height: p.height,
                  position: maxPosition + 1 + i,
                  exif: p.exif ?? undefined,
                })),
              },
            }),
          },
        });
        return tx.post.findUniqueOrThrow({
          where: { id },
          include: {
            photos: { orderBy: { position: 'asc' } },
            project: { select: { id: true, title: true, isPublic: true } },
          },
        });
      });
    } catch (error) {
      await this.storage.remove(processed.map((p) => p.src));
      throw error;
    }

    // DB is the source of truth; clean up storage after commit succeeds.
    await this.storage.remove(removedPhotos.map((p) => p.src));
    return maskProject(updated, true);
  }

  async remove(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { photos: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.post.delete({ where: { id } });
    await this.storage.remove(post.photos.map((p) => p.src));
    return { ok: true };
  }

  private async resolveProjectAssignment(
    raw: string | undefined,
  ): Promise<{ projectId?: string | null }> {
    if (raw === undefined) return {};
    const trimmed = raw.trim();
    if (trimmed === '' || trimmed === 'null') return { projectId: null };
    const found = await this.prisma.project.findUnique({
      where: { id: trimmed },
      select: { id: true },
    });
    if (!found) throw new BadRequestException('Project not found');
    return { projectId: trimmed };
  }

  private async uploadFiles(
    files: Express.Multer.File[],
  ): Promise<ProcessedFile[]> {
    for (const f of files) {
      if (!f.mimetype.startsWith('image/')) {
        throw new BadRequestException('Only image files are allowed');
      }
    }

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
      await this.storage.remove(successes.map((p) => p.src));
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
    const [output, rawExif] = await Promise.all([
      sharp(file.buffer, { failOn: 'none' })
        .rotate()
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true }),
      exifr
        .parse(file.buffer, {
          pick: [
            'Make',
            'Model',
            'LensModel',
            'ExposureTime',
            'FNumber',
            'ISO',
            'FocalLength',
            'DateTimeOriginal',
          ],
          gps: false,
        })
        .catch(() => null),
    ]);

    const filename = `${Date.now()}-${randomUUID()}.webp`;
    const src = await this.storage.upload(filename, output.data);
    return {
      src,
      width: output.info.width,
      height: output.info.height,
      exif: formatExif(rawExif),
      takenAtFromExif: formatExifDate(rawExif?.DateTimeOriginal),
    };
  }
}

type WithProject<T> = T & {
  project: { id: string; title: string; isPublic: boolean } | null;
};

function maskProject<T>(post: WithProject<T>, isAdmin: boolean) {
  const { project, ...rest } = post;
  if (!project || (!isAdmin && !project.isPublic)) {
    return { ...rest, project: null } as T & {
      project: { id: string; title: string } | null;
    };
  }
  return {
    ...rest,
    project: { id: project.id, title: project.title },
  } as T & { project: { id: string; title: string } | null };
}

function formatExif(raw: Record<string, unknown> | null): ExifData | null {
  if (!raw) return null;
  const camera = formatCamera(raw.Make, raw.Model);
  const lens = typeof raw.LensModel === 'string' ? raw.LensModel : undefined;
  const shutterSpeed = formatShutter(raw.ExposureTime);
  const aperture = formatAperture(raw.FNumber);
  const iso = typeof raw.ISO === 'number' ? raw.ISO : undefined;
  const focalLength = formatFocalLength(raw.FocalLength);

  const exif: ExifData = {};
  if (camera) exif.camera = camera;
  if (lens) exif.lens = lens;
  if (shutterSpeed) exif.shutterSpeed = shutterSpeed;
  if (aperture) exif.aperture = aperture;
  if (iso !== undefined) exif.iso = iso;
  if (focalLength) exif.focalLength = focalLength;
  return Object.keys(exif).length ? exif : null;
}

function formatCamera(make: unknown, model: unknown): string | undefined {
  const m = typeof model === 'string' ? model.trim() : '';
  if (!m) return undefined;
  const mk = typeof make === 'string' ? make.trim() : '';
  if (!mk) return m;
  // Compare first words so "NIKON CORPORATION" + "NIKON Z 6" stays "NIKON Z 6".
  const mkFirst = mk.split(/\s+/)[0].toUpperCase();
  const mFirst = m.split(/\s+/)[0].toUpperCase();
  if (mkFirst === mFirst) return m;
  return `${mk} ${m}`;
}

function formatShutter(value: unknown): string | undefined {
  if (typeof value !== 'number' || !isFinite(value) || value <= 0) return undefined;
  // 0.5s and slower → seconds; faster → 1/N fraction.
  if (value >= 0.5) {
    return Number.isInteger(value) ? `${value}s` : `${value.toFixed(1)}s`;
  }
  return `1/${Math.round(1 / value)}s`;
}

function formatAperture(value: unknown): string | undefined {
  if (typeof value !== 'number' || !isFinite(value) || value <= 0) return undefined;
  // Show one decimal only when needed (f/1.8 vs f/8).
  const text = Number.isInteger(value) ? `${value}` : value.toFixed(1);
  return `f/${text}`;
}

function formatFocalLength(value: unknown): string | undefined {
  if (typeof value !== 'number' || !isFinite(value) || value <= 0) return undefined;
  return `${Math.round(value)}mm`;
}

function formatExifDate(value: unknown): string | null {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
  // EXIF DateTimeOriginal carries no timezone; exifr constructs the Date as if
  // wall-clock were UTC. Use UTC getters so the wall-clock date survives
  // regardless of the runtime's local TZ.
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const day = String(value.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
