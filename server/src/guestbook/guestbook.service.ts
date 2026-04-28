import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateGuestbookDto } from './dto/create-guestbook.dto';

@Injectable()
export class GuestbookService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.guestbookEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(dto: CreateGuestbookDto) {
    return this.prisma.guestbookEntry.create({
      data: { name: dto.name, message: dto.message },
    });
  }

  async remove(id: string) {
    const entry = await this.prisma.guestbookEntry.findUnique({
      where: { id },
    });
    if (!entry) throw new NotFoundException('Entry not found');
    await this.prisma.guestbookEntry.delete({ where: { id } });
    return { ok: true };
  }
}
