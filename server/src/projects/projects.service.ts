import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { PrismaService } from '@/prisma/prisma.service';
import { StorageService } from '@/storage/storage.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

const MAX_DIMENSION = 2400;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  list(isAdmin: boolean) {
    return this.prisma.project.findMany({
      where: isAdmin ? {} : { isPublic: true },
      // Postgres enum sorts by declared order. ProjectStatus is { ongoing, completed }
      // so 'asc' lands ongoing first.
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      include: { _count: { select: { posts: true } } },
    });
  }

  async getOne(id: string, isAdmin: boolean) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        posts: {
          orderBy: { createdAt: 'asc' },
          include: {
            photos: {
              where: { position: 0 },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });
    if (!project || (!project.isPublic && !isAdmin)) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async create(file: Express.Multer.File | undefined, dto: CreateProjectDto) {
    const coverPhotoUrl = file ? await this.uploadCover(file) : null;
    try {
      return await this.prisma.project.create({
        data: {
          title: dto.title,
          concept: dto.concept ?? null,
          coverPhotoUrl,
          startDate: dto.startDate ?? null,
          endDate: dto.endDate ?? null,
          status: dto.status ?? ProjectStatus.ongoing,
          isPublic: dto.isPublic ?? true,
        },
        include: { _count: { select: { posts: true } } },
      });
    } catch (error) {
      if (coverPhotoUrl) await this.storage.remove([coverPhotoUrl]);
      throw error;
    }
  }

  async update(
    id: string,
    file: Express.Multer.File | undefined,
    dto: UpdateProjectDto,
  ) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');

    const newCoverUrl = file ? await this.uploadCover(file) : null;
    // clearCover only applies when no replacement file is sent.
    const removingCover = !file && dto.clearCover === true;

    try {
      const updated = await this.prisma.project.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.concept !== undefined && { concept: dto.concept }),
          ...(dto.startDate !== undefined && { startDate: dto.startDate }),
          ...(dto.endDate !== undefined && { endDate: dto.endDate }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
          ...(newCoverUrl
            ? { coverPhotoUrl: newCoverUrl }
            : removingCover
              ? { coverPhotoUrl: null }
              : {}),
        },
        include: { _count: { select: { posts: true } } },
      });
      // DB is the source of truth; clean up the previous cover after commit.
      if ((newCoverUrl || removingCover) && existing.coverPhotoUrl) {
        await this.storage.remove([existing.coverPhotoUrl]);
      }
      return updated;
    } catch (error) {
      if (newCoverUrl) await this.storage.remove([newCoverUrl]);
      throw error;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');

    // Posts.projectId is set null automatically (schema onDelete: SetNull).
    await this.prisma.project.delete({ where: { id } });
    if (existing.coverPhotoUrl) {
      await this.storage.remove([existing.coverPhotoUrl]);
    }
    return { ok: true };
  }

  private async uploadCover(file: Express.Multer.File): Promise<string> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }
    const output = await sharp(file.buffer, { failOn: 'none' })
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
    const filename = `${Date.now()}-${randomUUID()}.webp`;
    return this.storage.upload(filename, output);
  }
}
