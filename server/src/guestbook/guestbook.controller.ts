import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GuestbookService } from './guestbook.service';
import { CreateGuestbookDto } from './dto/create-guestbook.dto';

@Controller('guestbook')
export class GuestbookController {
  constructor(private readonly guestbook: GuestbookService) {}

  @Get()
  list() {
    return this.guestbook.list();
  }

  @Post()
  create(@Body() dto: CreateGuestbookDto) {
    return this.guestbook.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guestbook.remove(id);
  }
}
