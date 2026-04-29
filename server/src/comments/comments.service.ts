import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 comment per IP per minute (any post)
const DAILY_LIMIT_PER_POST = 5; // 5 comments per IP per post per day

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(postId: string, visitorIpHash: string) {
    const rows = await this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        postId: true,
        name: true,
        body: true,
        createdAt: true,
        visitorIpHash: true,
      },
    });
    return rows.map(({ visitorIpHash: hash, ...rest }) => ({
      ...rest,
      isOwnedByVisitor: hash === visitorIpHash,
    }));
  }

  async create(
    postId: string,
    dto: CreateCommentDto,
    visitorIpHash: string,
  ) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const recent = await this.prisma.comment.findFirst({
      where: {
        visitorIpHash,
        createdAt: { gt: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) },
      },
      select: { id: true },
    });
    if (recent) {
      throw new BadRequestException(
        '댓글은 1분에 한 번만 작성할 수 있어요. 잠시 후 다시 시도해주세요.',
      );
    }

    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const todayCount = await this.prisma.comment.count({
      where: {
        postId,
        visitorIpHash,
        createdAt: { gte: dayStart },
      },
    });
    if (todayCount >= DAILY_LIMIT_PER_POST) {
      throw new BadRequestException(
        '같은 글에는 하루 5개까지만 댓글을 달 수 있어요.',
      );
    }

    const created = await this.prisma.comment.create({
      data: {
        postId,
        name: dto.name.trim() || '익명',
        body: dto.body.trim(),
        visitorIpHash,
      },
      select: {
        id: true,
        postId: true,
        name: true,
        body: true,
        createdAt: true,
      },
    });
    return { ...created, isOwnedByVisitor: true };
  }

  async remove(id: string, visitorIpHash: string | null) {
    const where =
      visitorIpHash === null ? { id } : { id, visitorIpHash };
    const result = await this.prisma.comment.deleteMany({ where });
    if (result.count === 0) {
      throw new NotFoundException('Comment not found');
    }
    return { ok: true };
  }
}
