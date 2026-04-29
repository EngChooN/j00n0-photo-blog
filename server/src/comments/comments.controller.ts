import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { getVisitorIpHash } from '@/lib/visitor-ip';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get('posts/:postId/comments')
  list(@Param('postId') postId: string) {
    return this.comments.list(postId);
  }

  @Post('posts/:postId/comments')
  create(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    return this.comments.create(postId, dto, getVisitorIpHash(req));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  remove(@Param('id') id: string) {
    return this.comments.remove(id);
  }
}
